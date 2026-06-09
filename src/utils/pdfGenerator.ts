import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export type PDFReportType = 'FULL' | 'CLINICAL' | 'TREATMENT' | 'PRESCRIPTION';

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

export const downloadConsultationPDF = async ({
  type = 'FULL',
  patient,
  consultationData,
  toothChartState = {}
}: PDFGeneratorParams) => {
  const pdfContainer = document.createElement("div");
  pdfContainer.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 794px; background: white; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Safely extract doctor details from API payload structure (e.g. responseObject.data or directly)
  const doctorObj = consultationData.doctor ||
    consultationData.data?.doctor ||
    consultationData.data?.data?.doctor ||
    consultationData.responseObject?.data?.doctor ||
    consultationData.responseObject?.doctor;
  const doctorName = doctorObj?.name || patient.doctorName || "";
  const displayDoctorName = doctorName ? (doctorName.toLowerCase().startsWith("dr.") ? doctorName : `Dr. ${doctorName}`) : "—";
  const specialization = doctorObj?.personal_profile?.specialization?.name ||
    doctorObj?.specialization?.name ||
    doctorObj?.specialization ||
    "Dentistry";

  // Safely extract patient details from API payload structure
  const patientObj = consultationData.patient ||
    consultationData.data?.patient ||
    consultationData.data?.data?.patient ||
    consultationData.responseObject?.data?.patient ||
    consultationData.responseObject?.patient;
  const patientName = patientObj?.name || patient.patientName || "—";
  const patientId = patientObj?.id || patient.id || "—";
  const displayPatientId = patientId === "—" ? "—" : patientId.split('-')[0];
  const patientPhone = patientObj?.phone || patient.phone || "—";
  const patientGender = patientObj?.gender || patient.gender || "—";
  const patientBloodGroup = (patientObj?.blood_group || patient.bloodGroup || "—").replace('_', ' ');

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
    "—";

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
    consultationData.data?.treatments ||
    consultationData.data?.data?.treatments ||
    [];

  // Safely extract prescriptions array from API structure
  const rawPrescriptions = consultationData.prescriptions ||
    consultationData.data?.prescriptions ||
    consultationData.data?.data?.prescriptions ||
    [];
  const filledPrescriptions = rawPrescriptions.filter(
    (p: any) => (p.medicine || p.medicine_name) && (p.medicine || p.medicine_name).trim() !== "",
  );

  const getHeader = () => `
    <div style="padding: 35px 50px 25px; background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); color: white; border-bottom: 4px solid #f59e0b;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:32px; font-weight:850; letter-spacing:-0.75px; color:#ffffff; font-family:'Outfit', sans-serif;">OPAL SMILE</div>
          <div style="font-size:12px; color:#93c5fd; font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:1px;">Multi-Speciality Dental Clinic & Hospital</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#ffffff;">${displayDoctorName}</div>
          <div style="font-size:11px; color:#93c5fd; font-weight:500; margin-top:2px;">${specialization}</div>
          <div style="font-size:10px; color:#60a5fa; margin-top:1px;">Hospital Registration Board</div>
        </div>
      </div>
    </div>
  `;

  const getPatientInfo = (title: string) => `
    <div style="padding: 12px 50px; background:#f1f5f9; border-bottom: 1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:13px; font-weight:850; color:#1e3a8a; text-transform:uppercase; letter-spacing:1.5px;">${title}</div>
      <div style="text-align:right; font-size:11px; color:#475569; font-weight:600;">
        <span><strong>Report Date:</strong> ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
      </div>
    </div>
    <div style="padding: 25px 50px 15px;">
      <div style="display:flex; flex-direction:row; justify-content:space-between; align-items:center; padding:20px; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="flex:1; min-width:0; padding-right:10px;">
          <div style="font-size:9px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">Patient Name</div>
          <div style="font-size:14px; font-weight:800; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${patientName}</div>
        </div>
        <div style="flex:1; min-width:0; padding-right:10px;">
          <div style="font-size:9px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">Patient ID</div>
          <div style="font-size:13px; font-weight:700; color:#334155;">#${displayPatientId}</div>
        </div>
        <div style="flex:1; min-width:0; padding-right:10px;">
          <div style="font-size:9px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">Contact Phone</div>
          <div style="font-size:13px; font-weight:700; color:#334155;">${patientPhone}</div>
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:9px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">Gender / Blood Group</div>
          <div style="font-size:13px; font-weight:700; color:#334155;">${patientGender} / ${patientBloodGroup}</div>
        </div>
      </div>
    </div>
  `;

  const getClinicalSection = () => `
    <div style="padding: 10px 50px 20px;">
      ${patientConcern ? `
        <div style="margin-bottom:15px; background:#f8fafc; border-left:4px solid #f59e0b; padding:12px 18px; border-radius:4px;">
          <div style="font-size:10px; font-weight:850; color:#b45309; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Chief Complaint / Concern</div>
          <div style="font-size:13px; line-height:1.5; color:#1e293b; font-weight:500;">${patientConcern}</div>
        </div>
      ` : ''}
      <div style="display:flex; flex-direction:row; justify-content:space-between; width:100%;">
        <div style="width:48%; border-left: 3.5px solid #1e3a8a; padding-left:18px; box-sizing:border-box;">
          <div style="font-size:11px; font-weight:850; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Clinical Observations</div>
          <div style="font-size:13px; line-height:1.6; color:#334155;">
            ${observations || '<span style="color:#94a3b8; font-style:italic;">No observations recorded.</span>'}
          </div>
          ${Object.keys(finalToothChart).length > 0 ? `
            <div style="margin-top:14px;">
               <div style="font-size:10px; font-weight:850; color:#1e3a8a; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px;">Tooth Chart Findings</div>
               <div style="display:flex; flex-wrap:wrap; gap:6px;">
                 ${Object.entries(finalToothChart).map(([num, cond]) => `<span style="font-size:11px; padding:3px 10px; border-radius:6px; background:#eff6ff; border:1px solid #bfdbfe; color:#1e3a8a; font-weight:700;">Tooth #${num}: ${cond}</span>`).join('')}
               </div>
            </div>
          ` : ''}
        </div>
        <div style="width:48%; border-left: 3.5px solid #10b981; padding-left:18px; box-sizing:border-box;">
          <div style="font-size:11px; font-weight:850; color:#065f46; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Diagnosis & Assessment</div>
          <div style="font-size:13px; line-height:1.6; color:#334155;">
            ${diagnosis || '<span style="color:#94a3b8; font-style:italic;">No diagnosis provided.</span>'}
          </div>
        </div>
      </div>
    </div>
  `;

  const getXraySection = () => {
    const xrayFiles = consultationData.xrayFiles || consultationData.data?.xrayFiles || [];
    if (!xrayFiles || xrayFiles.length === 0) return "";
    return `
      <div style="padding: 10px 50px 20px;">
        <div style="font-size:11px; font-weight:850; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px; border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;">Diagnostic Imaging (X-Ray)</div>
        <div style="display:flex; flex-direction:row; flex-wrap:wrap; gap:15px; width:100%;">
          ${xrayFiles.map((url: string, i: number) => `
            <div style="width:30%; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden; background:#f8fafc; box-shadow:0 1px 3px rgba(0,0,0,0.05); box-sizing:border-box;">
              <img src="${url}" style="width:100%; height:130px; object-fit:cover;" />
              <div style="padding:6px; text-align:center; font-size:10px; color:#475569; font-weight:700; background:#f1f5f9;">Image #${i + 1}</div>
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
        <table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid #e2e8f0; margin-top:10px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
              <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Tooth</th>
              <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Procedure / Treatment</th>
              <th style="padding:10px 14px; text-align:center; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Sessions</th>
              <th style="padding:10px 14px; text-align:right; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Est. Cost</th>
            </tr>
          </thead>
          <tbody>
            ${treatmentsArray.map((t: any, i: number) => `
              <tr style="border-bottom:1px solid #f1f5f9; ${i % 2 === 0 ? "" : "background:#fafafa;"}">
                <td style="padding:10px 14px; font-size:12px; font-weight:700; color:#1e3a8a;">#${t.tooth_number || t.tooth || 'General'}</td>
                <td style="padding:10px 14px; font-size:12px; font-weight:600; color:#1e293b;">${t.procedure || '—'}</td>
                <td style="padding:10px 14px; font-size:12px; text-align:center; color:#475569;">${t.sessions || 1}</td>
                <td style="padding:10px 14px; font-size:12px; text-align:right; font-weight:700; color:#0f172a;">₹${(t.est_cost || t.cost || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      treatmentsHtml = `
        <div style="background:#fff; border:1px solid #e2e8f0; padding:15px; border-radius:8px; font-size:13px; color:#475569;">
          <strong>Procedure:</strong> ${consultationData.treatmentProcedure || consultationData.procedure || "—"}<br/>
          <strong style="display:inline-block; margin-top:6px;">Plan:</strong> ${consultationData.treatmentPlan || consultationData.treatment_plan_description || "—"}<br/>
          <strong style="display:inline-block; margin-top:6px;">Sessions:</strong> ${consultationData.treatmentSessions || 1} | <strong>Estimated Cost:</strong> ₹${(consultationData.treatmentCost || consultationData.cost || 0).toLocaleString('en-IN')}
        </div>
      `;
    }

    return `
      <div style="padding: 10px 50px 20px;">
        <div style="font-size:11px; font-weight:850; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;">Treatment Planning & Procedures</div>
        ${treatmentsHtml}
        
        <div style="margin-top:15px;">
          <div style="font-size:10px; font-weight:850; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Recommendations & Notes</div>
          <div style="font-size:12px; line-height:1.6; color:#334155; padding:12px 16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
            ${recommendations}
          </div>
        </div>
        
        ${additionalNotes ? `
          <div style="margin-top:12px;">
            <div style="font-size:10px; font-weight:850; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Additional Clinical Notes</div>
            <div style="font-size:12px; line-height:1.5; color:#475569;">${additionalNotes}</div>
          </div>
        ` : ''}
      </div>
    `;
  };

  const getPrescriptionSection = () => `
    <div style="padding: 10px 50px 20px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;">
        <div style="font-size:14px; font-weight:800; color:#1e3a8a;">Rx</div>
        <div style="font-size:11px; font-weight:850; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px;">Prescribed Medications</div>
      </div>
      <table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <thead>
          <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
            <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">#</th>
            <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">Medicine</th>
            <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">Dosage</th>
            <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">Freq</th>
            <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">Duration</th>
          </tr>
        </thead>
        <tbody>
          ${filledPrescriptions.map((p: any, i: number) => `
            <tr style="border-bottom:1px solid #f1f5f9; ${i % 2 === 0 ? "" : "background:#fafafa;"}">
              <td style="padding:10px 14px; font-size:12px; color:#94a3b8;">${i + 1}</td>
              <td style="padding:10px 14px; font-size:12px; font-weight:700; color:#1e293b;">${p.medicine || p.medicine_name || "-"}</td>
              <td style="padding:10px 14px; font-size:12px; color:#475569;">${p.dosage || "-"} (${p.timing || "-"})</td>
              <td style="padding:10px 14px; font-size:12px; color:#475569;">${p.frequency || "-"}</td>
              <td style="padding:10px 14px; font-size:12px; color:#475569;">${p.duration ? `${p.duration} ${p.durationUnit || p.duration_type || 'Days'}` : '-'}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  const getFooter = () => `
    <div style="margin-top:40px; padding: 0 50px 20px; border-top:1.5px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:20px;">
        <div>
          ${isFollowUp && followUpDate ? `
            <div style="font-size:12px; color:#b45309; font-weight:750; background:#fef3c7; padding:4px 10px; border-radius:4px; display:inline-block; margin-bottom:10px;">
              ⚠️ Scheduled Follow-Up: ${new Date(followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          ` : ''}
          <div style="font-size:10px; color:#94a3b8; font-style:italic;">This is a computer-generated report from OPAL SMILE Hospital Management System.</div>
          <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Generated: ${new Date().toLocaleString("en-IN")}</div>
        </div>
        <div style="text-align:center;">
          <div style="width:200px; border-top:1.5px solid #0f172a; padding-top:10px;">
            <div style="font-size:13px; font-weight:800; color:#0f172a;">${displayDoctorName}</div>
            <div style="font-size:11px; color:#64748b; font-weight:500;">${specialization}</div>
            <div style="font-size:9px; color:#94a3b8; margin-top:4px; font-style:italic; font-weight:bold;">Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
    <div style="background:#1e3a8a; padding:15px 50px; color:white; font-size:10px; display:flex; justify-content:space-between; font-weight:600;">
      <div>OPAL SMILE Dental Clinic & Hospital</div>
      <div>🌐 Hospital Consultation Record | Secured Digital Document</div>
    </div>
  `;

  let htmlContent = `<div style="width:794px; background:#fff; margin:0; padding:0; color: #1f2937;">${getHeader()}`;

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
  document.body.appendChild(pdfContainer);

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

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(
      `${patient.patientName}_${fileNameSuffix}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  } finally {
    document.body.removeChild(pdfContainer);
  }
};

export const generateInvoicePDF = async (invoice: any, patient: any) => {
  const pdfContainer = document.createElement("div");
  pdfContainer.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 794px; background: white; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const htmlContent = `
    <div style="width:794px; background:#fff; padding: 40px 50px; color: #1f2937;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <div style="font-size:28px; font-weight:800; color:#1e3a8a; letter-spacing:-0.5px;">OPAL SMILE</div>
          <div style="font-size:12px; color:#6b7280; font-weight:500; margin-top:4px;">Multi-Speciality Dental Clinic & Hospital</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:24px; font-weight:800; color:#111827;">INVOICE</div>
          <div style="font-size:14px; color:#6b7280; font-weight:700; margin-top:4px;">#${invoice.id}</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:40px; margin-bottom:40px;">
        <div>
          <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Bill To</div>
          <div style="font-size:16px; font-weight:700; color:#111827;">${invoice.patientName}</div>
          <div style="font-size:13px; color:#4b5563; margin-top:4px;">${patient?.phone || '—'}</div>
          <div style="font-size:13px; color:#4b5563;">Patient ID: ${invoice.patientId || '—'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Invoice Details</div>
          <div style="font-size:13px; color:#4b5563;"><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-IN')}</div>
          <div style="font-size:13px; color:#4b5563;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</div>
          <div style="font-size:13px; color:#4b5563;"><strong>Doctor:</strong> ${invoice.doctor || '—'}</div>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:40px;">
        <thead>
          <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
            <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Description</th>
            <th style="padding:12px 15px; text-align:center; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Qty</th>
            <th style="padding:12px 15px; text-align:right; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Rate</th>
            <th style="padding:12px 15px; text-align:right; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item: any) => `
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:12px 15px; font-size:13px; font-weight:600; color:#1e293b;">${item.description}</td>
              <td style="padding:12px 15px; font-size:13px; text-align:center; color:#475569;">${item.quantity}</td>
              <td style="padding:12px 15px; font-size:13px; text-align:right; color:#475569;">₹${item.rate.toLocaleString()}</td>
              <td style="padding:12px 15px; font-size:13px; text-align:right; font-weight:700; color:#111827;">₹${item.amount.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display:flex; justify-content:flex-end;">
        <div style="width:300px; space-y:10px;">
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f1f5f9;">
            <span style="font-size:13px; color:#64748b;">Subtotal</span>
            <span style="font-size:13px; font-weight:700; color:#111827;">₹${invoice.subtotal.toLocaleString()}</span>
          </div>
          ${invoice.discount > 0 ? `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f1f5f9;">
              <span style="font-size:13px; color:#64748b;">Discount</span>
              <span style="font-size:13px; font-weight:700; color:#ef4444;">-₹${invoice.discount.toLocaleString()}</span>
            </div>
          ` : ''}
          ${invoice.tax > 0 ? `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f1f5f9;">
              <span style="font-size:13px; color:#64748b;">Tax (GST 18%)</span>
              <span style="font-size:13px; font-weight:700; color:#111827;">₹${invoice.tax.toLocaleString()}</span>
            </div>
          ` : ''}
          <div style="display:flex; justify-content:space-between; padding:15px 0; margin-top:10px; border-top:2px solid #1e3a8a;">
            <span style="font-size:16px; font-weight:800; color:#1e3a8a; text-transform:uppercase;">Grand Total</span>
            <span style="font-size:20px; font-weight:800; color:#1e3a8a;">₹${invoice.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style="margin-top:60px; border-top:1px solid #e2e8f0; padding-top:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
          <div>
            <div style="font-size:10px; color:#94a3b8; font-style:italic;">Thank you for your business.</div>
            <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Payments are due within 7 days.</div>
          </div>
          <div style="text-align:center;">
            <div style="width:180px; border-top:1px solid #1e293b; padding-top:10px;">
              <div style="font-size:13px; font-weight:700; color:#1e293b;">Authorized Signatory</div>
              <div style="font-size:10px; color:#64748b;">OPAL SMILE Clinic</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  pdfContainer.innerHTML = htmlContent;
  document.body.appendChild(pdfContainer);

  try {
    const canvas = await html2canvas(pdfContainer, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Invoice_${invoice.id}_${invoice.patientName}.pdf`);
  } finally {
    document.body.removeChild(pdfContainer);
  }
};
