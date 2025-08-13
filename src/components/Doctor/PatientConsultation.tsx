import React, { useState } from 'react';
import { X, Save, User, Clock, Stethoscope, FileText, Camera, Pill, Plus, Trash2, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';

interface PatientConsultationProps {
  patient: {
    id: string;
    patientName: string;
    treatmentType: string;
    patientConcern: string;
    patientHistory?: {
      medicalHistory: string[];
      allergies: string[];
    };
  };
  onClose: () => void;
  onCompleteConsultation: (consultationData: any) => void;
  onCreateTreatment?: (treatmentData: any) => void;
}

export function PatientConsultation({ patient, onClose, onCompleteConsultation, onCreateTreatment }: PatientConsultationProps) {
  const [consultationData, setConsultationData] = useState({
    diagnosis: '',
    treatmentPlan: '',
    observations: '',
    recommendations: '',
    followUpRequired: false,
    followUpDate: '',
    prescriptions: [
      { id: '1', medicine: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ],
    images: [] as string[],
    nextAppointment: '',
    consultationNotes: '',
    treatmentCost: 0,
    requiresTreatment: false,
    treatmentProcedure: '',
    treatmentTooth: '',
    treatmentSessions: 1,
    startTreatmentToday: false
  });

  const [loading, setLoading] = useState(false);

  const addPrescription = () => {
    setConsultationData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, {
        id: Date.now().toString(),
        medicine: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    }));
  };

  const removePrescription = (id: string) => {
    setConsultationData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter(p => p.id !== id)
    }));
  };

  const updatePrescription = (id: string, field: string, value: string) => {
    setConsultationData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setConsultationData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create treatment if required
    if (consultationData.requiresTreatment && onCreateTreatment) {
      const treatmentData = {
        patientName: patient.patientName,
        procedure: consultationData.treatmentProcedure,
        tooth: consultationData.treatmentTooth,
        date: new Date().toISOString().split('T')[0],
        notes: `Treatment recommended during consultation: ${consultationData.treatmentPlan}`,
        cost: consultationData.treatmentCost,
        status: consultationData.startTreatmentToday ? 'in-progress' : 'planned',
        doctorId: '1',
        doctorName: 'Dr. Sharma',
        prescriptions: consultationData.prescriptions.filter(p => p.medicine.trim() !== ''),
        sessions: consultationData.treatmentSessions
      };
      
      onCreateTreatment(treatmentData);
    }
    
    onCompleteConsultation({
      patientId: patient.id,
      ...consultationData,
      consultationDate: new Date().toISOString(),
      doctorId: '1', // Current doctor
      status: 'completed'
    });
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConsultationData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mr-4">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Patient Consultation</h2>
                <p className="text-gray-600">{patient.patientName} - {patient.treatmentType}</p>
              </div>
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
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700 font-medium">Patient Concern:</p>
                <p className="text-blue-800 bg-white p-3 rounded-lg border border-blue-200 mt-1">
                  {patient.patientConcern}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Treatment Type:</p>
                <p className="text-blue-800 bg-white p-3 rounded-lg border border-blue-200 mt-1">
                  {patient.treatmentType}
                </p>
              </div>
            </div>
            
            {/* Medical Alerts */}
            {patient.patientHistory && (patient.patientHistory.allergies.length > 0 || patient.patientHistory.medicalHistory.length > 0) && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">Medical Alerts</span>
                </div>
                {patient.patientHistory.allergies.length > 0 && (
                  <div className="text-xs text-red-700 mb-1">
                    <strong>Allergies:</strong> {patient.patientHistory.allergies.join(', ')}
                  </div>
                )}
                {patient.patientHistory.medicalHistory.length > 0 && (
                  <div className="text-xs text-red-700">
                    <strong>Medical History:</strong> {patient.patientHistory.medicalHistory.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clinical Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Clinical Observations *
              </label>
              <textarea
                name="observations"
                value={consultationData.observations}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Record your clinical observations and examination findings..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Diagnosis *
              </label>
              <textarea
                name="diagnosis"
                value={consultationData.diagnosis}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your diagnosis based on examination..."
              />
            </div>
          </div>

          {/* Treatment Plan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Treatment Plan *
            </label>
            <textarea
              name="treatmentPlan"
              value={consultationData.treatmentPlan}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Outline the recommended treatment plan and procedures..."
            />
          </div>

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Prescriptions
              </h3>
              <button
                type="button"
                onClick={addPrescription}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center text-sm font-medium transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {consultationData.prescriptions.map((prescription, index) => (
                <div key={prescription.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medicine</label>
                    <input
                      type="text"
                      value={prescription.medicine}
                      onChange={(e) => updatePrescription(prescription.id, 'medicine', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Medicine name"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                    <input
                      type="text"
                      value={prescription.dosage}
                      onChange={(e) => updatePrescription(prescription.id, 'dosage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="500mg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <input
                      type="text"
                      value={prescription.frequency}
                      onChange={(e) => updatePrescription(prescription.id, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3 times daily"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={prescription.duration}
                      onChange={(e) => updatePrescription(prescription.id, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5 days"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                    <input
                      type="text"
                      value={prescription.instructions}
                      onChange={(e) => updatePrescription(prescription.id, 'instructions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="After meals"
                    />
                  </div>
                  <div className="col-span-1">
                    {consultationData.prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrescription(prescription.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up and Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recommendations & Instructions
              </label>
              <textarea
                name="recommendations"
                value={consultationData.recommendations}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Post-treatment care instructions and recommendations..."
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Treatment Cost (₹)
                </label>
                <input
                  type="number"
                  name="treatmentCost"
                  value={consultationData.treatmentCost}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter treatment cost"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="followUpRequired"
                  checked={consultationData.followUpRequired}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Follow-up appointment required</span>
              </div>

              {consultationData.followUpRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={consultationData.followUpDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Treatment Planning */}
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Treatment Planning
            </h3>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="requiresTreatment"
                checked={consultationData.requiresTreatment}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm font-medium text-purple-700">Patient requires treatment</span>
            </div>

            {consultationData.requiresTreatment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Treatment Procedure
                  </label>
                  <select
                    name="treatmentProcedure"
                    value={consultationData.treatmentProcedure}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Procedure</option>
                    <option value="Dental Filling">Dental Filling</option>
                    <option value="Root Canal Treatment">Root Canal Treatment</option>
                    <option value="Crown Placement">Crown Placement</option>
                    <option value="Tooth Extraction">Tooth Extraction</option>
                    <option value="Teeth Cleaning">Teeth Cleaning</option>
                    <option value="Orthodontic Treatment">Orthodontic Treatment</option>
                    <option value="Dental Implant">Dental Implant</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Tooth/Area
                  </label>
                  <input
                    type="text"
                    name="treatmentTooth"
                    value={consultationData.treatmentTooth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 16 (Upper Right First Molar)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Estimated Sessions
                  </label>
                  <input
                    type="number"
                    name="treatmentSessions"
                    value={consultationData.treatmentSessions}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="startTreatmentToday"
                    checked={consultationData.startTreatmentToday}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm font-medium text-purple-700">Start treatment today</span>
                </div>
              </div>
            )}
          </div>
          {/* Clinical Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Camera className="w-4 h-4 inline mr-2" />
              Clinical Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Upload clinical photos, X-rays, or other relevant images</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Images
              </label>
            </div>

            {consultationData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {consultationData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Clinical ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = consultationData.images.filter((_, i) => i !== index);
                          setConsultationData(prev => ({ ...prev, images: newImages }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Additional Consultation Notes
            </label>
            <textarea
              name="consultationNotes"
              value={consultationData.consultationNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Any additional notes or observations..."
            />
          </div>

          {/* Action Buttons */}
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
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold flex items-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completing Consultation...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Consultation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
