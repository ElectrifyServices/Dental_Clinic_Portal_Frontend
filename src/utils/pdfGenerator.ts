import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoImg from "../logo.png";
import { formatPhoneWithCountryCode } from "./phoneUtils";

export type PDFReportType = "FULL" | "CLINICAL" | "TREATMENT" | "PRESCRIPTION";

// ---------------------------------------------------------------------------
// Brand tokens — read dynamically from login API (stored in localStorage).
// All defaults below are the original hardcoded fallbacks so the PDF looks
// identical when the API hasn't supplied branding data (demo mode, etc.).
// ---------------------------------------------------------------------------

const BRANDING_DEFAULTS = {
  BRAND: "#5F736D",         // header accent bar + footer band ONLY
  INK: "#0f1115",           // primary body text — black
  INK_MUTED: "#5F736D",     // secondary/muted body text
  LINE: "#d7dbde",          // table/section borders — neutral gray
  PANEL: "#f7f8f8",         // neutral panel background (notes, alt rows)
  CLINIC_NAME: "Opal Smiles Dental Studio",
  CLINIC_TAGLINE: "Dental & Facial Aesthetics",
  CLINIC_ADDRESS: "104, Unicus Shyamal, Shyamal Cross Road, Satellite, Ahmedabad, Gujarat — 380 015",
  CLINIC_PHONE: "+91 99981 93256",
  CLINIC_EMAIL: "rajal.shah@opalsmiles.com",
  CLINIC_HOURS: "Mon-Sat: 10:00 AM – 8:00 PM",
  CLINIC_INSTAGRAM: "@opalsmiles_dental",
  DOCTOR_NAME: "Dr. Rajal Shah",
  DOCTOR_TITLE: "MDS Prosthodontist & Implantologist",
  LOGO_URL: logoImg,
} as const;

/**
 * Returns branding tokens resolved from the login API response (if available)
 * falling back to BRANDING_DEFAULTS. Safe to call in a pure TS context — no
 * React hooks needed because it reads directly from localStorage.
 */
function getBrandingTokens() {
  try {
    const raw = localStorage.getItem("dental_theme");
    if (raw) {
      const parsed = JSON.parse(raw);
      const b = parsed?.branding ?? {};
      const t = parsed?.theme ?? {};

      const rawBrand = b.brand_color || t.primary_color;
      const brandColor = (rawBrand && rawBrand.trim()) ? rawBrand.trim() : BRANDING_DEFAULTS.BRAND;

      const rawInk = b.ink_color;
      const inkColor = (rawInk && rawInk.trim()) ? rawInk.trim() : BRANDING_DEFAULTS.INK;

      const inkMutedColor = brandColor;

      return {
        BRAND: brandColor,
        INK: inkColor,
        INK_MUTED: inkMutedColor,
        LINE: b.line_color ?? BRANDING_DEFAULTS.LINE,
        PANEL: b.panel_color ?? BRANDING_DEFAULTS.PANEL,
        CLINIC_NAME: b.clinic_name ?? BRANDING_DEFAULTS.CLINIC_NAME,
        CLINIC_TAGLINE: t.tagline ?? BRANDING_DEFAULTS.CLINIC_TAGLINE,
        CLINIC_ADDRESS: b.address ?? BRANDING_DEFAULTS.CLINIC_ADDRESS,
        CLINIC_PHONE: b.phone ?? BRANDING_DEFAULTS.CLINIC_PHONE,
        CLINIC_EMAIL: b.email ?? BRANDING_DEFAULTS.CLINIC_EMAIL,
        CLINIC_HOURS: b.hours ?? BRANDING_DEFAULTS.CLINIC_HOURS,
        CLINIC_INSTAGRAM: b.instagram ?? BRANDING_DEFAULTS.CLINIC_INSTAGRAM,
        DOCTOR_NAME: b.doctor_name ?? BRANDING_DEFAULTS.DOCTOR_NAME,
        DOCTOR_TITLE: b.doctor_title ?? BRANDING_DEFAULTS.DOCTOR_TITLE,
        LOGO_URL: (t.logo_url && t.logo_url.trim()) ? t.logo_url : BRANDING_DEFAULTS.LOGO_URL,
      };
    }
  } catch {
    /* corrupt localStorage — fall through to defaults */
  }
  return { ...BRANDING_DEFAULTS };
}

// Default SAC (Services Accounting Code) applied to line items that don't carry
// their own code. 999312 = "Medical and dental services" (consultations, exams,
// general/orthodontic/periodontic treatment — GST-exempt as of last check).
// NOTE: this code is for *services*. If you ever bill a physical product/goods
// line (retail item, appliance sold outright, etc.) that needs a proper HSN
// goods code instead - don't default those rows to 999312. Pass `hsn_code` /
// `hsnCode` on the item to override per line.
const DEFAULT_SAC_CODE = "999312";

// ---------------------------------------------------------------------------
// Pagination constants
// PAGE_WIDTH_PX / PAGE_HEIGHT_PX describe one A4 page in the *source* CSS
// pixel space that the offscreen container is rendered in (before the 1.5x
// html2canvas scale factor is applied). These replace the old hardcoded
// `min-height:1123px` assumption baked into the template strings — that
// inline min-height is still present for a nice single-page preview, but the
// actual page count/height used for the PDF is always computed dynamically
// from real measured content, never assumed.
// ---------------------------------------------------------------------------
const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123;

interface PDFGeneratorParams {
  type: PDFReportType;
  patient: {
    id: string;
    patientName: string;
    phone?: string;
    doctorName?: string;
    treatmentType?: string;
  };
  consultationData: any;
  toothChartState?: Record<number, string>;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Waits for all <img> tags inside a node to finish loading (success or error),
 *  and for web fonts to be ready, so html2canvas never captures a half-painted frame. */
async function waitForAssets(node: HTMLElement) {
  const images = Array.from(node.getElementsByTagName("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }),
  );
  if ((document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch {
      /* no-op */
    }
  }
}

/**
 * Walks every element marked `data-avoid-break` inside the container and
 * computes a set of page-end offsets (in px, relative to the container's
 * top) such that:
 *  - each page is at most `pageHeightPx` tall
 *  - no marked element (table row, card, section block) is ever split
 *    across two pages — if a naive page boundary would land inside one,
 *    the boundary is pulled back to that element's top instead, and the
 *    leftover space simply flows onto the next page.
 *
 * `contentHeight` must exclude the footer — the footer is handled
 * separately by the caller so it can always be pinned to the final page.
 */
function computeContentPageBreaks(
  container: HTMLElement,
  contentStart: number,
  contentHeight: number,
  contentPageHeight: number,
  signatureHeight: number,
): number[] {
  if (contentHeight + signatureHeight <= contentPageHeight) return [contentStart + contentHeight];

  const containerTop = container.getBoundingClientRect().top;

  const blocks = Array.from(
    container.querySelectorAll<HTMLElement>("[data-avoid-break]"),
  )
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - containerTop, bottom: r.bottom - containerTop };
    })
    // Only blocks that actually live in the content region matter here.
    .filter((b) => b.bottom <= contentStart + contentHeight + 0.5)
    .sort((a, b) => a.top - b.top);

  const breaks: number[] = [];
  let pageStart = contentStart;
  const contentEnd = contentStart + contentHeight;

  while (pageStart < contentEnd - 0.5) {
    let end = Math.min(pageStart + contentPageHeight, contentEnd);

    if (end === contentEnd) {
      if (contentEnd - pageStart > contentPageHeight - signatureHeight) {
        end = pageStart + (contentPageHeight - signatureHeight);
      }
    }

    if (end < contentEnd) {
      // If this boundary would slice through a protected block, pull it
      // back to the top of that block instead — the block (and everything
      // after it) spills onto the next page in full.
      const straddled = blocks.find((b) => b.top < end && b.bottom > end);
      if (straddled && straddled.top > pageStart) {
        end = straddled.top;
      }
    }

    // Safety net: never allow a zero/negative-height page (e.g. a single
    // block taller than a full page) — fall back to a hard cut rather than
    // looping forever.
    if (end <= pageStart) {
      const maxPageSpace = (pageStart + contentPageHeight >= contentEnd)
        ? contentPageHeight - signatureHeight
        : contentPageHeight;
      end = Math.min(pageStart + maxPageSpace, contentEnd);
    }

    breaks.push(end);
    pageStart = end;
  }

  return breaks;
}

/**
 * Renders an offscreen container to a multi-page A4 PDF and saves it.
 *
 * Pagination is fully dynamic:
 *  - Content height is measured from the real DOM, never assumed.
 *  - Page breaks avoid slicing through anything marked `data-avoid-break`
 *    (table rows, cards, section blocks).
 *  - Header & Brand Footer are layered onto every page.
 *  - Signature block is drawn only at the bottom of the last page, above the brand footer.
 */
