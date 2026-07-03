import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoImg from "../logo.png";

export type PDFReportType = "FULL" | "CLINICAL" | "TREATMENT" | "PRESCRIPTION";

// ---------------------------------------------------------------------------
// Brand tokens
// Brand color is used ONLY in the letterhead accent bar and the footer band.
// Everything else (labels, table text, totals, badges) is plain black/gray
// so the document reads like a standard printed invoice, not a colored flyer.
// ---------------------------------------------------------------------------
const BRAND = "#506761"; // header accent bar + footer band ONLY
const INK = "#0f1115"; // primary body text â€” black
const INK_MUTED = "#506761"; // secondary/muted body text
const LINE = "#d7dbde"; // table/section borders — neutral gray
const PANEL = "#f7f8f8"; // neutral panel background (notes, alt rows)

const CLINIC_NAME = "Opal Smiles Dental Studio";
const CLINIC_TAGLINE = "Dental & Facial Aesthetics";
const CLINIC_ADDRESS =
  "104, Unicus Shyamal, Shyamal Cross Road, Satellite, Ahmedabad, Gujarat — 380 015";
const CLINIC_PHONE = "+91 99981 93256";
const CLINIC_EMAIL = "rajal.shah@opalsmiles.com";
const CLINIC_HOURS = "Mon–Sat: 10:00 AM – 8:00 PM | Emergency: 24 / 7";
const CLINIC_INSTAGRAM = "@opalsmiles_dental";

// Default SAC (Services Accounting Code) applied to line items that don't carry
// their own code. 999312 = "Medical and dental services" (consultations, exams,
// general/orthodontic/periodontic treatment — GST-exempt as of last check).
// NOTE: this code is for *services*. If you ever bill a physical product/goods
// line (retail item, appliance sold outright, etc.) that needs a proper HSN
// goods code instead â€” don't default those rows to 999312. Pass `hsn_code` /
// `hsnCode` on the item to override per line.
const DEFAULT_SAC_CODE = "999312";

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

