import React, { useState } from 'react';
import { X, Save, User, Phone, Mail, Calendar, MapPin, Heart, QrCode, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

// Enhanced barcode generation function
const generateBarcode = (patientId: string) => {
  return `*${patientId}*`; // Code 39 format
};

const generatePatientId = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `PAT${timestamp}`;
};

interface PatientFormProps {
  onClose: () => void;
  onSave: (patient: any) => void;
  patient?: any;
}

export function PatientForm({ onClose, onSave, patient }: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || 'male',
    address: patient?.address || '',
    emergencyContact: patient?.emergencyContact || '',
    emergencyName: patient?.emergencyName || '',
    medicalHistory: patient?.medicalHistory?.join('\n') || '',
    pastDentalHistory: patient?.pastDentalHistory || '',
    allergies: patient?.allergies?.join('\n') || '',
    allergyOther: patient?.allergyOther || '',
    allergyNotes: patient?.allergyNotes || '',
    patientId: patient?.id || generatePatientId(),
    barcode: patient?.barcode || '',
    bloodGroup: patient?.bloodGroup || '',
    occupation: patient?.occupation || '',
    maritalStatus: patient?.maritalStatus || '',
    insuranceProvider: patient?.insuranceProvider || '',
    insuranceNumber: patient?.insuranceNumber || '',
    referredBy: patient?.referredBy || '',
    avatar: patient?.avatar || ''
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
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
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

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit if we're on the final step (step 3)
    if (step !== 3) {
      handleNext();
      return;
    }
    
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
      status: patient?.status || 'new'
    });
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
              width: 300px;
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
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
        <p className="text-gray-600">Enter patient's personal details</p>
      </div>

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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="+91 98765 43210"
          />
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
      </div>

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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Medical Information</h3>
        <p className="text-gray-600">Important medical history and allergies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div>
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
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Referred By
        </label>
        <input
          type="text"
          name="referredBy"
          value={formData.referredBy}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Doctor name or referral source"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Heart className="w-4 h-4 inline mr-2" />
          Medical History
        </label>
        <div className="space-y-2">
          <select
            multiple
            value={selectedMedicalHistory}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedMedicalHistory(values);
              setFormData(prev => ({ ...prev, medicalHistory: values.join('\n') }));
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
          >
            {medicalConditions.map(condition => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500">Hold Ctrl/Cmd to select multiple conditions</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Past Dental History
        </label>
        <textarea
          name="pastDentalHistory"
          value={formData.pastDentalHistory}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Previous dental treatments, surgeries, or procedures..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Allergies
        </label>
        <div className="space-y-3">
          <select
            multiple
            value={selectedAllergies}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedAllergies(values);
              setFormData(prev => ({ ...prev, allergies: values.join('\n') }));
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
          >
            {commonAllergies.map(allergy => (
              <option key={allergy} value={allergy}>{allergy}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500">Hold Ctrl/Cmd to select multiple allergies</p>
          
          {selectedAllergies.includes('Other') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Allergy Details
              </label>
              <textarea
                name="allergyNotes"
                value={formData.allergyNotes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe other allergies..."
              />
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

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Patient Identification</h3>
        <p className="text-gray-600">Review and confirm patient details</p>
      </div>

      {/* Patient ID and Barcode */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          Patient Identification System
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Patient ID
            </label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-900 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Scannable Barcode
            </label>
            <div className="bg-white border border-blue-300 rounded-lg p-4 text-center">
              <div className="font-mono text-2xl text-blue-900 tracking-wider mb-2">
                {formData.barcode}
              </div>
              <button
                type="button"
                onClick={printBarcode}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-all duration-200 flex items-center mx-auto"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Print Barcode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Patient Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{formData.name || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{formData.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{formData.email || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-medium text-gray-900">
                {formData.dateOfBirth 
                  ? Math.floor((new Date().getTime() - new Date(formData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) + ' years'
                  : 'Not provided'
                }
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium text-gray-900 capitalize">{formData.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Blood Group:</span>
              <span className="font-medium text-gray-900">{formData.bloodGroup || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Medical Conditions:</span>
              <span className="font-medium text-gray-900">
                {formData.medicalHistory.split('\n').filter(h => h.trim()).length || 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Allergies:</span>
              <span className="font-medium text-gray-900">
                {formData.allergies.split('\n').filter(a => a.trim()).length || 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Alerts Preview */}
      {(formData.medicalHistory.trim() || formData.allergies.trim()) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <h4 className="font-semibold text-orange-900">Medical Alerts Preview</h4>
          </div>
          {formData.allergies.trim() && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Allergies: </span>
              <span className="text-sm text-red-600">
                {formData.allergies.split('\n').filter(a => a.trim()).join(', ')}
              </span>
            </div>
          )}
          {formData.medicalHistory.trim() && (
            <div>
              <span className="text-sm font-medium text-orange-700">Medical History: </span>
              <span className="text-sm text-orange-600">
                {formData.medicalHistory.split('\n').filter(h => h.trim()).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

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
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {patient ? 'Edit Patient Information' : 'Add New Patient'}
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
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              {getStepIndicator(1)}
              <span className={`ml-2 text-sm font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                Basic Info
              </span>
            </div>
            <div className={`h-1 w-16 rounded-full ${step > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              {getStepIndicator(2)}
              <span className={`ml-2 text-sm font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                Medical Info
              </span>
            </div>
            <div className={`h-1 w-16 rounded-full ${step > 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              {getStepIndicator(3)}
              <span className={`ml-2 text-sm font-medium ${step >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                Review
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

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
              {step < 3 ? (
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
                      {patient ? 'Update Patient' : 'Save Patient'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}