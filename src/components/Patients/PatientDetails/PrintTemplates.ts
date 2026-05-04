export const getPrescriptionHTML = (data: any) => {
  const { t, localizedClinicName, localizedDoctorName, localizedDoctorDegrees, localizedPatientName, previewData, localizedGender, localizedData, historyContent, customContent, printLanguage, patientId } = data;
  return `
    <html>
      <head>
        <title>Prescription - ${localizedPatientName}</title>
        <style>
          @page { size: A4; margin: 10mm 15mm; }
          body { font-family: 'Segoe UI', 'Arial', sans-serif; color: #1f2937; margin: 0; padding: 0; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 15px; margin-bottom: 10px; }
          .clinic-logo { width: 50px; height: 50px; background: #3b82f6; border-radius: 8px; margin-right: 15px; }
          .clinic-name { font-size: 20px; font-weight: 800; color: #1e40af; margin-bottom: 2px; }
          .clinic-info { font-size: 11px; color: #4b5563; }
          .doctor-name { font-size: 18px; font-weight: 800; color: #1e40af; text-align: right; }
          .degree { font-size: 11px; font-weight: 700; color: #4b5563; text-align: right; }
          .patient-bar { border-top: 2px solid #1e40af; border-bottom: 1px solid #e5e7eb; padding: 10px 0; display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 15px; font-weight: 700; color: #111827; }
          .vitals-grid { display: flex; gap: 30px; font-size: 13px; margin-bottom: 15px; color: #111827; }
          .footer { position: fixed; bottom: 30px; left: 0; right: 0; border-top: 1px solid #1e40af; padding-top: 15px; display: flex; justify-content: space-between; align-items: flex-end; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center;">
            <div class="clinic-logo"></div>
            <div>
              <div class="clinic-name">${localizedClinicName}</div>
              <div class="clinic-info">${printLanguage === "gu" ? t.clinicAddress : "#102, C Block, South Extension - 1"}</div>
              <div class="clinic-info">${printLanguage === "gu" ? t.clinicCity : "New Delhi"} | ${printLanguage === "gu" ? t.phoneLabel : "Ph"}: 9204972991</div>
            </div>
          </div>
          <div>
            <div class="doctor-name">${localizedDoctorName}</div>
            <div class="degree">${localizedDoctorDegrees}</div>
          </div>
        </div>
        <div class="patient-bar">
          <span>${patientId} : ${localizedPatientName.toUpperCase()}</span>
          <span>${t.date}: ${new Date().toLocaleDateString()}</span>
        </div>
        ${historyContent}
        ${customContent}
        <div class="footer">
          <div class="sig-area">
            <div class="sig-name">${localizedDoctorName}</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getBarcodeHTML = (patient: any) => {
  return `
    <html>
      <head><title>Barcode - ${patient.name}</title></head>
      <body>
        <div style="border: 2px solid #2563eb; padding: 20px; width: 300px; text-align: center;">
          <h2 style="color: #1e40af;">🦷 DentalCare Pro</h2>
          <div style="font-size: 24px; font-weight: bold; margin: 15px 0;">${patient.barcode}</div>
          <p><strong>Name:</strong> ${patient.name}</p>
          <p><strong>ID:</strong> ${patient.id}</p>
        </div>
      </body>
    </html>
  `;
};
