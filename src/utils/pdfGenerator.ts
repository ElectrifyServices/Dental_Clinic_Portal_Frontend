import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoImg from '../logo.png';

export type PDFReportType = 'FULL' | 'CLINICAL' | 'TREATMENT' | 'PRESCRIPTION';

// ---------------------------------------------------------------------------
// Brand tokens
// Brand color is used ONLY in the letterhead accent bar and the footer band.
// Everything else (labels, table text, totals, badges) is plain black/gray
// so the document reads like a standard printed invoice, not a colored flyer.
// ---------------------------------------------------------------------------
const BRAND = "#4e6e65";        // header accent bar + footer band ONLY
const INK = "#0f1115";          // primary body text â€” black
const INK_MUTED = "#5a6168";    // secondary/muted body text â€” neutral gray, no green tint
const LINE = "#d7dbde";         // table/section borders â€” neutral gray
const PANEL = "#f7f8f8";        // neutral panel background (notes, alt rows)

const CLINIC_NAME = "Opal Smiles Dental Studio";
const CLINIC_TAGLINE = "Dental & Facial Aesthetics";
const CLINIC_ADDRESS = "104, Unicus Shyamal, Shyamal Cross Road, Satellite, Ahmedabad, Gujarat â€“ 380 015";
const CLINIC_PHONE = "+91 99981 93256";
const CLINIC_EMAIL = "hello@opalsmiles.in";
const CLINIC_HOURS = "Monâ€“Sat: 10:00 AM â€“ 8:00 PM | Emergency: 24 / 7";
const CLINIC_INSTAGRAM = "@opalsmiles_dental";

// Default SAC (Services Accounting Code) applied to line items that don't carry
// their own code. 999312 = "Medical and dental services" (consultations, exams,
// general/orthodontic/periodontic treatment â€” GST-exempt as of last check).
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
    })
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
async function renderContainerToPDF(pdfContainer: HTMLElement, fileName: string) {
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
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });

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

/** Shared letterhead used across all PDF types. Brand color lives only in the
*  top accent bar here â€” all text below it is plain ink/muted gray. */
function getLetterhead(rightBlock: string) {
  return `
<div style="height:6px; background:${BRAND};"></div>
<div style="padding: 22px 40px 16px; display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid ${LINE};">
<div style="display:flex; align-items:center; gap:14px;">
<img src="${logoImg}" style="height: 62px; width: auto; object-fit: contain;" crossorigin="anonymous" />
<div>
<div style="font-size:16px; font-weight:800; color:${INK}; letter-spacing:0.3px;">${CLINIC_NAME}</div>
<div style="font-size:11px; font-weight:600; color:${INK_MUTED}; margin-top:2px;">${CLINIC_TAGLINE}</div>
</div>
</div>
<div style="text-align:right;">
        ${rightBlock}
</div>
</div>
  `;
}

/** Shared footer band used across all PDF types. Brand color is the solid
*  fill here â€” the only other place brand color appears besides the top bar. */
function getBrandFooter(signatureBlock: string) {
  return `
<div style="margin-top:auto;">
<div style="padding: 18px 40px 0;">
<div style="display:flex; justify-content:flex-end;">
          ${signatureBlock}
</div>
</div>
<div style="height:16px;"></div>
<div style="background:${BRAND}; padding:16px 40px; color:#ffffff; display:flex; justify-content:space-between; align-items:center;">
<div style="flex:1; display:flex; flex-direction:column; gap:3px;">
<div style="font-size:11px; font-weight:700;">${CLINIC_ADDRESS}</div>
<div style="font-size:10.5px; font-weight:500; opacity:0.9;">Phone: ${CLINIC_PHONE} &nbsp;|&nbsp; Email: ${CLINIC_EMAIL}</div>
<div style="font-size:10.5px; font-weight:500; opacity:0.9;">${CLINIC_HOURS}</div>
<div style="font-size:10.5px; font-weight:500; opacity:0.9;">Instagram: ${CLINIC_INSTAGRAM}</div>
</div>
<div style="width:56px; height:56px; background:white; padding:4px; border-radius:6px; flex-shrink:0;">
<img src="/opalsmiles-qr.png" style="width:100%; height:100%; object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />
</div>
</div>
</div>
  `;
}

