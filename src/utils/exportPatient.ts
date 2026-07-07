import apiClient from "../services/apiClient";
import { parseApiResponse } from "../services/parseApiResponse";
import { normalizePatient } from "../hooks/patients/usePatientDetailQuery";
import logoImg from '../logo.png';

export const exportPatientReport = async (
  patientId: string
) => {
  let patient: any = null;

  try {
    const res = await apiClient.request({ url: `/patient/${patientId}`, method: 'get' });
    const parsed = parseApiResponse(res.data);
    if (parsed.data) {
      patient = normalizePatient(parsed.data);
    }
  } catch (err) {
  }

  if (!patient) return;

  // 1. Fetch appointments
  let patientAppointments: any[] = [];
  try {
    const aptRes = await apiClient.request({ url: `/patient/appointment-history/${patientId}`, method: 'get' });
    const parsed = parseApiResponse(aptRes.data);
    const rawList = parsed.data || [];
    patientAppointments = rawList.map((a: any) => ({
      ...a,
      id: a.id,
      patientName: a.patient_name || a.patientName,
      patientPhone: a.patient_phone || a.patientPhone,
      doctorName: a.doctor?.name || a.doctorName || "Doctor",
      date: a.date,
      time: a.start_time_ist || a.start_time || a.time,
      treatment: a.specific_treatment || a.treatment || "",
      treatmentType: a.treatment_type || a.treatmentType || "",
      fee: a.treatment_cost || a.cost || a.fee || 0,
      cost: a.treatment_cost || a.cost || 0,
      status: (a.status || "scheduled").toLowerCase().replace(/_/g, "-"),
      patientConcern: a.concern || a.patientConcern || "",
      concern: a.concern,
      notes: a.notes,
      doctorId: a.doctor_id || a.doctor?.id,
      patientId: a.patient_id,
      duration: a.slot_duration_mins || a.duration || 15,
    }));
  } catch (err) {}

  // 2. Fetch treatments
  let patientTreatments: any[] = [];
  try {
    const treatRes = await apiClient.request({
      url: `/treatment/list`,
      method: 'post',
      data: { filters: { patientId: [patientId] }, all: true }
    });
    const parsed = parseApiResponse(treatRes.data);
    const rawList = parsed.data?.data || parsed.data || [];
    patientTreatments = rawList.map((t: any) => ({
      ...t,
      id: t.id,
      name: t.procedure || t.name || "",
      date: t.treatment_date ? t.treatment_date.split('T')[0] : "",
      notes: t.notes || "",
      cost: t.est_cost || t.cost || 0,
      status: (t.status || "planned").toLowerCase(),
      patientId: t.patient_id,
    }));
  } catch (err) {}

  // 3. Fetch invoices
  let patientInvoices: any[] = [];
  try {
    const invRes = await apiClient.request({
      url: `/invoice/list`,
      method: 'post',
      data: { filters: { patient_id: [patientId] } }
    });
    const parsed = parseApiResponse(invRes.data);
    const rawList = parsed.data?.invoices || parsed.data || [];
    patientInvoices = rawList.map((inv: any) => ({
      ...inv,
      id: inv.id,
      invoice_number: inv.invoice_number || inv.invoiceNumber || inv.id,
      date: inv.created_at || inv.date,
      total: inv.grand_total || inv.total || 0,
      status: (inv.status || "").toLowerCase(),
      patientId: inv.patient_id,
    }));
  } catch (err) {}
  const prescriptions = patient.prescriptionHistory || [];

  const allergiesList = patient.allergyNames?.length ? patient.allergyNames : patient.allergies;
  const medicalHistoryList = patient.medicalHistoryNames?.length ? patient.medicalHistoryNames : patient.medicalHistory;

  const rawDoctor = patient.doctor_name || patient.doctorName || patientAppointments[0]?.doctorName || patientAppointments[0]?.doctor_name || "Consulting Doctor";
  const displayDoctorName = rawDoctor.toLowerCase().startsWith("dr") ? rawDoctor : `Dr. ${rawDoctor}`;

  const displayPatientId = patient.patient_code || patient.patientCode || patient.id.split('-')[0];
  const patientGender = patient.gender || "N/A";
  const patientBlood = patient.bloodGroup || patient.blood_group ? (patient.bloodGroup || patient.blood_group).replace('_', ' ') : "N/A";

  const printContent = `
    <html>
      <head>
        <title>Patient Report - ${patient.name}</title>
        <style>
          @page { size: A4; margin: 15mm 20mm 28mm 20mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.4;
            background: #fff;
          }

          /* ===== TABLE-BASED PRINT LAYOUT ===== */
          .print-layout { width: 100%; border-collapse: collapse; }
          .print-layout > thead td { vertical-align: bottom; padding: 0 5px; }
          .print-layout > tbody td { vertical-align: top; padding: 0 5px; }
          .print-layout > tfoot { display: none; } /* hide tfoot, we use fixed footer */

          /* Header area */
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0 12px 0;
            border-bottom: 2px solid #1e40af;
          }
          .report-header .logo img { height: 70px; width: auto; }
          .report-header .patient-info { text-align: right; }
          .report-header .patient-name { font-size: 17px; font-weight: 800; color: #1e40af; text-transform: uppercase; }
          .report-header .patient-detail { font-size: 11px; color: #475569; margin-top: 2px; }

          /* Fixed footer - always at page bottom */
          .fixed-footer {
            display: none;
          }
          @media print {
            .fixed-footer {
              display: block;
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 6px 20mm;
              border-top: 1px solid #cbd5e1;
              background: #fff;
            }
            .fixed-footer .footer-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
          }
          .footer-clinic { font-size: 9px; color: #475569; line-height: 1.5; }
          .footer-clinic strong { color: #1e293b; }
          .footer-note { font-size: 8px; color: #94a3b8; text-align: right; }

          /* Screen footer (visible in browser) */
          .screen-footer {
            border-top: 1px solid #cbd5e1;
            padding: 8px 0 4px 0;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 20px;
          }
          @media print { .screen-footer { display: none; } }

          /* Content sections */
          .section { margin-bottom: 14px; }
          .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1.5px solid #1e40af;
            padding-bottom: 3px;
            margin-bottom: 8px;
          }

          /* Info grid */
          .info-grid { display: flex; flex-wrap: wrap; gap: 6px 20px; }
          .info-grid .item { min-width: 45%; }
          .info-grid .item-full { width: 100%; }
          .info-grid .label { font-size: 9px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .info-grid .value { font-size: 12px; color: #0f172a; font-weight: 500; }

          /* Data tables */
          .data-table { width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 4px; }
          .data-table th {
            text-align: left; background: #f1f5f9; padding: 5px 8px;
            font-size: 10px; font-weight: 700; color: #475569;
            border-bottom: 1px solid #cbd5e1; text-transform: uppercase;
          }
          .data-table td {
            padding: 4px 8px; border-bottom: 1px solid #e2e8f0;
            font-size: 11px; color: #334155;
          }
          .data-table tr:nth-child(even) { background: #f8fafc; }

          /* Alert box */
          .alert-box {
            background: #fef3c7; border: 1px solid #fbbf24;
            padding: 8px 10px; border-radius: 4px; margin-top: 4px;
          }
          .alert-box .alert-label { font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase; }
          .alert-box .alert-text { font-size: 11px; color: #78350f; margin-top: 2px; }

          /* Signature block */
          .signature-block {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
            padding-right: 20px;
          }
          .signature-block .sig { text-align: center; }
          .signature-block .sig-line { border-top: 1px solid #334155; width: 180px; margin-bottom: 5px; }
          .signature-block .sig-name { font-size: 13px; font-weight: 700; color: #0f172a; }
          .signature-block .sig-role { font-size: 10px; color: #64748b; }

          /* Page border (print only) */
          @media print {
            .page-border {
              position: fixed; top: 0; left: 0; right: 0; bottom: 0;
              border: 1px solid #cbd5e1;
              pointer-events: none; z-index: 9999;
            }
          }
          @media screen {
            body { background: #e2e8f0; padding: 20px; }
            .page-border { display: none; }
            .fixed-footer { display: none; }
            .print-layout { max-width: 210mm; margin: 0 auto; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.12); padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="page-border"></div>

        <!-- Fixed footer: always at page bottom in print -->
        <div class="fixed-footer">
          <div class="footer-row">
            <div class="footer-clinic">
              <strong>Opal Smiles Dental Studio</strong><br/>
              104, Unicus Shyamal, Shyamal Cross Road, Satellite, Ahmedabad, Gujarat – 380 015<br/>
              Phone: +91 99981 93256 | Email: hello@opalsmiles.in<br/>
              Mon–Sat: 10:00 AM – 8:00 PM | Emergency: 24/7
            </div>
            <div class="footer-note">
              Computer-generated report<br/>
              ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <table class="print-layout">
          <!-- ====== REPEATING HEADER (every page) ====== -->
          <thead>
            <tr><td>
              <div class="report-header">
                <div class="logo">
                  <img src="${logoImg}" crossorigin="anonymous" />
                </div>
                <div class="patient-info">
                  <div class="patient-name">${patient.name}</div>
                  <div class="patient-detail"><strong>Patient ID:</strong> ${displayPatientId}</div>
                  <div class="patient-detail"><strong>Phone:</strong> ${patient.phone || 'N/A'}</div>
                  <div class="patient-detail">${patientGender} | ${patientBlood}</div>
                </div>
              </div>
              <div style="height: 10px;"></div>
            </td></tr>
          </thead>

          <tfoot><tr><td><div style="height:1px;"></div></td></tr></tfoot>

          <!-- ====== MAIN CONTENT ====== -->
          <tbody>
            <tr><td>

              <!-- Personal Information -->
              <div class="section">
                <div class="section-title">Personal Information</div>
                <div class="info-grid">
                  <div class="item">
                    <div class="label">Email</div>
                    <div class="value">${patient.email || 'N/A'}</div>
                  </div>
                  <div class="item">
                    <div class="label">Date of Birth</div>
                    <div class="value">${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</div>
                  </div>
                  <div class="item">
                    <div class="label">Gender</div>
                    <div class="value">${patientGender}</div>
                  </div>
                  <div class="item">
                    <div class="label">Blood Group</div>
                    <div class="value">${patientBlood}</div>
                  </div>
                  <div class="item-full">
                    <div class="label">Address</div>
                    <div class="value">${patient.address || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <!-- Medical Alerts -->
              ${
                (medicalHistoryList?.length > 0 || allergiesList?.length > 0)
                  ? `
              <div class="section">
                <div class="section-title">Medical Alerts</div>
                <div class="alert-box">
                  ${allergiesList?.length > 0 ? `
                    <div class="alert-label">⚠ Allergies</div>
                    <div class="alert-text">${allergiesList.join(', ')}</div>
                  ` : ''}
                  ${medicalHistoryList?.length > 0 ? `
                    <div class="alert-label" style="margin-top: ${allergiesList?.length > 0 ? '6px' : '0'};">Medical Conditions</div>
                    <div class="alert-text">${medicalHistoryList.join(', ')}</div>
                  ` : ''}
                </div>
              </div>
              ` : ''
              }

              <!-- Appointment History -->
              ${
                patientAppointments.length > 0
                  ? `
              <div class="section">
                <div class="section-title">Appointment History</div>
                <table class="data-table">
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
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((a) => `
                    <tr>
                      <td>${new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td>${a.time}</td>
                      <td>${a.treatment || a.type || 'General Consultation'}</td>
                      <td style="font-weight:600; color: ${a.status === 'COMPLETED' ? '#16a34a' : '#2563eb'}">${a.status.toUpperCase()}</td>
                    </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              ` : ''
              }

              <!-- Treatment History -->
              ${
                patientTreatments.length > 0
                  ? `
              <div class="section">
                <div class="section-title">Treatment History</div>
                <table class="data-table">
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
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((t) => `
                    <tr>
                      <td>${new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td>${t.name || t.treatmentName || 'N/A'}</td>
                      <td>${t.notes || '—'}</td>
                      <td style="font-weight:600;">${(t.status || 'completed').toUpperCase()}</td>
                    </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              ` : ''
              }

              <!-- Prescription History -->
              ${
                prescriptions.length > 0
                  ? `
              <div class="section">
                <div class="section-title">Prescription History</div>
                ${prescriptions.map((p: any) => `
                  <div style="margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <span style="font-weight: 700; font-size: 11px;">${p.treatment}</span>
                      <span style="color: #64748b; font-size: 10px;">${new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <table class="data-table" style="margin: 0;">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${p.prescriptions.map((m: any) => `
                        <tr>
                          <td>${m.medicine}</td>
                          <td>${m.dosage}</td>
                          <td>${m.frequency}</td>
                        </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `).join('')}
              </div>
              ` : ''
              }

              <!-- Billing Summary -->
              ${
                patientInvoices.length > 0
                  ? `
              <div class="section">
                <div class="section-title">Billing Summary</div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${patientInvoices.map((inv) => `
                    <tr>
                      <td style="font-weight:600;">${inv.invoice_number || inv.id}</td>
                      <td>${new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td>₹${(inv.total || inv.amount || 0).toLocaleString('en-IN')}</td>
                      <td style="font-weight:600; color: ${inv.status === 'paid' ? '#16a34a' : '#dc2626'}">${(inv.status || '').toUpperCase()}</td>
                    </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              ` : ''
              }

              <!-- Authorized Signature -->
              <div class="signature-block">
                <div class="sig">
                  <div class="sig-line"></div>
                  <div class="sig-name">${displayDoctorName}</div>
                  <div class="sig-role">Authorized Signatory</div>
                  <div class="sig-role">Opal Smiles Dental Studio</div>
                </div>
              </div>

            </td></tr>
          </tbody>
        </table>

        <!-- Screen-only footer (browser preview) -->
        <div class="screen-footer" style="padding: 8px 20px;">
          <div class="footer-clinic">
            <strong>Opal Smiles Dental Studio</strong><br/>
            104, Unicus Shyamal, Shyamal Cross Road, Satellite, Ahmedabad, Gujarat – 380 015<br/>
            Phone: +91 99981 93256 | Email: hello@opalsmiles.in<br/>
            Mon–Sat: 10:00 AM – 8:00 PM | Emergency: 24/7
          </div>
          <div class="footer-note">
            Computer-generated report<br/>
            ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
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