async function renderContainerToPDF(
  pdfContainer: HTMLElement,
  fileName: string,
) {
  document.body.appendChild(pdfContainer);
  await waitForAssets(pdfContainer);

  try {
    const containerTop = pdfContainer.getBoundingClientRect().top;

    const headerEl = pdfContainer.querySelector<HTMLElement>("[data-header]");
    const brandFooterEl = pdfContainer.querySelector<HTMLElement>("[data-brand-footer]");
    const signatureEl = pdfContainer.querySelector<HTMLElement>("[data-signature]");

    const headerHeight = headerEl ? headerEl.getBoundingClientRect().bottom - containerTop : 140;
    const brandFooterHeight = brandFooterEl ? brandFooterEl.getBoundingClientRect().height : 100;
    const signatureHeight = signatureEl ? signatureEl.getBoundingClientRect().height : 0;
    const signatureGap = signatureEl ? 25 : 0;

    // The signature element starts at signatureTop.
    // If there is no signature element, contentTop is brandFooterEl's top.
    const contentEndTop = signatureEl
      ? signatureEl.getBoundingClientRect().top - containerTop
      : (brandFooterEl ? brandFooterEl.getBoundingClientRect().top - containerTop : pdfContainer.scrollHeight);

    const brandFooterTop = brandFooterEl ? brandFooterEl.getBoundingClientRect().top - containerTop : pdfContainer.scrollHeight - brandFooterHeight;

    const contentHeight = contentEndTop - headerHeight;
    const contentPageHeight = PAGE_HEIGHT_PX - headerHeight - brandFooterHeight;

    const pageBreaks = computeContentPageBreaks(
      pdfContainer,
      headerHeight,
      contentHeight,
      contentPageHeight,
      signatureHeight + signatureGap,
    );

    // Capture the entire pdfContainer as a canvas at its natural scroll height
    const naturalHeight = pdfContainer.scrollHeight;
    const canvas = await html2canvas(pdfContainer, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: PAGE_WIDTH_PX,
      windowWidth: PAGE_WIDTH_PX,
      height: naturalHeight,
      windowHeight: naturalHeight,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const scaleFactor = canvas.width / PAGE_WIDTH_PX;

    const headerCanvasHeight = Math.round(headerHeight * scaleFactor);
    const footerCanvasHeight = Math.round(brandFooterHeight * scaleFactor);
    const signatureCanvasHeight = Math.round(signatureHeight * scaleFactor);
    const signatureSourceY = signatureEl ? Math.round((signatureEl.getBoundingClientRect().top - containerTop) * scaleFactor) : 0;

    for (let page = 0; page < pageBreaks.length; page++) {
      if (page > 0) pdf.addPage();

      const sliceStartPx = page === 0 ? headerHeight : pageBreaks[page - 1];
      const sliceEndPx = pageBreaks[page];

      const sourceContentY = Math.round(sliceStartPx * scaleFactor);
      const sourceContentHeight = Math.round(
        (sliceEndPx - sliceStartPx) * scaleFactor,
      );

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.round(PAGE_HEIGHT_PX * scaleFactor);
      const ctx = pageCanvas.getContext("2d")!;

      // Background color
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      // 1. Draw Header
      if (headerEl && headerCanvasHeight > 0) {
        ctx.drawImage(
          canvas,
          0,
          0,
          canvas.width,
          headerCanvasHeight,
          0,
          0,
          pageCanvas.width,
          headerCanvasHeight,
        );
      }

      // 2. Draw Content Slice
      if (sourceContentHeight > 0) {
        ctx.drawImage(
          canvas,
          0,
          sourceContentY,
          canvas.width,
          sourceContentHeight,
          0,
          headerCanvasHeight,
          pageCanvas.width,
          sourceContentHeight,
        );
      }

      // 3. Draw Signature (ONLY on the last page)
      const isLastPage = page === pageBreaks.length - 1;
      if (isLastPage && signatureEl && signatureCanvasHeight > 0) {
        const signatureGapCanvas = Math.round(signatureGap * scaleFactor);
        const destSignatureY = pageCanvas.height - footerCanvasHeight - signatureCanvasHeight - signatureGapCanvas;
        ctx.drawImage(
          canvas,
          0,
          signatureSourceY,
          canvas.width,
          signatureCanvasHeight,
          0,
          destSignatureY,
          pageCanvas.width,
          signatureCanvasHeight,
        );
      }

      // 4. Draw Brand Footer
      if (brandFooterEl && footerCanvasHeight > 0) {
        const destFooterY = pageCanvas.height - footerCanvasHeight;
        ctx.drawImage(
          canvas,
          0,
          Math.round(brandFooterTop * scaleFactor),
          canvas.width,
          footerCanvasHeight,
          0,
          destFooterY,
          pageCanvas.width,
          footerCanvasHeight,
        );
      }

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.85);
      pdf.addImage(pageImgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(fileName);
  } finally {
    document.body.removeChild(pdfContainer);
  }
}

function makeOffscreenContainer(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    position: absolute; left: -9999px; top: 0;
    width: 794px; background: white;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  return el;
}

/** Computes a whole-number age from a DOB string, if one is available. */
function ageFromDOB(dob?: string): string | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  const age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return age >= 0 ? String(age) : null;
}

/** New premium header: large curved brand-color panel top-left (pure CSS,
 *  no SVG/image), large logo sitting on top of the curve, thin vertical
 *  divider, and static doctor info on the right. Old thin top strip +
 *  left-doctor/right-logo layout removed as requested.
 *  `rightBlock` kept in the signature for call-site compatibility (same as
 *  before — not rendered here, matching prior behavior). */
function getLetterhead(rightBlock: string, tokens?: ReturnType<typeof getBrandingTokens>) {
  const T = tokens ?? getBrandingTokens();
  return `
<div style="padding: 18px 40px 14px; display:flex; flex-direction:row; justify-content:space-between; align-items:center; border-bottom: 1px solid ${T.LINE}; position:relative; overflow:hidden; background:#ffffff; min-height:120px;">
    <!-- Left: Doctor Name & Title -->
  <div style="display:flex; flex-direction:column; align-items:flex-start; position:relative; z-index:1;">
    <div style="font-size: 20px; font-weight: 700; color: ${T.BRAND}; letter-spacing: 0.5px; text-transform: uppercase; line-height:1.3;">${T.DOCTOR_NAME}</div>
    <div style="font-size: 12px; font-weight: 500; color: ${T.INK_MUTED}; margin-top: 4px; letter-spacing: 0.2px; line-height:1.3; text-transform: uppercase;">
      ${T.DOCTOR_TITLE}
    </div>
  </div>
  
  <!-- Vertical Divider Line -->
  <div style="width:1.5px; height:70px; background:${T.BRAND}; position:relative; z-index:1;"></div>

  <!-- Right: Logo -->
  <div style="display:flex; align-items:center; gap:0; position:relative; z-index:1;">
    <img src="${T.LOGO_URL}" style="height:90px; width:auto; display:block; flex-shrink:0;" crossorigin="anonymous" />
  </div>
</div>
  `;
}

/** Shared footer band used across all PDF types. Brand color is the solid
 *  fill here — the only other place brand color appears besides the top bar.
 *  Marked with `data-footer` so renderContainerToPDF can always pin it to
 *  the bottom of the final page. */
/** Shared footer band used across all PDF types. Brand color is the solid
 *  fill here — the only other place brand color appears besides the top bar.
 *  Marked with `data-footer` so renderContainerToPDF can always pin it to
 *  the bottom of the final page. */
/** Shared footer band used across all PDF types. Brand color is the solid
 *  fill here — the only other place brand color appears besides the top bar.
 *  Marked with `data-footer` so renderContainerToPDF can always pin it to
 *  the bottom of the final page. */
/** Shared footer band used across all PDF types. Brand color is the solid
 *  fill here — the only other place brand color appears besides the top bar.
 *  Marked with `data-footer` so renderContainerToPDF can always pin it to
 *  the bottom of the final page. */
function getBrandFooter(signatureBlock: string, isInvoice: boolean = false, tokens?: ReturnType<typeof getBrandingTokens>) {
  const T = tokens ?? getBrandingTokens();
  // FIX: SVG ko inline-flex banaya aur align-items:center ke saath
  // taaki icon apne parent container ke andar center ho
  const svgStyle = `
display:block;
width:14px;
height:14px;
flex-shrink:0;
overflow:visible;
vertical-align:middle;
`;
  const iconPhone = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.36 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
  const iconEmail = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
  const iconInstagram = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
  const iconLocation = `
<svg
xmlns="http://www.w3.org/2000/svg"
width="14"
height="14"
viewBox="0 0 24 24"
fill="#ffffff"
style="display:block;width:14px;height:14px;"
>
<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
</svg>`;

  const computerGeneratedBlock = isInvoice
    ? `
<div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.3); padding-top:8px; text-align:center; font-size:13px; font-weight:600; opacity:0.9; letter-spacing:0.3px;">
  This is a computer generated Invoice
</div>`
    : "";

  return `
<div style="margin-top:auto;" data-footer="true">
<div data-signature="true" style="padding: 14px 40px 15px; background: #ffffff;">
<div style="display:flex; justify-content:flex-end;">
          ${signatureBlock}
</div>
</div>
<div style="height:12px;"></div>
<div data-brand-footer="true" style="background:${T.BRAND}; padding:14px 40px; min-height:90px; color:#ffffff; display:flex; flex-direction:row; align-items:center; justify-content:space-between; box-sizing:border-box;">
  
  <!-- Left column: Contact info -->
  <div
style="
flex:1;
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
padding-right:20px;
box-sizing:border-box;
height:100%;
">
    <!-- Address - Single line with proper alignment -->
<div
style="
margin-bottom:6px;
display:flex;
justify-content:center;
align-items:center;
gap:6px;
flex-wrap:nowrap;
">

<span
style="
display:flex;
align-items:center;
justify-content:center;
width:14px;
height:14px;
flex-shrink:0;
align-self:center;
padding-top:15px;
">
${iconLocation}
</span>

<span
style="
font-size:13px;
font-weight:400;
line-height:1.4;
">
${T.CLINIC_ADDRESS}
</span>

</div>

<!-- Phone, Email, Instagram -->
<div style="
margin-bottom:6px;
display:flex;
align-items:center;
justify-content:center;
gap:16px;
flex-wrap:wrap;
">

  <!-- Phone -->
  <span
    style="
      display:flex;
      align-items:center;
      justify-content:center;
      gap:6px;
      white-space:nowrap;
    "
  >
    <span
      style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:14px;
        height:14px;
        margin-top:1px;
        flex-shrink:0;
        padding-top:15px;
      "
    >
      ${iconPhone}
    </span>

    <span style="font-size:13px;font-weight:400;line-height:1.4;">
      ${T.CLINIC_PHONE}
    </span>
  </span>

  <!-- Email -->
  <span
    style="
      display:flex;
      align-items:center;
      justify-content:center;
      gap:6px;
      white-space:nowrap;
    "
  >
    <span
      style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:14px;
        height:14px;
        margin-top:1px;
        flex-shrink:0;
        padding-top:15px;
      "
    >
      ${iconEmail}
    </span>

    <span style="font-size:13px;font-weight:400;line-height:1.4;">
      ${T.CLINIC_EMAIL}
    </span>
  </span>

  <!-- Instagram -->
  <span
    style="
      display:flex;
      align-items:center;
      justify-content:center;
      gap:6px;
      white-space:nowrap;
    "
  >
    <span
      style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:14px;
        height:14px;
        margin-top:1px;
        flex-shrink:0;
        padding-top:15px;
      "
    >
      ${iconInstagram}
    </span>

    <span style="font-size:13px;font-weight:400;line-height:1.4;">
      ${T.CLINIC_INSTAGRAM}
    </span>
  </span>

</div>

<!-- Hours -->
<div
  style="
    font-size:13px;
    font-weight:400;
    opacity:0.85;
    text-align:center;
    line-height:1.4;
  "
>
  ${T.CLINIC_HOURS}
</div>

${computerGeneratedBlock}
</div>

  <!-- Right column: QR Code -->
  <div style="text-align:center; display:flex; height:100%; flex-direction:column; align-items:center; flex-shrink:0; justify-content:center; margin-left:10px;">
<div style="
background:#ffffff;
padding:4px;
border-radius:6px;
margin-bottom:6px;
box-shadow:0 2px 4px rgba(0,0,0,0.1);
display:inline-block;
line-height:0;
">
      <img src="/opalsmiles-qr.png" style="width:46px; height:46px; display:block;" crossorigin="anonymous" />
    </div>
    <div style="font-size:7.5px; opacity:0.95; text-transform:uppercase; letter-spacing:0.5px; font-weight:700; line-height:1.2;">Scan to visit</div>
  </div>

</div>
</div>
  `;
}

/** Neutral black/gray status badge - no brand tint, so it reads correctly
 *  next to the rest of the black-ink document. */
function statusBadge(status: string) {
  const ink = getBrandingTokens().INK;
  const s = status.toLowerCase();
  const palette =
    s === "paid"
      ? { bg: "#e7f4ea", fg: "#1e6b33" }
      : s === "overdue"
        ? { bg: "#fbe9e9", fg: "#9c2626" }
        : { bg: "#eef0f1", fg: ink };
  return `<span style="padding:4px 12px; border-radius:20px; font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.4px; background:${palette.bg}; color:${palette.fg};">${status}</span>`;
}

const sectionLabel = (text: string, showBorder: boolean = true, tokens?: ReturnType<typeof getBrandingTokens>) => {
  const T = tokens ?? getBrandingTokens();
  const labelText = text.endsWith(":") ? text : `${text}:`;
  const borderStyle = showBorder ? `border-bottom:1.5px solid ${T.LINE}; padding-bottom:5px;` : "";
  return `<div style="font-size:12px; font-weight:400; color:${T.INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; ${borderStyle}">${labelText}</div>`;
};

const makeCellContent = (
  content: string,
  align: string = "left",
  extraStyle: string = "",
) => {
  const justify =
    align === "center"
      ? "center"
      : align === "right"
        ? "flex-end"
        : "flex-start";
  return `<div style="display:flex; align-items:center; justify-content:${justify}; width:100%; min-height:100%; padding: 10px 12px 20px 12px; box-sizing:border-box; line-height:1.2; text-align:${align}; ${extraStyle}">${content}</div>`;
};

const tableHeadCell = (text: string, align: string = "left") => {
  const ink = getBrandingTokens().INK;
  return `<th style="padding:0; text-align:${align}; font-size:12px; font-weight:400; color:${ink}; text-transform:uppercase; letter-spacing:0.4px; vertical-align:middle;">${makeCellContent(text, align)}</th>`;
};

/** A bordered label/value grid - the classic "tax invoice" look - used for the
 *  patient + invoice meta block. 4 columns: label | value | label | value. */
function detailsGrid(rows: Array<[string, string, string, string]>, tokens?: ReturnType<typeof getBrandingTokens>) {
  const T = tokens ?? getBrandingTokens();
  const labelStyle = `font-size:12px; font-weight:400; color:${T.INK_MUTED}; text-transform:uppercase; letter-spacing:0.3px;`;
  const valueStyle = `font-size:12px; font-weight:400; color:${T.INK};`;
  return `
<table style="width:100%; border-collapse:collapse; border:1px solid ${T.LINE}; margin-top:16px;">
<tbody>
        ${rows
      .map(
        (row) => `
<tr>
<td style="width:20%; padding:0; background:${T.PANEL}; border:1px solid ${T.LINE}; vertical-align:middle;">${makeCellContent(row[0], "left", labelStyle)}</td>
<td style="width:30%; padding:0; border:1px solid ${T.LINE}; vertical-align:middle;">${makeCellContent(row[1], "left", valueStyle)}</td>
<td style="width:20%; padding:0; background:${T.PANEL}; border:1px solid ${T.LINE}; vertical-align:middle;">${makeCellContent(row[2], "left", labelStyle)}</td>
<td style="width:30%; padding:0; border:1px solid ${T.LINE}; vertical-align:middle;">${makeCellContent(row[3], "left", valueStyle)}</td>
</tr>
        `,
      )
      .join("")}
</tbody>
</table>
  `;
}

// ---------------------------------------------------------------------------
// Consultation / clinical / treatment / prescription report
// ---------------------------------------------------------------------------

export const downloadConsultationPDF = async ({
  type = "FULL",
  patient,
  consultationData,
  toothChartState = {},
}: PDFGeneratorParams) => {
  const pdfContainer = makeOffscreenContainer();
  // Resolve branding tokens from API (falls back to hardcoded defaults)
  const T = getBrandingTokens();

  // Safely extract doctor details from API payload structure (e.g. responseObject.data or directly)
  let doctorObj: any = {};
  if (consultationData.responseObject?.data?.doctor) {
    doctorObj = consultationData.responseObject.data.doctor;
  } else if (consultationData.data?.doctor) {
    doctorObj = consultationData.data.doctor;
  } else if (consultationData.doctor) {
    doctorObj = consultationData.doctor;
  } else if (consultationData.responseObject?.doctor) {
    doctorObj = consultationData.responseObject.doctor;
  }

  const displayDoctorName = (T.DOCTOR_NAME || "Dr. Rajal Shah").toUpperCase();
  const specialization = T.DOCTOR_TITLE || "MDS Prosthodontist & Implantologist";

  // Safely extract patient details from API payload structure
  let patientObj: any = {};
  if (consultationData.responseObject?.data?.patient) {
    patientObj = consultationData.responseObject.data.patient;
  } else if (consultationData.data?.patient) {
    patientObj = consultationData.data.patient;
  } else if (consultationData.patient) {
    patientObj = consultationData.patient;
  } else if (consultationData.responseObject?.patient) {
    patientObj = consultationData.responseObject.patient;
  }
  const isBlankMode = consultationData?.isBlankMode || false;

  const patientName = isBlankMode ? "" : (patientObj?.name || patient.patientName || "-");
  const patientId = isBlankMode ? "" : (patientObj?.id || patient.id || "-");
  const patientCode =
    patientObj?.patient_code ||
    patientObj?.patientCode ||
    (patient as any).patient_code ||
    (patient as any).patientCode;
  const displayPatientId = isBlankMode
    ? ""
    : (patientCode || (patientId === "-" ? "-" : patientId.split("-")[0]));
  const rawPatientPhone = isBlankMode ? "" : (patientObj?.phone || patient.phone || "");
  const patientCountryCode = isBlankMode ? "" : (patientObj?.country_code || patientObj?.countryCode || (patient as any).country_code || (patient as any).countryCode || "+91");
  const patientPhone = isBlankMode ? "" : (rawPatientPhone ? formatPhoneWithCountryCode(rawPatientPhone, patientCountryCode) : "-");
  const patientGender = isBlankMode ? "" : (patientObj?.gender || (patient as any).gender || "-");
  let patientDobRaw =
    patientObj?.date_of_birth ||
    patientObj?.dob ||
    (patient as any).date_of_birth ||
    (patient as any).dob;
  let patientDob = isBlankMode ? "" : "-";
  if (!isBlankMode && patientDobRaw) {
    try {
      const d = new Date(patientDobRaw);
      if (!isNaN(d.getTime())) {
        patientDob = d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } else {
        patientDob = patientDobRaw;
      }
    } catch (e) {
      patientDob = patientDobRaw;
    }
  }
  const patientBloodGroup = isBlankMode ? "" : (
    patientObj?.blood_group ||
    (patient as any).bloodGroup ||
    "-"
  ).replace("_", " ");

  // Extract clinical observations, diagnosis, treatment plans, concern, notes, etc.
  const observations =
    consultationData.observations ||
    consultationData.observations_desc ||
    consultationData.data?.observations ||
    consultationData.data?.observations_desc ||
    consultationData.data?.data?.observations ||
    consultationData.data?.data?.observations_desc ||
    "";
  const diagnosis =
    consultationData.diagnosis ||
    consultationData.diagnosis_desc ||
    consultationData.data?.diagnosis ||
    consultationData.data?.diagnosis_desc ||
    consultationData.data?.data?.diagnosis ||
    consultationData.data?.data?.diagnosis_desc ||
    "";
  const patientConcern =
    consultationData.patientConcern ||
    consultationData.patient_concern ||
    consultationData.data?.patientConcern ||
    consultationData.data?.patient_concern ||
    "";
  const additionalNotes =
    consultationData.additional_notes ||
    consultationData.consultationNotes ||
    consultationData.data?.additional_notes ||
    consultationData.data?.consultationNotes ||
    "";
  const isFollowUp =
    consultationData.is_follow_up ||
    consultationData.followUpRequired ||
    consultationData.data?.is_follow_up ||
    consultationData.data?.followUpRequired ||
    false;
  const followUpDate =
    consultationData.followUpDate ||
    consultationData.follow_up_date ||
    consultationData.data?.followUpDate ||
    consultationData.data?.follow_up_date ||
    "";
  const recommendations =
    consultationData.recommendations ||
    consultationData.data?.recommendations ||
    consultationData.data?.data?.recommendations ||
    "";

  const treatmentPlanDesc =
    consultationData.treatment_plan_desc ||
    consultationData.consultation?.treatment_plan_desc ||
    consultationData.data?.treatment_plan_desc ||
    consultationData.data?.consultation?.treatment_plan_desc ||
    consultationData.data?.data?.treatment_plan_desc ||
    consultationData.treatmentPlan ||
    consultationData.treatment_plan_description ||
    "";

  // Dynamic tooth chart findings map merging
  const finalToothChart = { ...toothChartState };
  const toothFindingsArray =
    consultationData.toothFindings ||
    consultationData.data?.toothFindings ||
    consultationData.tooth_findings ||
    consultationData.data?.tooth_findings ||
    consultationData.data?.data?.toothFindings ||
    consultationData.data?.data?.tooth_findings ||
    [];
  if (Array.isArray(toothFindingsArray)) {
    toothFindingsArray.forEach((finding: any) => {
      if (finding.tooth_number && finding.condition) {
        if (finding.condition === 'OTHER' && finding.other_condition) {
          finalToothChart[finding.tooth_number] = finding.other_condition;
        } else {
          finalToothChart[finding.tooth_number] = typeof finding.condition === 'string' ? finding.condition.replace('_', ' ') : finding.condition;
        }
      }
    });
  }

  // Safely extract treatments array from API structure
  const treatmentsArray =
    consultationData.treatments ||
    consultationData.treatmentPlans ||
    consultationData.treatment_plans ||
    consultationData.data?.treatments ||
    consultationData.data?.data?.treatments ||
    consultationData.responseObject?.data?.treatment_plans ||
    consultationData.responseObject?.data?.treatments ||
    [];

  // Safely extract prescriptions array from API structure
  const rawPrescriptions =
    consultationData.prescriptions ||
    consultationData.data?.prescriptions ||
    consultationData.data?.data?.prescriptions ||
    consultationData.responseObject?.data?.prescriptions ||
    [];
  const filledPrescriptions = rawPrescriptions.filter(
    (p: any) =>
      p.medicine_id ||
      p.medicine_name ||
      p.medicineName ||
      (typeof p.medicine === "string" && p.medicine.trim()),
  );
  const hasClinicalData = Boolean(
    observations ||
    diagnosis ||
    patientConcern ||
    additionalNotes ||
    Object.keys(finalToothChart).length > 0,
  );
  const hasTreatmentData = Boolean(
    consultationData.requiresTreatment || consultationData.requires_treatment,
  ) || treatmentsArray.some((t: any) =>
      t && (
        t.procedure ||
        t.treatment_type ||
        t.tooth_number ||
        t.tooth ||
        Number(t.est_cost || t.cost || 0) > 0
      ),
    );

  const getHeader = () =>
    getLetterhead(`
<div style="font-size: 12px; font-weight: 400; color: ${T.INK}; text-transform: uppercase; letter-spacing: 0.5px;">${patientName}</div>
<div style="font-size: 12px; font-weight: 400; color: ${T.INK_MUTED}; margin-top: 4px;">Patient ID: ${displayPatientId}</div>
<div style="font-size: 12px; font-weight: 400; color: ${T.INK_MUTED}; margin-top: 2px;">Phone: ${patientPhone}</div>
<div style="font-size: 12px; font-weight: 400; color: ${T.INK_MUTED}; margin-top: 2px;">${isBlankMode ? "" : `DOB ${patientDob} / ${patientGender} / ${patientBloodGroup}`}</div>
  `, T);

  const getPatientInfo = (title: string) => `
<div style="padding: 10px 40px 20px 40px; background:${T.PANEL}; border-bottom: 1px solid ${T.LINE}; display:flex; justify-content:space-between; align-items:center;">
<div style="font-size:12px; font-weight:400; color:${T.INK}; text-transform:uppercase; letter-spacing:1px; font-family:'Cinzel', serif;">${title}</div>
<div style="text-align:right; font-size:12px; color:${T.INK_MUTED}; font-weight:400;">
<span>Date: ${isBlankMode ? "___________________" : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
</div>
</div>
<div style="padding: 0 40px;">
      ${detailsGrid([
    ["Name", patientName, "Patient ID", displayPatientId],
    [
      "DOB / Gender",
      isBlankMode
        ? ""
        : (patientDob && patientDob !== "-" && patientGender && patientGender !== "-")
          ? `${patientDob} / ${patientGender}`
          : (patientDob === "-" ? "" : patientDob) || (patientGender === "-" ? "" : patientGender) || "",
      "Phone",
      patientPhone,
    ],
    ["Doctor", displayDoctorName, "Specialization", specialization],
  ])}
</div>
  `;

  const getClinicalSection = () => {
    if (!isBlankMode && !hasClinicalData) return "";
    return `
<div style="padding: 16px 40px 10px;">
      ${(patientConcern || isBlankMode)
      ? `
<div style="margin-bottom:16px;" data-avoid-break="true">
          ${sectionLabel("Chief Complaint", !isBlankMode)}
<div style="font-size:12px; line-height:1.5; color:${T.INK}; font-weight:400; min-height:${isBlankMode ? "40px" : "auto"}; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">${isBlankMode ? "" : patientConcern}</div>
</div>
      `
      : ""
    }
<div style="display:flex; flex-direction:row; justify-content:space-between; width:100%; gap:24px;" data-avoid-break="true">
<div style="flex:1;">
          ${sectionLabel("Clinical Observations", !isBlankMode)}
<div style="font-size:12px; line-height:1.6; color:${T.INK}; min-height:${isBlankMode ? "110px" : "auto"}; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">
            ${isBlankMode ? "" : (observations || `<span style="color:#93999e; font-style:italic;">No observations recorded.</span>`)}
</div>
          ${!isBlankMode && Object.keys(finalToothChart).length > 0
      ? `
<div style="margin-top:14px;">
<div style="font-size:12px; font-weight:400; color:${T.INK_MUTED}; text-transform:uppercase; margin-bottom:6px;">Tooth Findings</div>
<div style="display:flex; flex-wrap:wrap; gap:4px;">
                 ${Object.entries(finalToothChart)
        .map(
          ([num, cond]) =>
            `<span style="font-size:12px; padding: 4px 8px; border-radius:4px; background:${T.PANEL}; border:1px solid ${T.LINE}; color:${T.INK}; font-weight:400;">${num === "FM" ? "Full Mouth" : `#${num}`}: ${cond}</span>`,
        )
        .join("")}
</div>
</div>
          `
      : ""
    }
</div>
<div style="flex:1;">
          ${sectionLabel("Diagnosis", !isBlankMode)}
<div style="font-size:12px; line-height:1.6; color:${T.INK}; min-height:${isBlankMode ? "110px" : "auto"}; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">
            ${isBlankMode ? "" : (diagnosis || `<span style="color:#93999e; font-style:italic;">No diagnosis provided.</span>`)}
</div>
</div>
</div>
</div>
  `;
  };

  const getXraySection = () => {
    if (isBlankMode) return "";
    const xrayFiles =
      consultationData.xrayFiles || consultationData.data?.xrayFiles || [];
    if (!xrayFiles || xrayFiles.length === 0) return "";
    return `
<div style="padding: 8px 40px 10px;">
        ${sectionLabel("Diagnostic Imaging (X-Ray)", !isBlankMode)}
<div style="display:flex; flex-direction:row; flex-wrap:wrap; gap:15px; width:100%;">
          ${xrayFiles
        .map(
          (url: string, i: number) => `
<div style="width:30%; border:1px solid ${T.LINE}; border-radius:10px; overflow:hidden; background:${T.PANEL}; box-sizing:border-box;" data-avoid-break="true">
<img src="${url}" style="width:100%; height:130px; object-fit:cover;" />
<div style="padding:6px; text-align:center; font-size:12px; color:${T.INK_MUTED}; font-weight:400; background:#ffffff;">Image #${i + 1}</div>
</div>
          `,
        )
        .join("")}
</div>
</div>
    `;
  };

  const getTreatmentSection = () => {
    if (!isBlankMode && !hasTreatmentData) return "";
    let treatmentsHtml = "";
    if (isBlankMode) {
      treatmentsHtml = `<div style="height: 120px;"></div>`;
    } else if (treatmentsArray && treatmentsArray.length > 0) {
      treatmentsHtml = `
<table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid ${T.LINE}; margin-top:10px;">
<thead>
<tr style="background:${T.PANEL}; border-bottom:2px solid ${T.LINE};">
              ${tableHeadCell("Tooth")}
              ${tableHeadCell("Procedure / Treatment")}
              ${tableHeadCell("Sessions", "center")}
              ${tableHeadCell("Est. Cost", "right")}
</tr>
</thead>
<tbody>
            ${treatmentsArray
          .map(
            (t: any, i: number) => `
<tr style="border-bottom:1px solid #eef0f1; ${i % 2 === 0 ? "" : `background:#fafafa;`}" data-avoid-break="true">
<td style="padding:0; vertical-align:middle;">${makeCellContent(`${(t.tooth_number || t.tooth) === "FM" ? "Full Mouth" : `#${t.tooth_number || t.tooth || "General"}`}`, "left", `font-size:12px; font-weight:400; color:${T.INK};`)}</td>
<td style="padding:0; vertical-align:middle;">${makeCellContent(`${t.procedure || t.treatment_type || "-"}`, "left", `font-size:12px; font-weight:400; color:${T.INK};`)}</td>
<td style="padding:0; vertical-align:middle;">${makeCellContent(`${Array.isArray(t.sessions) ? t.sessions.length : t.sessions || 1}`, "center", `font-size:12px; color:${T.INK_MUTED};`)}</td>
<td style="padding:0; vertical-align:middle;">${makeCellContent(`Rs. ${Number(t.est_cost || t.cost || 0).toLocaleString("en-IN")}`, "right", `font-size:12px; font-weight:400; color:${T.INK};`)}</td>
</tr>
            `,
          )
          .join("")}
</tbody>
</table>
      `;
    } else {
      treatmentsHtml = `
<div style="background:#fff; border:1px solid ${T.LINE}; padding:15px; border-radius:8px; font-size:12px; color:${T.INK_MUTED};" data-avoid-break="true">
<strong>Procedure:</strong> ${consultationData.treatmentProcedure || consultationData.procedure || "-"}<br/>
<strong style="display:inline-block; margin-top:6px;">Plan:</strong> ${treatmentPlanDesc || "-"}<br/>
<strong style="display:inline-block; margin-top:6px;">Sessions:</strong> ${consultationData.treatmentSessions || 1} | <strong>Estimated Cost:</strong> Rs. ${(consultationData.treatmentCost || consultationData.cost || 0).toLocaleString("en-IN")}
</div>
      `;
    }

    return `
<div style="padding: 8px 40px 10px;">
        ${sectionLabel("Treatment Planning & Procedures", !isBlankMode)}
        ${treatmentsHtml}
        ${isBlankMode || (treatmentPlanDesc && treatmentPlanDesc !== "-" && (treatmentsArray && treatmentsArray.length > 0))
        ? `
<div style="margin-top:16px;" data-avoid-break="true">
<div style="font-size:12px; font-weight:400; color:${T.INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Treatment Plan Description:</div>
${isBlankMode
          ? `<div style="height: 80px;"></div>`
          : `<div style="font-size:12px; line-height:1.6; color:${T.INK}; padding:12px 16px; background:${T.PANEL}; border:1px solid ${T.LINE}; border-radius:8px; white-space:pre-wrap; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">${treatmentPlanDesc}</div>`
        }
</div>
        `
        : ""
      }
        ${isBlankMode || (recommendations && recommendations !== "-")
        ? `
<div style="margin-top:16px;" data-avoid-break="true">
<div style="font-size:12px; font-weight:400; color:${T.INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Recommendations & Notes:</div>
${isBlankMode
          ? `<div style="height: 80px;"></div>`
          : `<div style="font-size:12px; line-height:1.6; color:${T.INK}; padding:12px 16px; background:${T.PANEL}; border:1px solid ${T.LINE}; border-radius:8px; white-space:pre-wrap; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">${recommendations}</div>`
        }
</div>
        `
        : ""
      }
</div>
    `;
  };

  const getPrescriptionSection = () => {
    if (!isBlankMode && filledPrescriptions.length === 0) return "";
    return `
<div style="padding: 8px 40px 10px;" data-avoid-break="true">
<div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; border-bottom:1.5px solid ${T.LINE}; padding-bottom:5px;">
<div style="font-size:12px; font-weight:400; color:${T.INK_MUTED};">Rx</div>
<div style="font-size:12px; font-weight:400; color:${T.INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px;">Prescribed Medications:</div>
</div>
${isBlankMode
        ? `<div style="height: 200px;"></div>`
        : `
<table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid ${T.LINE};">
<thead>
<tr style="background:${T.PANEL}; border-bottom:2px solid ${T.LINE};">
            ${tableHeadCell("#")}
            ${tableHeadCell("Medicine")}
            ${tableHeadCell("Dosage")}
            ${tableHeadCell("Freq")}
            ${tableHeadCell("Duration")}
            ${tableHeadCell("Qty")}
</tr>
</thead>
<tbody>
          ${filledPrescriptions
          .map(
            (p: any, i: number) => `
<tr style="border-bottom:1px solid #eef0f1; ${i % 2 === 0 ? "" : `background:#fafafa;`}" data-avoid-break="true">
<td style="padding:0; vertical-align:middle;">${makeCellContent(`${i + 1}`, "left", `font-size:12px; color:#93999e;`)}</td>
<td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.medicine?.name || p.medicine?.medicine_name || p.medicine_name || p.medicineName || (typeof p.medicine === "string" ? p.medicine : "") || "-"}`, "left", `font-size:12px; font-weight:400; color:${T.INK};`)}</td>
<td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.dosage || "-"} (${p.timing || "-"})`, "left", `font-size:12px; color:${T.INK};`)}</td>
<td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.frequency || "-"}`, "left", `font-size:12px; color:${T.INK};`)}</td>
<td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.duration ? `${p.duration} ${p.durationUnit || p.duration_type || "Days"}` : "-"}`, "left", `font-size:12px; color:${T.INK};`)}</td>
<td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.qty || "-"}`, "left", `font-size:12px; color:${T.INK};`)}</td>
</tr>
          `,
          )
          .join("")}