/** Neutral black/gray status badge â€” no brand tint, so it reads correctly
*  next to the rest of the black-ink document. */
function statusBadge(status: string) {
  const s = status.toLowerCase();
  const palette =
    s === "paid" ? { bg: "#e7f4ea", fg: "#1e6b33" } :
      s === "overdue" ? { bg: "#fbe9e9", fg: "#9c2626" } :
        { bg: "#eef0f1", fg: INK };
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
        ${rows.map((row) => `
<tr>
<td style="width:16%; padding:9px 12px; font-size:10px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.3px; background:${PANEL}; border:1px solid ${LINE};">${row[0]}</td>
<td style="width:34%; padding:9px 12px; font-size:12px; font-weight:700; color:${INK}; border:1px solid ${LINE};">${row[1]}</td>
<td style="width:16%; padding:9px 12px; font-size:10px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.3px; background:${PANEL}; border:1px solid ${LINE};">${row[2]}</td>
<td style="width:34%; padding:9px 12px; font-size:12px; font-weight:700; color:${INK}; border:1px solid ${LINE};">${row[3]}</td>
</tr>
        `).join('')}
</tbody>
</table>
  `;
}

// ---------------------------------------------------------------------------
// Consultation / clinical / treatment / prescription report
// ---------------------------------------------------------------------------

export const downloadConsultationPDF = async ({
  type = 'FULL',
  patient,
  consultationData,
  toothChartState = {}
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
  const specialization = doctorObj?.personal_profile?.specialization?.name ||
    doctorObj?.specialization?.name ||
    doctorObj?.specialization ||
    "Dentistry";
  const displayDoctorName = doctorName ? (doctorName.toLowerCase().startsWith("dr.") ? doctorName : `Dr. ${doctorName}`) : "â€”";

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
  const patientCode = patientObj?.patient_code || patientObj?.patientCode || (patient as any).patient_code || (patient as any).patientCode;
  const displayPatientId = patientCode || (patientId === "â€”" ? "â€”" : patientId.split('-')[0]);
  const patientPhone = patientObj?.phone || patient.phone || "â€”";
  const patientGender = patientObj?.gender || (patient as any).gender || "â€”";
  const patientAge = patientObj?.age || ageFromDOB(patientObj?.dob || (patient as any).dob) || "â€”";
  const patientBloodGroup = (patientObj?.blood_group || (patient as any).bloodGroup || "â€”").replace('_', ' ');

  // Extract clinical observations, diagnosis, treatment plans, concern, notes, etc.
  const observations = consultationData.observations ||
    consultationData.observations_desc ||
    consultationData.data?.observations ||
    consultationData.data?.observations_desc ||
    consultationData.data?.data?.observations ||
    consultationData.data?.data?.observations_desc ||
    "";
  const diagnosis = consultationData.diagnosis ||
    consultationData.diagnosis_desc ||
    consultationData.data?.diagnosis ||
    consultationData.data?.diagnosis_desc ||
    consultationData.data?.data?.diagnosis ||
    consultationData.data?.data?.diagnosis_desc ||
    "";
  const patientConcern = consultationData.patientConcern ||
    consultationData.patient_concern ||
    consultationData.data?.patientConcern ||
    consultationData.data?.patient_concern ||
    "";
  const additionalNotes = consultationData.additional_notes ||
    consultationData.consultationNotes ||
    consultationData.data?.additional_notes ||
    consultationData.data?.consultationNotes ||
    "";
  const isFollowUp = consultationData.is_follow_up ||
    consultationData.followUpRequired ||
    consultationData.data?.is_follow_up ||
    consultationData.data?.followUpRequired ||
    false;
  const followUpDate = consultationData.followUpDate ||
    consultationData.follow_up_date ||
    consultationData.data?.followUpDate ||
    consultationData.data?.follow_up_date ||
    "";
  const recommendations = consultationData.recommendations ||
    consultationData.additional_notes ||
    consultationData.data?.recommendations ||
    consultationData.data?.additional_notes ||
    consultationData.data?.data?.recommendations ||
    consultationData.data?.data?.additional_notes ||
    "â€”";

  // Dynamic tooth chart findings map merging
  const finalToothChart = { ...toothChartState };
  const toothFindingsArray = consultationData.toothFindings ||
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
  const treatmentsArray = consultationData.treatments ||
    consultationData.treatmentPlans ||
    consultationData.treatment_plans ||
    consultationData.data?.treatments ||
    consultationData.data?.data?.treatments ||
    consultationData.responseObject?.data?.treatment_plans ||
    consultationData.responseObject?.data?.treatments ||
    [];

  // Safely extract prescriptions array from API structure
  const rawPrescriptions = consultationData.prescriptions ||
    consultationData.data?.prescriptions ||
    consultationData.data?.data?.prescriptions ||
    consultationData.responseObject?.data?.prescriptions ||
    [];
  const filledPrescriptions = rawPrescriptions.filter(
    (p: any) => p.medicine_id || p.id || (p.medicine || p.medicine_name || p.medicineName),
  );

  const getHeader = () => getLetterhead(`
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
    ["Age / Gender", `${patientAge} / ${patientGender}`, "Phone", patientPhone],
    ["Doctor", displayDoctorName, "Specialization", specialization],
  ])}
