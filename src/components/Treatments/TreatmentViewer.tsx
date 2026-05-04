import React from 'react';
import { X, Download, Stethoscope, User, Calendar, FileText, Camera, Pill, IndianRupee, Clock } from 'lucide-react';

interface TreatmentViewerProps {
  treatment: any;
  onClose: () => void;
  onEditTreatment: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onStartTreatment: (id: string) => void;
}

export function TreatmentViewer({ treatment, onClose, onEditTreatment, onMarkCompleted, onStartTreatment }: TreatmentViewerProps) {
  if (!treatment) return null;

  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>Treatment Plan - ${treatment.patientName}</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 4px solid #3b82f6; padding-bottom: 20px; }
            .section { background: #f8fafc; padding: 25px; border-radius: 16px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            h1, h2, h3 { color: #0f172a; margin-top: 0; }
            .prescription-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .med-card { background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TREATMENT PLAN & PROGRESS</h1>
            <p style="font-weight: bold; color: #3b82f6;">DentalCare Pro - Advanced Dental Solutions</p>
          </div>
          
          <div class="section">
            <h3>Patient Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <p><strong>Patient:</strong> ${treatment.patientName}</p>
              <p><strong>Procedure:</strong> ${treatment.procedure}</p>
              <p><strong>Tooth:</strong> ${treatment.tooth}</p>
              <p><strong>Doctor:</strong> ${treatment.doctorName}</p>
              <p><strong>Date:</strong> ${new Date(treatment.date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${treatment.status.toUpperCase()}</p>
            </div>
          </div>

          <div class="section">
            <h3>Clinical Notes</h3>
            <p style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">${treatment.notes || 'No notes available.'}</p>
          </div>

          <div class="section">
            <h3>Prescribed Medications</h3>
            <div class="prescription-grid">
              ${(treatment.prescriptions || []).map((p: any) => `
                <div class="med-card">
                  <p><strong>${p.medicine}</strong></p>
                  <p style="font-size: 13px; margin: 5px 0;">Dosage: ${p.dosage} | Timing: ${p.timing}</p>
                  <p style="font-size: 13px; margin: 5px 0;">Freq: ${p.frequency} | Dur: ${p.duration}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="footer">
            <p>Confidential medical document. Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-plan-${treatment.patientName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sm = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-100',
    planned: 'bg-amber-50 text-amber-700 border-amber-100',
  }[treatment.status as 'completed' | 'in-progress' | 'planned'] || 'bg-gray-50 text-gray-700 border-gray-100';

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-5xl w-full">
        <div className="modal-header bg-gradient-to-r from-blue-50 to-indigo-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-blue-100">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="modal-title text-xl">{treatment.procedure}</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{treatment.patientName} • {treatment.tooth}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownload} className="btn-secondary py-2 px-4 shadow-sm">
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="modal-body p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 shadow-sm relative overflow-hidden group">
              <User className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-100/50 group-hover:scale-110 transition-transform" />
              <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Patient Overview</h3>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-500">Name</span><span className="text-sm font-bold text-gray-900">{treatment.patientName}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-500">Tooth</span><span className="text-sm font-bold text-gray-900">{treatment.tooth}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-500">Doctor</span><span className="text-sm font-bold text-gray-900">{treatment.doctorName}</span></div>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden group">
              <Calendar className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100/50 group-hover:scale-110 transition-transform" />
              <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">Timeline & Status</h3>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-500">Started</span><span className="text-sm font-bold text-gray-900">{new Date(treatment.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-500">Next Visit</span><span className="text-sm font-bold text-gray-900">{treatment.nextAppointment ? new Date(treatment.nextAppointment).toLocaleDateString('en-IN', {day:'2-digit', month:'short'}) : '—'}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">Current</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border tracking-widest ${sm}`}>{treatment.status.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden group">
              <IndianRupee className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-100/50 group-hover:scale-110 transition-transform" />
              <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">Financial Overview</h3>
              <div className="space-y-1 relative z-10">
                <p className="text-3xl font-bold text-indigo-900">₹{treatment.cost.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Projected Total Fee</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Clinical Notes & Progression
            </h3>
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 italic text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {treatment.notes || 'No detailed clinical notes provided for this treatment plan.'}
            </div>
          </div>

          {treatment.prescriptions?.length > 0 && (
            <div className="bg-emerald-50/30 rounded-3xl p-8 border border-emerald-100/50">
              <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                Prescribed Medications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treatment.prescriptions.map((p: any) => (
                  <div key={p.id} className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-emerald-900 tracking-tight">{p.medicine}</h4>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-100">{p.dosage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-xs font-bold text-gray-500">
                      <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-emerald-400" /> {p.timing}</div>
                      <div className="flex items-center gap-2"><Calendar className="w-3 h-3 text-emerald-400" /> {p.duration}</div>
                      <div className="flex items-center gap-2"><FileText className="w-3 h-3 text-emerald-400" /> {p.frequency}</div>
                      <div className="flex items-center gap-2"><Pill className="w-3 h-3 text-emerald-400" /> {p.qty} Units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {treatment.images?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2 px-2">
                <Camera className="w-5 h-5 text-blue-500" />
                Diagnostic Images & Scans
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {treatment.images.map((img: string, i: number) => (
                  <div key={i} className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-gray-100" onClick={() => window.open(img, '_blank')}>
                    <img src={img} alt="Diagnostic" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                      <Download className="text-white w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-footer sticky bottom-0 bg-white/80 backdrop-blur-md -mx-8 -mb-8 mt-8 rounded-b-2xl border-t border-gray-100">
            {treatment.status === 'planned' && (
              <button onClick={() => { onStartTreatment(treatment.id); onClose(); }} className="btn-primary py-3 px-8 shadow-lg shadow-emerald-100 bg-emerald-600 hover:bg-emerald-700 font-semibold">
                Start Treatment Now
              </button>
            )}
            {treatment.status === 'in-progress' && (
              <button onClick={() => { onMarkCompleted(treatment.id); onClose(); }} className="btn-primary py-3 px-8 shadow-lg shadow-blue-100 font-semibold">
                Mark as Successfully Completed
              </button>
            )}
            <button onClick={() => { onEditTreatment(treatment.id); onClose(); }} className="btn-secondary py-3 px-8 font-semibold">
              Edit Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}