</tbody>
</table>
`}
        ${isBlankMode || additionalNotes
        ? `
<div style="margin-top:16px;" data-avoid-break="true">
<div style="font-size:12px; font-weight:400; color:${T.INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Additional Notes:</div>
${isBlankMode
          ? `<div style="height: 80px;"></div>`
          : `<div style="font-size:12px; line-height:1.6; color:${T.INK}; padding:12px 16px; background:${T.PANEL}; border:1px solid ${T.LINE}; border-radius:8px; white-space:pre-wrap; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">${additionalNotes}</div>`
        }
</div>
        `
        : ""
      }
</div>
  `;
  };

  const getFooter = () =>
    getBrandFooter(
      `
<div style="text-align:center;">
<div style="width:200px; border-bottom:1px solid ${T.LINE}; margin-bottom:8px;"></div>
<div style="font-size:12px; font-weight:400; color:${T.INK};">${displayDoctorName}</div>
<div style="font-size:12px; color:${T.INK_MUTED}; font-weight:400;">${specialization}</div>
<div style="font-size:12px; color:#93999e; margin-top:2px;">(Signature/Seal)</div>
</div>
    ${!isBlankMode && isFollowUp && followUpDate
        ? `
<div style="position:absolute; left:40px; font-size:12px; color:${T.INK}; font-weight:400; border:1px solid ${T.LINE}; padding:6px 12px; border-radius:4px;">
        Next Follow-Up: ${new Date(followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
</div>
    `
        : ""
      }
  `,
      false,
      T,
    );

  let htmlContent = `<div style="width:794px; background:#fff; margin:0; padding:0; font-family: 'Inter', sans-serif; color:${T.INK}; display:flex; flex-direction:column; min-height:auto; box-sizing:border-box;"><div data-header="true"><div style="height:20px; background:${T.BRAND}; width:100%;"></div>${getHeader()}</div>`;

  let reportTitle = "Consultation Report";
  let fileNameSuffix = "full_report";

  if (type === "CLINICAL") {
    reportTitle = "Clinical Observations Report";
    fileNameSuffix = "clinical_observations";
    htmlContent +=
      getPatientInfo(reportTitle) + getClinicalSection() + getXraySection();
  } else if (type === "TREATMENT") {
    reportTitle = "Treatment Planning Report";
    fileNameSuffix = "treatment_plan";
    htmlContent += getPatientInfo(reportTitle) + getTreatmentSection();
  } else if (type === "PRESCRIPTION") {
    reportTitle = "Prescription";
    fileNameSuffix = "prescription";
    htmlContent += getPatientInfo(reportTitle) + getPrescriptionSection();
  } else {
    htmlContent +=
      getPatientInfo(reportTitle) +
      getClinicalSection() +
      getXraySection() +
      getTreatmentSection() +
      getPrescriptionSection();
  }

  htmlContent += `${getFooter()}</div>`;
  pdfContainer.innerHTML = htmlContent;

  const outputFileName = isBlankMode
    ? type === "CLINICAL"
      ? "Blank_Clinical_Observations.pdf"
      : type === "TREATMENT"
        ? "Blank_Treatment_Plan.pdf"
        : type === "PRESCRIPTION"
          ? "Blank_Prescription.pdf"
          : "Blank_Full_Summary.pdf"
    : `${patient.patientName}_${fileNameSuffix}_${new Date().toISOString().split("T")[0]}.pdf`;

  await renderContainerToPDF(pdfContainer, outputFileName);
};

export const downloadCompletedTreatmentPDF = async (treatment: any) => {
  const pdfContainer = makeOffscreenContainer();
  // Resolve branding tokens from API (falls back to hardcoded defaults)
  const T = getBrandingTokens();

  // Safely extract the inner treatment plan object if nested under "data"
  const treatmentObj = treatment?.data || treatment || {};
  const isBlankMode = treatmentObj.isBlankMode || false;

  // Safely extract doctor & patient details
  const displayDoctorName = (T.DOCTOR_NAME || "Dr. Rajal Shah").toUpperCase();
  const specialization = T.DOCTOR_TITLE || "MDS Prosthodontist & Implantologist";

  const patientName = isBlankMode ? "" : (treatmentObj.patient?.name || treatmentObj.patientName || "-");
  const patientId = isBlankMode ? "" : (treatmentObj.patient?.id || treatmentObj.patientId || "-");
  const patientCode =
    treatmentObj.patient?.patient_code ||
    treatmentObj.patient?.patientCode ||
    "-";
  const displayPatientId = isBlankMode ? "" : (
    patientCode !== "-"
      ? patientCode
      : patientId === "-"
        ? "-"
        : patientId.split("-")[0]
  );
  const rawTreatmentPhone = isBlankMode ? "" : (treatmentObj.patient?.phone || treatmentObj.patientPhone || "");
  const treatmentCountryCode = isBlankMode ? "" : (treatmentObj.patient?.country_code || treatmentObj.patient?.countryCode || treatmentObj.country_code || "+91");
  const patientPhone = isBlankMode ? "" : (rawTreatmentPhone ? formatPhoneWithCountryCode(rawTreatmentPhone, treatmentCountryCode) : "-");
  const procedure = isBlankMode ? "" : (treatmentObj.procedure || "-");
  const tooth = isBlankMode ? "" : (treatmentObj.tooth_number || treatmentObj.tooth || "General");

  const getHeader = () =>
    getLetterhead(`
<div style="font-size: 12px; font-weight: 400; color: ${T.INK}; text-transform: uppercase; letter-spacing: 0.5px;">${patientName}</div>
<div style="font-size: 12px; font-weight: 400; color: ${T.INK_MUTED}; margin-top: 4px;">Patient ID: ${displayPatientId}</div>
<div style="font-size: 12px; font-weight: 400; color: ${T.INK_MUTED}; margin-top: 2px;">Phone: ${patientPhone}</div>
    `, T);

  const getPatientInfo = () => `
<div style="padding: 10px 40px 20px 40px; background:${T.PANEL}; border-bottom: 1px solid ${T.LINE}; display:flex; justify-content:space-between; align-items:center;">
<div style="font-size:12px; font-weight:400; color:${T.INK}; text-transform:uppercase; letter-spacing:1px; font-family:'Cinzel', serif;">TREATMENT & PROCEDURE COMPLETED</div>
<div style="text-align:right; font-size:12px; color:${T.INK_MUTED}; font-weight:400;">
<span>Date: ${isBlankMode ? "___________________" : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
</div>
</div>
<div style="padding: 0 40px;">
      ${detailsGrid([
    ["Name", patientName, "Patient ID", displayPatientId],
    ["Phone", patientPhone, "Procedure", procedure],
    ["Doctor", displayDoctorName, "Tooth", tooth ? `#${tooth}` : ""],
  ])}