</div>
  `;

  const getClinicalSection = () => `
<div style="padding: 16px 40px 10px;">
      ${patientConcern ? `
<div style="margin-bottom:16px;">
          ${sectionLabel("Chief Complaint")}
<div style="font-size:13px; line-height:1.5; color:${INK}; font-weight:500;">${patientConcern}</div>
</div>
      ` : ''}
<div style="display:flex; flex-direction:row; justify-content:space-between; width:100%; gap:24px;">
<div style="flex:1;">
          ${sectionLabel("Clinical Observations")}
<div style="font-size:13px; line-height:1.6; color:${INK};">
            ${observations || `<span style="color:#93999e; font-style:italic;">No observations recorded.</span>`}
</div>
          ${Object.keys(finalToothChart).length > 0 ? `
<div style="margin-top:14px;">
<div style="font-size:10px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; margin-bottom:6px;">Tooth Findings</div>
<div style="display:flex; flex-wrap:wrap; gap:4px;">
                 ${Object.entries(finalToothChart).map(([num, cond]) => `<span style="font-size:11px; padding: 4px 8px; border-radius:4px; background:${PANEL}; border:1px solid ${LINE}; color:${INK}; font-weight:600;">#${num}: ${cond}</span>`).join('')}
</div>
</div>
          ` : ''}
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
    const xrayFiles = consultationData.xrayFiles || consultationData.data?.xrayFiles || [];
    if (!xrayFiles || xrayFiles.length === 0) return "";
    return `
<div style="padding: 8px 40px 10px;">
        ${sectionLabel("Diagnostic Imaging (X-Ray)")}
<div style="display:flex; flex-direction:row; flex-wrap:wrap; gap:15px; width:100%;">
          ${xrayFiles.map((url: string, i: number) => `
<div style="width:30%; border:1px solid ${LINE}; border-radius:10px; overflow:hidden; background:${PANEL}; box-sizing:border-box;">
<img src="${url}" style="width:100%; height:130px; object-fit:cover;" />
<div style="padding:6px; text-align:center; font-size:10px; color:${INK_MUTED}; font-weight:700; background:#ffffff;">Image #${i + 1}</div>
</div>
          `).join('')}
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
            ${treatmentsArray.map((t: any, i: number) => `
<tr style="border-bottom:1px solid #eef0f1; ${i % 2 === 0 ? "" : `background:#fafafa;`}">
<td style="padding:10px 12px; font-size:12px; font-weight:700; color:${INK};">#${t.tooth_number || t.tooth || 'General'}</td>
<td style="padding:10px 12px; font-size:12px; font-weight:600; color:${INK};">${t.procedure || t.treatment_type || 'â€”'}</td>
<td style="padding:10px 12px; font-size:12px; text-align:center; color:${INK_MUTED};">${Array.isArray(t.sessions) ? t.sessions.length : (t.sessions || 1)}</td>
<td style="padding:10px 12px; font-size:12px; text-align:right; font-weight:700; color:${INK};">â‚¹${Number(t.est_cost || t.cost || 0).toLocaleString('en-IN')}</td>
</tr>
            `).join('')}
</tbody>
</table>
      `;
    } else {
      treatmentsHtml = `
<div style="background:#fff; border:1px solid ${LINE}; padding:15px; border-radius:8px; font-size:13px; color:${INK_MUTED};">
<strong>Procedure:</strong> ${consultationData.treatmentProcedure || consultationData.procedure || "â€”"}<br/>
<strong style="display:inline-block; margin-top:6px;">Plan:</strong> ${consultationData.treatmentPlan || consultationData.treatment_plan_description || "â€”"}<br/>
<strong style="display:inline-block; margin-top:6px;">Sessions:</strong> ${consultationData.treatmentSessions || 1} | <strong>Estimated Cost:</strong> â‚¹${(consultationData.treatmentCost || consultationData.cost || 0).toLocaleString('en-IN')}
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
        ${additionalNotes ? `
<div style="margin-top:12px;">
<div style="font-size:10px; font-weight:800; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Additional Clinical Notes</div>
<div style="font-size:12px; line-height:1.5; color:${INK_MUTED};">${additionalNotes}</div>
</div>
        ` : ''}
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
          ${filledPrescriptions.map((p: any, i: number) => `
<tr style="border-bottom:1px solid #eef0f1; ${i % 2 === 0 ? "" : `background:#fafafa;`}">
<td style="padding:10px 12px; font-size:12px; color:#93999e;">${i + 1}</td>
<td style="padding:10px 12px; font-size:12px; font-weight:700; color:${INK};">${p.medicine?.name || p.medicine?.medicine_name || p.medicine_name || p.medicineName || (typeof p.medicine === 'string' ? p.medicine : '') || "-"}</td>
<td style="padding:10px 12px; font-size:12px; color:${INK_MUTED};">${p.dosage || "-"} (${p.timing || "-"})</td>
<td style="padding:10px 12px; font-size:12px; color:${INK_MUTED};">${p.frequency || "-"}</td>
<td style="padding:10px 12px; font-size:12px; color:${INK_MUTED};">${p.duration ? `${p.duration} ${p.durationUnit || p.duration_type || 'Days'}` : '-'}</td>
<td style="padding:10px 12px; font-size:12px; color:${INK_MUTED};">${p.qty || "-"}</td>
</tr>
          `).join("")}
</tbody>
</table>
</div>
  `;

  const getFooter = () => getBrandFooter(`
<div style="text-align:center;">
<div style="width:200px; border-bottom:1px solid ${LINE}; margin-bottom:8px;"></div>
<div style="font-size:13px; font-weight:800; color:${INK};">${displayDoctorName}</div>
<div style="font-size:11px; color:${INK_MUTED}; font-weight:500;">${specialization}</div>
<div style="font-size:10px; color:#93999e; margin-top:2px;">(Signature/Seal)</div>
</div>
    ${isFollowUp && followUpDate ? `
<div style="position:absolute; left:40px; font-size:12px; color:${INK}; font-weight:700; border:1px solid ${LINE}; padding:6px 12px; border-radius:4px;">
        Next Follow-Up: ${new Date(followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
</div>
    ` : ''}
  `);

  let htmlContent = `<div style="width:794px; background:#fff; margin:0; padding:0; font-family: 'Cinzel', serif; color:${INK}; display:flex; flex-direction:column; min-height:1123px; box-sizing:border-box;">${getHeader()}`;

  let reportTitle = "Consultation Report";
  let fileNameSuffix = "full_report";

  if (type === 'CLINICAL') {
    reportTitle = "Clinical Observations Report";
    fileNameSuffix = "clinical_observations";
    htmlContent += getPatientInfo(reportTitle) + getClinicalSection() + getXraySection();
  } else if (type === 'TREATMENT') {
    reportTitle = "Treatment Planning Report";
    fileNameSuffix = "treatment_plan";
    htmlContent += getPatientInfo(reportTitle) + getTreatmentSection();
  } else if (type === 'PRESCRIPTION') {
    reportTitle = "Prescription";
    fileNameSuffix = "prescription";
    htmlContent += getPatientInfo(reportTitle) + getPrescriptionSection();
  } else {
    htmlContent += getPatientInfo(reportTitle) + getClinicalSection() + getXraySection() + getTreatmentSection() + getPrescriptionSection();
  }

  htmlContent += `${getFooter()}</div>`;
  pdfContainer.innerHTML = htmlContent;

  await renderContainerToPDF(
    pdfContainer,
    `${patient.patientName}_${fileNameSuffix}_${new Date().toISOString().split("T")[0]}.pdf`
  );
};

// ---------------------------------------------------------------------------
// Invoice / consolidated statement
// ---------------------------------------------------------------------------

const INK_BORDER = "#2d2d2d";
const CELL_LINE = "#c8ccd0";
const PANEL_BG = "#f2f2f2";

function numberToWords(n: number): string {
  const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (n === 0) return "Zero";
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numberToWords(n % 100) : "");
  if (n < 100000) return numberToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numberToWords(n % 1000) : "");
  if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numberToWords(n % 100000) : "");
  return numberToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numberToWords(n % 10000000) : "");
}

