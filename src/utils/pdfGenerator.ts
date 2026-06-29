import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoImg from '../logo.png';

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
    position: absolute; left: -9999px; top: 0;
    width: 794px; background: white; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

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
  const doctorEmail = doctorObj?.email || "";
  const doctorPhone = doctorObj?.phone || "";
  const displayDoctorName = doctorName ? (doctorName.toLowerCase().startsWith("dr.") ? doctorName : `Dr. ${doctorName}`) : "—";
  const specialization = doctorObj?.personal_profile?.specialization?.name ||
    doctorObj?.specialization?.name ||
    doctorObj?.specialization ||
    "Dentistry";

  console.log("Extracted doctor:", { doctorName, doctorEmail, doctorPhone, doctorObj });


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
  const patientName = patientObj?.name || patient.patientName || "—";
  const patientId = patientObj?.id || patient.id || "—";
  const patientCode = patientObj?.patient_code || patientObj?.patientCode || patient.patient_code || patient.patientCode;
  const displayPatientId = patientCode || (patientId === "—" ? "—" : patientId.split('-')[0]);
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

  const getHeader = () => `
    <div style="padding: 25px 40px 15px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center;">
        <img src="${logoImg}" style="height: 80px; width: auto; object-fit: contain;" crossorigin="anonymous" />
      </div>
      <div style="text-align: right;">
        <div style="font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${patientName}</div>
        <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 4px;">Patient ID: ${displayPatientId}</div>
        <div style="font-size: 12px; font-weight: 500; color: #475569; margin-top: 2px;">Phone: ${patientPhone}</div>
        <div style="font-size: 12px; font-weight: 500; color: #475569; margin-top: 2px;">${patientGender} / ${patientBloodGroup}</div>
      </div>
    </div>
  `;


  const getPatientInfo = (title: string) => `
    <div style="padding: 10px 40px; background:#f8fafc; border-bottom: 1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:12px; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:1px;">${title}</div>
      <div style="text-align:right; font-size:11px; color:#475569; font-weight:500;">
        <span><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
      </div>
    </div>
    <div style="padding: 20px 40px 10px;">
      <div style="display:flex; flex-direction:row; justify-content:space-between; align-items:center; padding:12px 18px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <div style="flex:1; min-width:0; padding-right:10px; border-right: 1px solid #e2e8f0;">
           <div style="font-size:9px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:2px;">Consulting Doctor</div>
           <div style="font-size:14px; font-weight:800; color:#0f172a;">${displayDoctorName}</div>
           <div style="font-size:11px; font-weight:500; color:#475569; margin-top:2px;">${specialization}</div>
        </div>
        <div style="flex:1; min-width:0; padding-left:18px;">
           <div style="font-size:9px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:2px;">Clinic</div>
           <div style="font-size:13px; font-weight:700; color:#0f172a;">Opal Smiles Dental Studio</div>
           <div style="font-size:11px; font-weight:500; color:#475569; margin-top:2px;">Dental & Facial Aesthetics</div>
        </div>
      </div>
    </div>
  `;

  const getClinicalSection = () => `
    <div style="padding: 10px 40px 10px;">
      ${patientConcern ? `
        <div style="margin-bottom:15px;">
          <div style="font-size:11px; font-weight:800; color:#0f172a; text-transform:uppercase; margin-bottom:4px; border-bottom:1px solid #cbd5e1; padding-bottom:4px; display:inline-block;">Chief Complaint</div>
          <div style="font-size:13px; line-height:1.5; color:#334155; font-weight:500;">${patientConcern}</div>
        </div>
      ` : ''}
      <div style="display:flex; flex-direction:row; justify-content:space-between; width:100%; gap:20px;">
        <div style="flex:1;">
          <div style="font-size:11px; font-weight:800; color:#0f172a; text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">Clinical Observations</div>
          <div style="font-size:13px; line-height:1.6; color:#334155;">
            ${observations || '<span style="color:#94a3b8; font-style:italic;">No observations recorded.</span>'}
          </div>
          ${Object.keys(finalToothChart).length > 0 ? `
            <div style="margin-top:14px;">
               <div style="font-size:10px; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:6px;">Tooth Findings</div>
               <div style="display:flex; flex-wrap:wrap; gap:4px;">
                 ${Object.entries(finalToothChart).map(([num, cond]) => `<span style="font-size:11px; padding: 4px 8px; border-radius:4px; background:#f1f5f9; border:1px solid #e2e8f0; color:#334155; font-weight:600;">#${num}: ${cond}</span>`).join('')}
               </div>
            </div>
          ` : ''}
        </div>
        <div style="flex:1;">
          <div style="font-size:11px; font-weight:800; color:#0f172a; text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">Diagnosis</div>
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
                <td style="padding:10px 14px; font-size:12px; font-weight:600; color:#1e293b;">${t.procedure || t.treatment_type || '—'}</td>
                <td style="padding:10px 14px; font-size:12px; text-align:center; color:#475569;">${Array.isArray(t.sessions) ? t.sessions.length : (t.sessions || 1)}</td>
                <td style="padding:10px 14px; font-size:12px; text-align:right; font-weight:700; color:#0f172a;">₹${Number(t.est_cost || t.cost || 0).toLocaleString('en-IN')}</td>
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
              <td style="padding:10px 14px; font-size:12px; font-weight:700; color:#1e293b;">${p.medicine?.name || p.medicine?.medicine_name || p.medicine_name || p.medicineName || (typeof p.medicine === 'string' ? p.medicine : '') || "-"}</td>
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
    <div style="margin-top: auto;">
      <div style="padding: 0 40px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:20px;">
          <div>
            ${isFollowUp && followUpDate ? `
              <div style="font-size:12px; color:#0f172a; font-weight:700; border:1px solid #cbd5e1; padding:6px 12px; border-radius:4px; display:inline-block; margin-bottom:15px;">
                📅 Next Follow-Up: ${new Date(followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            ` : ''}
          </div>
          <div style="text-align:center;">
            <div style="width:200px; border-bottom:1px solid #cbd5e1; margin-bottom:8px;"></div>
            <div style="font-size:13px; font-weight:800; color:#0f172a;">${displayDoctorName}</div>
            <div style="font-size:11px; color:#475569; font-weight:500;">${specialization}</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">(Signature/Seal)</div>
          </div>
        </div>
      </div>
      <div style="background:#ffffff; padding:15px 40px 30px 40px; color:#0f172a; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 -4px 10px rgba(0,0,0,0.03); border-top: 1px solid #f1f5f9;">
        <div style="flex: 1; display:flex; flex-direction:column; gap:4px;">
          <div style="font-size:11px; font-weight:700;">104, Unicus Shyamal, Shyamal Cross Road, Satellite, Ahmedabad, Gujarat – 380 015</div>
          <div style="font-size:11px; font-weight:600; color:#475569;">Phone: +91 99981 93256 | Email: hello@opalsmiles.in</div>
          <div style="font-size:11px; font-weight:600; color:#475569;">Mon–Sat: 10:00 AM – 8:00 PM | Emergency: 24 / 7</div>
          <div style="font-size:11px; font-weight:600; color:#475569;">Instagram: "opalsmiles_dental"</div>
        </div>
        <div style="width: 60px; height: 60px; background: white; padding: 2px; border-radius: 4px; border:1px solid #cbd5e1;">
          <img src="/opalsmiles-qr.png" style="width: 100%; height: 100%; object-fit: contain;" crossorigin="anonymous" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>
  `;

  let htmlContent = `<div style="width:794px; background:#fff; margin:0; padding:0; color: #1f2937; display:flex; flex-direction:column; min-height:1123px; box-sizing:border-box;">${getHeader()}`;

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

  // Wait for images to load
  const images = Array.from(pdfContainer.getElementsByTagName('img'));
  await Promise.all(images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }));

  // Force height to be a multiple of A4 (1123px) so footer sticks to bottom of last page
  const currentHeight = pdfContainer.offsetHeight;
  const remainder = currentHeight % 1123;
  if (remainder !== 0) {
    const extra = 1123 - remainder;
    // We add the extra height to the container so it becomes exactly a multiple of 1123.
    // However, since it's flex, we can just add a spacer or set exact height.
    pdfContainer.style.height = (currentHeight + extra) + "px";
  }

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

    // Draw subtle border around page
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, pdfWidth - 20, pdfHeight - 20);

    heightLeft -= pdfHeight;

    // Fix for the extra blank page bug: only add a new page if remaining height is significant (> 10px)
    while (heightLeft > 10) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(1);
      pdf.rect(10, 10, pdfWidth - 20, pdfHeight - 20);
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
    position: absolute; left: -9999px; top: 0;
    width: 794px; background: white; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const patientName = invoice.patientName || patient?.name || "—";
  const patientId = invoice.patientId || patient?.id || "—";
  const patientCode = invoice.patient_code || invoice.patientCode || patient?.patient_code || patient?.patientCode;
  const displayPatientId = patientCode || (patientId === "—" ? "—" : patientId.split('-')[0]);
  const patientPhone = invoice.phone || patient?.phone || "—";
  const doctorName = invoice.doctor || "General Dentist";
  const displayDoctorName = doctorName.toLowerCase().startsWith("dr.") ? doctorName : `Dr. ${doctorName}`;
  const invoiceNumber = invoice.invoice_number || invoice.id || "—";
  const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const status = (invoice.status || "Generated").replace('_', ' ');

  // Determine paid amount and balance due properly based on API structure or normalized structure
  const rawPayments = invoice.invoice_payments || [];
  const calculatedPaidAmount = rawPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const paidAmount = invoice.paidAmount !== undefined ? invoice.paidAmount : calculatedPaidAmount;
  const grandTotal = Number(invoice.total || invoice.grand_total || 0);
  const pendingAmount = invoice.pendingAmount !== undefined ? invoice.pendingAmount : Math.max(0, grandTotal - paidAmount);

  const htmlContent = `
    <div style="width:794px; background:#fff; margin:0; padding:0; color: #1f2937; display:flex; flex-direction:column; min-height:1123px; box-sizing:border-box;">
      
      <!-- Header Area -->
      <div style="padding: 25px 40px 15px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center;">
          <img src="${logoImg}" style="height: 80px; width: auto; object-fit: contain;" crossorigin="anonymous" />
        </div>
        <div style="text-align: right;">
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${patientName}</div>
          <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 4px;">Patient ID: ${displayPatientId}</div>
          <div style="font-size: 12px; font-weight: 500; color: #475569; margin-top: 2px;">Phone: ${patientPhone}</div>
          ${invoiceNumber === 'STATEMENT' ? '' : `<div style="font-size: 12px; font-weight: 500; color: #475569; margin-top: 2px;">Invoice: #${invoiceNumber}</div>`}
        </div>
      </div>
      
      <!-- Title Bar -->
      <div style="padding: 10px 40px; background:#f8fafc; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:12px; font-weight:900; color:#1e3a8a; text-transform:uppercase; letter-spacing:1px;">${invoiceNumber === 'STATEMENT' ? 'CONSOLIDATED STATEMENT' : 'TAX INVOICE'}</div>
        <div style="text-align:right; font-size:11px; color:#475569; font-weight:500;">
          <span><strong>Date:</strong> ${invoiceDate}</span>
        </div>
      </div>
      

      
      <!-- Items Table -->
      <div style="padding: 10px 40px 10px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;">
          <div style="font-size:11px; font-weight:850; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px;">Invoice Details</div>
        </div>
        <table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
              <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">Invoice Number</th>
              <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">Item Type</th>
              <th style="padding:10px 14px; text-align:right; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">Total Amount</th>
              <th style="padding:10px 14px; text-align:right; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">Billed Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items && invoice.items.length > 0 ? invoice.items.map((item: any, i: number) => `
              <tr style="border-bottom:1px solid #f1f5f9; ${i % 2 === 0 ? "" : "background:#fafafa;"}">
                <td style="padding:10px 14px; font-size:12px; font-weight:700; color:#1e293b;">${item.invoice_number || invoice.invoice_number || invoice.id || "—"}</td>
                <td style="padding:10px 14px; font-size:12px; font-weight:700; color:#475569; text-transform:capitalize;">${(item.item_type || "Service").toLowerCase()}</td>
                <td style="padding:10px 14px; font-size:12px; text-align:right; color:#475569;">₹${Number(item.total_amount || 0).toLocaleString('en-IN')}</td>
                <td style="padding:10px 14px; font-size:12px; text-align:right; font-weight:700; color:#0f172a;">₹${Number(item.billed_amount || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('') : `
              <tr><td colspan="4" style="padding:15px; text-align:center; font-size:12px; color:#94a3b8; font-style:italic;">No items found.</td></tr>
            `}
          </tbody>
        </table>
      </div>
      
      <!-- Totals & Payment Section -->
      <div style="padding: 10px 40px 10px; display: flex; justify-content: space-between; align-items: flex-start; gap: 40px;">
        <!-- Left: Notes -->
        <div style="flex:1;">
          <div style="font-size:10px; font-weight:850; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Payment Terms & Notes</div>
          <div style="font-size:11px; line-height:1.6; color:#334155; padding:12px 16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
            1. Payment is due within 7 days of invoice date.<br/>
            2. Please make cheques payable to "Opal Smiles Dental Studio".<br/>
            3. For online transfers, please use UPI ID: opalsmiles@upi.<br/>
            4. This is a computer-generated invoice and does not require a physical signature.
          </div>
          ${invoice.isComplimentary && invoice.complimentaryNote ? `
            <div style="margin-top: 12px; padding: 10px 12px; background: #fdf4ff; border: 1px solid #f5d0fe; border-radius: 8px;">
              <div style="font-size: 10px; font-weight: 800; color: #a21caf; text-transform: uppercase;">Complimentary Reason</div>
              <div style="font-size: 11px; color: #86198f; font-weight: 500; margin-top: 4px;">"${invoice.complimentaryNote}"</div>
            </div>
          ` : ''}
          <div style="margin-top: 15px;">
             <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Payment Status:</span>
             <span style="margin-left: 6px; padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; background: ${invoice.status?.toLowerCase() === 'paid' ? '#dcfce7; color: #166534' : (invoice.status?.toLowerCase() === 'overdue' ? '#fee2e2; color: #991b1b' : '#e0e7ff; color: #3730a3')}">${status}</span>
          </div>
        </div>
        
        <!-- Right: Totals Box -->
        <div style="width: 280px;">
          <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fafaf9; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:#475569;">
              <span>Subtotal</span>
              <strong style="color:#0f172a;">₹${Number(invoice.subtotal || 0).toLocaleString('en-IN')}</strong>
            </div>
            
            ${invoice.discountAmount > 0 || invoice.discount > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:#ef4444;">
                <span>Discount ${invoice.discount && invoice.discountAmount ? `(${invoice.discount}%)` : ''}</span>
                <strong>-₹${Number(invoice.discountAmount || invoice.discount || 0).toLocaleString('en-IN')}</strong>
              </div>
            ` : ''}
            
            ${invoice.taxAmount > 0 || invoice.tax > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:#475569;">
                <span>Tax (GST) ${invoice.tax && invoice.taxAmount ? `(${invoice.tax}%)` : ''}</span>
                <strong style="color:#0f172a;">₹${Number(invoice.taxAmount || invoice.tax || 0).toLocaleString('en-IN')}</strong>
              </div>
            ` : ''}
            
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0 4px; margin-top:8px; border-top:2px solid #cbd5e1;">
              <span style="font-size:13px; font-weight:800; color:#0f172a; text-transform:uppercase;">Grand Total</span>
              <span style="font-size:18px; font-weight:900; color:#1e3a8a;">₹${grandTotal.toLocaleString('en-IN')}</span>
            </div>
            
            ${(paidAmount > 0 || pendingAmount > 0) ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; color:#15803d;">
                  <span>Amount Paid</span>
                  <strong>₹${paidAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:#b45309;">
                  <span>Balance Due</span>
                  <strong>₹${pendingAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
      
      <!-- Footer (Identical to Consultation) -->
      <div style="margin-top: auto;">
        <div style="padding: 0 40px 20px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:20px;">
            <div></div>
            <div style="text-align:center;">
              <div style="width:200px; border-bottom:1px solid #cbd5e1; margin-bottom:8px;"></div>
              <div style="font-size:13px; font-weight:800; color:#0f172a;">${displayDoctorName}</div>
              <div style="font-size:11px; color:#475569; font-weight:500;">Authorized Signatory</div>
              <div style="font-size:10px; color:#64748b; margin-top:2px;">Opal Smiles Dental Studio</div>
            </div>
          </div>
        </div>
        <div style="background:#ffffff; padding:15px 40px 30px 40px; color:#0f172a; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 -4px 10px rgba(0,0,0,0.03); border-top: 1px solid #f1f5f9;">
          <div style="flex: 1; display:flex; flex-direction:column; gap:4px;">
            <div style="font-size:11px; font-weight:700;">104, Unicus Shyamal, Shyamal Cross Road, Satellite, Ahmedabad, Gujarat – 380 015</div>
            <div style="font-size:11px; font-weight:600; color:#475569;">Phone: +91 99981 93256 | Email: hello@opalsmiles.in</div>
            <div style="font-size:11px; font-weight:600; color:#475569;">Mon–Sat: 10:00 AM – 8:00 PM | Emergency: 24 / 7</div>
            <div style="font-size:11px; font-weight:600; color:#475569;">InstaAcount: "opalsmiles_dental"</div>
          </div>
          <div style="width: 60px; height: 60px; background: white; padding: 2px; border-radius: 4px; border:1px solid #cbd5e1;">
            <img src="/opalsmiles-qr.png" style="width: 100%; height: 100%; object-fit: contain;" crossorigin="anonymous" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>
      
    </div>
  `;

  pdfContainer.innerHTML = htmlContent;
  document.body.appendChild(pdfContainer);

  // Wait for images to load
  const images = Array.from(pdfContainer.getElementsByTagName('img'));
  await Promise.all(images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }));

  try {
    const canvas = await html2canvas(pdfContainer, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 794, windowWidth: 794 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    // Draw subtle border around page
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, pdfWidth - 20, pdfHeight - 20);

    heightLeft -= pdfHeight;

    while (heightLeft > 10) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(1);
      pdf.rect(10, 10, pdfWidth - 20, pdfHeight - 20);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Invoice_${invoice.invoice_number || invoice.id}_${invoice.patientName || 'Patient'}.pdf`);
  } finally {
    document.body.removeChild(pdfContainer);
  }
};
