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

  const filledPrescriptions = (consultationData.prescriptions || []).filter(
    (p: any) => p.medicine && p.medicine.trim() !== "",
  );

  const getHeader = () => `
    <div style="padding: 30px 50px 20px; border-bottom: 2px solid #3b82f6;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:28px; font-weight:800; color:#1e40af; letter-spacing:-0.5px;">DentalCare Pro</div>
          <div style="font-size:12px; color:#6b7280; font-weight:500; margin-top:4px;">Advanced Dental Clinic & Implant Centre</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:14px; font-weight:700; color:#111827;">${patient.doctorName || "Dr. Rajesh Sharma"}</div>
          <div style="font-size:11px; color:#6b7280; margin-top:2px;">BDS, MDS (Oral & Maxillofacial Surgery)</div>
          <div style="font-size:11px; color:#6b7280;">Reg No: 123456/78</div>
        </div>
      </div>
    </div>
  `;

  const getPatientInfo = (title: string) => `
    <div style="padding: 10px 50px; background:#f8fafc; border-bottom: 1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:16px; font-weight:700; color:#1e40af; text-transform:uppercase; letter-spacing:1px;">${title}</div>
        <div style="text-align:right; font-size:11px; color:#64748b; display:flex; gap:15px;">
          <span><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
          <span><strong>Time:</strong> ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    </div>
    <div style="padding: 20px 50px 10px;">
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; padding:15px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <div>
          <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Patient Name</div>
          <div style="font-size:15px; font-weight:700; color:#1e293b;">${patient.patientName || "—"}</div>
        </div>
        <div>
          <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Patient ID</div>
          <div style="font-size:14px; font-weight:500; color:#334155;">${patient.id || "—"}</div>
        </div>
        <div>
          <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Phone</div>
          <div style="font-size:14px; font-weight:500; color:#334155;">${patient.phone || "—"}</div>
        </div>
      </div>
    </div>
  `;

  const getClinicalSection = () => `
    <div style="padding: 10px 50px 20px;">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-bottom:20px;">
        <div style="border-left: 3px solid #3b82f6; padding-left:15px;">
          <div style="font-size:11px; font-weight:700; color:#1e40af; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Clinical Observations</div>
          <div style="font-size:13px; line-height:1.6; color:#374151;">
            ${consultationData.observations || '<span style="color:#9ca3af;">No observations recorded.</span>'}
          </div>
          ${Object.keys(toothChartState).length > 0 ? `
            <div style="margin-top:12px;">
              <div style="font-size:11px; font-weight:700; color:#1e40af; text-transform:uppercase; margin-bottom:8px;">Tooth Chart Findings</div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${Object.entries(toothChartState).map(([num, cond]) => `<span style="font-size:11px; padding:3px 10px; border-radius:999px; background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; font-weight:600;">#${num} — ${cond}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div style="border-left: 3px solid #10b981; padding-left:15px;">
          <div style="font-size:11px; font-weight:700; color:#065f46; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Diagnosis</div>
          <div style="font-size:13px; line-height:1.6; color:#374151;">
            ${consultationData.diagnosis || '<span style="color:#9ca3af;">No diagnosis provided.</span>'}
          </div>
        </div>
      </div>
    </div>
  `;

  const getXraySection = () => {
    if (!consultationData.xrayFiles || consultationData.xrayFiles.length === 0) return "";
    return `
      <div style="padding: 10px 50px 20px;">
        <div style="font-size:11px; font-weight:700; color:#1e40af; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:5px;">X-Ray Reports</div>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px;">
          ${consultationData.xrayFiles.map((url: string, i: number) => `
            <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; background:#f8fafc;">
              <img src="${url}" style="width:100%; height:150px; object-fit:cover;" />
              <div style="padding:5px; text-align:center; font-size:9px; color:#64748b; font-weight:600;">X-Ray Image ${i + 1}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  const getTreatmentSection = () => `
    <div style="padding: 10px 50px 20px;">
      <div style="margin-bottom:25px; background:#f1f5f9; padding:15px 20px; border-radius:8px;">
        <div style="font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; border-bottom:1px solid #cbd5e1; padding-bottom:8px;">Treatment Plan & Procedures</div>
        <div style="font-size:13px; line-height:1.6; color:#334155;">
          <div style="margin-bottom:10px;"><strong>Procedure:</strong> ${consultationData.treatmentProcedure || consultationData.procedure || 'General Consultation'}</div>
          <div style="margin-bottom:10px;"><strong>Plan:</strong> ${consultationData.treatmentPlan || '—'}</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:10px; font-size:12px;">
            <div><strong>Sessions:</strong> ${consultationData.treatmentSessions || 1}</div>
            <div><strong>Estimated Cost:</strong> ₹${consultationData.treatmentCost || consultationData.cost || 0}</div>
          </div>
        </div>
      </div>
      <div>
        <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Recommendations</div>
        <div style="font-size:12px; line-height:1.6; color:#334155; padding:15px; background:#fff; border:1px solid #e2e8f0; border-radius:8px;">
          ${consultationData.recommendations || "Follow standard post-operative care."}
        </div>
      </div>
    </div>
  `;

  const getPrescriptionSection = () => `
    <div style="padding: 10px 50px 20px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <div style="width:24px; height:24px; background:#ecfdf5; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#059669; font-weight:bold;">💊</div>
        <div style="font-size:14px; font-weight:700; color:#111827;">Prescribed Medications</div>
      </div>
      <table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
            <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">#</th>
            <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Medicine</th>
            <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Dosage</th>
            <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Freq</th>
            <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Duration</th>
          </tr>
        </thead>
        <tbody>
          ${filledPrescriptions.map((p: any, i: number) => `
            <tr style="border-bottom:1px solid #f1f5f9; ${i % 2 === 0 ? "" : "background:#fafafa;"}">
              <td style="padding:12px 15px; font-size:12px; color:#94a3b8;">${i + 1}</td>
              <td style="padding:12px 15px; font-size:13px; font-weight:600; color:#1e293b;">${p.medicine || "-"}</td>
              <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.dosage || "-"} (${p.timing || "-"})</td>
              <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.frequency || "-"}</td>
              <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.duration ? `${p.duration} ${p.durationUnit || 'Days'}` : '-'}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  const getFooter = () => `
    <div style="margin-top:40px; padding: 0 50px 20px; border-top:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:20px;">
        <div>
          <div style="font-size:10px; color:#94a3b8; font-style:italic;">This is a computer-generated report.</div>
          <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Generated: ${new Date().toLocaleString("en-IN")}</div>
        </div>
        <div style="text-align:center;">
          <div style="width:180px; border-top:1px solid #1e293b; padding-top:10px;">
            <div style="font-size:13px; font-weight:700; color:#1e293b;">${patient.doctorName || "Dr. Rajesh Sharma"}</div>
            <div style="font-size:10px; color:#64748b;">Dental Surgeon</div>
          </div>
        </div>
      </div>
    </div>
    <div style="background:#1e40af; padding:15px 50px; color:white; font-size:10px; display:flex; justify-content:space-between;">
      <div>📍 123 Dental Street, Medical Hub, New Delhi</div>
      <div>📞 +91 98765 43210 | 🌐 www.dentalcarepro.com</div>
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
