import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileNav } from './components/Layout/MobileNav';
import { DashboardStats } from './components/Dashboard/DashboardStats';
import { TodayAppointments } from './components/Dashboard/TodayAppointments';
import { RecentPatients } from './components/Dashboard/RecentPatients';
import { AppointmentForm } from './components/Appointments/AppointmentForm';
import { AppointmentCalendar } from './components/Appointments/AppointmentCalendar';
import { AppointmentList } from './components/Appointments/AppointmentList';
import { PatientList } from './components/Patients/PatientList';
import { PatientForm } from './components/Patients/PatientForm';
import { PatientDetails } from './components/Patients/PatientDetails';
import { TreatmentList } from './components/Treatments/TreatmentList';
import { TreatmentForm } from './components/Treatments/TreatmentForm';
import { EMRList } from './components/EMR/EMRList';
import { EMRForm } from './components/EMR/EMRForm';
import { InvoiceList } from './components/Billing/InvoiceList';
import { InvoiceForm } from './components/Billing/InvoiceForm';
import { InventoryList } from './components/Inventory/InventoryList';
import { InventoryForm } from './components/Inventory/InventoryForm';
import { ReportsDashboard } from './components/Reports/ReportsDashboard';
import { ConsentFormList } from './components/Consent/ConsentFormList';
import { ConsentForm } from './components/Consent/ConsentForm';
import { DoctorCheckIn } from './components/Doctor/DoctorCheckIn';
import { PatientQueue } from './components/Doctor/PatientQueue';
import { PatientConsultation } from './components/Doctor/PatientConsultation';
import { TreatmentViewer } from './components/Treatments/TreatmentViewer';
import { TreatmentSessionManager } from './components/Treatments/TreatmentSessionManager';
import { DoctorManagement } from './components/Staff/DoctorManagement';
import { DoctorForm } from './components/Staff/DoctorForm';
import { DoctorScheduleManager } from './components/Staff/DoctorScheduleManager';
import { TodaySchedulePopup } from './components/Appointments/TodaySchedulePopup';
import { EMRViewer } from './components/EMR/EMRViewer';
import { InvoiceViewer } from './components/Billing/InvoiceViewer';
import { ConsentFormViewer } from './components/Consent/ConsentFormViewer';
import { User, Phone, Stethoscope, MessageSquare, AlertTriangle, X, DollarSign } from 'lucide-react';

