import React, { useState } from 'react';
import { X, Save, User, Phone, Mail, Calendar, MapPin, Heart, QrCode, Upload, AlertTriangle, CheckCircle, UploadIcon, History, UploadCloud, ClipboardCheck, PenTool, ShieldCheck, Lock } from 'lucide-react';
import { SignaturePad } from '../Consent/SignaturePad';

// Enhanced barcode generation function
const generateBarcode = (patientId: string) => {
  return `*${patientId}*`; // Code 39 format
};

const generatePatientId = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `PAT${timestamp}`;
};

const calculateAge = (dob: string) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

interface PatientFormProps {
  onClose: () => void;
  onSave: (patient: any) => void;
  patient?: any;
  type?: 'normal' | 'person';
  parentId?: string;
  isCheckIn?: boolean;
}

export function PatientForm({ onClose, onSave, patient, type, parentId, isCheckIn }: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState((isCheckIn && patient) ? 4 : 1);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  React.useEffect(() => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        ...patient,
        patientId: patient.id || generatePatientId(),
        medicalHistory: patient.medicalHistory?.join('\n') || '',
        allergies: patient.allergies?.join('\n') || '',
        dentalFiles: patient.dentalFiles || [],
        pastDentalHistory: patient.pastDentalHistory || '',
      }));
      setSelectedMedicalHistory(patient.medicalHistory || []);
      setSelectedAllergies(patient.allergies || []);
      setIsPhoneVerified(!!(patient.id || patient.patientId));
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        emergencyContact: '',
        emergencyName: '',
        emergencyRelation: '',
        customEmergencyRelation: '',
        medicalHistory: '',
        pastDentalHistory: '',
        allergies: '',
        allergyOther: '',
        allergyNotes: '',
        patientId: generatePatientId(),
        barcode: '',
        bloodGroup: '',
        relation: '',
        customRelation: '',
        occupation: '',
        maritalStatus: '',
        insuranceProvider: '',
        insuranceNumber: '',
        referredBy: '',
        avatar: '',
        dentalFiles: [],
        previousDoctorName: '',
        previousClinicName: '',
        previousDoctorPhone: '',
        previousClinicAddress: '',
        previousLastVisitDate: '',
        previousReason: '',
        previousTreatments: [],
        consentCorrectDetails: false,
        consentExamination: false,
        consentRisks: false,
        consentStorage: false,
        consentEmergency: false,
        optWhatsApp: false,
        optPhotos: false,
        patientSignature: '',
        guardianName: '',
        guardianSignature: '',
        category: 'regular',
        defaultDiscount: 0,
      });
      setSelectedMedicalHistory([]);
      setSelectedAllergies([]);
    }
    setStep(1);
    setMedicalSearch('');
    setAllergySearch('');
  }, [patient]);
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || '',
    address: patient?.address || '',
    emergencyContact: patient?.emergencyContact || '',
    emergencyName: patient?.emergencyName || '',
    emergencyRelation: patient?.emergencyRelation || '',
    medicalHistory: patient?.medicalHistory?.join('\n') || '',
    pastDentalHistory: patient?.pastDentalHistory || '',
    allergies: patient?.allergies?.join('\n') || '',
    allergyOther: patient?.allergyOther || '',
    allergyNotes: patient?.allergyNotes || '',
    patientId: patient?.id || generatePatientId(),
    barcode: patient?.barcode || '',
    bloodGroup: patient?.bloodGroup || '',
    relation: '',
    customRelation: '',
    occupation: patient?.occupation || '',
    maritalStatus: patient?.maritalStatus || '',
    insuranceProvider: patient?.insuranceProvider || '',
    insuranceNumber: patient?.insuranceNumber || '',
    referredBy: patient?.referredBy || '',
    avatar: patient?.avatar || '',
    dentalFiles: patient?.dentalFiles || [],
    previousDoctorName: patient?.previousDoctorName || '',
    previousClinicName: patient?.previousClinicName || '',
    previousDoctorPhone: patient?.previousDoctorPhone || '',
    previousClinicAddress: patient?.previousClinicAddress || '',
    previousLastVisitDate: patient?.previousLastVisitDate || '',
    previousReason: patient?.previousReason || '',
    previousTreatments: patient?.previousTreatments || [],
    consentCorrectDetails: patient?.consentCorrectDetails || false,
    consentExamination: patient?.consentExamination || false,
    consentRisks: patient?.consentRisks || false,
    consentStorage: patient?.consentStorage || false,
    consentEmergency: patient?.consentEmergency || false,
    optWhatsApp: patient?.optWhatsApp || false,
    optPhotos: patient?.optPhotos || false,
    patientSignature: patient?.patientSignature || '',
    guardianName: patient?.guardianName || '',
    guardianSignature: patient?.guardianSignature || '',
    customEmergencyRelation: '',
    category: patient?.category || 'regular',
    defaultDiscount: patient?.defaultDiscount || 0,
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const medicalConditions = [
    'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Heart Disease', 'Asthma',
    'Arthritis', 'Osteoporosis', 'Thyroid Disorder', 'Kidney Disease', 'Liver Disease',
    'Cancer History', 'Blood Disorder', 'Epilepsy', 'Depression', 'Anxiety',
    'High Cholesterol', 'Stroke History', 'Allergic Rhinitis', 'COPD', 'Other'
  ];

  const commonAllergies = [
    'Penicillin', 'Latex', 'Iodine', 'Aspirin', 'Codeine', 'Local Anesthetics',
    'Sulfa Drugs', 'Tetracycline', 'Erythromycin', 'Nickel', 'Adhesive Tape',
    'Food Allergies', 'Seasonal Allergies', 'Other'
  ];

  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<string[]>(
    patient?.medicalHistory || []
  );

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    patient?.allergies || []
  );
  const [medicalSearch, setMedicalSearch] = useState('');
  const [allergySearch, setAllergySearch] = useState('');
  const [showOtherTreatment, setShowOtherTreatment] = useState(false);

  React.useEffect(() => {
    if (!formData.barcode) {
      const barcode = generateBarcode(formData.patientId);
      setFormData(prev => ({ ...prev, barcode }));
    }
  }, [formData.patientId, formData.barcode]);

  const validateStep = (stepNumber: number) => {
    const errors: {[key: string]: string} = {};
    
    if (stepNumber === 1) {
      if (!formData.name.trim()) errors.name = 'Name is required';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!isPhoneVerified) errors.phone = 'Please verify your phone number first';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (stepNumber === 3) {
      if (!formData.consentCorrectDetails || !formData.consentExamination || !formData.consentRisks || !formData.consentStorage || !formData.consentEmergency) {
        errors.consent = 'All mandatory consents must be accepted';
      }
      const age = calculateAge(formData.dateOfBirth);
      if (age > 0 && age < 18) {
        if (!formData.guardianName.trim()) errors.guardianName = 'Guardian name is required';
        if (!formData.guardianSignature) errors.guardianSignature = 'Guardian signature is required';
      } else {
        if (!formData.patientSignature) {
          errors.patientSignature = 'Patient signature is required';
        }
      }
    }
    
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(step);
    setValidationErrors(errors);
    if (Object.keys(errors).length === 0) {
      setStep(step + 1);
    }
  };
