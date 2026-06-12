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

  let doctorObj = {};
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
  const doctorEmail = doctorObj?.email || "";
  const doctorPhone = doctorObj?.phone || "";
  const displayDoctorName = doctorName ? (doctorName.toLowerCase().startsWith("dr.") ? doctorName : `Dr. ${doctorName}`) : "—";
  const specialization = doctorObj?.personal_profile?.specialization?.name ||
    doctorObj?.specialization?.name ||
    doctorObj?.specialization ||
    "Dentistry";

  console.log("Extracted doctor:", { doctorName, doctorEmail, doctorPhone, doctorObj });


  // Safely extract patient details from API payload structure
let patientObj = {};
if (consultationData.responseObject?.data?.patient) {
  patientObj = consultationData.responseObject.data.patient;
} else if (consultationData.data?.patient) {
  patientObj = consultationData.data.patient;
} else if (consultationData.patient) {
  patientObj = consultationData.patient;
} else if (consultationData.responseObject?.patient) {
  patientObj = consultationData.responseObject.patient;
}
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
    <div style="padding: 20px 40px 15px; border-bottom: 2px solid #1e3a8a;">
      <div style="text-align: center;">
        <div style="font-size: 20px; font-weight: 800; color: #1e3a8a; text-transform:uppercase; letter-spacing: -0.5px;">Opal Smiles Dental Studio</div>
         <div style="font-size:12px; color: #1f2937; font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:1px;">Multi-Speciality Dental Clinic & Hospital</div>
        <div style="font-size: 10px; color: #4b5563; margin-top: 5px;">#102, C Block, South Extension - 1, New Delhi</div>
        <div style="font-size: 10px; color: #4b5563;">Phone: 9204972991 / 9934004494</div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #1f2937;">${displayDoctorName}</div>
