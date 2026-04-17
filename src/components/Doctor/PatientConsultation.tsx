import React, { useState } from 'react';
import { X, Save, User, Clock, Stethoscope, FileText, Camera, Pill, Plus, Trash2, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
const downloadConsultationPDF = async () => {
  const pdfContainer = document.createElement('div');
  pdfContainer.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 794px; background: white; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const filledPrescriptions = consultationData.prescriptions.filter(p => p.medicine.trim() !== '');

  pdfContainer.innerHTML = `
    <div style="width:794px; background:#fff; margin:0; padding:0;">

      <!-- Simple Header -->
      <div style="padding: 32px 40px 24px; border-bottom: 2px solid #e5e7eb;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:22px; font-weight:700; color:#111827; letter-spacing:-0.3px;">DentalCare Pro</div>
            <div style="font-size:11px; color:#6b7280; margin-top:4px;">Patient Consultation Report</div>
          </div>
          <div style="text-align:right; font-size:11px; color:#6b7280; line-height:1.6;">
            <div>${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</div>
            <div>${new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</div>
            <div>Dr. Sharma</div>
          </div>
        </div>
      </div>

      <!-- Patient Info -->
      <div style="padding: 20px 40px; background:#f9fafb; border-bottom: 1px solid #e5e7eb;">
        <div style="display:flex; gap:40px; flex-wrap:wrap;">
          <div>
            <div style="font-size:9px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Patient Name</div>
            <div style="font-size:15px; font-weight:600; color:#111827; margin-top:3px;">${patient.patientName}</div>
          </div>
          <div>
            <div style="font-size:9px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Treatment Type</div>
            <div style="font-size:15px; font-weight:500; color:#374151; margin-top:3px;">${patient.treatmentType}</div>
          </div>
          <div>
            <div style="font-size:9px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Patient Concern</div>
            <div style="font-size:14px; font-weight:400; color:#4b5563; margin-top:3px;">${patient.patientConcern}</div>
          </div>
        </div>
      </div>

      <!-- Medical Alerts -->
      ${patient.patientHistory && (patient.patientHistory.allergies.length > 0 || patient.patientHistory.medicalHistory.length > 0) ? `
      <div style="margin: 20px 40px 0; background:#fef2f2; border-left: 3px solid #dc2626; padding: 12px 16px;">
        <div style="font-size:10px; font-weight:700; color:#991b1b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Medical Alerts</div>
        ${patient.patientHistory.allergies.length > 0 ? `<div style="font-size:11px; color:#7f1d1d;"><strong>Allergies:</strong> ${patient.patientHistory.allergies.join(', ')}</div>` : ''}
        ${patient.patientHistory.medicalHistory.length > 0 ? `<div style="font-size:11px; color:#7f1d1d; margin-top:4px;"><strong>History:</strong> ${patient.patientHistory.medicalHistory.join(', ')}</div>` : ''}
      </div>
      ` : ''}

      <!-- Main Content -->
      <div style="padding: 24px 40px 40px;">

        <!-- Observations & Diagnosis -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px;">
          <div>
            <div style="font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Clinical Observations</div>
            <div style="font-size:12px; color:#4b5563; line-height:1.6; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
              ${consultationData.observations || '<span style="color:#9ca3af;">—</span>'}
            </div>
          </div>
          <div>
            <div style="font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Diagnosis</div>
            <div style="font-size:12px; color:#4b5563; line-height:1.6; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
              ${consultationData.diagnosis || '<span style="color:#9ca3af;">—</span>'}
            </div>
          </div>
        </div>

        <!-- Treatment Plan -->
        <div style="margin-bottom:24px;">
          <div style="font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Treatment Plan</div>
          <div style="font-size:12px; color:#4b5563; line-height:1.6; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
            ${consultationData.treatmentPlan || '<span style="color:#9ca3af;">—</span>'}
          </div>
        </div>

        <!-- Prescriptions -->
        ${filledPrescriptions.length > 0 ? `
        <div style="margin-bottom:24px;">
          <div style="font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Prescriptions</div>
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="background:#f3f4f6; border-bottom:1px solid #e5e7eb;">
                <th style="padding:8px 10px; text-align:left; font-weight:600; color:#374151;">#</th>
                <th style="padding:8px 10px; text-align:left; font-weight:600; color:#374151;">Medicine</th>
                <th style="padding:8px 10px; text-align:left; font-weight:600; color:#374151;">Dosage</th>
                <th style="padding:8px 10px; text-align:left; font-weight:600; color:#374151;">Frequency</th>
                <th style="padding:8px 10px; text-align:left; font-weight:600; color:#374151;">Duration</th>
                <th style="padding:8px 10px; text-align:left; font-weight:600; color:#374151;">Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${filledPrescriptions.map((p, i) => `
                <tr style="border-bottom:1px solid #f3f4f6;">
                  <td style="padding:8px 10px; color:#6b7280;">${i + 1}</td>
                  <td style="padding:8px 10px; color:#111827; font-weight:500;">${p.medicine || '-'}</td>
                  <td style="padding:8px 10px; color:#4b5563;">${p.dosage || '-'}</td>
                  <td style="padding:8px 10px; color:#4b5563;">${p.frequency || '-'}</td>
                  <td style="padding:8px 10px; color:#4b5563;">${p.duration || '-'}</td>
                  <td style="padding:8px 10px; color:#6b7280;">${p.instructions || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Recommendations & Cost -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px;">
          <div>
            <div style="font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Recommendations</div>
            <div style="font-size:12px; color:#4b5563; line-height:1.6; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
              ${consultationData.recommendations || '<span style="color:#9ca3af;">—</span>'}
            </div>
          </div>
          <div>
            <div style="font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Treatment Cost</div>
            <div style="font-size:20px; font-weight:700; color:#111827; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
              ₹${consultationData.treatmentCost || 0}
            </div>
          </div>
        </div>

        <!-- Follow-up -->
        <div style="margin-bottom:24px;">
          <div style="font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Follow-up</div>
          <div style="font-size:12px; color:#4b5563; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
            ${consultationData.followUpRequired 
              ? (consultationData.followUpDate 
                  ? new Date(consultationData.followUpDate).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })
                  : 'To be scheduled')
              : 'Not required'}
          </div>
        </div>

        <!-- Treatment Planning -->
        ${consultationData.requiresTreatment ? `
        <div style="margin-bottom:24px;">
          <div style="font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Treatment Planning</div>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
            <div>
              <div style="font-size:9px; color:#6b7280; text-transform:uppercase; margin-bottom:4px;">Procedure</div>
              <div style="font-size:13px; font-weight:500; color:#111827;">${consultationData.treatmentProcedure || '—'}</div>
            </div>
            <div>
              <div style="font-size:9px; color:#6b7280; text-transform:uppercase; margin-bottom:4px;">Tooth / Area</div>
              <div style="font-size:13px; font-weight:500; color:#111827;">${consultationData.treatmentTooth || '—'}</div>
            </div>
            <div>
              <div style="font-size:9px; color:#6b7280; text-transform:uppercase; margin-bottom:4px;">Sessions</div>
              <div style="font-size:13px; font-weight:500; color:#111827;">${consultationData.treatmentSessions || 1}</div>
            </div>
          </div>
          ${consultationData.startTreatmentToday ? `
          <div style="margin-top:8px; font-size:11px; color:#059669;">✓ Treatment starting today</div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Additional Notes -->
        ${consultationData.consultationNotes ? `
        <div style="margin-bottom:24px;">
          <div style="font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Additional Notes</div>
          <div style="font-size:12px; color:#4b5563; line-height:1.6; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
            ${consultationData.consultationNotes}
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="margin-top:32px; padding-top:20px; border-top:1px solid #e5e7eb;">
          <div style="display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
              <div style="font-size:9px; color:#9ca3af;">Generated by DentalCare Pro</div>
              <div style="font-size:9px; color:#9ca3af; margin-top:2px;">${new Date().toLocaleString('en-IN')}</div>
            </div>
            <div style="text-align:center;">
              <div style="width:140px; border-top:1px solid #d1d5db; padding-top:6px;">
                <div style="font-size:11px; font-weight:600; color:#111827;">Dr. Signature</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(pdfContainer);

  try {
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${patient.patientName}_consultation_${new Date().toISOString().split('T')[0]}.pdf`);
  } finally {
    document.body.removeChild(pdfContainer);
  }
};
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
    await downloadConsultationPDF();
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
      <div 
       id="consultation-form"
      className="bg-white rounded-2xl max-w-5xl w-full max-h-screen overflow-y-auto shadow-2xl">
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
