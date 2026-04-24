import React from 'react';
import { X, Download, FileText, User, Calendar, Stethoscope, Camera } from 'lucide-react';

interface EMRViewerProps {
  record: any;
  onClose: () => void;
}

export function EMRViewer({ record, onClose }: EMRViewerProps) {
  if (!record) return null;

  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>EMR Record - ${record.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .record-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .content { white-space: pre-wrap; margin-bottom: 30px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Electronic Medical Record</h1>
            <h2>DentalCare Pro - Dr. Sharma's Clinic</h2>
          </div>
          
          <div class="record-info">
            <h3>Record Information</h3>
            <p><strong>Patient:</strong> ${record.patientName}</p>
            <p><strong>Title:</strong> ${record.title}</p>
            <p><strong>Date:</strong> ${new Date(record.date).toLocaleDateString()}</p>
            <p><strong>Doctor:</strong> ${record.doctorName}</p>
            <p><strong>Type:</strong> ${record.type.toUpperCase()}</p>
          </div>

          <div class="content">
            <h3>Medical Record Content</h3>
            ${record.content}
          </div>

          <div class="footer">
            <p>This is a confidential medical document generated from DentalCare Pro EMR System</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emr-${record.patientName}-${record.date}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{record.title}</h2>
                <p className="text-gray-600">{record.patientName}</p>
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
          {/* Record Information */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-medium text-gray-900">{record.patientName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Last Activity</p>
                  <p className="font-medium text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Stethoscope className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="font-medium text-gray-900">{record.timeline?.length || 1}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Medical History Timeline</h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {record.timeline ? (
                record.timeline.map((item: any, idx: number) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <time className="font-mono text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{new Date(item.date).toLocaleDateString()}</time>
                      </div>
                      <div className="text-slate-600 text-sm">{item.content}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="font-bold text-slate-900 mb-2">{record.title}</div>
                  <div className="text-slate-600 text-sm whitespace-pre-wrap">{record.content}</div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {record.attachments && record.attachments.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Attachments ({record.attachments.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {record.attachments.map((attachment: string, index: number) => (
                  <div key={index} className="relative group">
                    <div className="w-full h-32 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-200">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">{attachment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}