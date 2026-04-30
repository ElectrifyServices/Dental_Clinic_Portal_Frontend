import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, Stethoscope, Shield, Key, Upload, DollarSign, Calendar, Clock, Award, FileText, IndianRupee, IndianRupeeIcon } from 'lucide-react';

interface DoctorFormProps {
  onClose: () => void;
  onSave: (doctor: any) => void;
  doctor?: any;
}

export function DoctorForm({ onClose, onSave, doctor }: DoctorFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
    role: doctor?.role || 'doctor',
    specialization: doctor?.specialization || '',
    password: '',
    confirmPassword: '',
    permissions: doctor?.permissions || ['appointments', 'patients', 'treatments', 'emr'],
    uniqueId: doctor?.uniqueId || `STAFF${Date.now().toString().slice(-6)}`,
    documents: doctor?.documents || [],
    profitSharing: doctor?.profitSharing || false,
    profitPercentage: doctor?.profitPercentage || 0,
    licenseNumber: doctor?.licenseNumber || '',
    monthlySalary: doctor?.monthlySalary || '',
    salaryPaid: doctor?.salaryPaid || '0',
    salaryPending: doctor?.salaryPending || '0',
    education: doctor?.education || '',
    experience: doctor?.experience || '',
    department: doctor?.department || '',
    designation: doctor?.designation || '',
    qualification: doctor?.qualification || '',
    consultationFee: doctor?.consultationFee || '',
    isActive: doctor?.isActive !== undefined ? doctor.isActive : true,
    avatar: doctor?.avatar || doctor?.image || ''
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full system access', icon: Shield, color: 'purple' },
    { value: 'doctor', label: 'Doctor', description: 'Patient care and treatments', icon: Stethoscope, color: 'blue' },
    { value: 'receptionist', label: 'Receptionist', description: 'Front desk operations', icon: User, color: 'green' },
    { value: 'assistant', label: 'Assistant', description: 'Support functions', icon: User, color: 'yellow' }
  ];

  const availablePermissions = [
    { id: 'appointments', label: 'Appointments', description: 'Schedule and manage appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', description: 'View and manage patient records', icon: User },
    { id: 'treatments', label: 'Treatments', description: 'Create and manage treatment plans', icon: Stethoscope },
    { id: 'emr', label: 'EMR', description: 'Electronic medical records', icon: FileText },
    { id: 'billing', label: 'Billing', description: 'Invoices and payments', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', description: 'Stock management', icon: FileText },
    { id: 'reports', label: 'Reports', description: 'Analytics and reports', icon: FileText }
  ];

  const specializations = [
    'General Dentistry',
    'Orthodontics',
    'Oral Surgery',
    'Periodontics',
    'Endodontics',
    'Prosthodontics',
    'Pediatric Dentistry',
    'Oral Pathology',
    'Cosmetic Dentistry'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only submit if we're on the final step (step 4)
    if (currentStep !== 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (!doctor && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!doctor && !formData.password) {
      alert('Password is required for new staff members');
      return;
    }

    onSave({
      ...formData,
      id: doctor?.id || Date.now().toString(),
      salaryPending: !doctor ? (parseFloat(formData.monthlySalary) || 0).toLocaleString('en-IN') : formData.salaryPending,
      permissions: formData.role === 'admin' ? ['all'] : formData.permissions,
      workingHours: doctor?.workingHours || {
        monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        saturday: { isWorking: false, startTime: '09:00', endTime: '18:00' },
        sunday: { isWorking: false, startTime: '09:00', endTime: '18:00' }
      },
      timeSlots: doctor?.timeSlots || { duration: 30, bufferTime: 5 }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="relative inline-block group">
          <div className="w-28 h-28 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[2rem] border-2 border-dashed border-blue-200 flex items-center justify-center mx-auto mb-4 overflow-hidden relative transition-all group-hover:border-blue-400">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-blue-200" />
            )}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer"
            >
              <Upload className="w-6 h-6 text-white mb-1" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change Photo</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mt-2">Personal Information</h3>
        <p className="text-gray-500 text-sm">Basic details and contact information</p>
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
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Staff ID
          </label>
          <input
            type="text"
            name="uniqueId"
            value={formData.uniqueId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            placeholder="Auto-generated unique ID"
            readOnly
          />
        </div>
      </div>

      {!doctor && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Key className="w-4 h-4 inline mr-2" />
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!doctor}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required={!doctor}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Confirm password"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Role & Permissions</h3>
        <p className="text-gray-600">Define access level and responsibilities</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          Select Role *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => {
            const Icon = role.icon;
            return (
              <div
                key={role.value}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.role === role.value
                  ? `border-${role.color}-300 bg-${role.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
              >
                <div className="flex items-center mb-2">
                  <Icon className={`w-6 h-6 mr-3 text-${role.color}-600`} />
                  <h4 className="font-bold text-gray-900">{role.label}</h4>
                </div>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {formData.role !== 'admin' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Permissions
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePermissions.map(permission => {
              const Icon = permission.icon;
              return (
                <div key={permission.id} className="flex items-start p-3 border border-gray-200 rounded-xl">
                  <input
                    type="checkbox"
                    id={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 text-gray-500 mr-2" />
                      <label htmlFor={permission.id} className="text-sm font-medium text-gray-700">
                        {permission.label}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => {
    const docRequirements = {
      doctor: [
        'Aadhaar / Identity Proof',
        'Educational Degree Documents',
        'Medical Council Registration',
        'Experience Certificates',
        'Medical Indemnity Insurance',
        'NOC (if applicable)',
        'Police Verification',
        'PAN Card',
        'Bank Details / Passbook',
        'Signed Employment Contract'
      ],
      receptionist: [
        'Aadhaar / Identity Proof',
        'Educational Certificate',
        'Previous Employment Proof',
        'PAN Card',
        'Bank Details / Passbook'
      ],
      assistant: [
        'Aadhaar / Identity Proof',
        'Education Certificate',
        'Experience Certificate',
        'Medical Fitness Certificate',
        'Vaccination Proof (Hep-B/COVID)'
      ],
      admin: [
        'Aadhaar Card',
        'PAN Card',
        'Resume / CV',
        'Bank Details / Passbook',
        'Police Verification',
        'Signed NDA',
        'Appointment Letter',
        'Previous Experience Proof'
      ]
    };

    const currentDocs = docRequirements[formData.role as keyof typeof docRequirements] || docRequirements.assistant;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Documentation</h3>
          <p className="text-gray-600">Upload required documents for {formData.role} role</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentDocs.map((doc, idx) => (
            <div key={idx} className="p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-200 transition-all bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm mr-3">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-bold text-gray-700 text-sm">{doc} *</span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Required</span>
              </div>
              <div className="relative group">
                <div className="w-full h-12 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center group-hover:border-blue-400 transition-all cursor-pointer bg-white">
                  <Upload className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-xs font-bold text-gray-500">Click to upload</span>
                </div>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start">
          <Shield className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            Please ensure all documents are clearly visible and in PDF or JPG format. Maximum file size: 5MB per document.
          </p>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Professional Details</h3>
        <p className="text-gray-600">Employment and qualification details</p>
      </div>

      {/* Doctor Layout */}
      {(formData.role === 'doctor' || formData.role === 'admin_doctor' ) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Stethoscope className="w-4 h-4 inline mr-2" />
              Specialization
            </label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Specialization</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <IndianRupeeIcon className="w-4 h-4 inline mr-2" />
              Consultation Fee
            </label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter consultation fee"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Award className="w-4 h-4 inline mr-2" />
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., BDS, MDS"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience (Years)
            </label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Years of experience"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              License Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Medical license number"
            />
          </div>
        </div>
      )}

      {/* Assistant & Receptionist Layout */}
      {(formData.role === 'assistant' || formData.role === 'receptionist') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Highest Education Level
            </label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Graduate, Diploma"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Work Experience (Years)
            </label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Years of experience"
            />
          </div>
          {formData.role === 'assistant' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Primary Department / Area
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                <option value="Surgery">Surgery Support</option>
                <option value="General">General Dentistry</option>
                <option value="Lab">Laboratory</option>
                <option value="Sterilization">Sterilization</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Admin Layout */}
      {formData.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              <option value="HR">Human Resources</option>
              <option value="Finance">Finance / Accounting</option>
              <option value="Operations">Operations</option>
              <option value="IT">IT Support</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Manager, Lead"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Professional Background / Education
            </label>
            <textarea
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Summary of background and education..."
            />
          </div>
        </div>
      )}

      {/* Common Salary Field for Everyone */}
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <IndianRupee className="w-4 h-4 inline mr-2 text-emerald-600" />
          Monthly Salary (₹) *
        </label>
        <input
          type="number"
          name="monthlySalary"
          value={formData.monthlySalary}
          onChange={handleChange}
          required
          min="0"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Enter monthly salary amount"
        />
      </div>

      {/* Profit Sharing (Only for Doctor) */}
      {formData.role === 'doctor' && (
        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="profitSharing"
              checked={formData.profitSharing}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="ml-3 text-lg font-semibold text-green-700">Enable Profit Sharing</span>
          </div>
          {formData.profitSharing && (
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Profit Sharing Percentage (%)
              </label>
              <input
                type="number"
                name="profitPercentage"
                value={formData.profitPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500"
                placeholder="Enter percentage"
              />
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status
        </label>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Role & Access', icon: Shield },
    { number: 3, title: 'Documentation', icon: FileText },
    { number: 4, title: 'Professional', icon: Stethoscope }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {doctor ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <p className="text-gray-600 mt-1">Complete staff registration with role-based access</p>
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
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      Step {step.number}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
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
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold transition-all duration-200"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {doctor ? 'Update Staff Member' : 'Add Staff Member'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}