</div>
  `;

  // Sessions section
  const sessions = treatmentObj.sessions || [];
  let sessionsHtml = "";
  if (isBlankMode || sessions.length > 0) {
    sessionsHtml = `
<div style="padding: 16px 40px 10px;" data-avoid-break="true">
  ${sectionLabel("Treatment Session")}
  ${isBlankMode
        ? `<div style="height: 150px;"></div>`
        : `
  <table style="width:100%; border-collapse:collapse; border:1px solid ${T.LINE}; margin-top:10px;">
    <thead>
      <tr style="background:${T.PANEL}; border-bottom:2px solid ${T.LINE};">
        ${tableHeadCell("Session")}
        ${tableHeadCell("Date")}
        ${tableHeadCell("Findings")}
        ${tableHeadCell("Work Done")}
      </tr>
    </thead>
    <tbody>
      ${sessions
          .map(
            (s: any, idx: number) => `
        <tr style="border-bottom:1px solid ${T.LINE}; ${idx % 2 === 0 ? "" : `background:#fafafa;`}" data-avoid-break="true">
          <td style="padding:0; vertical-align:middle;">${makeCellContent(`Visit #${s.visit_number || idx + 1}`, "left", `font-size:12px; font-weight:400; color:${T.INK};`)}</td>
          <td style="padding:0; vertical-align:middle;">${makeCellContent(`${s.visit_date ? new Date(s.visit_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}`, "left", `font-size:12px; color:${T.INK_MUTED};`)}</td>
          <td style="padding:0; vertical-align:middle;">${makeCellContent(`${s.session_findings || s.findings || "-"}`, "left", `font-size:12px; color:${T.INK};`)}</td>
          <td style="padding:0; vertical-align:middle;">${makeCellContent(`${s.work_done || "-"}`, "left", `font-size:12px; color:${T.INK};`)}</td>
        </tr>
      `,
          )
          .join("")}
    </tbody>
  </table>
  `}
