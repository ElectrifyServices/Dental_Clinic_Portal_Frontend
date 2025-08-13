import React from 'react';
import { X, Download, Shield, User, Calendar, FileText } from 'lucide-react';

interface ConsentFormViewerProps {
  formId: string;
  onClose: () => void;
}

export function ConsentFormViewer({ formId, onClose }: ConsentFormViewerProps) {
  // Mock data - in real app, fetch from API
  const form = {
    id: formId,
    patientName: 'Rajesh Kumar',
    treatmentType: 'Root Canal Treatment',
    content: 'I understand the risks and benefits of root canal treatment and consent to the procedure. The doctor has explained the treatment process, potential complications, and post-treatment care instructions.',
    riskDisclosure: 'Potential risks include temporary discomfort, swelling, infection, and in rare cases, treatment failure requiring additional procedures.',
    alternativeTreatments: 'Alternative treatments include tooth extraction followed by implant or bridge placement.',
    postTreatmentCare: 'Avoid hard foods for 24 hours, take prescribed medications, and maintain good oral hygiene.',
    date: '2024-01-15',
    signature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCI+PHBhdGggZD0iTTEwIDUwIEwxOTAgNTAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
    witnessSignature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCI+PHBhdGggZD0iTTEwIDUwIEwxOTAgNTAiIHN0cm9rZT0iYmx1ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'
  };

  const handleDownload = () => {
    // Create a printable version
    const printContent = `
      <html>
        <head>
          <title>Consent Form - ${form.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .signature-area { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Digital Consent Form</h1>
            <h2>${form.treatmentType}</h2>
          </div>
          <div class="section">
            <strong>Patient Name:</strong> ${form.patientName}<br>
            <strong>Date:</strong> ${new Date(form.date).toLocaleDateString()}
          </div>
          <div class="section">
            <h3>Treatment Consent</h3>
            <p>${form.content}</p>
          </div>
          <div class="section">
            <h3>Risk Disclosure</h3>
            <p>${form.riskDisclosure}</p>
          </div>
          <div class="section">
            <h3>Alternative Treatments</h3>
            <p>${form.alternativeTreatments}</p>
          </div>
          <div class="section">
            <h3>Post-Treatment Care</h3>
            <p>${form.postTreatmentCare}</p>
          </div>
          <div class="signature-area">
            <p><strong>Patient Signature:</strong> [Digitally Signed]</p>
            <p><strong>Date:</strong> ${new Date(form.date).toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-form-${form.patientName}-${form.date}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Digital Consent Form</h2>
                <p className="text-gray-600">{form.treatmentType}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={() => {
                  const printContent = document.querySelector('.consent-content')?.innerHTML;
                  if (printContent) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Consent Form - ${form.patientName}</title>
                            <style>
                              body { font-family: Arial, sans-serif; margin: 40px; }
                              .header { text-align: center; margin-bottom: 30px; }
                              .section { margin-bottom: 20px; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h1>Digital Consent Form</h1>
                              <h2>${form.treatmentType}</h2>
                            </div>
                            ${printContent}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center transition-all duration-200"
              >
                <FileText className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="consent-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Patient Name</p>
                  <p className="font-semibold text-gray-900">{form.patientName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">{new Date(form.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Treatment Consent
              </h3>
              <p className="text-blue-800">{form.content}</p>
            </div>

            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <h3 className="text-lg font-bold text-orange-900 mb-3">Risk Disclosure</h3>
              <p className="text-orange-800">{form.riskDisclosure}</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-3">Alternative Treatments</h3>
              <p className="text-purple-800">{form.alternativeTreatments}</p>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-3">Post-Treatment Care</h3>
              <p className="text-green-800">{form.postTreatmentCare}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Digital Signatures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Patient Signature</p>
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                    <p className="text-green-600 font-medium">✓ Digitally Signed</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(form.date).toLocaleDateString()}</p>
                  </div>
                </div>
                {form.witnessSignature && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Witness Signature</p>
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                      <p className="text-blue-600 font-medium">✓ Witnessed</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(form.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Legal Disclaimer</h4>
              <p className="text-sm text-blue-800">
                This digital consent form is legally binding and complies with healthcare regulations. 
                The patient has acknowledged understanding of the treatment, risks, and alternatives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}