import React, { useState } from 'react';
import { X, Save, User, FileText, Shield, PenTool } from 'lucide-react';

interface ConsentFormProps {
  onClose: () => void;
  onSave: (form: any) => void;
  form?: any;
}

export function ConsentForm({ onClose, onSave, form }: ConsentFormProps) {
  const [formData, setFormData] = useState({
    patientName: form?.patientName || '',
    treatmentType: form?.treatmentType || '',
    content: form?.content || '',
    riskDisclosure: form?.riskDisclosure || '',
    alternativeTreatments: form?.alternativeTreatments || '',
    postTreatmentCare: form?.postTreatmentCare || '',
    patientSignature: form?.patientSignature || '',
    witnessSignature: form?.witnessSignature || '',
    date: form?.date || new Date().toISOString().split('T')[0],
  });

  const patients = [
    'Rajesh Kumar',
    'Priya Sharma', 
    'Amit Singh',
    'Neha Gupta',
    'Suresh Patel'
  ];

  const treatmentTypes = [
    'Root Canal Treatment',
    'Tooth Extraction',
    'Crown Placement',
    'Dental Implant',
    'Orthodontic Treatment',
    'Oral Surgery',
    'Periodontal Treatment',
    'Cosmetic Dentistry'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: form?.id || Date.now().toString(),
      patientId: Date.now().toString(),
      signature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCI+PHBhdGggZD0iTTEwIDUwIEwxOTAgNTAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg=='
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {form ? 'Edit Consent Form' : 'Create Digital Consent Form'}
              </h2>
              <p className="text-gray-600 mt-1">Generate legally compliant consent forms with digital signatures</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Basic Info Display */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700">Patient Name</p>
                <p className="font-semibold text-blue-900">{formData.patientName || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Treatment Type</p>
                <p className="font-semibold text-blue-900">{formData.treatmentType || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Date</p>
                <p className="font-semibold text-blue-900">{new Date(formData.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Patient Name *
              </label>
              <select
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient} value={patient}>{patient}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Treatment Type *
              </label>
              <select
                name="treatmentType"
                value={formData.treatmentType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Treatment</option>
                {treatmentTypes.map(treatment => (
                  <option key={treatment} value={treatment}>{treatment}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Treatment-Specific Consent Information
            </label>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
              <textarea
                name="content"
                value={formData.content || (formData.treatmentType ? 
                  `I understand the nature of ${formData.treatmentType} and consent to the procedure. The doctor has explained the treatment process, potential risks, benefits, and alternative treatments. I acknowledge that no guarantee has been made regarding the outcome of the treatment.` :
                  '')}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Consent information will be automatically generated based on the selected treatment type..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Risk Disclosure
            </label>
            <textarea
              name="riskDisclosure"
              value={formData.riskDisclosure}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Explain potential risks and complications..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alternative Treatments
            </label>
            <textarea
              name="alternativeTreatments"
              value={formData.alternativeTreatments}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Describe alternative treatment options..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post-Treatment Care Instructions
            </label>
            <textarea
              name="postTreatmentCare"
              value={formData.postTreatmentCare}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Provide post-treatment care instructions..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <PenTool className="w-4 h-4 inline mr-2" />
                Patient Signature Area
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                <PenTool className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Digital signature will be captured here</p>
                <p className="text-xs text-gray-400 mt-1">Patient will sign using touch/mouse</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Witness Signature (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                <PenTool className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Witness signature area</p>
                <p className="text-xs text-gray-400 mt-1">Staff member can witness</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Legal Disclaimer</h4>
            <p className="text-sm text-blue-800">
              By signing this form, the patient acknowledges that they have read, understood, and agree to the treatment plan, 
              risks, and post-treatment care instructions. This digital consent form is legally binding and complies with 
              healthcare regulations.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Consent Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}