</div>
    `;
  }

  // Prescriptions section
  const prescriptions = treatmentObj.prescriptions || [];
  let prescriptionsHtml = "";
  if (isBlankMode || prescriptions.length > 0) {
    prescriptionsHtml = `
<div style="padding: 8px 40px 10px;" data-avoid-break="true">
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; border-bottom:1.5px solid ${T.LINE}; padding-bottom:5px;">
    <div style="font-size:12px; font-weight:400; color:${T.INK_MUTED};">Rx</div>
    <div style="font-size:12px; font-weight:400; color:${T.INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px;">Prescribed Medications:</div>
  </div>
  ${isBlankMode
        ? `<div style="height: 100px;"></div>`
        : `
  <table style="width:100%; border-collapse:collapse; border:1px solid ${T.LINE};">
    <thead>
      <tr style="background:${T.PANEL}; border-bottom:2px solid ${T.LINE};">
        ${tableHeadCell("Sr. No.")}
        ${tableHeadCell("Medicine")}
        ${tableHeadCell("Dosage")}
        ${tableHeadCell("Freq")}
        ${tableHeadCell("Duration")}
        ${tableHeadCell("Qty")}
      </tr>
    </thead>
    <tbody>
      ${prescriptions
          .map((p: any, idx: number) => `
          <tr style="border-bottom:1px solid ${T.LINE}; ${idx % 2 === 0 ? "" : `background:#fafafa;`}" data-avoid-break="true">
            <td style="padding:0; vertical-align:middle;">${makeCellContent(`${idx + 1}`, "left", `font-size:12px; color:#93999e;`)}</td>
            <td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.medicine?.name || p.medicine_name || p.medicineName || "-"}`, "left", `font-size:12px; font-weight:400; color:${T.INK};`)}</td>
            <td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.dosage || "-"} (${p.timing || "-"})`, "left", `font-size:12px; color:${T.INK};`)}</td>
            <td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.frequency || "-"}`, "left", `font-size:12px; color:${T.INK};`)}</td>
            <td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.duration ? `${p.duration} ${p.duration_type || "Days"}` : "-"}`, "left", `font-size:12px; color:${T.INK};`)}</td>
            <td style="padding:0; vertical-align:middle;">${makeCellContent(`${p.qty || "-"}`, "left", `font-size:12px; color:${T.INK};`)}</td>
          </tr>
        `)
          .join("")}
    </tbody>
  </table>
  `}
