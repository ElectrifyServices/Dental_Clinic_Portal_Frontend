import apiClient from "../services/apiClient";
import { parseApiResponse } from "../services/parseApiResponse";
import { normalizePatient } from "../hooks/patients/usePatientDetailQuery";

export const exportPatientReport = async (
  patientId: string,
  patients: any[],
  appointments: any[],
  treatments: any[],
  invoices: any[]
) => {
  let patient = patients.find((p) => p.id === patientId);
  if (!patient) return;

  try {
    const res = await apiClient.request({ url: `/patient/${patientId}`, method: 'get' });
    const parsed = parseApiResponse(res.data);
    if (parsed.data) {
      const detailedPatient = normalizePatient(parsed.data);
      if (detailedPatient) {
        patient = { ...patient, ...detailedPatient };
      }
    }
  } catch (err) {
    /* console.error removed */
  }

  const patientAppointments = appointments.filter(
    (a) => a.patientId === patient.id || a.patientPhone === patient.phone,
  );
  const patientTreatments = treatments.filter(
    (t) => t.patientId === patient.id,
  );
  const patientInvoices = invoices.filter(
    (inv) => inv.patientId === patient.id,
  );
  const prescriptions = patient.prescriptionHistory || [];

  const allergiesList = patient.allergyNames?.length ? patient.allergyNames : patient.allergies;
  const medicalHistoryList = patient.medicalHistoryNames?.length ? patient.medicalHistoryNames : patient.medicalHistory;

  const printContent = `
    <html>
      <head>
        <title>Patient Full Report - ${patient.name}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 { color: #1e40af; margin: 0; font-size: 28px; }
          .header p { margin: 5px 0; color: #666; font-size: 14px; }
          
          .section { margin-bottom: 25px; }
          .section-title {
            font-size: 16px;
            font-bold: bold;
            color: #1e40af;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .info-item { margin-bottom: 10px; }
          .info-label { font-size: 12px; color: #666; font-weight: 600; }
          .info-value { font-size: 14px; color: #111; font-weight: 500; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { text-align: left; background: #f8fafc; padding: 10px; font-size: 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0; color: #475569; }
          td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          
          .alert-box {
            background: #fff7ed;
            border: 1px solid #ffedd5;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .alert-title { color: #9a3412; font-weight: bold; font-size: 14px; margin-bottom: 5px; }
          .alert-text { color: #c2410c; font-size: 13px; }

          .footer-sig {
            margin-top: 60px;
            display: flex;
            justify-content: flex-end;
            padding-right: 50px;
          }
          .sig-container { text-align: center; }
          .sig-line { border-top: 1px solid #333; width: 200px; margin-bottom: 8px; }
          .sig-name { font-weight: bold; font-size: 15px; color: #111; }
          .sig-title { font-size: 12px; color: #666; }

          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(226, 232, 240, 0.4);
            z-index: -1;
            pointer-events: none;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="watermark">OPAL SMILES</div>
        
        <div class="header">
          <h1>🦷 Opal Smiles Dental Studio</h1>
          <p>Advanced Multispeciality Dental Clinic & Implant Centre</p>
          <p>#102, C Block, South Extension, New Delhi | Ph: 9204972991</p>
        </div>

        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${patient.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Patient ID</div>
              <div class="info-value">${patient.id}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone Number</div>
              <div class="info-value">${patient.phone}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email Address</div>
              <div class="info-value">${patient.email || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date of Birth</div>
              <div class="info-value">${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Gender</div>
              <div class="info-value">${patient.gender || "N/A"}</div>
            </div>
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">Residential Address</div>
              <div class="info-value">${patient.address || "N/A"}</div>
            </div>
          </div>
        </div>

        ${
          medicalHistoryList?.length > 0 || allergiesList?.length > 0
            ? `
          <div class="section">
            <div class="section-title">Medical Alerts</div>
            <div class="alert-box">
              ${
                allergiesList?.length > 0
                  ? `
                <div class="alert-title">ALLERGIES</div>
                <div class="alert-text">${allergiesList.join(", ")}</div>
                <div style="margin-bottom: 10px;"></div>
              `
                  : ""
              }
              ${
                medicalHistoryList?.length > 0
                  ? `
                <div class="alert-title">MEDICAL CONDITIONS</div>
                <div class="alert-text">${medicalHistoryList.join(", ")}</div>
              `
                  : ""
              }
            </div>
          </div>
        `
            : ""
        }

        ${
          patientAppointments.length > 0
            ? `
          <div class="section">
            <div class="section-title">Appointment History</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Treatment / Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${patientAppointments
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map(
                    (a) => `
                  <tr>
                    <td>${new Date(a.date).toLocaleDateString()}</td>
                    <td>${a.time}</td>
                    <td>${a.treatment || a.type || "General Consultation"}</td>
                    <td>${a.status.toUpperCase()}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : ""
        }

        ${
          patientTreatments.length > 0
            ? `
          <div class="section">
            <div class="section-title">Treatment History</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Treatment Name</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${patientTreatments
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map(
                    (t) => `
                  <tr>
                    <td>${new Date(t.date).toLocaleDateString()}</td>
                    <td>${t.name || t.treatmentName || "N/A"}</td>
                    <td>${t.notes || "—"}</td>
                    <td>${(t.status || "completed").toUpperCase()}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : ""
        }

        ${
          prescriptions.length > 0
            ? `
          <div class="section">
            <div class="section-title">Prescription History</div>
            ${prescriptions
              .map(
                (p: any) => `
              <div style="margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-weight: bold; font-size: 13px;">${p.treatment}</span>
                  <span style="color: #666; font-size: 12px;">${new Date(p.date).toLocaleDateString()}</span>
                </div>
                <table style="margin-top: 0;">
                  <thead>
                    <tr>
                      <th style="padding: 5px 10px;">Medicine</th>
                      <th style="padding: 5px 10px;">Dosage</th>
                      <th style="padding: 5px 10px;">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${p.prescriptions
                      .map(
                        (m: any) => `
                      <tr>
                        <td style="padding: 5px 10px;">${m.medicine}</td>
                        <td style="padding: 5px 10px;">${m.dosage}</td>
                        <td style="padding: 5px 10px;">${m.frequency}</td>
                      </tr>
                    `,
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        ${
          patientInvoices.length > 0
            ? `
          <div class="section">
            <div class="section-title">Billing Summary</div>
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${patientInvoices
                  .map(
                    (inv) => `
                  <tr>
                    <td>${inv.id}</td>
                    <td>${new Date(inv.date).toLocaleDateString()}</td>
                    <td>₹${(inv.total || inv.amount || 0).toLocaleString()}</td>
                    <td style="color: ${inv.status === "paid" ? "#16a34a" : "#dc2626"}">${(inv.status || "").toUpperCase()}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : ""
        }

        <div class="footer-sig">
          <div class="sig-container">
            <div class="sig-line"></div>
            <div class="sig-name">Dr. Rajesh Sharma</div>
            <div class="sig-title">BDS, MDS (Oral Surgery)</div>
            <div class="sig-title">Reg No: 12345/A</div>
          </div>
        </div>

        <div style="position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 10px; color: #999;">
          This is a computer-generated medical report. Generated on ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
};
