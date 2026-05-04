import React from 'react';
import { X, Printer, Download, Shield, User, FileText, Calendar, CheckCircle2, MapPin, Phone, Globe } from 'lucide-react';

interface ConsentFormViewerProps {
  form: any;
  onClose: () => void;
}

export function ConsentFormViewer({ form, onClose }: ConsentFormViewerProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white max-w-4xl w-full my-auto shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 print:shadow-none print:w-full print:max-w-none rounded-[2rem] overflow-hidden print:rounded-none">
        
        {/* Actions - Hidden on Print */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Document Preview</h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="p-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 font-bold shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-12 bg-gray-50/30 print:p-0 print:overflow-visible custom-scrollbar">
          <div className="bg-white mx-auto shadow-sm border border-gray-100 p-12 min-h-[1000px] relative print:border-none print:shadow-none print:p-8">
            
            {/* Professional Watermark (Optional) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-35deg]">
              <Shield className="w-96 h-96" />
            </div>

            {/* Clinic Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-8 mb-10">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">DENTAL CLINIC</h1>
                <p className="text-blue-600 font-bold tracking-[0.2em] text-xs mt-1 uppercase">Advanced Oral Care Center</p>
                <div className="mt-6 space-y-1 text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-blue-500" /> 123 Healthcare Tower, Sector 44</div>
                  <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-blue-500" /> +91 98765 43210</div>
                  <div className="flex items-center gap-2"><Globe className="w-3 h-3 text-blue-500" /> www.dentalclinic.com</div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gray-900 text-white px-4 py-2 rounded-lg inline-block font-bold text-xs uppercase tracking-widest mb-4">Official Record</div>
                <div className="text-gray-400 text-xs uppercase font-bold tracking-widest">Document ID</div>
                <div className="text-sm font-bold text-gray-900">{form.id}</div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight underline underline-offset-8 decoration-blue-600/30">INFORMED CONSENT FOR {form.treatmentType}</h2>
              <p className="text-gray-500 mt-4 text-sm max-w-2xl mx-auto leading-relaxed italic">
                "I understand that dentistry is not an exact science and therefore reputable practitioners cannot properly guarantee results. I acknowledge that no guarantee or assurance has been made by anyone regarding the dental treatment I have requested and authorized."
              </p>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-10 bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-100">
              <div>
                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Patient Name</label>
                <div className="text-lg font-bold text-gray-900">{form.patientName}</div>
              </div>
              <div className="text-right">
                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Date of Authorization</label>
                <div className="text-lg font-bold text-gray-900">{new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric'})}</div>
              </div>
            </div>

            {/* Legal Content Sections */}
            <div className="space-y-10 mb-12">
              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">01</span>
                  Procedure Details & Authorization
                </h3>
                <div className="pl-8 text-gray-700 leading-relaxed text-sm whitespace-pre-wrap border-l-2 border-gray-100 ml-3">
                  {form.content}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">02</span>
                  Disclosed Risks & Complications
                </h3>
                <div className="pl-8 text-gray-700 leading-relaxed text-sm whitespace-pre-wrap border-l-2 border-gray-100 ml-3">
                  {form.riskDisclosure}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px]">03</span>
                  Alternative Treatment Options
                </h3>
                <div className="pl-8 text-gray-700 leading-relaxed text-sm whitespace-pre-wrap border-l-2 border-gray-100 ml-3">
                  {form.alternativeTreatments}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px]">04</span>
                  Post-Treatment Care Compliance
                </h3>
                <div className="pl-8 text-gray-700 leading-relaxed text-sm whitespace-pre-wrap border-l-2 border-gray-100 ml-3">
                  {form.postTreatmentCare}
                </div>
              </section>
            </div>

            {/* Final Declarations */}
            <div className="p-6 border-2 border-gray-100 rounded-2xl mb-12 bg-gray-50/50">
              <div className="flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  I have read this form or had it read to me. I have had an opportunity to ask questions and all questions have been answered to my satisfaction. I understand the procedure and its risks and alternatives. I hereby freely give my consent to the proposed treatment.
                </p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-20 pt-10 border-t border-gray-100">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="min-h-[100px] flex items-center justify-center p-4">
                    {form.signature && (
                      <img src={form.signature} alt="Patient Signature" className="max-h-24 object-contain contrast-125" />
                    )}
                  </div>
                  <div className="h-px bg-gray-300 w-full mb-2"></div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient / Guardian Signature</div>
                  <div className="text-xs font-bold text-gray-900 mt-1">{form.patientName}</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="min-h-[100px] flex items-center justify-center p-4">
                    {/* Placeholder for Doctor's Signature/Seal */}
                    <div className="text-blue-100 font-serif italic text-4xl select-none">Clinic Seal</div>
                  </div>
                  <div className="h-px bg-gray-300 w-full mb-2"></div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attending Dentist / Witness</div>
                  <div className="text-xs font-bold text-gray-900 mt-1">{form.doctorName}</div>
                </div>
              </div>
            </div>

            {/* Footer Seal */}
            <div className="mt-20 text-center">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full">
                 <Shield className="w-3 h-3 text-blue-600" />
                 <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Electronically Verified Medical Document • {new Date().getFullYear()}</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}