</div>
    `;
  }

  // Clinical notes
  let clinicalNotesHtml = "";
  if (isBlankMode || treatmentObj.clinical_notes) {
    clinicalNotesHtml = `
<div style="padding: 16px 40px 10px;" data-avoid-break="true">
  ${sectionLabel("Clinical Notes", !isBlankMode)}
  ${isBlankMode
    ? ""
    : `
  <div style="font-size:12px; line-height:1.6; color:${T.INK}; padding:12px 16px; background:${T.PANEL}; border:1px solid ${T.LINE}; border-radius:8px; min-height:auto; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">
    ${treatmentObj.clinical_notes}
  </div>
  `}
</div>
    `;
  }

  const getFooter = () =>
    getBrandFooter(
      `
<div style="text-align:center;">
<div style="width:200px; border-bottom:1px solid ${T.LINE}; margin-bottom:8px;"></div>
<div style="font-size:12px; font-weight:400; color:${T.INK};">${displayDoctorName}</div>
<div style="font-size:12px; color:${T.INK_MUTED}; font-weight:400;">${specialization}</div>
<div style="font-size:12px; color:#93999e; margin-top:2px;">(Signature/Seal)</div>
</div>
  `,
      false,
      T,
    );

  let htmlContent = `<div style="width:794px; background:#fff; margin:0; padding:0; font-family: 'Inter', sans-serif; color:${T.INK}; display:flex; flex-direction:column; min-height:auto; box-sizing:border-box;"><div data-header="true"><div style="height:20px; background:${T.BRAND}; width:100%;"></div>${getHeader()}</div>`;
  htmlContent +=
    getPatientInfo() +
    clinicalNotesHtml +
    sessionsHtml +
    prescriptionsHtml +
    getFooter() +
    "</div>";

  pdfContainer.innerHTML = htmlContent;

  const outputFileName = isBlankMode
    ? "Blank_Completed_Treatment.pdf"
    : `${patientName}_completed_treatment_${new Date().toISOString().split("T")[0]}.pdf`;

  await renderContainerToPDF(pdfContainer, outputFileName);
};

// ---------------------------------------------------------------------------
// Invoice / consolidated statement
// ---------------------------------------------------------------------------

const INK_BORDER = "#2d2d2d";
const CELL_LINE = "#c8ccd0";
const PANEL_BG = "#f2f2f2";

function numberToWords(n: number): string {
  const ONES = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const TENS = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if (n === 0) return "Zero";
  if (n < 20) return ONES[n];
  if (n < 100)
    return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  if (n < 1000)
    return (
      ONES[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " " + numberToWords(n % 100) : "")
    );
  if (n < 100000)
    return (
      numberToWords(Math.floor(n / 1000)) +
      " Thousand" +
      (n % 1000 ? " " + numberToWords(n % 1000) : "")
    );
  if (n < 10000000)
    return (
      numberToWords(Math.floor(n / 100000)) +
      " Lakh" +
      (n % 100000 ? " " + numberToWords(n % 100000) : "")
    );
  return (
    numberToWords(Math.floor(n / 10000000)) +
    " Crore" +
    (n % 10000000 ? " " + numberToWords(n % 10000000) : "")
  );
}

export const generateInvoicePDF = async (invoice: any, patient: any) => {
  // The history API returns one invoice inside responseObject.data.invoices.
  invoice = invoice?.responseObject?.data?.invoices?.[0] || invoice;
  const pdfContainer = makeOffscreenContainer();
  // Resolve branding tokens from API (falls back to hardcoded defaults)
  const T = getBrandingTokens();

  const isStatement =
    (invoice.invoice_number || "").toUpperCase() === "STATEMENT";

  const patientName = invoice.patient?.name || "N/A";
  const patientIdValue = invoice.patient_id;
  const patientCode =
    invoice.patient_code ||
    invoice.patientCode ||
    patient?.patient_code ||
    patient?.patientCode;
  const displayPatientId = String(patientCode || patientIdValue || "").trim() || "N/A";

  const invoiceNumber = invoice.invoice_number || invoice.id || "—";
  const invoiceDateValue = invoice.date || invoice.invoice_date;
  const invoiceDate = invoiceDateValue
    ? new Date(invoiceDateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const rawPayments = invoice.invoice_payments || [];
  const calculatedPaidAmount = rawPayments.reduce(
    (sum: number, p: any) => sum + (Number(p.amount) || 0),
    0,
  );
  const paidAmount =
    invoice.paidAmount !== undefined
      ? Number(invoice.paidAmount)
      : calculatedPaidAmount;
  const discountAmount = Number(invoice.discountAmount || 0);
  const discountPct = Number(invoice.discount || 0);
  const taxAmount = Number(invoice.taxAmount || 0);
  const taxPct = Number(invoice.tax || 0);
  const grandTotal = Number(invoice.grand_total || 0);

  const isMemberCheck =
    invoice.isMemberInvoice ||
    !!(
      invoice.member_id ||
      invoice.memberId ||
      patient?.memberId ||
      patient?.member_id
    );

  const gender =
    patient?.gender || invoice.member?.gender || invoice.patient?.gender || "—";
  const age =
    patient?.age ||
    ageFromDOB(
      patient?.dob ||
      patient?.dateOfBirth ||
      invoice.member?.dob ||
      invoice.patient?.dob,
    ) ||
    "—";
  const ageGender = age !== "—" || gender !== "—" ? `${age} / ${gender}` : "—";

  const phone =
    invoice.phone ||
    patient?.phone ||
    invoice.member?.phone ||
    invoice.patient?.phone ||
    "—";

  const displayDoctorName = (T.DOCTOR_NAME || "Dr. Rajal Shah").toUpperCase();

  const statementDateFormatted = invoiceDate;

  let dueDateFormatted = "";
  if (invoice.dueDate) {
    dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } else {
    const baseDate = invoice.date ? new Date(invoice.date) : new Date();
    const fallbackDueDate = new Date(
      baseDate.getTime() + 6 * 24 * 60 * 60 * 1000,
    );
    dueDateFormatted = fallbackDueDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const formatCurrency = (val: number) => {
    if (val % 1 === 0) {
      return `₹${val.toLocaleString("en-IN")}`;
    }
    return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getHeader = () =>
    getLetterhead(`
    <div style="font-size: 14px; font-weight: 400; color: ${T.INK}; text-transform: uppercase; letter-spacing: 0.5px;">
      ${isStatement ? "Consolidated Statement" : "Invoice"}
    </div>
    <div style="font-size: 16px; font-weight: 400; color: ${T.INK}; margin-top: 4px; text-transform: capitalize;">
      ${patientName}
    </div>
    <div style="margin-top: 6px;">
      ${statusBadge(invoice.status || "GENERATED")}
    </div>
  `, T);

  const items: any[] = invoice.items || [];

  // Extract values for the right column from the single invoice response.
  const firstInvoiceNumber = invoice.invoice_number || "—";
  const firstItemDate = isStatement ? statementDateFormatted : invoiceDate;

  // Member ID from the invoice response.
  const memberId = String(invoice.member_id || "").trim() || "N/A";

  const rows: Array<[string, string, string, string]> = [
    ["Name", patientName, "Date", firstItemDate],
    ["Patient ID", displayPatientId, "Invoice No.", firstInvoiceNumber],
    ["Member ID", memberId, "Phone", phone],
  ];

  const itemsHtml = items
    .map((item: any, i: number) => {
      const itemType = item.item_type || "Service";
      const formattedType =
        itemType.charAt(0).toUpperCase() +
        itemType.slice(1).replace("_", " ").toLowerCase();

      const displayDescription =
        item.description &&
          item.description.toLowerCase() !== itemType.toLowerCase()
          ? `<div style="font-size:12px; margin-top:2px;">${item.description}</div>`
          : "";

      const hsnCode = item.hsn_code || item.hsnCode || DEFAULT_SAC_CODE;
      const totalVal = Number(item.total_amount || item.amount || 0);
      const billedVal = Number(item.billed_amount || item.amount || 0);
      const discountPct = Number(item.discount_value || item.item_discount || 0);
      const displayDiscount = discountPct > 0 ? `${discountPct}%` : "—";

      return `
      <tr style="border-bottom:1px solid ${T.LINE};" data-avoid-break="true">
        <td style="padding:0; vertical-align:middle; width:10%;">${makeCellContent(`${i + 1}`, "center", `font-size:12px; font-weight:400;`)}</td>
        <td style="padding:0; vertical-align:middle; width:15%;">${makeCellContent(`${hsnCode}`, "center", `font-size:12px; font-weight:400;`)}</td>
        <td style="padding:0; vertical-align:middle; width:45%;">
          <div style="padding:12px 12px; font-size:12px; font-weight:400; text-align:left; line-height:1.2;">
            <div>${formattedType}</div>
            ${displayDescription}
          </div>
        </td>
        <td style="padding:0; vertical-align:middle; width:15%;">${makeCellContent(`${displayDiscount}`, "right", `font-size:12px; font-weight:400; color: #ef4444;`)}</td>
        <td style="padding:0; vertical-align:middle; width:15%;">${makeCellContent(`${formatCurrency(billedVal)}`, "right", `font-size:12px; font-weight:600;`)}</td>
      </tr>
    `;
    })
    .join("");

  const signatureBlock = `
    <div style="text-align:right; font-family:'Inter',sans-serif; margin-right:12px;">
      <div style="font-size:12px; font-weight:400; margin-bottom:20px">${"for " + T.CLINIC_NAME}</div>
      <div style="font-size:10px; margin-top:10px;">Authorized Signatory</div>
    </div>
  `;

  const htmlContent = `
    <div style="width:794px; background:#fff; margin:0; padding:0; color:${T.INK}; display:flex; flex-direction:column; min-height:auto; box-sizing:border-box; font-family: 'Inter', sans-serif;">
      <div data-header="true">
        <div style="height:20px; background:${T.BRAND}; width:100%;"></div>
        <div style="text-align:center; font-size:15px; font-weight:400; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; padding: 12px 0 6px; font-family: 'Cinzel', serif;">
          Invoice
        </div>
        ${getHeader()}
      </div>

      <div style="padding: 0 40px; display:flex; flex-direction:column; gap:12px; margin-top:8px;">

        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0; background:#f9fafb; border-radius:10px; padding:12px 20px; border:1px solid ${T.LINE}; margin-bottom:2px;" data-avoid-break="true">
          <!-- Left column -->
          <div style="display:flex; flex-direction:column; gap:10px; flex:1;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Name</span>
              <span style="font-size:12px; font-weight:400; text-align:right;">${patientName}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Patient ID</span>
              <span style="font-size:12px; font-weight:400; text-align:right;">${displayPatientId}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Member ID</span>
              <span style="font-size:12px; font-weight:400; text-align:right;">${memberId}</span>
            </div>
          </div>

          <!-- Divider -->
          <div style="width:1px; background:${T.LINE}; align-self:stretch; margin:0 28px;"></div>

          <!-- Right column -->
          <div style="display:flex; flex-direction:column; gap:10px; flex:1;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Date</span>
              <span style="font-size:12px; font-weight:400; text-align:right;">${firstItemDate}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Invoice No.</span>
              <span style="font-size:12px; font-weight:400; text-align:right;">${firstInvoiceNumber}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Phone</span>
              <span style="font-size:12px; font-weight:400; text-align:right;">${phone}</span>
            </div>
          </div>
        </div>


        <div style="margin-top:8px;">
          ${sectionLabel("Particulars")}
          <table style="width:100%; border-collapse:collapse; margin-top:8px; border-bottom:1.5px solid ${T.LINE};">
            <thead>
              <tr style="border-top:1.5px solid ${T.LINE}; border-bottom:1.5px solid ${T.LINE}; background:#fafafa;">
                <th style="padding:10px 12px; text-align:center; font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.4px; width:10%; vertical-align:middle; line-height:1.4;">Sr. No</th>
                <th style="padding:10px 12px; text-align:center; font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.4px; width:15%; vertical-align:middle; line-height:1.4;">HSN/SAC</th>
                <th style="padding:10px 12px; text-align:left; font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.4px; width:45%; vertical-align:middle; line-height:1.4;">Item Type</th>
                <th style="padding:10px 12px; text-align:right; font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.4px; width:15%; vertical-align:middle; line-height:1.4;">Discount</th>
                <th style="padding:10px 12px; text-align:right; font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.4px; width:15%; vertical-align:middle; line-height:1.4;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>


        <div style="display:flex; justify-content:flex-end; margin-top:4px; margin-bottom:8px;" data-avoid-break="true">
          <div style="min-width:280px; display:flex; flex-direction:column; gap:4px;">
            <table style="width:100%; border-collapse:collapse; font-size:12px; color:${T.INK};">
              <tbody>
                <tr>
                  <td style="padding:5px 0; font-size:12px; font-weight:400; vertical-align:middle;">Total Amount</td>
                  <td style="padding:5px 0; text-align:right; font-size:12px; font-weight:400; padding-right:10px; vertical-align:middle;">${formatCurrency(items.reduce((s: number, it: any) => s + Number(it.total_amount || it.amount || 0), 0))}</td>
                </tr>
                ${discountAmount > 0
      ? `
                <tr>
                  <td style="padding:5px 0; color:${T.INK_MUTED}; font-weight:400; vertical-align:middle;">Discount (${discountPct}%)</td>
                  <td style="padding:5px 0; text-align:right; font-weight:400; color:#9c2626; vertical-align:middle;">-${formatCurrency(discountAmount)}</td>
                </tr>`
      : ""
    }
                
              </tbody>
            </table>
            <div style="background:${T.BRAND}; color:#ffffff; border-radius:6px; padding:10px 14px 25px 14px; text-align:center; margin-top:4px;">
              <span style="font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.5px; ">Grand Total &nbsp; ${formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

      </div>


      ${getBrandFooter(signatureBlock, true, T)}

    </div>
  `;

  pdfContainer.innerHTML = htmlContent;

  await renderContainerToPDF(
    pdfContainer,
    `Invoice_${firstInvoiceNumber || invoice.id}.pdf`,
  );
};

export type BlankPDFType =
  | "CLINICAL"
  | "TREATMENT"
  | "PRESCRIPTION"
  | "FULL"
  | "COMPLETION";

export const downloadBlankPDF = async (type: BlankPDFType) => {
  if (type === "COMPLETION") {
    await downloadCompletedTreatmentPDF({
      isBlankMode: true,
      patient: { name: "", id: "—", phone: "" },
      procedure: "",
      tooth_number: "",
      sessions: [1, 2, 3, 4, 5],
      prescriptions: [1, 2, 3, 4, 5],
    });
  } else {
    await downloadConsultationPDF({
      type: type as PDFReportType,
      patient: {
        id: "—",
        patientName: "",
        phone: "",
        doctorName: "DR. RAJAL SHAH",
      },
      consultationData: {
        isBlankMode: true,
        patientConcern: "",
        observations: "",
        diagnosis: "",
        additional_notes: "",
        treatment_plan_desc: "",
        treatments: [1, 2, 3, 4, 5],
        prescriptions: [1, 2, 3, 4, 5],
      },
    });
  }
};
