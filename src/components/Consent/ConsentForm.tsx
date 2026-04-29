import React, { useState, useEffect } from 'react';
import { X, Save, User, FileText, Shield, PenTool, AlertCircle, RotateCcw, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Patient } from '../../types';
import { SignaturePad } from './SignaturePad';

interface ConsentFormProps {
  onClose: () => void;
  onSave: (form: any) => void;
  form?: any;
  patients: Patient[];
  doctors: any[];
}

const CONSENT_TEMPLATES = {
// ... existing templates ...
  'General Dentistry': {
    content: "I hereby authorize Dr. Rajesh Sharma and associates to perform dental examinations, radiographs, and basic treatments (cleaning, fillings, fluoride). I understand that dental treatment involves risks and I have been informed of the nature and purpose of these procedures.",
    risks: "Sensitivity to hot/cold, gum irritation, local anesthesia reactions, minor bleeding.",
    alternatives: "No treatment, which may lead to further decay or tooth loss.",
    care: "Regular brushing and flossing. Follow specific instructions for fillings or cleanings."
  },
  'Tooth Extraction / Oral Surgery': {
    content: "I consent to the extraction of the specified tooth/teeth. I understand that oral surgery involves risk of damage to adjacent teeth, bone, or nerves. I authorize the use of local anesthesia and/or sedation as deemed necessary.",
    risks: "Severe bleeding, dry socket, infection, temporary or permanent numbness of lip/tongue, jaw fracture, sinus involvement.",
    alternatives: "Root canal treatment (if applicable), periodontal therapy, or leaving the tooth (risk of pain/infection spread).",
    care: "Do not spit, smoke, or use a straw for 24 hours. Bite on gauze for 45 mins. Soft diet for 3 days."
  },
  'Root Canal Treatment (Endodontics)': {
    content: "I authorize root canal treatment on the specified tooth. I understand that this procedure is an attempt to save a tooth that might otherwise require extraction. Success cannot be guaranteed 100% due to complex canal anatomy.",
    risks: "Post-op pain/swelling, instrument breakage in canal, root perforation, need for additional surgery (Apicoectomy).",
    alternatives: "Extraction followed by bridge or implant, or no treatment (leading to abscess/severe pain).",
    care: "Avoid hard foods until permanent restoration (crown) is placed. Complete full course of prescribed antibiotics."
  },
  'Dental Implants': {
    content: "I consent to the surgical placement of dental implants. I understand this is a multi-stage process involving surgery into the jawbone. I confirm I have disclosed all medical conditions including bone disorders and smoking habits.",
    risks: "Implant failure, nerve damage, sinus perforation, infection, bone loss around implant.",
    alternatives: "Partial dentures, fixed bridges, or no treatment.",
    care: "Meticulous oral hygiene is mandatory. Regular professional cleaning every 4-6 months."
  },
  'Orthodontic Braces / Clear Aligners': {
    content: "I authorize orthodontic treatment to correct dental irregularities. I understand that successful results depend on my cooperation in wearing appliances and attending regular appointments.",
    risks: "Root resorption, decalcification (white spots), relapse after treatment, gum recession.",
    alternatives: "Accepting current dental position, or cosmetic veneers/crowns.",
    care: "Clean around brackets carefully. Wear retainers as directed after active treatment."
  }
};