/** Renders an offscreen container to a multi-page A4 PDF and saves it. */
async function renderContainerToPDF(
  pdfContainer: HTMLElement,
  fileName: string,
) {
  document.body.appendChild(pdfContainer);
  await waitForAssets(pdfContainer);

  try {
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 794,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 10) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
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
function getLetterhead(rightBlock: string) {
  return `
<div style="height:6px; background:${BRAND};"></div>
<div style="padding: 18px 40px 14px; display:flex; flex-direction:row; justify-content:space-between; align-items:center; border-bottom: 1px solid ${LINE};">
  <div style="display:flex; flex-direction:column; justify-content:center; gap:2px;">
    <div style="font-size: 14px; font-weight: 800; color: ${BRAND}; text-transform: uppercase; letter-spacing: 0.3px;">DR. RAJAL SHAH</div>
    <div style="font-size: 9.5px; font-weight: 700; color: ${INK}; margin-top: 3px; text-transform: uppercase; line-height: 1.3; letter-spacing: 0.2px;">
      M.D.S PROSTHODONTIST &amp; IMPLANTOLOGIST
    </div>
  </div>
  <img src="${logoImg}" style="width:90px; height:72px; object-fit:contain; display:block; flex-shrink:0;" crossorigin="anonymous" />
</div>
  `;
}

/** Shared footer band used across all PDF types. Brand color is the solid
 *  fill here — the only other place brand color appears besides the top bar. */
function getBrandFooter(signatureBlock: string) {
  const svgStyle = `display:block; flex-shrink:0; margin-right:6px;`;
  const iconPhone = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.36 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
  const iconEmail = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
  const iconInstagram = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
  const iconLocation = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

  return `
<div style="margin-top:auto;">
<div style="padding: 14px 40px 0;">
<div style="display:flex; justify-content:flex-end;">
          ${signatureBlock}
</div>
</div>
<div style="height:12px;"></div>
<div style="background:${BRAND}; padding:14px 40px; color:#ffffff;">
<div style="display:flex; flex-direction:row; align-items:center; margin-bottom:4px;">
  ${iconLocation}<span style="font-size:10.5px; font-weight:700; margin-bottom:12px;">${CLINIC_ADDRESS}</span>
</div>
<div style="display:flex; flex-direction:row; align-items:center; gap:20px; margin-bottom:4px;">
  <div style="display:flex; flex-direction:row; align-items:center;">${iconPhone}<span style="font-size:10px; font-weight:500; margin-bottom:12px;">${CLINIC_PHONE}</span></div>
  <div style="display:flex; flex-direction:row; align-items:center;">${iconEmail}<span style="font-size:10px; font-weight:500; margin-bottom:12px;">${CLINIC_EMAIL}</span></div>
  <div style="display:flex; flex-direction:row; align-items:center;">${iconInstagram}<span style="font-size:10px; font-weight:500; margin-bottom:12px;">${CLINIC_INSTAGRAM}</span></div>
</div>
<div style="font-size:10px; font-weight:500; opacity:0.85;">${CLINIC_HOURS}</div>
</div>
</div>
  `;
}

/** Neutral black/gray status badge â€” no brand tint, so it reads correctly
 *  next to the rest of the black-ink document. */
function statusBadge(status: string) {
  const s = status.toLowerCase();
  const palette =
    s === "paid"
      ? { bg: "#e7f4ea", fg: "#1e6b33" }
      : s === "overdue"
        ? { bg: "#fbe9e9", fg: "#9c2626" }
        : { bg: "#eef0f1", fg: INK };
  return `<span style="padding:4px 12px; border-radius:20px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.4px; background:${palette.bg}; color:${palette.fg};">${status}</span>`;
}

const sectionLabel = (text: string) =>
  `<div style="font-size:11px; font-weight:800; color:${INK}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; border-bottom:1.5px solid ${LINE}; padding-bottom:5px;">${text}</div>`;

const tableHeadCell = (text: string, align: string = "left") =>
  `<th style="padding:10px 12px; text-align:${align}; font-size:10px; font-weight:800; color:${INK}; text-transform:uppercase; letter-spacing:0.4px;">${text}</th>`;

/** A bordered label/value grid â€” the classic "tax invoice" look â€” used for the
 *  patient + invoice meta block. 4 columns: label | value | label | value. */
function detailsGrid(rows: Array<[string, string, string, string]>) {
  return `
<table style="width:100%; border-collapse:collapse; border:1px solid ${LINE}; margin-top:16px;">
<tbody>
        ${rows
          .map(
            (row) => `
<tr>
<td style="width:16%; padding:9px 12px; font-size:10px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.3px; background:${PANEL}; border:1px solid ${LINE};">${row[0]}</td>
<td style="width:34%; padding:9px 12px; font-size:12px; font-weight:700; color:${INK}; border:1px solid ${LINE};">${row[1]}</td>
<td style="width:16%; padding:9px 12px; font-size:10px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.3px; background:${PANEL}; border:1px solid ${LINE};">${row[2]}</td>
<td style="width:34%; padding:9px 12px; font-size:12px; font-weight:700; color:${INK}; border:1px solid ${LINE};">${row[3]}</td>
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

  const doctorName = doctorObj?.name || patient.doctorName || "";
  const specialization =
    doctorObj?.personal_profile?.specialization?.name ||
    doctorObj?.specialization?.name ||
    doctorObj?.specialization ||
    "Dentistry";
  const displayDoctorName = doctorName
    ? doctorName.toLowerCase().startsWith("dr.")
      ? doctorName
      : `Dr. ${doctorName}`
    : "â€”";

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
  const patientName = patientObj?.name || patient.patientName || "â€”";
  const patientId = patientObj?.id || patient.id || "â€”";
  const patientCode =
    patientObj?.patient_code ||
    patientObj?.patientCode ||
    (patient as any).patient_code ||
    (patient as any).patientCode;
  const displayPatientId =
    patientCode || (patientId === "â€”" ? "â€”" : patientId.split("-")[0]);
  const patientPhone = patientObj?.phone || patient.phone || "â€”";
  const patientGender = patientObj?.gender || (patient as any).gender || "â€”";
  const patientAge =
    patientObj?.age ||
    ageFromDOB(patientObj?.dob || (patient as any).dob) ||
    "â€”";
  const patientBloodGroup = (
    patientObj?.blood_group ||
    (patient as any).bloodGroup ||
    "â€”"
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
    consultationData.additional_notes ||
    consultationData.data?.recommendations ||
    consultationData.data?.additional_notes ||
    consultationData.data?.data?.recommendations ||
    consultationData.data?.data?.additional_notes ||
    "â€”";

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
        finalToothChart[finding.tooth_number] = finding.condition;
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
      p.medicine_id || p.id || p.medicine || p.medicine_name || p.medicineName,
  );

  const getHeader = () =>
    getLetterhead(`
<div style="font-size: 16px; font-weight: 800; color: ${INK}; text-transform: uppercase; letter-spacing: 0.5px;">${patientName}</div>
<div style="font-size: 12.5px; font-weight: 600; color: ${INK_MUTED}; margin-top: 4px;">Patient ID: ${displayPatientId}</div>
<div style="font-size: 11.5px; font-weight: 500; color: ${INK_MUTED}; margin-top: 2px;">Phone: ${patientPhone}</div>
<div style="font-size: 11.5px; font-weight: 500; color: ${INK_MUTED}; margin-top: 2px;">Age ${patientAge} / ${patientGender} / ${patientBloodGroup}</div>
  `);

  const getPatientInfo = (title: string) => `
<div style="padding: 12px 40px; background:${PANEL}; border-bottom: 1px solid ${LINE}; display:flex; justify-content:space-between; align-items:center;">
<div style="font-size:12px; font-weight:800; color:${INK}; text-transform:uppercase; letter-spacing:1px;">${title}</div>
<div style="text-align:right; font-size:11px; color:${INK_MUTED}; font-weight:600;">
<span>Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
</div>
</div>
<div style="padding: 0 40px;">
      ${detailsGrid([
        ["Patient Name", patientName, "Patient ID", displayPatientId],
        [
          "Age / Gender",
          `${patientAge} / ${patientGender}`,
          "Phone",
          patientPhone,
        ],
        ["Doctor", displayDoctorName, "Specialization", specialization],
      ])}
</div>
  `;

  const getClinicalSection = () => `
<div style="padding: 16px 40px 10px;">
      ${
        patientConcern
          ? `
<div style="margin-bottom:16px;">
          ${sectionLabel("Chief Complaint")}
<div style="font-size:13px; line-height:1.5; color:${INK}; font-weight:500;">${patientConcern}</div>
</div>
      `
          : ""
      }
<div style="display:flex; flex-direction:row; justify-content:space-between; width:100%; gap:24px;">
<div style="flex:1;">
          ${sectionLabel("Clinical Observations")}
<div style="font-size:13px; line-height:1.6; color:${INK};">
            ${observations || `<span style="color:#93999e; font-style:italic;">No observations recorded.</span>`}
</div>
          ${
            Object.keys(finalToothChart).length > 0
              ? `
<div style="margin-top:14px;">
<div style="font-size:10px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; margin-bottom:6px;">Tooth Findings</div>
<div style="display:flex; flex-wrap:wrap; gap:4px;">
                 ${Object.entries(finalToothChart)
                   .map(
                     ([num, cond]) =>
                       `<span style="font-size:11px; padding: 4px 8px; border-radius:4px; background:${PANEL}; border:1px solid ${LINE}; color:${INK}; font-weight:600;">#${num}: ${cond}</span>`,
                   )
                   .join("")}
</div>
</div>
          `
              : ""
          }
</div>
<div style="flex:1;">
          ${sectionLabel("Diagnosis")}
<div style="font-size:13px; line-height:1.6; color:${INK};">
            ${diagnosis || `<span style="color:#93999e; font-style:italic;">No diagnosis provided.</span>`}
</div>
</div>
</div>
</div>
  `;

  const getXraySection = () => {
    const xrayFiles =
      consultationData.xrayFiles || consultationData.data?.xrayFiles || [];
    if (!xrayFiles || xrayFiles.length === 0) return "";
    return `
<div style="padding: 8px 40px 10px;">
        ${sectionLabel("Diagnostic Imaging (X-Ray)")}
<div style="display:flex; flex-direction:row; flex-wrap:wrap; gap:15px; width:100%;">
          ${xrayFiles
            .map(
              (url: string, i: number) => `
<div style="width:30%; border:1px solid ${LINE}; border-radius:10px; overflow:hidden; background:${PANEL}; box-sizing:border-box;">
<img src="${url}" style="width:100%; height:130px; object-fit:cover;" />
<div style="padding:6px; text-align:center; font-size:10px; color:${INK_MUTED}; font-weight:700; background:#ffffff;">Image #${i + 1}</div>
</div>
          `,
            )
            .join("")}
</div>
</div>
    `;
  };

  const getTreatmentSection = () => {
    let treatmentsHtml = "";
    if (treatmentsArray && treatmentsArray.length > 0) {
      treatmentsHtml = `
<table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid ${LINE}; margin-top:10px;">
<thead>
<tr style="background:${PANEL}; border-bottom:2px solid ${LINE};">
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
<tr style="border-bottom:1px solid #eef0f1; ${i % 2 === 0 ? "" : `background:#fafafa;`}">
<td style="padding:10px 12px; font-size:12px; font-weight:700; color:${INK};">#${t.tooth_number || t.tooth || "General"}</td>
<td style="padding:10px 12px; font-size:12px; font-weight:600; color:${INK};">${t.procedure || t.treatment_type || "â€”"}</td>
<td style="padding:10px 12px; font-size:12px; text-align:center; color:${INK_MUTED};">${Array.isArray(t.sessions) ? t.sessions.length : t.sessions || 1}</td>
<td style="padding:10px 12px; font-size:12px; text-align:right; font-weight:700; color:${INK};">â‚¹${Number(t.est_cost || t.cost || 0).toLocaleString("en-IN")}</td>
</tr>
            `,
              )
              .join("")}
</tbody>
</table>
      `;
    } else {
      treatmentsHtml = `
<div style="background:#fff; border:1px solid ${LINE}; padding:15px; border-radius:8px; font-size:13px; color:${INK_MUTED};">
<strong>Procedure:</strong> ${consultationData.treatmentProcedure || consultationData.procedure || "â€”"}<br/>
<strong style="display:inline-block; margin-top:6px;">Plan:</strong> ${consultationData.treatmentPlan || consultationData.treatment_plan_description || "â€”"}<br/>
<strong style="display:inline-block; margin-top:6px;">Sessions:</strong> ${consultationData.treatmentSessions || 1} | <strong>Estimated Cost:</strong> â‚¹${(consultationData.treatmentCost || consultationData.cost || 0).toLocaleString("en-IN")}
</div>
      `;
    }

    return `
<div style="padding: 8px 40px 10px;">
        ${sectionLabel("Treatment Planning & Procedures")}
        ${treatmentsHtml}
<div style="margin-top:16px;">
<div style="font-size:10px; font-weight:800; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Recommendations & Notes</div>
<div style="font-size:12px; line-height:1.6; color:${INK}; padding:12px 16px; background:${PANEL}; border:1px solid ${LINE}; border-radius:8px;">
            ${recommendations}
</div>
</div>
        ${
          additionalNotes
            ? `
<div style="margin-top:12px;">
<div style="font-size:10px; font-weight:800; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Additional Clinical Notes</div>
<div style="font-size:12px; line-height:1.5; color:${INK_MUTED};">${additionalNotes}</div>
</div>
        `
            : ""
        }
</div>
    `;
  };

  const getPrescriptionSection = () => `
<div style="padding: 8px 40px 10px;">
<div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; border-bottom:1.5px solid ${LINE}; padding-bottom:5px;">
<div style="font-size:14px; font-weight:800; color:${INK};">Rx</div>
<div style="font-size:11px; font-weight:800; color:${INK}; text-transform:uppercase; letter-spacing:0.5px;">Prescribed Medications</div>
</div>
<table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid ${LINE};">
<thead>
<tr style="background:${PANEL}; border-bottom:2px solid ${LINE};">
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
<tr style="border-bottom:1px solid #eef0f1; ${i % 2 === 0 ? "" : `background:#fafafa;`}">
<td style="padding:10px 12px; font-size:12px; color:#93999e;">${i + 1}</td>
<td style="padding:10px 12px; font-size:12px; font-weight:700; color:${INK};">${p.medicine?.name || p.medicine?.medicine_name || p.medicine_name || p.medicineName || (typeof p.medicine === "string" ? p.medicine : "") || "-"}</td>
<td style="padding:10px 12px; font-size:12px; color:${INK_MUTED};">${p.dosage || "-"} (${p.timing || "-"})</td>
<td style="padding:10px 12px; font-size:12px; color:${INK_MUTED};">${p.frequency || "-"}</td>
<td style="padding:10px 12px; font-size:12px; color:${INK_MUTED};">${p.duration ? `${p.duration} ${p.durationUnit || p.duration_type || "Days"}` : "-"}</td>
<td style="padding:10px 12px; font-size:12px; color:${INK_MUTED};">${p.qty || "-"}</td>
</tr>
          `,
            )
            .join("")}
</tbody>
</table>
</div>
  `;

  const getFooter = () =>
    getBrandFooter(`
<div style="text-align:center;">
<div style="width:200px; border-bottom:1px solid ${LINE}; margin-bottom:8px;"></div>
<div style="font-size:13px; font-weight:800; color:${INK};">${displayDoctorName}</div>
<div style="font-size:11px; color:${INK_MUTED}; font-weight:500;">${specialization}</div>
<div style="font-size:10px; color:#93999e; margin-top:2px;">(Signature/Seal)</div>
</div>
    ${
      isFollowUp && followUpDate
        ? `
<div style="position:absolute; left:40px; font-size:12px; color:${INK}; font-weight:700; border:1px solid ${LINE}; padding:6px 12px; border-radius:4px;">
        Next Follow-Up: ${new Date(followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
</div>
    `
        : ""
    }
  `);

  let htmlContent = `<div style="width:794px; background:#fff; margin:0; padding:0; font-family: 'Cinzel', serif; color:${INK}; display:flex; flex-direction:column; min-height:1123px; box-sizing:border-box;">${getHeader()}`;

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

  await renderContainerToPDF(
    pdfContainer,
    `${patient.patientName}_${fileNameSuffix}_${new Date().toISOString().split("T")[0]}.pdf`,
  );
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
  const pdfContainer = makeOffscreenContainer();

  const isStatement =
    (invoice.invoice_number || "").toUpperCase() === "STATEMENT";

  const patientName = invoice.patientName || patient?.name || "—";
  const patientId = invoice.patientId || patient?.id || "—";
  const patientCode =
    invoice.patient_code ||
    invoice.patientCode ||
    patient?.patient_code ||
    patient?.patientCode;
  const displayPatientId =
    patientCode || (patientId === "—" ? "—" : patientId.split("-")[0]);

  const invoiceNumber = invoice.invoice_number || invoice.id || "—";
  const invoiceDate = invoice.date
    ? new Date(invoice.date).toLocaleDateString("en-IN", {
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
  const grandTotal = Number(invoice.total || invoice.grand_total || 0);

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

  const doctorName = invoice.doctor || patient?.doctorName || "";
  const displayDoctorName = doctorName
    ? doctorName.toLowerCase().startsWith("dr.")
      ? doctorName
      : `Dr. ${doctorName}`
    : "Dr. General Dentist";

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
    <div style="font-size: 14px; font-weight: 800; color: ${INK}; text-transform: uppercase; letter-spacing: 0.5px;">
      ${isStatement ? "Consolidated Statement" : "Invoice"}
    </div>
    <div style="font-size: 16px; font-weight: 800; color: ${INK}; margin-top: 4px; text-transform: capitalize;">
      ${patientName}
    </div>
    <div style="margin-top: 6px;">
      ${statusBadge(invoice.status || "GENERATED")}
    </div>
  `);

  const items: any[] = invoice.items || [];

  // Extract values for the right column from the first item/invoice
  // items[0].invoice_number carries the real invoice number even on a consolidated statement
  const firstInvoiceNumber =
    items[0]?.invoice_number || invoice.invoice_number || invoice.id || "—";
  const firstItemDate = isStatement ? statementDateFormatted : invoiceDate;

  // Member ID (from invoice or member object)
  const memberId =
    invoice.member_id ||
    invoice.memberId ||
    invoice.member?.id ||
    patient?.member_id ||
    patient?.memberId ||
    "—";

  const rows: Array<[string, string, string, string]> = [
    ["Patient Name", patientName, "Date", firstItemDate],
    ["Patient ID", "—", "Invoice No.", firstInvoiceNumber],
    [
      "Member ID",
      memberId !== "—" ? memberId.split("-")[0] : "—",
      "Phone",
      phone,
    ],
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
          ? `<div style="font-size:9.5px; color:${INK_MUTED}; margin-top:2px;">${item.description}</div>`
          : "";

      const hsnCode = item.hsn_code || item.hsnCode || DEFAULT_SAC_CODE;
      const totalVal = Number(item.total_amount || item.amount || 0);
      const billedVal = Number(item.billed_amount || item.amount || 0);

      return `
      <tr style="border-bottom:1px solid ${LINE};">
        <td style="padding:12px 12px; font-size:11px; font-weight:700; color:${INK}; text-align:center; width:10%;">${i + 1}</td>
        <td style="padding:12px 12px; font-size:11px; font-weight:500; color:${INK_MUTED}; text-align:center; width:15%;">${hsnCode}</td>
        <td style="padding:12px 12px; font-size:11px; font-weight:600; color:${INK}; text-align:left; width:45%;">
          <div>${formattedType}</div>
          ${displayDescription}
        </td>
        <td style="padding:12px 12px; font-size:11px; font-weight:700; color:${INK_MUTED}; text-align:right; width:15%;">${formatCurrency(totalVal)}</td>
        
      </tr>
    `;
    })
    .join("");

  const signatureBlock = `
    <div style="text-align:right; font-family:'Inter',sans-serif; margin-right:12px;">
      <div style="font-size:10px; font-weight:500; margin-bottom:20px">${"for Opal Smiles Dental Studio"}</div>
      <div style="font-size:8px; margin-top:10px;">Authorized Signatory</div>
    </div>
  `;

  const htmlContent = `
    <div style="width:794px; background:#fff; margin:0; padding:0; color:${INK}; display:flex; flex-direction:column; min-height:1123px; box-sizing:border-box; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

      <div style="text-align:center; font-size:15px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; padding: 12px 0 6px;">
        ${"Invoice"}
      </div>

      ${getHeader()}

      <div style="padding: 0 40px; display:flex; flex-direction:column; gap:12px; margin-top:8px;">

        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0; background:#f9fafb; border-radius:10px; padding:12px 20px; border:1px solid ${LINE}; margin-bottom:2px;">
          <!-- Left column -->
          <div style="display:flex; flex-direction:column; gap:10px; flex:1;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:9.5px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Patient Name</span>
              <span style="font-size:11.5px; font-weight:700; color:${INK}; text-align:right;">${patientName}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:9.5px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Patient ID</span>
              <span style="font-size:11px; font-weight:600; color:${INK}; text-align:right;">—</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:9.5px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Member ID</span>
              <span style="font-size:11px; font-weight:600; color:${INK}; text-align:right;">${memberId !== "—" ? memberId.split("-")[0] : "—"}</span>
            </div>
          </div>

          <!-- Divider -->
          <div style="width:1px; background:${LINE}; align-self:stretch; margin:0 28px;"></div>

          <!-- Right column -->
          <div style="display:flex; flex-direction:column; gap:10px; flex:1;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:9.5px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Date</span>
              <span style="font-size:11px; font-weight:600; color:${INK}; text-align:right;">${firstItemDate}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:9.5px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Invoice No.</span>
              <span style="font-size:11px; font-weight:700; color:${INK}; text-align:right;">${firstInvoiceNumber}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <span style="font-size:9.5px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;">Phone</span>
              <span style="font-size:11px; font-weight:600; color:${INK}; text-align:right;">${phone}</span>
            </div>
          </div>
        </div>


        <div style="margin-top:8px;">
          ${sectionLabel("Particulars")}
          <table style="width:100%; border-collapse:collapse; margin-top:8px; border-bottom:1.5px solid ${LINE};">
            <thead>
              <tr style="border-top:1.5px solid ${LINE}; border-bottom:1.5px solid ${LINE}; background:#fafafa;">
                <th style="padding:10px 12px; text-align:center; font-size:10px; font-weight:800; color:${INK}; text-transform:uppercase; letter-spacing:0.4px; width:10%;">Sr. No</th>
                <th style="padding:10px 12px; text-align:center; font-size:10px; font-weight:800; color:${INK}; text-transform:uppercase; letter-spacing:0.4px; width:15%;">HSN/SAC</th>
                <th style="padding:10px 12px; text-align:left; font-size:10px; font-weight:800; color:${INK}; text-transform:uppercase; letter-spacing:0.4px; width:45%;">Item Type</th>
                <th style="padding:10px 12px; text-align:right; font-size:10px; font-weight:800; color:${INK}; text-transform:uppercase; letter-spacing:0.4px; width:15%;">Amount</th>
            
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>


        <div style="display:flex; justify-content:flex-end; margin-top:4px; margin-bottom:8px;">
          <div style="min-width:280px; display:flex; flex-direction:column; gap:4px;">
            <table style="width:100%; border-collapse:collapse; font-size:12px; color:${INK};">
              <tbody>
                <tr>
                  <td style="padding:5px 0; color:${INK_MUTED}; font-weight:600;">Total Amount</td>
                  <td style="padding:5px 0; text-align:right; font-weight:700;">${formatCurrency(items.reduce((s: number, it: any) => s + Number(it.total_amount || it.amount || 0), 0))}</td>
                </tr>
                ${
                  discountAmount > 0
                    ? `
                <tr>
                  <td style="padding:5px 0; color:${INK_MUTED}; font-weight:600;">Discount (${discountPct}%)</td>
                  <td style="padding:5px 0; text-align:right; font-weight:700; color:#9c2626;">-${formatCurrency(discountAmount)}</td>
                </tr>`
                    : ""
                }
                
              </tbody>
            </table>
            <div style="background:${BRAND}; color:#ffffff; border-radius:6px; padding:10px 14px; text-align:center; margin-top:4px;">
              <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">Grand Total &nbsp; ${formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

      </div>


      ${getBrandFooter(signatureBlock)}

    </div>
  `;

  pdfContainer.innerHTML = htmlContent;

  await renderContainerToPDF(
    pdfContainer,
    `Invoice_${invoice.invoice_number || invoice.id}_${patientName}.pdf`,
  );
};
