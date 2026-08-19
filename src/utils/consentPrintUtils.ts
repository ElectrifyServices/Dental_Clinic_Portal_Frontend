import logoDefault from "../logo.png";

export function printConsentForm(form: any, logoUrl: string | null) {
  // Create a temporary hidden iframe element
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "0px";
  iframe.style.height = "0px";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const dateStr = form.createdDate
    ? new Date(form.createdDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "-";
  
  const signedDateStr = (form.status?.toUpperCase() === "SIGNED" || form.status?.toUpperCase() === "COMPLETED") && form.signedDate
    ? new Date(form.signedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "-";

  const isSigned = form.status?.toUpperCase() === "SIGNED" || form.status?.toUpperCase() === "COMPLETED";
  const logo = logoUrl || logoDefault;

  const htmlContent = `
    <html>
      <head>
        <title>Consent Form - ${form.patientName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 30px;
            color: #0f172a;
            background-color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .container {
            border: 2px solid #1e3a8a;
            border-radius: 20px;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
            background-color: white;
            box-sizing: border-box;
          }

          .watermark {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            opacity: 0.02;
            width: 350px;
            height: 350px;
            pointer-events: none;
            z-index: 0;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 10;
          }

          .logo {
            height: 55px;
            object-fit: contain;
          }

          .badge {
            background-color: #1e3a8a;
            color: white;
            padding: 6px 14px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .disclaimer {
            border: 1.5px solid #cbd5e1;
            border-radius: 12px;
            padding: 14px;
            background-color: #f8fafc;
            margin-bottom: 25px;
            text-align: center;
            font-style: italic;
            font-size: 11.5px;
            color: #334155;
            line-height: 1.5;
            font-weight: 500;
            position: relative;
            z-index: 10;
          }

          .info-table {
            border: 2px solid #1e3a8a;
            border-radius: 16px;
            margin-bottom: 30px;
            width: 100%;
            border-collapse: collapse;
            position: relative;
            z-index: 10;
            overflow: hidden;
          }

          .info-header {
            background-color: #1e3a8a;
            color: white;
            text-align: center;
            padding: 8px;
            font-weight: bold;
            font-size: 11px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .info-row {
            display: flex;
            border-top: 2px solid #1e3a8a;
          }

          .info-cell {
            flex: 1;
            padding: 12px 15px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            box-sizing: border-box;
          }

          .info-cell:not(:last-child) {
            border-right: 2px solid #1e3a8a;
          }

          .info-label {
            font-size: 9px;
            font-weight: 700;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .info-value {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
          }

          .status-badge {
            font-size: 8px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            border: 1px solid transparent;
            display: inline-block;
          }

          .status-completed {
            background-color: #d1fae5;
            color: #065f46;
            border-color: #a7f3d0;
          }

          .status-pending {
            background-color: #fef3c7;
            color: #92400e;
            border-color: #fde68a;
          }

          .section {
            margin-bottom: 25px;
            position: relative;
            z-index: 10;
          }

          .section-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
          }

          .section-num {
            background-color: #1e3a8a;
            color: white;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 900;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .section-title {
            color: #1e3a8a;
            font-weight: 700;
            font-size: 14px;
          }

          .section-line {
            flex-grow: 1;
            height: 1px;
            background-color: #1e3a8a;
            opacity: 0.25;
          }

          .section-content {
            padding-left: 32px;
            color: #334155;
            font-size: 12px;
            line-height: 1.6;
            font-weight: 500;
            white-space: pre-wrap;
          }

          .compliance-card {
            border: 1px solid #bfdbfe;
            background-color: #eff6ff;
            border-radius: 12px;
            padding: 15px;
            box-sizing: border-box;
          }

          .compliance-title {
            font-weight: 700;
            margin-bottom: 5px;
            font-size: 12.5px;
            color: #1e3a8a;
          }

          .signatures-grid {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            gap: 50px !important;
            padding-top: 30px !important;
            margin-top: 40px !important;
            position: relative;
            z-index: 10;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .sig-box {
            width: 45% !important;
            flex: 0 0 45% !important;
            text-align: center !important;
            box-sizing: border-box !important;
          }

          .sig-img-container {
            height: 55px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
          }

          .sig-img {
            max-height: 55px;
            object-fit: contain;
          }

          .sig-placeholder {
            font-size: 11px;
            font-weight: bold;
          }

          .sig-placeholder.pending {
            color: #ef4444;
          }

          .sig-placeholder.seal {
            color: #cbd5e1;
            font-style: italic;
            font-family: serif;
            font-size: 18px;
          }

          .sig-line {
            border-top: 1px dashed #94a3b8;
            padding-top: 8px;
            font-size: 11px;
            font-weight: 700;
            color: #334155;
          }

          .sig-name {
            color: #1e3a8a;
            font-weight: 900;
            font-size: 13.5px;
            font-style: italic;
            margin-top: 5px;
          }

          .footer {
            background-color: #1e3a8a;
            color: white;
            text-align: center;
            padding: 8px;
            font-size: 9px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-weight: 900;
            border-radius: 0 0 16px 16px;
            margin-top: 40px;
            box-sizing: border-box;
          }

          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .container {
              border: 2px solid #1e3a8a !important;
              max-width: 100% !important;
              border-radius: 16px !important;
              padding: 24px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <svg class="watermark" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>

          <div class="header">
            <img src="${logo}" class="logo" />
            <div class="badge">
              Verified Consent
            </div>
          </div>

          <div class="disclaimer">
            "I understand that dentistry is not an exact science and therefore reputable practitioners cannot properly guarantee results. I acknowledge that no guarantee or assurance has been made by anyone regarding the dental treatment I have requested and authorized."
          </div>

          <table class="info-table">
            <thead>
              <tr>
                <th class="info-header" colspan="2">Consent Information</th>
              </tr>
            </thead>
            <tbody>
              <tr class="info-row">
                <td class="info-cell">
                  <span class="info-label">Patient</span>
                  <span class="info-value">${form.patientName}</span>
                </td>
                <td class="info-cell">
                  <span class="info-label">Doctor</span>
                  <span class="info-value">${form.doctorName}</span>
                </td>
              </tr>
              <tr class="info-row">
                <td class="info-cell">
                  <span class="info-label">Procedure</span>
                  <span class="info-value">${form.treatmentType}</span>
                </td>
                <td class="info-cell" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; border-right: none;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span class="info-label">Signed Date</span>
                    <span class="info-value">${signedDateStr}</span>
                  </div>
                  <div style="text-align: right;">
                    <span class="info-label" style="display: block; margin-bottom: 2px;">Status</span>
                    <span class="status-badge ${isSigned ? 'status-completed' : 'status-pending'}">
                      ${isSigned ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </td>
              </tr>
              <tr class="info-row">
                <td class="info-cell" colspan="2" style="border-right: none;">
                  <span class="info-label">Created Date</span>
                  <span class="info-value">${dateStr}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="section">
            <div class="section-header">
              <div class="section-num">01</div>
              <div class="section-title">Procedure Details & Authorization</div>
              <div class="section-line"></div>
            </div>
            <div class="section-content">${form.content}</div>
          </div>

          <div class="section">
            <div class="section-header">
              <div class="section-num">02</div>
              <div class="section-title">Disclosed Risks & Complications</div>
              <div class="section-line"></div>
            </div>
            <div class="section-content">${form.riskDisclosure}</div>
          </div>

          <div class="section">
            <div class="section-header">
              <div class="section-num">03</div>
              <div class="section-title">Alternative Treatment Options</div>
              <div class="section-line"></div>
            </div>
            <div class="section-content">${form.alternativeTreatments}</div>
          </div>

          <div class="section">
            <div class="section-header">
              <div class="section-num">04</div>
              <div class="section-title">Post-Treatment Care Compliance</div>
              <div class="section-line"></div>
            </div>
            <div class="section-content">
              <div class="compliance-card">
                <div class="compliance-text">
                  <div class="compliance-title">Follow doctor's post-treatment guidelines carefully.</div>
                  I have read this form or had it read to me. I have had an opportunity to ask questions and all questions have been answered to my satisfaction. I understand the procedure and its risks and alternatives. I hereby freely give my consent to the proposed treatment.
                </div>
              </div>
            </div>
          </div>

          <div class="signatures-grid">
            <div class="sig-box">
              <div class="sig-img-container">
                ${form.signature ? `<img src="${form.signature}" class="sig-img" />` : `<span class="sig-placeholder pending">Not signed yet</span>`}
              </div>
              <div class="sig-line">
                Patient Signature
              </div>
              <div class="sig-name">${form.patientName}</div>
            </div>

            <div class="sig-box">
              <div class="sig-img-container">
                ${form.witnessSignature ? `<img src="${form.witnessSignature}" class="sig-img" />` : `<span class="sig-placeholder seal">Clinic Seal</span>`}
              </div>
              <div class="sig-line">
                ${form.witnessName ? 'Witness Signature' : 'Doctor Signature'}
              </div>
              <div class="sig-name">${form.witnessName || form.doctorName}</div>
            </div>
          </div>

          <div class="footer">
            Electronically Verified Medical Document &bull; ${new Date().getFullYear()}
          </div>
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Print once the iframe structure is loaded
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}
