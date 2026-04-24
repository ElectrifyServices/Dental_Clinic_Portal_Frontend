import React from 'react';
import { X, Download, Stethoscope, User, Calendar, DollarSign, FileText, Camera, Pill } from 'lucide-react';

interface TreatmentViewerProps {
  treatment: any;
  onClose: () => void;
}

export function TreatmentViewer({ treatment, onClose }: TreatmentViewerProps) {
  if (!treatment) return null;

  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>Treatment Plan - ${treatment.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .patient-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .treatment-details { margin-bottom: 30px; }
            .prescriptions { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .prescription-item { background-color: white; padding: 15px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #10b981; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Treatment Plan & Progress Report</h1>
            <h2>DentalCare Pro - Dr. Sharma's Clinic</h2>
          </div>
          
          <div class="patient-info">
            <h3>Patient & Treatment Information</h3>
            <p><strong>Patient Name:</strong> ${treatment.patientName}</p>
            <p><strong>Procedure:</strong> ${treatment.procedure}</p>
            <p><strong>Tooth:</strong> ${treatment.tooth}</p>
            <p><strong>Date:</strong> ${new Date(treatment.date).toLocaleDateString()}</p>
            <p><strong>Doctor:</strong> ${treatment.doctorName}</p>
            <p><strong>Status:</strong> ${treatment.status.toUpperCase()}</p>
            <p><strong>Cost:</strong> ₹${treatment.cost.toLocaleString()}</p>
          </div>

          <div class="treatment-details">
            <h3>Treatment Notes & Progress</h3>
            <pre>${treatment.notes}</pre>
          </div>

          <div class="prescriptions">
            <h3>Prescribed Medications</h3>
            ${treatment.prescriptions.map(prescription => `
              <div class="prescription-item">
                <h4>${prescription.medicine}</h4>
                <p><strong>Dosage:</strong> ${prescription.dosage}</p>
                <p><strong>Timing:</strong> ${prescription.timing}</p>
                <p><strong>Frequency:</strong> ${prescription.frequency}</p>
                <p><strong>Duration:</strong> ${prescription.duration}</p>
                <p><strong>Qty:</strong> ${prescription.qty}</p>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>This is a confidential medical document. For questions, contact Dr. Sharma's Clinic.</p>
            <p>Generated on ${new Date().toLocaleDateString()} from DentalCare Pro Treatment Management System</p>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-plan-${treatment.patientName}-${treatment.date}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Stethoscope className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{treatment.procedure}</h2>
                <p className="text-gray-600">{treatment.patientName} - {treatment.tooth}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
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
          {/* Treatment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Patient Info
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {treatment.patientName}</p>
                <p><span className="font-medium">Tooth:</span> {treatment.tooth}</p>
                <p><span className="font-medium">Doctor:</span> {treatment.doctorName}</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Started:</span> {new Date(treatment.date).toLocaleDateString()}</p>
                {treatment.nextAppointment && (
                  <p><span className="font-medium">Next Visit:</span> {new Date(treatment.nextAppointment).toLocaleDateString()}</p>
                )}
                <p>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(treatment.status)}`}>
                    {treatment.status.replace('-', ' ').toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Cost
              </h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-purple-900">₹{treatment.cost.toLocaleString()}</p>
                <p className="text-sm text-purple-700">Treatment Fee</p>
              </div>
            </div>
          </div>

          {/* Treatment Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Treatment Notes & Progress
            </h3>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {treatment.notes}
              </pre>
            </div>
          </div>

          {/* Prescriptions */}
          {treatment.prescriptions && treatment.prescriptions.length > 0 && (
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Prescribed Medications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treatment.prescriptions.map((prescription) => (
                  <div key={prescription.id} className="bg-white rounded-xl p-4 border border-green-200">
                    <h4 className="font-bold text-green-900 mb-2">{prescription.medicine}</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                      <p><span className="font-medium">Timing:</span> {prescription.timing}</p>
                      <p><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                      <p><span className="font-medium">Duration:</span> {prescription.duration}</p>
                      <p><span className="font-medium">Qty:</span> {prescription.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treatment Images */}
          {treatment.images && treatment.images.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Treatment Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {treatment.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Treatment image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200"
                      onClick={() => window.open(image, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="bg-white text-gray-900 px-3 py-1 rounded-lg text-sm font-medium">
                          View Full Size
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {treatment.status === 'planned' && (
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all duration-200">
                Start Treatment
              </button>
            )}
            {treatment.status === 'in-progress' && (
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all duration-200">
                Mark as Completed
              </button>
            )}
            <button className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold transition-all duration-200">
              Edit Treatment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}