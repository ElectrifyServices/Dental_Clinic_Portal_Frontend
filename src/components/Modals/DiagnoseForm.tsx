import React from 'react';
import { X } from 'lucide-react';

interface DiagnoseFormProps {
  patient: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const DiagnoseForm: React.FC<DiagnoseFormProps> = ({ patient, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-card rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white">
        <div className="p-8 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-xl font-bold text-foreground">Clinical Diagnosis Form</h2>
            <p className="text-sm text-muted-foreground">{patient.patientName} · {patient.treatmentType}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20">
             <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Current Complaint</h4>
             <p className="text-sm text-blue-900 font-medium">{patient.patientConcern}</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSubmit({}); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                 <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 block">Consultation Notes</label>
                 <textarea rows={3} className="w-full px-4 py-3 rounded-2xl bg-muted border-border focus:bg-card focus:ring-4 focus:ring-primary transition-all outline-none" placeholder="Enter session findings..." />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 block">Proposed Cost (₹)</label>
                 <input type="number" className="w-full px-4 py-3 rounded-2xl bg-muted border-border focus:bg-card focus:ring-4 focus:ring-primary transition-all outline-none" placeholder="500" />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 block">Follow-up Needed?</label>
                 <select className="w-full px-4 py-3 rounded-2xl bg-muted border-border focus:bg-card focus:ring-4 focus:ring-primary transition-all outline-none">
                   <option>No</option>
                   <option>Yes (Next Week)</option>
                   <option>Yes (Next Month)</option>
                 </select>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
               <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-muted-foreground/60 hover:text-muted-foreground">Cancel</button>
               <button type="submit" className="px-10 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-primary transition-all">Save & Finalize</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