function tdCell(align: string, last = false): string {
  return `padding:8px 10px; font-size:11px; color:${INK}; text-align:${align}; border-right:${last ? "none" : `1px solid ${CELL_LINE}`}; border-bottom:1px solid ${CELL_LINE};`;
}

export const generateInvoicePDF = async (invoice: any, patient: any) => {
  const pdfContainer = makeOffscreenContainer();

  const isStatement = (invoice.invoice_number || "").toUpperCase() === "STATEMENT";

  const patientName = invoice.patientName || patient?.name || "â€”";
  const patientId = invoice.patientId || patient?.id || "â€”";
  const patientCode = invoice.patient_code || invoice.patientCode || patient?.patient_code || patient?.patientCode;
  const displayPatientId = patientCode || (patientId === "â€”" ? "â€”" : patientId.split('-')[0]);
  const memberId = invoice.memberId || invoice.member_id || patient?.memberId || patient?.member_id || "â€”";

  const invoiceNumber = invoice.invoice_number || invoice.id || "â€”";
  const invoiceDate = invoice.date
    ? new Date(invoice.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const rawPayments = invoice.invoice_payments || [];
  const calculatedPaidAmount = rawPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const paidAmount = invoice.paidAmount !== undefined ? Number(invoice.paidAmount) : calculatedPaidAmount;
  const discountAmount = Number(invoice.discountAmount || 0);
  const discountPct = Number(invoice.discount || 0);
  const taxAmount = Number(invoice.taxAmount || 0);
  const taxPct = Number(invoice.tax || 0);
  const grandTotal = Number(invoice.total || invoice.grand_total || 0);
  const pendingAmount = invoice.pendingAmount !== undefined ? Number(invoice.pendingAmount) : Math.max(0, grandTotal - paidAmount);

  const grandTotalWords = `INR ${numberToWords(Math.round(grandTotal))} Only`;
  const items: any[] = invoice.items || [];

  // Item rows
  const itemsHtml = items.map((item: any, i: number) => `
<tr>
<td style="${tdCell("center")}">${i + 1}</td>
<td style="${tdCell("left")}">${((item.item_type || "Service") as string).charAt(0).toUpperCase() + ((item.item_type || "Service") as string).slice(1).toLowerCase()}</td>
<td style="${tdCell("center")}">${item.hsn_code || item.hsnCode || DEFAULT_SAC_CODE}</td>
<td style="${tdCell("center")}">1 NOS</td>
<td style="${tdCell("right")}">â‚¹${Number(item.total_amount || 0).toLocaleString('en-IN')}</td>
<td style="${tdCell("center")}">NOS</td>
<td style="${tdCell("right", true)}">â‚¹${Number(item.total_amount || 0).toLocaleString('en-IN')}</td>
</tr>`).join('');

  // Discount row
  const discountRowHtml = discountAmount > 0 ? `
<tr>
<td style="${tdCell("center")}"></td>
<td style="${tdCell("left")}; font-style:italic;">Less : DISCOUNT ALLOWED${discountPct > 0 ? ` ${discountPct}%` : ""}</td>
<td style="${tdCell("center")}"></td>
<td style="${tdCell("center")}"></td>
<td style="${tdCell("right")}"></td>
<td style="${tdCell("center")}"></td>
<td style="${tdCell("right", true)}">(-â‚¹${discountAmount.toLocaleString('en-IN')})</td>
</tr>` : "";

  // Padding rows for fixed table height
  const filledRows = items.length + (discountAmount > 0 ? 1 : 0);
  const paddingCount = Math.max(0, 10 - filledRows);
  const paddingRowsHtml = Array.from({ length: paddingCount }, () => `
<tr style="height:26px;">
<td style="${tdCell("center")}"></td>
<td style="${tdCell("left")}"></td>
<td style="${tdCell("center")}"></td>
<td style="${tdCell("center")}"></td>
<td style="${tdCell("right")}"></td>
<td style="${tdCell("center")}"></td>
<td style="${tdCell("right", true)}"></td>
</tr>`).join('');

  // Total row
  const totalRowHtml = `
<tr style="background:${PANEL_BG}; border-top:2px solid ${INK_BORDER};">
<td colspan="3" style="padding:8px 10px; font-size:12px; font-weight:800; color:${INK}; text-align:right; border-right:1px solid ${CELL_LINE}; border-top:2px solid ${INK_BORDER};">Total</td>
<td style="padding:8px 10px; font-size:11px; font-weight:700; color:${INK}; text-align:center; border-right:1px solid ${CELL_LINE}; border-top:2px solid ${INK_BORDER};">${items.length} NOS</td>
<td colspan="2" style="padding:8px 10px; border-right:1px solid ${CELL_LINE}; border-top:2px solid ${INK_BORDER};"></td>
<td style="padding:8px 10px; font-size:12px; font-weight:800; color:${INK}; text-align:right; border-top:2px solid ${INK_BORDER};">â‚¹${grandTotal.toLocaleString('en-IN')}</td>
</tr>`;

  const htmlContent = `
<div style="width:794px; background:#fff; padding:28px 40px 16px; font-family: 'Cinzel', serif; color:${INK}; box-sizing:border-box;">

  <div style="text-align:center; font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px;">Invoice</div>

  <div style="border:1.5px solid ${INK_BORDER}; background:#fff;">

    <div style="padding:14px 18px; border-bottom:1px solid ${INK_BORDER}; display:flex; align-items:center; gap:14px;">
      <img src="${logoImg}" style="height:56px; width:auto; object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />
      <div>
        <div style="font-size:15px; font-weight:800; color:${INK}; letter-spacing:0.3px;">${CLINIC_NAME}</div>
        <div style="font-size:10.5px; font-weight:600; color:${INK_MUTED}; margin-top:2px;">${CLINIC_TAGLINE}</div>
      </div>
    </div>

    <div style="display:flex; border-bottom:1px solid ${INK_BORDER};">
      <div style="flex:1; padding:12px 18px; border-right:1px solid ${INK_BORDER};">
        <div style="margin-bottom:9px;">
          <div style="font-size:9px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:2px;">Patient Name</div>
          <div style="font-size:12px; font-weight:700; color:${INK};">${patientName}</div>
        </div>
        <div style="margin-bottom:9px;">
          <div style="font-size:9px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:2px;">Member ID</div>
          <div style="font-size:12px; font-weight:700; color:${INK};">${memberId}</div>
        </div>
        <div>
          <div style="font-size:9px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:2px;">Patient ID</div>
          <div style="font-size:12px; font-weight:700; color:${INK};">${displayPatientId}</div>
        </div>
      </div>
      <div style="width:224px;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px;">
          <span style="font-size:9px; font-weight:700; color:${INK_MUTED}; text-transform:uppercase; letter-spacing:0.4px;">Invoice No.</span>
          <span style="font-size:11px; font-weight:700; color:${INK};">${String(invoiceNumber)}</span>
        </div>
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; border-bottom:1px solid ${INK_BORDER};">
      <thead>
        <tr style="background:${PANEL_BG}; border-bottom:1px solid ${INK_BORDER};">
          <th style="padding:8px 10px; width:6%; font-size:9px; font-weight:700; text-transform:uppercase; color:${INK}; text-align:center; border-right:1px solid ${CELL_LINE}; border-bottom:1px solid ${INK_BORDER};">Sr. No</th>
          <th style="padding:8px 10px; width:30%; font-size:9px; font-weight:700; text-transform:uppercase; color:${INK}; text-align:left; border-right:1px solid ${CELL_LINE}; border-bottom:1px solid ${INK_BORDER};">Description</th>
          <th style="padding:8px 10px; width:12%; font-size:9px; font-weight:700; text-transform:uppercase; color:${INK}; text-align:center; border-right:1px solid ${CELL_LINE}; border-bottom:1px solid ${INK_BORDER};">HSN/SAC</th>
          <th style="padding:8px 10px; width:13%; font-size:9px; font-weight:700; text-transform:uppercase; color:${INK}; text-align:center; border-right:1px solid ${CELL_LINE}; border-bottom:1px solid ${INK_BORDER};">Quantity</th>
          <th style="padding:8px 10px; width:13%; font-size:9px; font-weight:700; text-transform:uppercase; color:${INK}; text-align:right; border-right:1px solid ${CELL_LINE}; border-bottom:1px solid ${INK_BORDER};">Rate</th>
          <th style="padding:8px 10px; width:8%; font-size:9px; font-weight:700; text-transform:uppercase; color:${INK}; text-align:center; border-right:1px solid ${CELL_LINE}; border-bottom:1px solid ${INK_BORDER};">Per</th>
          <th style="padding:8px 10px; width:18%; font-size:9px; font-weight:700; text-transform:uppercase; color:${INK}; text-align:right; border-bottom:1px solid ${INK_BORDER};">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        ${discountRowHtml}
        ${paddingRowsHtml}
        ${totalRowHtml}
      </tbody>
    </table>

    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 18px; border-bottom:1px solid ${CELL_LINE};">
      <div style="font-size:11px; color:${INK};">
        <span style="font-weight:700;">Amount Chargeable (in words):</span> ${grandTotalWords}
      </div>
      <div style="font-size:10px; color:${INK_MUTED};">E. &amp; O.E</div>
    </div>

    ${paidAmount > 0 ? `
    <div style="display:flex; justify-content:flex-end; gap:24px; padding:7px 18px; border-bottom:1px solid ${CELL_LINE}; font-size:11px; color:${INK};">
      <span>Amount Paid: <strong>â‚¹${paidAmount.toLocaleString('en-IN')}</strong></span>
      <span>Balance Due: <strong>â‚¹${pendingAmount.toLocaleString('en-IN')}</strong></span>
    </div>` : ""}

    <div style="background:${PANEL_BG}; border-top:1px solid ${INK_BORDER}; padding:16px 18px; display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <div style="font-size:12px; font-weight:800; color:${INK}; margin-bottom:34px;">For Opal Smile Dental Studio</div>
        <div style="width:140px; border-top:1px solid ${INK_MUTED}; margin-bottom:4px;"></div>
        <div style="font-size:10px; color:${INK_MUTED}; font-weight:600;">Authorised Signatory</div>
        <div style="font-size:9.5px; color:${INK_MUTED}; margin-top:10px;">${CLINIC_ADDRESS}</div>
        <div style="font-size:9.5px; color:${INK_MUTED}; margin-top:2px;">Phone: ${CLINIC_PHONE} &nbsp;|&nbsp; Email: ${CLINIC_EMAIL}</div>
        <div style="font-size:9.5px; color:${INK_MUTED}; margin-top:2px;">Instagram: ${CLINIC_INSTAGRAM}</div>
      </div>
      <div style="width:70px; height:70px; background:white; padding:3px; border:1px solid ${CELL_LINE}; border-radius:4px; flex-shrink:0;">
        <img src="/opalsmiles-qr.png" style="width:100%; height:100%; object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />
      </div>
    </div>

  </div>

  <div style="text-align:center; font-size:10px; color:${INK_MUTED}; font-style:italic; margin-top:10px;">
    This is a Computer Generated Invoice
  </div>

</div>
  `;

  pdfContainer.innerHTML = htmlContent;

  await renderContainerToPDF(
    pdfContainer,
    `Invoice_${invoice.invoice_number || invoice.id}_${invoice.patientName || patient?.name || 'Patient'}.pdf`
  );
};