export function ConsentForm({ onClose, onSave, form, patients, doctors }: ConsentFormProps) {
  const [activeTab, setActiveTab] = useState<'patient' | 'terms' | 'sign'>('patient');
  const [formData, setFormData] = useState({
    patientId: form?.patientId || '',
    patientName: form?.patientName || '',
    treatmentType: form?.treatmentType || '',
    content: form?.content || '',
    riskDisclosure: form?.riskDisclosure || '',
    alternativeTreatments: form?.alternativeTreatments || '',
    postTreatmentCare: form?.postTreatmentCare || '',
    patientSignature: form?.patientSignature || '',
    witnessName: form?.witnessName || '',
    witnessSignature: form?.witnessSignature || '',
    doctorName: form?.doctorName || '',
    date: form?.date || new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!form && formData.treatmentType && CONSENT_TEMPLATES[formData.treatmentType as keyof typeof CONSENT_TEMPLATES]) {
      const template = CONSENT_TEMPLATES[formData.treatmentType as keyof typeof CONSENT_TEMPLATES];
      setFormData(prev => ({
        ...prev,
        content: template.content,
        riskDisclosure: template.risks,
        alternativeTreatments: template.alternatives,
        postTreatmentCare: template.care
      }));
    }
  }, [formData.treatmentType, form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.treatmentType || !formData.patientSignature || !formData.doctorName) {
      alert("Required fields: Patient, Doctor, Procedure, and Signature.");
      return;
    }
    
    onSave({
      ...formData,
      id: form?.id || `CONSENT-${Date.now()}`,
      status: 'signed',
      signature: formData.patientSignature
    });
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPatient = patients.find(p => p.id === e.target.value);
    if (selectedPatient) {
      setFormData({ ...formData, patientId: selectedPatient.id, patientName: selectedPatient.name });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-[#f8fafc] rounded-[2.5rem] max-w-5xl w-full my-auto shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-white/20">
        
        {/* Header Section */}
        <div className="bg-white p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 rotate-3 group-hover:rotate-0 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {form ? 'Verify Consent' : 'Patient Authorization'}
              </h2>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mt-1">Medical Legal Document</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-8 flex gap-8 border-b border-gray-100">
          {[
            { id: 'patient', label: 'Patient Info', icon: User },
            { id: 'terms', label: 'Legal Terms', icon: BookOpen },
            { id: 'sign', label: 'Authorization', icon: PenTool }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 flex items-center gap-2 border-b-2 transition-all font-bold text-sm ${
                activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar max-h-[65vh]">
          
          {activeTab === 'patient' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Select Patient</label>
                  <div className="relative group">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <select
                      value={formData.patientId}
                      onChange={handlePatientChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-[1.25rem] focus:border-blue-500 outline-none transition-all font-semibold text-gray-800 shadow-sm"
                    >
                      <option value="">Choose from records...</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Attending Doctor *</label>
                  <div className="relative group">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <select
                      value={formData.doctorName}
                      onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-[1.25rem] focus:border-blue-500 outline-none transition-all font-semibold text-gray-800 shadow-sm"
                    >
                      <option value="">Select a doctor...</option>
                      {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Procedure Type</label>
                  <div className="relative group">
                    <FileText className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <select
                      value={formData.treatmentType}
                      onChange={(e) => setFormData({...formData, treatmentType: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-[1.25rem] focus:border-blue-500 outline-none transition-all font-semibold text-gray-800 shadow-sm"
                    >
                      <option value="">Select a template...</option>
                      {Object.keys(CONSENT_TEMPLATES).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-900 font-medium leading-relaxed">
                  Selecting a Procedure Type will automatically load the standard legal terminology and risk disclosures. You can customize these in the next step.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Consent Declaration & Understanding</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={4}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.25rem] focus:border-blue-500 outline-none transition-all font-medium text-gray-700 leading-relaxed shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Risks & Potential Complications</label>
                  <textarea
                    value={formData.riskDisclosure}
                    onChange={(e) => setFormData({...formData, riskDisclosure: e.target.value})}
                    rows={4}
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.25rem] focus:border-red-400 outline-none transition-all font-medium text-gray-700 leading-relaxed shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Alternatives to Proposed Treatment</label>
                  <textarea
                    value={formData.alternativeTreatments}
                    onChange={(e) => setFormData({...formData, alternativeTreatments: e.target.value})}
                    rows={4}
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.25rem] focus:border-green-400 outline-none transition-all font-medium text-gray-700 leading-relaxed shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Post-Operative Care Instructions</label>
                <textarea
                  value={formData.postTreatmentCare}
                  onChange={(e) => setFormData({...formData, postTreatmentCare: e.target.value})}
                  rows={2}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.25rem] focus:border-amber-400 outline-none transition-all font-medium text-gray-700 leading-relaxed shadow-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'sign' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Patient Signature</label>
                    {formData.patientSignature && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">SIGNED</span>}
                  </div>
                  <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-4 shadow-inner">
                    <SignaturePad 
                      onSave={(sig) => setFormData({...formData, patientSignature: sig})}
                      defaultValue={formData.patientSignature}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Witness / Guardian (Optional)</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.witnessName}
                    onChange={(e) => setFormData({...formData, witnessName: e.target.value})}
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.25rem] focus:border-blue-500 outline-none transition-all font-semibold mb-4"
                  />
                  <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-4 shadow-inner">
                    <SignaturePad 
                      onSave={(sig) => setFormData({...formData, witnessSignature: sig})}
                      defaultValue={formData.witnessSignature}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex items-center gap-6 shadow-xl">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Legal Attestation</h4>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                    By signing this electronic document, I acknowledge that I have been informed of the procedure, risks, and alternatives. I understand this constitutes a legally binding medical authorization.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signed On</span>
               <span className="text-sm font-bold text-gray-700">{new Date(formData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric'})}</span>
             </div>
             <div className="w-px h-8 bg-gray-100" />
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</span>
               <span className="text-sm font-bold text-gray-700">{formData.doctorName}</span>
             </div>
          </div>
          
          <div className="flex gap-4">
            {activeTab !== 'patient' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'sign' ? 'terms' : 'patient')}
                className="px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
              >
                Previous
              </button>
            )}
            
            {activeTab !== 'sign' ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'patient' ? 'terms' : 'sign')}
                className="px-10 py-4 bg-gray-900 text-white rounded-[1.25rem] font-bold hover:bg-gray-800 shadow-xl transition-all flex items-center gap-2 group"
              >
                Next Step
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-10 py-4 bg-blue-600 text-white rounded-[1.25rem] font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center gap-3 animate-pulse-subtle"
              >
                <Save className="w-5 h-5" />
                Finish & Generate Form
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}