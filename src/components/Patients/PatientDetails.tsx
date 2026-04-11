import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, MapPin, Heart, AlertTriangle, CreditCard, Send, FileText, Stethoscope, Image, Pill, Download, QrCode, Edit, Activity, TrendingUp } from 'lucide-react';

interface PatientDetailsProps {
  patient: any; 
   familyMembers: any[]; 
  onClose: () => void;
  onSendReminder: (patientId: string, amount: number) => void;
}


export function PatientDetails({ patient, onClose, familyMembers, onSendReminder }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Mock patient data - in real app, fetch from API
  // const patient = {
  //   id: patientId,
  //   name: 'Rajesh Kumar',
  //   email: 'rajesh@email.com',
  //   phone: '+91 98765 43210',
  //   dateOfBirth: '1985-06-15',
  //   gender: 'male',
  //   address: '123 MG Road, Bangalore, Karnataka 560001',
  //   emergencyContact: '+91 98765 43211',
  //   medicalHistory: ['Diabetes Type 2', 'Hypertension', 'Previous root canal treatment'],
  //   allergies: ['Penicillin', 'Latex'],
  //   bloodGroup: 'B+',
  //   occupation: 'Software Engineer',
  //   maritalStatus: 'married',
  //   insuranceProvider: 'Star Health Insurance',
  //   insuranceNumber: 'SH123456789',
  //   referredBy: 'Dr. Ramesh Kumar',
  //   createdAt: '2023-01-15',
  //   lastVisit: '2024-01-10',
  //   totalVisits: 5,
  //   outstandingBalance: 2500,
  //   status: 'active',
  //   barcode: '*PAT001*',
  //   avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  //   documents: [
  //     { id: '1', name: 'X-Ray Report', type: 'x-ray', date: '2024-01-15', url: 'https://images.pexels.com/photos/4269693/pexels-photo-4269693.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2' },
  //     { id: '2', name: 'Blood Test Report', type: 'lab-report', date: '2024-01-10', url: 'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2' },
  //     { id: '3', name: 'Previous Treatment Photos', type: 'photo', date: '2024-01-08', url: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2' }
  //   ],
  //   prescriptionHistory: [
  //     {
  //       id: '1',
  //       date: '2024-01-15',
  //       treatment: 'Root Canal Treatment',
  //       prescriptions: [
  //         { medicine: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '5 days' },
  //         { medicine: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '3 days' }
  //       ]
  //     },
  //     {
  //       id: '2',
  //       date: '2024-01-08',
  //       treatment: 'Dental Cleaning',
  //       prescriptions: [
  //         { medicine: 'Chlorhexidine Mouthwash', dosage: '10ml', frequency: '2 times daily', duration: '7 days' }
  //       ]
  //     }
  //   ]
  // };

  const appointments = [
    { id: '1', date: '2024-01-15', time: '10:00 AM', type: 'Root Canal', status: 'completed', doctor: 'Dr. Sharma' },
    { id: '2', date: '2024-01-22', time: '2:00 PM', type: 'Follow-up', status: 'scheduled', doctor: 'Dr. Sharma' },
    { id: '3', date: '2024-01-08', time: '11:00 AM', type: 'Cleaning', status: 'completed', doctor: 'Dr. Sharma' }
  ];

  const treatments = [
    { id: '1', date: '2024-01-15', procedure: 'Root Canal Treatment', tooth: '16', cost: 5000, status: 'in-progress' },
    { id: '2', date: '2024-01-08', procedure: 'Dental Cleaning', tooth: 'Full mouth', cost: 1500, status: 'completed' }
  ];

  const invoices = [
    { id: 'INV-001', date: '2024-01-15', amount: 5000, status: 'pending', dueDate: '2024-01-22' },
    { id: 'INV-002', date: '2024-01-08', amount: 1500, status: 'paid', dueDate: '2024-01-15' }
  ];

  const handleSendReminder = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSendReminder(patient.id, patient.outstandingBalance);
    setLoading(false);
  };

  const printBarcode = () => {
    const printContent = `
      <html>
        <head>
          <title>Patient Barcode - ${patient.name}</title>
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
          </style>
        </head>
        <body>
          <div class="barcode-card">
            <div class="clinic-header">
              <h1>🦷 DentalCare Pro</h1>
              <p>Dr. Sharma's Dental Clinic</p>
            </div>
            <div class="barcode">${patient.barcode}</div>
            <div class="patient-info">
              <h3>Patient Information</h3>
              <p><strong>ID:</strong> ${patient.id}</p>
              <p><strong>Name:</strong> ${patient.name}</p>
              <p><strong>Phone:</strong> ${patient.phone}</p>
              <p><strong>DOB:</strong> ${new Date(patient.dateOfBirth).toLocaleDateString()}</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'medical', label: 'Medical Info', icon: Heart },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'treatments', label: 'Treatments', icon: Stethoscope },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'family', label: 'Family', icon: User }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                {patient.avatar ? (
                  <img src={patient.avatar} alt={patient.name} className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <User className="w-10 h-10 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                <p className="text-gray-600 font-mono text-lg">{patient.id}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    Age: {Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                  </span>
                  {patient.bloodGroup && (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                      {patient.bloodGroup}
                    </span>
                  )}
                  {patient.outstandingBalance > 0 && (
                    <span className="ml-2 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      ₹{patient.outstandingBalance.toLocaleString()} PENDING
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {patient.outstandingBalance > 0 && (
                <button
                  onClick={handleSendReminder}
                  disabled={loading}
                  className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 flex items-center text-sm font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Payment Reminder
                    </>
                  )}
                </button>
              )}
              <div className="relative group">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center text-sm font-medium transition-all duration-200">
                  <Send className="w-4 h-4 mr-2" />
                  Send Reminder
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => alert('Bill reminder sent!')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Bill Reminder
                  </button>
                  <button
                    onClick={() => alert('Appointment reminder sent!')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Appointment Reminder
                  </button>
                </div>
              </div>
              <button
                onClick={printBarcode}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 flex items-center text-sm font-medium transition-all duration-200"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Print Barcode
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6 bg-gray-100 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-900">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900 capitalize">{patient.gender}</p>
                    </div>
                  </div>
                  {patient.bloodGroup && (
                    <div className="flex items-center">
                      <Heart className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Blood Group</p>
                        <p className="font-medium text-red-600">{patient.bloodGroup}</p>
                      </div>
                    </div>
                  )}
                  {patient.occupation && (
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Occupation</p>
                        <p className="font-medium text-gray-900">{patient.occupation}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{patient.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Emergency Contact</p>
                      <p className="font-medium text-gray-900">{patient.emergencyContact}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats & Actions */}
              <div className="space-y-4">
                {/* Patient Stats */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Patient Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="text-sm text-gray-700">Total Visits</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">{patient.totalVisits}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                        <span className="text-sm text-gray-700">Last Visit</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {new Date(patient.lastVisit).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-purple-600 mr-3" />
                        <span className="text-sm text-gray-700">Outstanding</span>
                      </div>
                      <span className={`text-lg font-bold ${patient.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{patient.outstandingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barcode Section */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    Patient Barcode
                  </h3>
                  <div className="bg-white rounded-xl p-4 text-center border border-purple-200">
                    <div className="font-mono text-xl text-purple-900 tracking-wider mb-3">
                      {patient.barcode}
                    </div>
                    <button
                      onClick={printBarcode}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium transition-all duration-200 flex items-center mx-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Print Barcode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medical History */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Medical History
                </h3>
                <div className="space-y-3">
                  {patient.medicalHistory.length > 0 ? (
                    patient.medicalHistory.map((condition, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                        <p className="text-blue-800 font-medium">{condition}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                      <p className="text-blue-600">No medical history recorded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Allergies & Alerts
                </h3>
                <div className="space-y-3">
                  {patient.allergies.length > 0 ? (
                    patient.allergies.map((allergy, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          <p className="text-red-800 font-medium">{allergy}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                      <p className="text-red-600">No allergies recorded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Medical Info */}
              <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {patient.bloodGroup && (
                    <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                      <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-bold text-red-600">{patient.bloodGroup}</p>
                    </div>
                  )}
                  {patient.occupation && (
                    <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                      <User className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-medium text-gray-900">{patient.occupation}</p>
                    </div>
                  )}
                  {patient.maritalStatus && (
                    <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                      <User className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Marital Status</p>
                      <p className="font-medium text-gray-900 capitalize">{patient.maritalStatus}</p>
                    </div>
                  )}
                  {patient.insuranceProvider && (
                    <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                      <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Insurance</p>
                      <p className="font-medium text-gray-900">{patient.insuranceProvider}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Appointment History</h3>
              {appointments.map((appointment) => (
                <div key={appointment.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">{appointment.type}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                        <p className="text-sm text-gray-600">with {appointment.doctor}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'treatments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Treatment History</h3>
              {treatments.map((treatment) => (
                <div key={treatment.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Stethoscope className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">{treatment.procedure}</p>
                        <p className="text-sm text-gray-600">Tooth: {treatment.tooth}</p>
                        <p className="text-sm text-gray-600">{new Date(treatment.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{treatment.cost.toLocaleString()}</p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(treatment.status)}`}>
                        {treatment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Billing History</h3>
                {patient.outstandingBalance > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-red-900">Outstanding Balance</p>
                        <p className="text-2xl font-bold text-red-600">₹{patient.outstandingBalance.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={handleSendReminder}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Reminder
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {invoices.map((invoice) => (
                <div key={invoice.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">{invoice.id}</p>
                        <p className="text-sm text-gray-600">
                          Issued: {new Date(invoice.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{invoice.amount.toLocaleString()}</p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Prescription History</h3>
              {patient.prescriptionHistory.map((record) => (
                <div key={record.id} className="bg-green-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Pill className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-semibold text-green-900">{record.treatment}</p>
                        <p className="text-sm text-green-700">{new Date(record.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {record.prescriptions.map((prescription, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-green-200">
                        <h4 className="font-bold text-green-900 mb-2">{prescription.medicine}</h4>
                        <div className="space-y-1 text-sm text-green-800">
                          <p><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                          <p><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                          <p><span className="font-medium">Duration:</span> {prescription.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Patient Documents & Images</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.documents.map((document) => (
                    <div key={document.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Image className="w-5 h-5 text-blue-600 mr-2" />
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            document.type === 'x-ray' ? 'bg-purple-100 text-purple-800' :
                            document.type === 'lab-report' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {document.type.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <button
                          onClick={() => window.open(document.url, '_blank')}
                          disabled={loading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Reminder
                            </>
                          )}
                        </button>
                      </div>
                      <img
                        src={document.url}
                        alt={document.name}
                        className="w-full h-40 object-cover rounded-lg mb-3 cursor-pointer hover:shadow-lg transition-all duration-200"
                        onClick={() => window.open(document.url, '_blank')}
                      />
                      <h4 className="font-semibold text-gray-900 mb-1">{document.name}</h4>
                      <p className="text-sm text-gray-600">{new Date(document.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
                
                {patient.documents.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents uploaded</h3>
                    <p className="text-gray-600">Medical images and documents will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
{activeTab === 'family' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-semibold text-gray-900">Family Members</h3>
      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        {familyMembers.length} {familyMembers.length === 1 ? 'Member' : 'Members'}
      </span>
    </div>

    {familyMembers.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-gray-500">No family members found</p>
        <p className="text-sm text-gray-400 mt-1">Add your first family member to get started</p>
      </div>
    ) : (
      <div className="grid gap-4">
        {familyMembers.map((member) => (
          <div
            key={member.id}
            className="group bg-white rounded-2xl p-5 border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{member.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{member.id}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                  <span className="text-gray-500">Age:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {member.dateOfBirth
                      ? Math.floor(
                          (Date.now() - new Date(member.dateOfBirth).getTime()) /
                          (365.25 * 24 * 60 * 60 * 1000)
                        )
                      : '-'}
                  </span>
                </div>
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                  <span className="text-gray-500">Relation:</span>
                  <span className="ml-1 font-medium text-gray-900">{member.relation || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  );
}