function MainApp() {
  const { state } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isQuickBooking, setIsQuickBooking] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showConsentViewer, setShowConsentViewer] = useState(false);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [showTreatmentViewer, setShowTreatmentViewer] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
  const [treatments, setTreatments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showDoctorScheduleManager, setShowDoctorScheduleManager] = useState(false);
  const [selectedDoctorIdForSchedule, setSelectedDoctorIdForSchedule] = useState('');
  const [selectedDoctorNameForSchedule, setSelectedDoctorNameForSchedule] = useState('');
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [queuedPatients, setQueuedPatients] = useState<any[]>([]);
  const [showPatientConsultation, setShowPatientConsultation] = useState(false);
  const [selectedPatientForConsultation, setSelectedPatientForConsultation] = useState<any>(null);
  const [showEMRForm, setShowEMRForm] = useState(false);
  const [showEMRViewer, setShowEMRViewer] = useState(false);
  const [emrRecords, setEmrRecords] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showDiagnoseForm, setShowDiagnoseForm] = useState(false);
  const [selectedPatientForDiagnose, setSelectedPatientForDiagnose] = useState<any>(null);
  const [viewMode, setViewMode] = useState('calendar');

  // Mock queued patients data
  const mockQueuedPatients = [
    {
      id: '1',
      appointmentId: 'APT-001',
      patientName: 'Rajesh Kumar',
      patientPhone: '+91 98765 43210',
      appointmentTime: '10:00 AM',
      treatmentType: 'Root Canal Treatment',
      patientConcern: 'Severe pain in upper right molar, especially when eating hot or cold foods. Pain started 3 days ago.',
      checkInTime: '9:55 AM',
      status: 'waiting',
      notes: '',
      patientHistory: {
        lastVisit: '2024-01-08',
        totalVisits: 5,
        medicalHistory: ['Diabetes Type 2', 'Hypertension'],
        allergies: ['Penicillin']
      }
    },
    {
      id: '2',
      appointmentId: 'APT-002',
      patientName: 'Priya Sharma',
      patientPhone: '+91 87654 32109',
      appointmentTime: '10:30 AM',
      treatmentType: 'Teeth Cleaning',
      patientConcern: 'Regular cleaning and checkup. Some bleeding while brushing teeth.',
      checkInTime: '10:25 AM',
      status: 'in-consultation',
      notes: '',
      patientHistory: {
        lastVisit: '2023-12-15',
        totalVisits: 2,
        medicalHistory: [],
        allergies: ['Latex']
      }
    },
    {
      id: '3',
      appointmentId: 'APT-003',
      patientName: 'Amit Singh',
      patientPhone: '+91 76543 21098',
      appointmentTime: '11:00 AM',
      treatmentType: 'Dental Filling',
      patientConcern: 'Cavity in lower left molar. Mild pain when chewing.',
      checkInTime: '10:58 AM',
      status: 'waiting',
      notes: '',
      patientHistory: {
        lastVisit: '2024-01-05',
        totalVisits: 8,
        medicalHistory: ['Previous root canal'],
        allergies: []
      }
    }
  ];

  // Mock doctors data with schedules
  const doctorsWithSchedules = [
    { 
      id: '1', 
      name: 'Dr. Rajesh Sharma', 
      specialization: 'General Dentistry',
      consultationFee: 800,
      isAvailableToday: true,
      workingHours: {
        monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        saturday: { isWorking: true, startTime: '09:00', endTime: '14:00' },
        sunday: { isWorking: false, startTime: '09:00', endTime: '18:00' }
      },
      timeSlots: { duration: 30, bufferTime: 5 }
    },
    { 
      id: '2', 
      name: 'Dr. Priya Patel', 
      specialization: 'Orthodontics',
      consultationFee: 1200,
      isAvailableToday: true,
      workingHours: {
        monday: { isWorking: true, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' },
        tuesday: { isWorking: false, startTime: '10:00', endTime: '16:00' },
        wednesday: { isWorking: true, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' },
        thursday: { isWorking: true, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' },
        friday: { isWorking: true, startTime: '10:00', endTime: '16:00', breakStart: '13:00', breakEnd: '14:00' },
        saturday: { isWorking: false, startTime: '10:00', endTime: '16:00' },
        sunday: { isWorking: false, startTime: '10:00', endTime: '16:00' }
      },
      timeSlots: { duration: 45, bufferTime: 10 }
    },
    { 
      id: '3', 
      name: 'Dr. Amit Singh', 
      specialization: 'Oral Surgery',
      consultationFee: 1500,
      isAvailableToday: false,
      workingHours: {
        monday: { isWorking: true, startTime: '14:00', endTime: '20:00', breakStart: '17:00', breakEnd: '18:00' },
        tuesday: { isWorking: true, startTime: '14:00', endTime: '20:00', breakStart: '17:00', breakEnd: '18:00' },
        wednesday: { isWorking: false, startTime: '14:00', endTime: '20:00' },
        thursday: { isWorking: true, startTime: '14:00', endTime: '20:00', breakStart: '17:00', breakEnd: '18:00' },
        friday: { isWorking: true, startTime: '14:00', endTime: '20:00', breakStart: '17:00', breakEnd: '18:00' },
        saturday: { isWorking: true, startTime: '09:00', endTime: '15:00', breakStart: '12:00', breakEnd: '13:00' },
        sunday: { isWorking: false, startTime: '14:00', endTime: '20:00' }
      },
      timeSlots: { duration: 60, bufferTime: 15 }
    }
  ];

  const [showTodaySchedulePopup, setShowTodaySchedulePopup] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState(
    doctorsWithSchedules.reduce((acc, doctor) => ({
      ...acc,
      [doctor.id]: doctor.isAvailableToday
    }), {})
  );

  const handleToggleDoctorAvailability = (doctorId: string) => {
    setDoctorAvailability(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
  };

  const handleManageSchedule = (doctorId: string, doctorName: string) => {
    setSelectedDoctorIdForSchedule(doctorId);
    setSelectedDoctorNameForSchedule(doctorName);
    setShowDoctorScheduleManager(true);
  };

  const handleSaveStaff = (staffData: any) => {
    if (selectedItemId) {
      setStaffMembers(prev => prev.map(s => s.id === selectedItemId ? staffData : s));
    } else {
      setStaffMembers(prev => [...prev, staffData]);
    }
    setShowDoctorForm(false);
    setSelectedItemId('');
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaffMembers(prev => prev.filter(s => s.id !== staffId));
  };

  const handleQuickAppointment = () => {
    setIsQuickBooking(true);
    setShowAppointmentForm(true);
  };

  const handleNewAppointment = () => {
    setIsQuickBooking(false);
    setShowAppointmentForm(true);
  };

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowPatientDetails(true);
  };

  const handleSendPaymentReminder = (patientId: string, amount: number) => {
    // In a real app, this would send SMS/WhatsApp/Email
    alert(`Payment reminder sent to patient ${patientId} for ₹${amount.toLocaleString()}`);
  };

  const handleSaveAppointment = (appointment: any) => {
    setAppointments(prev => [...prev, appointment]);
    setShowAppointmentForm(false);
    setIsQuickBooking(false);
  };

  const handleViewConsentForm = (formId: string) => {
    setSelectedItemId(formId);
    setShowConsentViewer(true);
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedItemId(invoiceId);
    setShowInvoiceViewer(true);
  };


  const handleViewTreatment = (treatmentId: string) => {
    setSelectedItemId(treatmentId);
    setShowTreatmentViewer(true);
  };

  const handleUpdateAppointmentStatus = (appointmentId: string, status: string) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status } : apt
    ));
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  const handleCheckInPatient = (appointment: any) => {
    // Move patient from appointments to diagnosis queue
    const queuedPatient = {
      id: appointment.id,
      appointmentId: appointment.id,
      patientName: appointment.patientName || appointment.patient,
      patientPhone: appointment.patientPhone || appointment.phone,
      appointmentTime: appointment.time,
      treatmentType: appointment.treatment || appointment.type,
      patientConcern: appointment.patientConcern || 'General consultation',
      checkInTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      status: 'waiting',
      notes: appointment.notes || '',
      patientHistory: {
        lastVisit: '2024-01-08',
        totalVisits: 5,
        medicalHistory: ['Diabetes Type 2'],
        allergies: ['Penicillin']
      }
    };
    
    // Add to diagnosis queue
    setQueuedPatients(prev => [...prev, queuedPatient]);
    
    // Update appointment status to checked-in
    setAppointments(prev => prev.map(apt => 
      apt.id === appointment.id ? { ...apt, status: 'checked-in' } : apt
    ));
    
    // Show success message
    alert(`${queuedPatient.patientName} has been checked in and added to the diagnosis queue.`);
  };
  const handleEditTreatment = (treatmentId: string) => {
    setSelectedItemId(treatmentId);
    setShowTreatmentForm(true);
  };

  const handleManageSessions = (treatmentId: string) => {
    setSelectedTreatmentId(treatmentId);
    setShowSessionManager(true);
  };

  const handleMarkCompleted = (treatmentId: string) => {
    setTreatments(prev => prev.map(t => 
      t.id === treatmentId ? { ...t, status: 'completed' } : t
    ));
  };

  const handleSaveTreatment = (treatment: any) => {
    if (selectedItemId) {
      setTreatments(prev => prev.map(t => t.id === selectedItemId ? treatment : t));
    } else {
      setTreatments(prev => [...prev, treatment]);
    }
    
    // Create appointments for each session if treatment has sessions
    if (treatment.sessions && treatment.sessions.length > 0) {
      const sessionAppointments = treatment.sessions
        .filter((session: any) => session.status === 'scheduled' || session.status === 'planned')
        .map((session: any) => ({
          id: `apt-${treatment.id}-${session.id}`,
          patientName: treatment.patientName,
          patientPhone: '+91 98765 43210', // Mock phone
          date: session.scheduledDate,
          time: '10:00', // Default time, can be customized
          duration: session.duration,
          type: `${treatment.procedure} - ${session.name}`,
          status: session.status === 'scheduled' ? 'scheduled' : 'planned',
          notes: `Session ${session.sessionNumber}: ${session.description}${session.notes ? '\n' + session.notes : ''}`,
          fee: session.cost,
          doctorId: treatment.doctorId,
          doctorName: treatment.doctorName,
          reminderSent: false,
          treatmentId: treatment.id,
          sessionId: session.id
        }));
      
      setAppointments(prev => [...prev, ...sessionAppointments]);
    }
    
    setShowTreatmentForm(false);
    setSelectedItemId('');
  };

  const handleSavePatient = (patient: any) => {
    setLoading(true);
    if (selectedPatientId) {
      setPatients(prev => prev.map(p => p.id === selectedPatientId ? patient : p));
    } else {
      setPatients(prev => [...prev, patient]);
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
    setShowPatientForm(false);
    setSelectedPatientId('');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your clinic today.</p>
            </div>
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TodayAppointments appointments={appointments} />
              <RecentPatients />
            </div>
          </div>
        );
      
      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-600 mt-1">Manage patient appointments and schedules</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-1 flex">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    viewMode === 'calendar'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('no-show')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    viewMode === 'no-show'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  No Show ({appointments.filter(apt => apt.status === 'no-show').length})
                </button>
              </div>
            </div>
            {viewMode === 'calendar' && <AppointmentCalendar onNewAppointment={handleNewAppointment} />}
            {viewMode === 'list' && (
              <AppointmentList 
                appointments={appointments.filter(apt => apt.status !== 'no-show')}
                onEditAppointment={(id) => console.log('Edit appointment:', id)}
                onDeleteAppointment={handleDeleteAppointment}
                onUpdateStatus={handleUpdateAppointmentStatus}
                onCheckInPatient={handleCheckInPatient}
              />
            )}
            {viewMode === 'no-show' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">No Show Appointments</h3>
                <AppointmentList 
                  appointments={appointments.filter(apt => apt.status === 'no-show')}
                  onEditAppointment={(id) => console.log('Edit appointment:', id)}
                  onDeleteAppointment={handleDeleteAppointment}
                  onUpdateStatus={handleUpdateAppointmentStatus}
                  onCheckInPatient={handleCheckInPatient}
                />
              </div>
            )}
          </div>
        );
      
      case 'profit-sharing':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profit Sharing Report</h1>
              <p className="text-gray-600 mt-1">Track doctor earnings and profit distribution</p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{treatments.reduce((sum, t) => sum + (t.cost || 0), 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Treatments</p>
                    <p className="text-3xl font-bold">{treatments.length}</p>
                  </div>
                  <Stethoscope className="w-8 h-8 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Active Doctors</p>
                    <p className="text-3xl font-bold">{doctorsWithSchedules.length}</p>
                  </div>
                  <User className="w-8 h-8 text-purple-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Profit Share</p>
                    <p className="text-3xl font-bold">₹{doctorsWithSchedules.reduce((sum, d) => {
                      const doctorTreatments = treatments.filter(t => t.doctorId === d.id);
                      const totalEarnings = doctorTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);
                      return sum + (totalEarnings * (d.profitPercentage || 0) / 100);
                    }, 0).toLocaleString()}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>
            
            {/* Doctor-wise Treatment Details */}
            <div className="space-y-6">
              {doctorsWithSchedules.map(doctor => {
                const doctorTreatments = treatments.filter(t => t.doctorId === doctor.id);
                const totalEarnings = doctorTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);
                const paidTreatments = doctorTreatments.filter(t => t.paymentStatus === 'paid');
                const pendingTreatments = doctorTreatments.filter(t => t.paymentStatus !== 'paid');
                const paidEarnings = paidTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);
                const pendingEarnings = pendingTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);
                const profitShare = (totalEarnings * (doctor.profitPercentage || 0) / 100);
                const paidProfitShare = (paidEarnings * (doctor.profitPercentage || 0) / 100);
                const pendingProfitShare = (pendingEarnings * (doctor.profitPercentage || 0) / 100);
                
                return (
                  <div key={doctor.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mr-4">
                            <Stethoscope className="w-8 h-8 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                            <p className="text-gray-600">{doctor.specialization}</p>
                            <p className="text-sm text-gray-500">Profit Share: {doctor.profitPercentage || 0}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">₹{paidProfitShare.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Paid Profit Share</div>
                          {pendingProfitShare > 0 && (
                            <div className="text-lg font-bold text-orange-600 mt-1">₹{pendingProfitShare.toLocaleString()}</div>
                          )}
                          {pendingProfitShare > 0 && (
                            <div className="text-sm text-orange-600">Pending</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{doctorTreatments.length}</div>
                          <div className="text-sm text-gray-600">Total Treatments</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">₹{totalEarnings.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Total Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">₹{paidEarnings.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Paid Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">₹{pendingEarnings.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Pending Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-600">₹{profitShare.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Total Profit Share</div>
                        </div>
                      </div>
                    </div>
                    
                    {doctorTreatments.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Treatment</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor Share</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Treatment Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {doctorTreatments.map(treatment => {
                              const doctorShare = (treatment.cost || 0) * (doctor.profitPercentage || 0) / 100;
                              const paymentStatus = treatment.paymentStatus || 'pending';
                              const paymentDate = treatment.paymentDate || null;
                              const dueDate = treatment.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                              
                              return (
                                <tr key={treatment.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-mono text-gray-900">
                                    PAT{treatment.patientId?.slice(-3) || '001'}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div>
                                      <div className="font-medium text-gray-900">{treatment.procedure}</div>
                                      <div className="text-sm text-gray-600">{treatment.tooth}</div>
                                      {treatment.notes && (
                                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{treatment.notes}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">{treatment.patientName}</td>
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {new Date(treatment.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    ₹{(treatment.cost || 0).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                      paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {paymentStatus.toUpperCase()}
                                    </span>
                                    {paymentStatus === 'pending' && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Due: {new Date(dueDate).toLocaleDateString()}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {paymentDate ? new Date(paymentDate).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="px-6 py-4 text-sm font-bold text-green-600">
                                    ₹{doctorShare.toLocaleString()}
                                    {paymentStatus !== 'paid' && (
                                      <div className="text-xs text-orange-600 mt-1">(Pending)</div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      treatment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      treatment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {treatment.status.replace('-', ' ').toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {doctorTreatments.length === 0 && (
                      <div className="text-center py-12">
                        <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No treatments yet</h3>
                        <p className="text-gray-600">This doctor hasn't performed any treatments yet.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Comprehensive clinic performance insights</p>
              </div>
              <button
                onClick={() => setCurrentPage('profit-sharing')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center shadow-lg transition-all duration-200"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Profit Sharing Report
              </button>
            </div>
            <ReportsDashboard />
          </div>
        );
      
      case 'doctor-queue':
      case 'patient-queue':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Diagnosis Queue</h1>
              <p className="text-gray-600 mt-1">Manage patients waiting for consultation</p>
            </div>
            <PatientQueue
              doctorName={state.user?.name || 'Doctor'}
              queuedPatients={queuedPatients.length > 0 ? queuedPatients : mockQueuedPatients}
              onSelectPatient={(patient) => {
                setSelectedPatientForConsultation(patient);
                setShowPatientConsultation(true);
              }}
              onUpdatePatientStatus={(patientId, newStatus) => {
                if (queuedPatients.length > 0) {
                  setQueuedPatients(prev => prev.map(p => 
                    p.id === patientId ? { ...p, status: newStatus } : p
                  ));
                }
              }}
            />
          </div>
        );
      
      case 'patients':
        return (
          <PatientList
            onAddPatient={() => setShowPatientForm(true)}
            onViewPatient={handleViewPatient}
            onEditPatient={(patientId) => {
              setSelectedPatientId(patientId);
              setShowPatientForm(true);
            }}
            onDeletePatient={(patientId) => {
              if (confirm('Are you sure you want to delete this patient?')) {
                console.log('Delete patient:', patientId);
                // In a real app, this would call an API to delete the patient
              }
            }}
          />
        );
      
      case 'treatments':
        return (
          <TreatmentList
            onAddTreatment={() => setShowTreatmentForm(true)}
            onViewTreatment={handleViewTreatment}
            onEditTreatment={handleEditTreatment}
            onManageSessions={handleManageSessions}
            onMarkCompleted={handleMarkCompleted}
          />
        );
      
      case 'billing':
        return (
          <InvoiceList 
            onCreateInvoice={() => setShowInvoiceForm(true)}
            onViewInvoice={handleViewInvoice}
          />
        );
      
      case 'inventory':
        return (
          <InventoryList onAddItem={() => setShowInventoryForm(true)} />
        );
      
      case 'consent':
        return (
          <ConsentFormList
            onAddForm={() => setShowConsentForm(true)}
            onViewForm={handleViewConsentForm}
          />
        );
      
      case 'staff':
        return (
          <DoctorManagement
            onAddDoctor={() => setShowDoctorForm(true)}
            onEditDoctor={(doctorId) => {
              setSelectedItemId(doctorId);
              setShowDoctorForm(true);
            }}
            onDeleteDoctor={handleDeleteStaff}
            onManageSchedule={handleManageSchedule}
          />
        );
      
      case 'emr':
        return (
          <EMRList
            onAddRecord={() => setShowEMRForm(true)}
            onViewRecord={(recordId) => {
              setSelectedItemId(recordId);
              setShowEMRViewer(true);
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        onQuickAppointment={handleQuickAppointment} 
        onShowTodaySchedule={() => setShowTodaySchedulePopup(true)}
      />
      
      <div className="flex flex-1">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            {renderPage()}
          </main>
        </div>
      </div>
      
      {/* Diagnose Form */}
      {showDiagnoseForm && selectedPatientForDiagnose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Patient Diagnosis Form</h2>
                <button
                  onClick={() => {
                    setShowDiagnoseForm(false);
                    setSelectedPatientForDiagnose(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Patient Information</h3>
                <p><strong>Name:</strong> {selectedPatientForDiagnose.patientName}</p>
                <p><strong>Treatment:</strong> {selectedPatientForDiagnose.treatmentType}</p>
                <p><strong>Concern:</strong> {selectedPatientForDiagnose.patientConcern}</p>
              </div>
              
              {/* Diagnosis Form */}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Patient Concern
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe patient's main concern..."
                    defaultValue={selectedPatientForDiagnose.patientConcern}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Consultation Notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="What was done during consultation and diagnosis..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Doctor's Suggestions
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Suggestions and recommendations given to patient..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Consultation Cost (₹)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter consultation fee"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medicine Prescribed
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="List prescribed medicines..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDiagnoseForm(false);
                      setSelectedPatientForDiagnose(null);
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    Save Diagnosis
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <MobileNav currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Modals */}
      {showPatientForm && (
        <PatientForm
          onClose={() => setShowPatientForm(false)}
          onSave={handleSavePatient}
          patient={selectedPatientId ? patients.find(p => p.id === selectedPatientId) : undefined}
        />
      )}
      
      {showAppointmentForm && (
        <AppointmentForm
          onClose={() => {
            setShowAppointmentForm(false);
            setIsQuickBooking(false);
          }}
          onSave={handleSaveAppointment}
          isQuickBooking={isQuickBooking}
          doctors={doctorsWithSchedules}
          doctorAvailability={doctorAvailability}
        />
      )}
      
      {showInvoiceForm && (
        <InvoiceForm
          onClose={() => setShowInvoiceForm(false)}
          onSave={(invoice) => {
            setInvoices(prev => [...prev, invoice]);
            setShowInvoiceForm(false);
          }}
        />
      )}
      
      {showConsentForm && (
        <ConsentForm
          onClose={() => setShowConsentForm(false)}
          onSave={(form) => {
            console.log('Save consent form:', form);
            setShowConsentForm(false);
          }}
        />
      )}
      
      {showInventoryForm && (
        <InventoryForm
          onClose={() => setShowInventoryForm(false)}
          onSave={(item) => {
            console.log('Save inventory item:', item);
            setShowInventoryForm(false);
          }}
        />
      )}
      
      {showTreatmentForm && (
        <TreatmentForm
          onClose={() => setShowTreatmentForm(false)}
          onSave={handleSaveTreatment}
          treatment={selectedItemId ? treatments.find(t => t.id === selectedItemId) : undefined}
        />
      )}
      
      {showPatientDetails && (
        <PatientDetails
          patientId={selectedPatientId}
          onClose={() => setShowPatientDetails(false)}
          onSendReminder={handleSendPaymentReminder}
        />
      )}
      
      {showEMRForm && (
        <EMRForm
          onClose={() => setShowEMRForm(false)}
          onSave={(record) => {
            setEmrRecords(prev => [...prev, record]);
            setShowEMRForm(false);
          }}
        />
      )}
      
      {/* Viewers */}
      {showConsentViewer && (
        <ConsentFormViewer
          formId={selectedItemId}
          onClose={() => setShowConsentViewer(false)}
        />
      )}
      
      {showInvoiceViewer && (
        <InvoiceViewer
          invoiceId={selectedItemId}
          onClose={() => setShowInvoiceViewer(false)}
        />
      )}
      
      {showEMRViewer && (
        <EMRViewer
          recordId={selectedItemId}
          onClose={() => setShowEMRViewer(false)}
        />
      )}
      
      {showTreatmentViewer && (
        <TreatmentViewer
          treatmentId={selectedItemId}
          onClose={() => setShowTreatmentViewer(false)}
        />
      )}
      
      {showDoctorForm && (
        <DoctorForm
          onClose={() => {
            setShowDoctorForm(false);
            setSelectedItemId('');
          }}
          onSave={handleSaveStaff}
          doctor={selectedItemId ? staffMembers.find(s => s.id === selectedItemId) : undefined}
        />
      )}
      
      {showSessionManager && (
        <TreatmentSessionManager
          treatmentId={selectedTreatmentId}
          patientName={treatments.find(t => t.id === selectedTreatmentId)?.patientName || "Patient Name"}
          procedure={treatments.find(t => t.id === selectedTreatmentId)?.procedure || "Treatment Procedure"}
          existingSessions={treatments.find(t => t.id === selectedTreatmentId)?.sessions || []}
          onScheduleAppointment={(sessionData) => {
            setAppointments(prev => [...prev, sessionData]);
          }}
          onClose={() => {
            setShowSessionManager(false);
            setSelectedTreatmentId('');
            setSelectedItemId('');
          }}
        />
      )}
      
      {showDoctorScheduleManager && (
        <DoctorScheduleManager
          doctorId={selectedDoctorIdForSchedule}
          doctorName={selectedDoctorNameForSchedule}
          onClose={() => {
            setShowDoctorScheduleManager(false);
            setSelectedDoctorIdForSchedule('');
            setSelectedDoctorNameForSchedule('');
          }}
          onSave={(schedule) => {
            console.log('Save doctor schedule:', schedule);
            // Update the doctor's schedule in the doctors array
            const updatedDoctors = doctorsWithSchedules.map(doctor => 
              doctor.id === selectedDoctorIdForSchedule 
                ? { ...doctor, workingHours: schedule.workingHours, timeSlots: schedule.timeSlots }
                : doctor
            );
            // In a real app, you would save this to your backend
            setShowDoctorScheduleManager(false);
            setSelectedDoctorIdForSchedule('');
            setSelectedDoctorNameForSchedule('');
          }}
          currentSchedule={doctorsWithSchedules.find(d => d.id === selectedDoctorIdForSchedule)?.workingHours}
        />
      )}
      
      {showTodaySchedulePopup && (
        <TodaySchedulePopup
          onClose={() => setShowTodaySchedulePopup(false)}
          appointments={appointments}
          doctors={doctorsWithSchedules}
          doctorAvailability={doctorAvailability}
          onToggleDoctorAvailability={handleToggleDoctorAvailability}
        />
      )}
      
      {showPatientConsultation && selectedPatientForConsultation && (
        <PatientConsultation
          patient={selectedPatientForConsultation}
          onClose={() => {
            setShowPatientConsultation(false);
            setSelectedPatientForConsultation(null);
          }}
          onCompleteConsultation={(consultationData) => {
            console.log('Consultation completed:', consultationData);
            
            // Save EMR record
            if (consultationData.emrRecord) {
              setEmrRecords(prev => [...prev, { ...consultationData.emrRecord, id: Date.now().toString() }]);
            }
            
            // Save invoice
            if (consultationData.invoice) {
              setInvoices(prev => [...prev, { ...consultationData.invoice, id: `INV-${Date.now()}` }]);
            }
            
            // Schedule follow-up appointment
            if (consultationData.followUpAppointment) {
              setAppointments(prev => [...prev, { ...consultationData.followUpAppointment, id: Date.now().toString() }]);
            }
            
            // Send notification (simulate)
            if (consultationData.patientNotification) {
              alert(`Notification sent to ${consultationData.patientNotification.split('\n')[0].replace('Dear ', '').replace(',', '')}:\n\n${consultationData.patientNotification}`);
            }
            
            // Update patient status to completed
            if (queuedPatients.length > 0) {
              setQueuedPatients(prev => prev.map(p => 
                p.id === consultationData.patientId ? { ...p, status: 'completed' } : p
              ));
            }
            
            setShowPatientConsultation(false);
            setSelectedPatientForConsultation(null);
          }}
          onCreateTreatment={(treatmentData) => {
            setTreatments(prev => [...prev, { ...treatmentData, id: Date.now().toString() }]);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AuthenticatedApp />
      </AppProvider>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return <LoginForm />;
  }

  return <MainApp />;
}

export default App;