<div style="font-size: 13px; font-weight: 500; color: #1f2937;">${specialization}</div>     
          <div style="font-size: 13px; font-weight: 500; color: #1f2937;">Hospital Registration Board</div>

        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: 500; color: #1f2937;">${doctorEmail}</div>
          <div style="font-size: 13px; font-weight: 500; color: #1f2937;">${doctorPhone}</div>
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
    <div style="padding: 20px 40px 10px;">
      <div style="display:flex; flex-direction:row; justify-content:space-between; align-items:center; padding:20px; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="flex:1; min-width:0; padding-right:10px;">
          <div style="font-size:9px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">Patient Name</div>
          <div style="font-size:14px; font-weight:800; color:#0f172a; white-space:nowrap; overflow:visible; text-overflow:ellipsis;">${patientName}</div>
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
    <div style="padding: 10px 30px 10px;">
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
                 ${Object.entries(finalToothChart).map(([num, cond]) => `<span style="font-size:11px; padding: 8px; border-radius:6px; background:#eff6ff; border:1px solid #bfdbfe; color:#1e3a8a; font-weight:700;">Tooth #${num}: ${cond}</span>`).join('')}
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
      <div style="padding: 10px 30px 10px;">
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
      <div style="padding: 10px 30px 10px;">
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
    <div style="padding: 10px 30px 10px;">
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
 <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">QTY</th>


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
          
  <td style="padding:10px 14px; font-size:12px; color:#475569;">${p.qty || "-"}</td>
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
          <div style="font-size:10px; color:#94a3b8; font-style:italic;">This is a computer-generated report from Opal Smiles Dental Studio.</div>
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
  <html>
    <head>
      <title>Invoice - ${invoice.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body { 
          font-family: 'Inter', sans-serif; 
          background: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .invoice-container {
          max-width: 900px;
          width: 100%;
          margin: 40px auto;
          padding: 0 20px;
        }
        .hospital-header { text-align: center; margin-bottom: 40px; border-bottom: 4px solid #3b82f6; padding-bottom: 20px; }
        .hospital-name { font-size: 24px; font-weight: 800; }
        .hospital-sub { font-size: 12px; font-weight: 600; color: #3b82f6; }
        .hospital-address { font-size: 11px; color: #64748b; }
        .hospital-contact { font-size: 10px; color: #94a3b8; }
        .doctor-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #f8fafc; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; }
        .info-row:last-child { border-bottom: none; }
        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        .med-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .med-table th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 700; font-size: 11px; border-bottom: 2px solid #e2e8f0; }
        .med-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .med-table td:nth-child(2) { text-align: center; }
        .med-table td:nth-child(3), .med-table td:nth-child(4) { text-align: right; }
        .med-table th:nth-child(2) { text-align: center; }
        .med-table th:nth-child(3), .med-table th:nth-child(4) { text-align: right; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
        .totals-box { width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .grand-total { display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px; border-top: 2px solid #3b82f6; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        @media print {
          body { margin: 0; padding: 0; }
          .invoice-container { margin: 0 auto; padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="hospital-header">
          <div class="hospital-name">OPAL SMILES DENTAL STUDIO</div>
          <div class="hospital-sub">MULTI-SPECIALITY DENTAL CLINIC & HOSPITAL</div>
          <div class="hospital-address">#102, C Block, South Extension - 1, New Delhi</div>
          <div class="hospital-contact">Phone: 9204972991 / 9934004454</div>
        </div>

        <div class="doctor-row">
          <div>
            <strong>Dr. ${invoice.doctor || "Staff"}</strong><br/>
            <span style="font-size: 12px;">Dentistry</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; font-weight: 600;">Hospital Registration Board</span><br/>
            <span style="font-size: 10px; color: #64748b;">clinic@opalsmiles.com</span>
          </div>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <h2 style="font-size: 20px; letter-spacing: 2px;">INVOICE</h2>
          <p style="font-size: 13px; color: #475569; margin-top: 5px;">Invoice #${invoice.id}</p>
          <p style="font-size: 12px; color: #475569;">Date: ${new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>

        <div class="patient-grid">
          <div>
            <div class="info-row"><span style="font-size: 11px; font-weight: 800;">BILL TO</span><span><strong>${invoice.patientName}</strong></span></div>
            <div class="info-row"><span style="font-size: 11px; font-weight: 800;">PATIENT ID</span><span><strong>${invoice.patientId || '—'}</strong></span></div>
          </div>
          <div>
            <div class="info-row"><span style="font-size: 11px; font-weight: 800;">CONTACT</span><span><strong>${patient?.phone || '—'}</strong></span></div>
            <div class="info-row"><span style="font-size: 11px; font-weight: 800;">DUE DATE</span><span><strong>${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</strong></span></div>
          </div>
        </div>

        <table class="med-table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th style="text-align:center;">QTY</th>
              <th style="text-align:right;">RATE</th>
              <th style="text-align:right;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td style="font-weight:600;">${item.description}</td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">₹${item.rate.toLocaleString()}</td>
                <td style="text-align:right; font-weight:700;">₹${item.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-box">
            <div class="total-row">
              <span style="font-size: 14px;">Subtotal</span>
              <span style="font-size: 14px; font-weight:700;">₹${invoice.subtotal.toLocaleString()}</span>
            </div>
            ${invoice.discount > 0 ? `
              <div class="total-row">
                <span style="font-size: 14px;">Discount</span>
                <span style="font-size: 14px; font-weight:700; color:#ef4444;">-₹${invoice.discount.toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="grand-total">
              <span style="font-size: 16px; font-weight:800;">GRAND TOTAL</span>
              <span style="font-size: 20px; font-weight:800; color:#3b82f6;">₹${invoice.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="signature-section">
          <div>
            <span style="font-size: 11px; font-style:italic;">Thank you for your business.</span><br/>
            <span style="font-size: 11px; font-style:italic;">Payments are due within 7 days.</span>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; width: 220px;">
              <div style="font-size: 13px; font-weight:700;">Authorized Signatory</div>
              <div style="font-size: 10px; color: #64748b;">OPAL SMILES Dental Clinic & Hospital</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Confidential information. Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
  </html>
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