const applyCustomRelation = () => {
  if (formData.customRelation.trim()) {
    setFormData(prev => ({
      ...prev,
      relation: prev.customRelation, 
      customRelation: ''
    }));
  }
};
const handleCustomRelation = (value: string) => {
  setFormData(prev => ({
    ...prev,
    customRelation: value
  }));
};
  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 4) return;
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSave({
      ...formData,
      id: formData.patientId,
      medicalHistory: formData.medicalHistory.split('\n').filter(item => item.trim()),
      pastDentalHistory: formData.pastDentalHistory,
      allergies: formData.allergies.split('\n').filter(item => item.trim()),
      allergyOther: formData.allergyOther,
      allergyNotes: formData.allergyNotes,
      emergencyName: formData.emergencyName,
      createdAt: patient?.createdAt || new Date().toISOString(),
      lastVisit: patient?.lastVisit || null,
      totalVisits: patient?.totalVisits || 0,
      outstandingBalance: patient?.outstandingBalance || 0,
      status: patient?.status || 'new',
      parentId: patient?.parentId || parentId || null,
      relation: formData.relation === 'Other'
  ? formData.customRelation
  : formData.relation,
    });
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset verification if phone changes
    if (name === 'phone') {
      setIsPhoneVerified(false);
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
const handleDentalFilesUpload = (e) => {
  const files = Array.from(e.target.files || []);

  const mappedFiles = files.map(file => ({
    name: file.name,
    url: URL.createObjectURL(file),
    type: file.type
  }));

  setFormData(prev => ({
    ...prev,
    dentalFiles: [...(prev.dentalFiles || []), ...mappedFiles]
  }));
};

  const printBarcode = () => {
    const printContent = `
      <html>
        <head>
          <title>Patient Barcode - ${formData.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              text-align: center;
              background: white;
            }
            .barcode-card {
              border: 2px solid #2563eb;
              border-radius: 12px;
              padding: 20px;
              margin: 20px auto;
              width: 380px;
              max-height: 90vh;
overflow: auto;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            }
            .clinic-header {
              color: #1e40af;
              margin-bottom: 15px;
            }
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              background: white;
              padding: 10px;
              border: 1px solid #ddd;
              margin: 15px 0;
              border-radius: 6px;
            }
            .patient-info {
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin-top: 15px;
              text-align: left;
            }
            .patient-info h3 {
              margin: 0 0 10px 0;
              color: #1e40af;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="barcode-card">
            <div class="clinic-header">
              <h1>🦷 DentalCare Pro</h1>
              <p>Dr. Sharma's Dental Clinic</p>
            </div>
            
            <div class="barcode">${formData.barcode}</div>
            
<div class="patient-info">
  <h3>Patient Information</h3>

  <div class="info-row">
    <span><strong>ID:</strong></span>
    <span>${formData.patientId}</span>
  </div>

  <div class="info-row">
    <span><strong>Name:</strong></span>
    <span>${formData.name}</span>
  </div>

  <div class="info-row">
    <span><strong>Phone:</strong></span>
    <span>${formData.phone}</span>
  </div>

  <div class="info-row">
    <span><strong>DOB:</strong></span>
    <span>${formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
  </div>

  <div class="info-row">
    <span><strong>Blood:</strong></span>
    <span>${formData.bloodGroup || 'N/A'}</span>
  </div>

  ${
    formData.allergies?.trim()
      ? `
      <div style="margin-top:12px;">
        <strong style="color:#dc2626;">Allergies:</strong><br/>
        <span style="font-size:13px;">
          ${formData.allergies.split('\n').join(', ')}
        </span>
      </div>
    `
      : ''
  }

  ${
    formData.medicalHistory?.trim()
      ? `
      <div style="margin-top:12px;">
        <strong style="color:#ea580c;">Medical History:</strong><br/>
        <span style="font-size:13px;">
          ${formData.medicalHistory.split('\n').join(', ')}
        </span>
      </div>
    `
      : ''
  }

  ${
    formData.pastDentalHistory?.trim()
      ? `
      <div style="margin-top:12px;">
        <strong style="color:#2563eb;">Past Dental History:</strong><br/>
        <span style="font-size:13px;">
          ${formData.pastDentalHistory}
        </span>
      </div>
    `
      : ''
  }

</div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
        <p className="text-gray-600">Enter patient's personal details</p>
      </div> */}

      {/* Avatar Upload */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar" className="w-24 h-24 object-cover rounded-full" />
            ) : (
              <User className="w-12 h-12 text-blue-600" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-200 shadow-lg">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-2">Upload patient photo (optional)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter patient's full name"
          />
          {validationErrors.name && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {validationErrors.name}
            </p>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number *
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isPhoneVerified}
              className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } ${isPhoneVerified ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
              placeholder="+91 98765 43210"
            />
            {!isPhoneVerified && formData.phone.length >= 10 && (
              <button
                type="button"
                onClick={() => {
                  setOtpSending(true);
                  setTimeout(() => {
                    setOtpSending(false);
                    setShowOtpInput(true);
                  }, 1000);
                }}
                disabled={otpSending}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {otpSending ? 'Sending...' : 'Verify'}
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
            {isPhoneVerified && (
              <div className="flex items-center gap-2 text-green-600 px-3 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Verified</span>
              </div>
            )}
          </div>

          {showOtpInput && !isPhoneVerified && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  Enter 4-Digit OTP
                </label>
                <span className="text-[10px] text-blue-500 font-medium">OTP: 1234 (Dummy)</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-32 px-4 py-2 text-center text-lg font-bold tracking-[0.5em] border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="0000"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (otp === '1234') {
                      setIsPhoneVerified(true);
                      setShowOtpInput(false);
                      setValidationErrors(prev => ({ ...prev, phone: '' }));
                    } else {
                      alert('Invalid OTP! Please enter 1234');
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}

          {validationErrors.phone && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {validationErrors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {validationErrors.email && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {validationErrors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Blood Group
          </label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
              </div>
         {type === 'person' && (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Relation
    </label>

<select
  name="relation"
  value={formData.relation}
  onChange={(e) => {
    const value = e.target.value;

    setFormData(prev => ({
      ...prev,
      relation: value,
      customRelation: value === 'Other' ? prev.customRelation : ''
    }));
  }}
  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
>
  <option value="">Select Relation</option>
  <option value="Father">Father</option>
  <option value="Mother">Mother</option>
  <option value="Brother">Brother</option>
  <option value="Sister">Sister</option>
  <option value="Wife">Wife</option>
  <option value="Husband">Husband</option>
  <option value="Friend">Friend</option>
  <option value="Other">Other</option>

  {/* ✅ Dynamic value */}
  {formData.relation &&
    ![
      '',
      'Father',
      'Mother',
      'Brother',
      'Sister',
      'Wife',
      'Husband',
      'Friend',
      'Other'
    ].includes(formData.relation) && (
      <option value={formData.relation}>
        {formData.relation}
      </option>
  )}
</select>

    {/* Other input */}
{formData.relation === 'Other' && (
  <div className="flex mt-3">
    <input
      type="text"
      value={formData.customRelation}
      onChange={(e) => handleCustomRelation(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCustomRelation();
        }
      }}
      placeholder="Enter custom relation"
      className="w-full px-4 py-3 border border-gray-300 rounded-l-xl"
    />

    <button
      type="button"
      onClick={applyCustomRelation}
      className="px-4 bg-blue-600 text-white rounded-r-xl"
    >
      →
    </button>
  </div>
)}
  </div>
)}

    
        
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Address
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Enter complete address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Occupation
          </label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter occupation"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Marital Status
          </label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Select Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Patient Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ 
                ...prev, 
                category: val as any,
                defaultDiscount: (val === 'family' || val === 'staff') ? 100 : prev.defaultDiscount
              }));
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="regular">Regular</option>
            <option value="family">Family (Doctor's House)</option>
            <option value="staff">Clinic Staff</option>
            <option value="vip">VIP</option>
            <option value="complimentary">Complimentary</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Default Discount (%)
          </label>
          <input
            type="number"
            name="defaultDiscount"
            value={formData.defaultDiscount}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="e.g. 100 for full free"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Emergency Contact Name
          </label>
          <input
            type="text"
            name="emergencyName"
            value={formData.emergencyName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Emergency contact person name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Emergency Contact Relation
          </label>
          <div className="space-y-3">
            <select
              name="emergencyRelation"
              value={formData.emergencyRelation}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  emergencyRelation: val,
                  customEmergencyRelation: val === 'Other' ? prev.customEmergencyRelation : ''
                }));
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Relation</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Husband">Husband</option>
              <option value="Wife">Wife</option>
              <option value="Guardian">Guardian</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
              {formData.emergencyRelation && !['', 'Father', 'Mother', 'Brother', 'Sister', 'Husband', 'Wife', 'Guardian', 'Friend', 'Other'].includes(formData.emergencyRelation) && (
                <option value={formData.emergencyRelation}>{formData.emergencyRelation}</option>
              )}
            </select>
            
            {formData.emergencyRelation === 'Other' && (
              <div className="flex animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  value={formData.customEmergencyRelation}
                  onChange={(e) => setFormData(prev => ({ ...prev, customEmergencyRelation: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (formData.customEmergencyRelation.trim()) {
                        setFormData(prev => ({ ...prev, emergencyRelation: prev.customEmergencyRelation, customEmergencyRelation: '' }));
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter custom relation"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.customEmergencyRelation.trim()) {
                      setFormData(prev => ({ ...prev, emergencyRelation: prev.customEmergencyRelation, customEmergencyRelation: '' }));
                    }
                  }}
                  className="px-4 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Emergency Contact Number
        </label>
        <input
          type="tel"
          name="emergencyContact"
          value={formData.emergencyContact}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="+91 98765 43210"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-3">
        <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Heart className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900 leading-none">Medical Information</h3>
        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">History & Allergies</p>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Insurance Provider
          </label>
          <input
            type="text"
            name="insuranceProvider"
            value={formData.insuranceProvider}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter insurance provider"
          />
        </div> */}

        {/* <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Insurance Number
          </label>
          <input
            type="text"
            name="insuranceNumber"
            value={formData.insuranceNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter insurance number"
          />
        </div> */}
      {/* </div> */}

      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">
          Referred By
        </label>
        <input
          type="text"
          name="referredBy"
          value={formData.referredBy}
          onChange={handleChange}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          placeholder="Doctor name or referral source"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medical History */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Heart className="w-4 h-4 inline mr-2 text-red-500" />
            Medical History
          </label>
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search condition..."
                value={medicalSearch}
                onChange={(e) => setMedicalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/50">
              {medicalConditions
                .filter(item => item.toLowerCase().includes(medicalSearch.toLowerCase()))
                .map((condition) => (
                  <label key={condition} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 last:border-0">
                    <input
                      type="checkbox"
                      checked={selectedMedicalHistory.includes(condition)}
                      onChange={(e) => {
                        let updated = e.target.checked 
                          ? [...selectedMedicalHistory, condition]
                          : selectedMedicalHistory.filter(i => i !== condition);
                        setSelectedMedicalHistory(updated);
                        setFormData(prev => ({ ...prev, medicalHistory: updated.join('\n') }));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{condition}</span>
                  </label>
                ))}
            </div>
            {selectedMedicalHistory.length > 0 && (
              <p className="text-[10px] font-bold text-blue-600 px-1 uppercase tracking-wider">
                {selectedMedicalHistory.length} Selected
              </p>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-2 text-amber-500" />
            Allergies
          </label>
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search allergy..."
                value={allergySearch}
                onChange={(e) => setAllergySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/50">
              {commonAllergies
                .filter(item => item.toLowerCase().includes(allergySearch.toLowerCase()))
                .map((allergy) => (
                  <label key={allergy} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 last:border-0">
                    <input
                      type="checkbox"
                      checked={selectedAllergies.includes(allergy)}
                      onChange={(e) => {
                        let updated = e.target.checked 
                          ? [...selectedAllergies, allergy]
                          : selectedAllergies.filter(i => i !== allergy);
                        setSelectedAllergies(updated);
                        setFormData(prev => ({ ...prev, allergies: updated.join('\n') }));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-red-600"
                    />
                    <span className="text-sm text-gray-700">{allergy}</span>
                  </label>
                ))}
            </div>
            {selectedAllergies.length > 0 && (
              <p className="text-[10px] font-bold text-red-600 px-1 uppercase tracking-wider">
                {selectedAllergies.length} Selected
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Past Dental History - Moved here for better flow */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Past Dental History
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Previous records</p>
        </div>

        <textarea
          name="pastDentalHistory"
          value={formData.pastDentalHistory}
          onChange={handleChange}
          rows={1}
          placeholder="Previous treatments, root canal, implants etc..."
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none min-h-[42px]"
        />

        <div
          className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl px-4 py-2.5 text-center hover:bg-blue-50 transition-all duration-200 cursor-pointer"
          onClick={() => document.getElementById('dentalUpload')?.click()}
        >
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleDentalFilesUpload}
            className="hidden"
            id="dentalUpload"
          />
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-blue-700 font-bold text-xs">Upload Reports / Photos</p>
              <p className="text-[10px] text-gray-500">JPG, PNG, PDF, DOC</p>
            </div>
          </div>
        </div>

        {formData.dentalFiles?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.dentalFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = formData.dentalFiles.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, dentalFiles: updated }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Doctor Details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Previous Dentist / Doctor Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Previous Doctor Name</label>
            <input
              type="text"
              name="previousDoctorName"
              value={formData.previousDoctorName}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Dr. Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Clinic Name</label>
            <input
              type="text"
              name="previousClinicName"
              value={formData.previousClinicName}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Clinic Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor Phone</label>
            <input
              type="tel"
              name="previousDoctorPhone"
              value={formData.previousDoctorPhone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({ ...prev, previousDoctorPhone: digits }));
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={15}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Digits only"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Visit Date</label>
            <input
              type="date"
              name="previousLastVisitDate"
              value={formData.previousLastVisitDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Clinic Address</label>
          <textarea
            name="previousClinicAddress"
            value={formData.previousClinicAddress}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="Complete Address"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Previous Treatment</label>
          <input
            type="text"
            name="previousReason"
            value={formData.previousReason}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Pain, Checkup"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Treatments</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Root Canal', 'Extraction', 'Braces', 'Implant', 'Crown', 'Filling', 'Surgery'].map((treatment) => (
              <label key={treatment} className="flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.previousTreatments.includes(treatment)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...formData.previousTreatments, treatment]
                      : formData.previousTreatments.filter(t => t !== treatment);
                    setFormData(prev => ({ ...prev, previousTreatments: updated }));
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-xs text-gray-700">{treatment}</span>
              </label>
            ))}
            {/* Other option */}
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-blue-300 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
              <input
                type="checkbox"
                checked={showOtherTreatment}
                onChange={(e) => {
                  setShowOtherTreatment(e.target.checked);
                  if (!e.target.checked) {
                    // Uncheck karne par custom entries hata do
                    setFormData(prev => ({ ...prev, previousTreatments: prev.previousTreatments.filter(t => ['Root Canal','Extraction','Braces','Implant','Crown','Filling','Surgery'].includes(t)) }));
                  }
                }}
                className="w-4 h-4 rounded border-blue-300 text-blue-600"
              />
              <span className="text-xs text-blue-700 font-semibold">Other</span>
            </label>
          </div>
          {/* Input sirf tab dikhega jab Other checked ho */}
          {showOtherTreatment && (
            <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                id="customTreatmentInput"
                placeholder="Treatment name likhein aur → se add karein"
                className="flex-1 px-4 py-2 text-sm border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !formData.previousTreatments.includes(val)) {
                      setFormData(prev => ({ ...prev, previousTreatments: [...prev.previousTreatments, val] }));
                    }
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold"
                onClick={() => {
                  const input = document.getElementById('customTreatmentInput') as HTMLInputElement;
                  const val = input?.value.trim();
                  if (val && !formData.previousTreatments.includes(val)) {
                    setFormData(prev => ({ ...prev, previousTreatments: [...prev.previousTreatments, val] }));
                  }
                  if (input) input.value = '';
                }}
              >
                →
              </button>
            </div>
          )}
          {/* Show custom treatment tags */}
          {formData.previousTreatments.filter(t => !['Root Canal','Extraction','Braces','Implant','Crown','Filling','Surgery'].includes(t)).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.previousTreatments.filter(t => !['Root Canal','Extraction','Braces','Implant','Crown','Filling','Surgery'].includes(t)).map(t => (
                <span key={t} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {t}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, previousTreatments: prev.previousTreatments.filter(x => x !== t) }))}
                    className="text-blue-500 hover:text-blue-800 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <h4 className="font-semibold text-red-900">Important Medical Notice</h4>
        </div>
        <p className="text-sm text-red-800">
          Please ensure all medical conditions and allergies are accurately recorded. 
          This information is critical for safe treatment planning and emergency situations.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const age = calculateAge(formData.dateOfBirth);
    const isMinor = age > 0 && age < 18;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Patient Consent & Declaration</h3>
          <p className="text-gray-600">Please review and confirm the following statements</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-600 mb-4">Required Consents</h4>
          <div className="space-y-4">
            {[
              { id: 'consentCorrectDetails', label: 'I confirm details entered are correct' },
              { id: 'consentExamination', label: 'I agree to dental examination' },
              { id: 'consentRisks', label: 'I understand treatment risks explained later by doctor' },
              { id: 'consentStorage', label: 'I allow clinic to store records securely' },
              { id: 'consentEmergency', label: 'Emergency treatment allowed if required' }
            ].map((consent) => (
              <label key={consent.id} className="flex items-start gap-3 p-3 border border-gray-50 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData[consent.id]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [consent.id]: e.target.checked }))}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">{consent.label}</span>
              </label>
            ))}
          </div>

          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-blue-600 mt-8 mb-4">Optional Preferences</h4>
          <div className="space-y-4">
            {[
              { id: 'optWhatsApp', label: 'Allow WhatsApp reminders' },
              { id: 'optPhotos', label: 'Allow before/after photos' }
            ].map((opt) => (
              <label key={opt.id} className="flex items-start gap-3 p-3 border border-gray-50 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData[opt.id]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          {!isMinor ? (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-600" />
                Patient Signature Section *
              </h4>
              <div className="border border-gray-100 rounded-2xl p-4">
                <SignaturePad
                  onSave={(dataUrl) => setFormData(prev => ({ ...prev, patientSignature: dataUrl }))}
                  defaultValue={formData.patientSignature}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Guardian Authorization Required</p>
                  <p className="text-xs text-amber-700">Patient is under 18 years old ({age} years). Guardian details and signature are mandatory.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Guardian Full Name *</label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter guardian name"
                />
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-blue-600" />
                  Guardian Signature *
                </h4>
                <div className="border border-gray-100 rounded-2xl p-4">
                  <SignaturePad
                    onSave={(dataUrl) => setFormData(prev => ({ ...prev, guardianSignature: dataUrl }))}
                    defaultValue={formData.guardianSignature}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    const age = calculateAge(formData.dateOfBirth);
    const isMinor = age > 0 && age < 18;

    return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{isCheckIn ? 'Verify & Confirm Check-in' : 'Review & Finalize'}</h3>
        <p className="text-gray-600">{isCheckIn ? 'Review patient history and details before checking in' : 'Please review all information before saving'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Patient Personal Details
            </h4>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {formData.patientId}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</span>
              <p className="font-semibold text-gray-900">{formData.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</span>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                {formData.phone}
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
              <p className="font-semibold text-gray-900 truncate">{formData.email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender / Age</span>
              <p className="font-semibold text-gray-900 capitalize">{formData.gender || 'N/A'} / {calculateAge(formData.dateOfBirth)}Y</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blood Group</span>
              <p className="font-semibold text-gray-900">{formData.bloodGroup || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marital Status</span>
              <p className="font-semibold text-gray-900 capitalize">{formData.maritalStatus || 'N/A'}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Occupation</span>
              <p className="font-semibold text-gray-900">{formData.occupation || 'N/A'}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Residential Address</span>
              <p className="font-semibold text-gray-900 text-sm">{formData.address || 'N/A'}</p>
            </div>
            <div className="col-span-2 p-3 bg-white border border-gray-100 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Emergency Contact</span>
              <p className="font-bold text-gray-900 text-sm">{formData.emergencyName} ({formData.emergencyRelation})</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {formData.emergencyContact}
              </p>
            </div>
          </div>
        </div>

        {/* Medical & History Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Medical Status
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Allergies</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.allergies.split('\n').filter(a => a.trim()).length > 0 ? (
                      formData.allergies.split('\n').filter(a => a.trim()).map(a => (
                        <span key={a} className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">{a}</span>
                      ))
                    ) : (
                      <span className="text-xs text-red-300 italic">No allergies</span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">Conditions</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.medicalHistory.split('\n').filter(h => h.trim()).length > 0 ? (
                      formData.medicalHistory.split('\n').filter(h => h.trim()).map(h => (
                        <span key={h} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px] font-bold">{h}</span>
                      ))
                    ) : (
                      <span className="text-xs text-orange-300 italic">None reported</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Past Dental History</span>
                <p className="text-sm text-gray-700 italic">{formData.pastDentalHistory || 'No previous history provided'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Previous Dentist Info
            </h4>
            {formData.previousDoctorName ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor / Clinic</span>
                  <p className="font-semibold text-gray-900 text-sm">{formData.previousDoctorName}</p>
                  <p className="text-[10px] text-gray-500">{formData.previousClinicName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Visit</span>
                  <p className="font-semibold text-gray-900 text-sm">{formData.previousLastVisitDate || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Previous Treatments</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.previousTreatments.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[10px] font-bold">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No previous dentist details provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Consent & Signature Preview */}
      <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
        <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-blue-600" />
          Consent & Signature Status
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.consentCorrectDetails && formData.consentExamination && formData.consentRisks && formData.consentStorage && formData.consentEmergency ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {formData.consentCorrectDetails && formData.consentExamination && formData.consentRisks && formData.consentStorage && formData.consentEmergency ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <span className="text-sm font-bold text-gray-700">All Mandatory Consents Accepted</span>
            </div>

            <div className="space-y-2 pl-9">
              {[
                { id: 'optWhatsApp', label: 'WhatsApp Reminders' },
                { id: 'optPhotos', label: 'Before/After Photos' }
              ].map(opt => (
                <div key={opt.id} className="flex items-center gap-2 text-sm">
                  <span className={formData[opt.id] ? 'text-green-600 font-bold' : 'text-gray-400'}>
                    {formData[opt.id] ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-600">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isMinor && formData.patientSignature && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Patient Signature</span>
                <div className="bg-white border border-gray-200 rounded-xl p-2 h-24 flex items-center justify-center">
                  <img src={formData.patientSignature} alt="Patient Signature" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            )}
            {isMinor && formData.guardianSignature && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Guardian: {formData.guardianName}</span>
                <div className="bg-white border border-gray-200 rounded-xl p-2 h-24 flex items-center justify-center">
                  <img src={formData.guardianSignature} alt="Guardian Signature" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

  const getStepIndicator = (stepNumber: number) => {
    if (stepNumber < step) {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    } else if (stepNumber === step) {
      return <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{stepNumber}</div>;
    } else {
      return <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">{stepNumber}</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {(patient && patient.id) ? 'Edit Patient Information' : 'New Patient Registration'}
              </h2>
              <p className="text-gray-600 mt-1">Complete patient registration with medical history</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-8 overflow-x-auto py-2">
            <div className="flex items-center shrink-0">
              {getStepIndicator(1)}
              <span className={`ml-2 text-xs sm:text-sm font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                Basic
              </span>
            </div>
            <div className={`h-1 w-8 sm:w-16 rounded-full shrink-0 ${step > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex items-center shrink-0">
              {getStepIndicator(2)}
              <span className={`ml-2 text-xs sm:text-sm font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                Medical
              </span>
            </div>
            <div className={`h-1 w-8 sm:w-16 rounded-full shrink-0 ${step > 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex items-center shrink-0">
              {getStepIndicator(3)}
              <span className={`ml-2 text-xs sm:text-sm font-medium ${step >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                Consent
              </span>
            </div>
            <div className={`h-1 w-8 sm:w-16 rounded-full shrink-0 ${step > 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex items-center shrink-0">
              {getStepIndicator(4)}
              <span className={`ml-2 text-xs sm:text-sm font-medium ${step >= 4 ? 'text-gray-900' : 'text-gray-500'}`}>
                Review
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700 font-medium">Please fill all required fields before proceeding.</p>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold transition-all duration-200 flex items-center"
                >
                  Next Step
                  <Calendar className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  onClick={(e) => handleSubmit(e as any)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold flex items-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving Patient...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isCheckIn ? 'Confirm Check-in' : (patient && patient.id) ? 'Update Patient' : 'Save Patient'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}