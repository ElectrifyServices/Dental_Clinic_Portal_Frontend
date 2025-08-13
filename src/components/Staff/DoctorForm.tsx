import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, Stethoscope, Shield, Key, Upload, DollarSign, Calendar, Clock, Award, FileText } from 'lucide-react';

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
    consultationFee: doctor?.consultationFee || 500,
    experience: doctor?.experience || '',
    qualification: doctor?.qualification || '',
    licenseNumber: doctor?.licenseNumber || '',
    isActive: doctor?.isActive !== undefined ? doctor.isActive : true
  });

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
    
    // Only submit if we're on the final step (step 3)
    if (currentStep !== 3) {
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
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
        <p className="text-gray-600">Basic details and contact information</p>
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
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.role === role.value
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

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Professional Details</h3>
        <p className="text-gray-600">Medical qualifications and specialization</p>
      </div>

      {(formData.role === 'doctor' || formData.role === 'admin') && (
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
              <DollarSign className="w-4 h-4 inline mr-2" />
              Consultation Fee (₹)
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

      {/* Profit Sharing */}
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

      {/* Document Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Staff Documents
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Upload ID proof, certificates, or other documents</p>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            id="document-upload"
          />
          <label
            htmlFor="document-upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Choose Documents
          </label>
        </div>
      </div>

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
    { number: 3, title: 'Professional', icon: Stethoscope }
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
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                    isCompleted 
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
              {currentStep < 3 ? (
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