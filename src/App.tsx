import React, { useEffect, useState } from 'react';
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
// import { ConsultationHistory } from "./components/Reports/ConsultationHistory";

function MainApp() {
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [patients, setPatients] = useState<any[]>(() => {
  const stored = localStorage.getItem("patients");
  return stored ? JSON.parse(stored) : [];
});

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
  const cleanOldAppointments = (appointments) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize

  return appointments.filter(a => {
    const apptDate = new Date(a.date);
    apptDate.setHours(0, 0, 0, 0);

    return apptDate >= today; 
  });
};
const [appointments, setAppointments] = useState(() => {
  try {
    const stored = localStorage.getItem("appointments");
    const parsed = stored ? JSON.parse(stored) : [];

    return cleanOldAppointments(parsed);
  } catch {
    return [];
  }
});
const today = new Date()

const todayAppointments = appointments.filter(a => {
  const d = new Date(a.date)
  return d.toDateString() === today.toDateString()
})
// const listCount = todayAppointments.length;
const listCount = appointments.filter(
  a => a.status !== 'no-show'
).length;

  const [showConsentViewer, setShowConsentViewer] = useState(false);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [showTreatmentViewer, setShowTreatmentViewer] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
  const [treatments, setTreatments] = useState<any[]>([]);

  const [showDoctorScheduleManager, setShowDoctorScheduleManager] = useState(false);
  const [selectedDoctorIdForSchedule, setSelectedDoctorIdForSchedule] = useState('');
  const [selectedDoctorNameForSchedule, setSelectedDoctorNameForSchedule] = useState('');
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [queuedPatients, setQueuedPatients] = useState<any[]>(() => {
  try {
    const stored = localStorage.getItem("queuedPatients");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
});
const handleDeleteInvoice = (id: string) => {
  if (window.confirm("Are you sure you want to delete this invoice?")) {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  }
};
  const [showPatientConsultation, setShowPatientConsultation] = useState(false);
  const [selectedPatientForConsultation, setSelectedPatientForConsultation] = useState<any>(null);
  const [showEMRForm, setShowEMRForm] = useState(false);
  const [showEMRViewer, setShowEMRViewer] = useState(false);
  const [emrRecords, setEmrRecords] = useState<any[]>([]);
 const [invoices, setInvoices] = useState<any[]>(() => {
  const stored = localStorage.getItem("invoices");
  return stored ? JSON.parse(stored) : [];
});
  const [showDiagnoseForm, setShowDiagnoseForm] = useState(false);
  const [selectedPatientForDiagnose, setSelectedPatientForDiagnose] = useState<any>(null);
  const [viewMode, setViewMode] = useState('calendar');
const [patientFormType, setPatientFormType] = useState<'normal' | 'person'>('normal');
const [parentPatientId, setParentPatientId] = useState('');
const selectedPatient = patients.find(p => p.id === selectedPatientId);
const handleUpdateInvoiceStatus = (id: string, status: string) => {
  setInvoices(prev =>
    prev.map(inv =>
      inv.id === id ? { ...inv, status } : inv
    )
  );
};
const familyMembers = patients.filter(p => {
  if (!selectedPatient) return false;

  const parentId = selectedPatient.parentId || selectedPatient.id;

  return (
    p.id !== selectedPatient.id && ( // khud ko exclude karo
      p.parentId === parentId ||     // siblings + children
      p.id === parentId              // parent
    )
  );
});
useEffect(() => {
  localStorage.setItem("patients", JSON.stringify(patients));
}, [patients]);
useEffect(() => {
  const cleaned = cleanOldAppointments(appointments);
  localStorage.setItem("appointments", JSON.stringify(cleaned));
}, [appointments]);
useEffect(() => {
  localStorage.setItem("queuedPatients", JSON.stringify(queuedPatients));
}, [queuedPatients]);
useEffect(() => {
  localStorage.setItem("invoices", JSON.stringify(invoices));
}, [invoices]);
useEffect(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  let changed = false;

  const updatedInvoices = invoices.map(inv => {
    const due = new Date(inv.dueDate); 
    due.setHours(0, 0, 0, 0); 

    if (inv.status !== 'paid' && due < today && inv.status !== 'overdue') {
      changed = true;
      return { ...inv, status: 'overdue' };
    }

    return inv;
  });

  if (changed) {
    setInvoices(updatedInvoices);
  }
}, [invoices]);

const handleSendReminder = (patientId: string, amount: number) => {
  console.log("Reminder sent to:", patientId, "Amount:", amount);

  // optional UI feedback
  alert(`Reminder sent for ₹${amount}`);
};

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
     setSelectedAppointment(null); 
    setIsQuickBooking(true);
    setShowAppointmentForm(true);
  };
const [selectedDate, setSelectedDate] = useState(null)

const handleNewAppointment = (date?) => {
  setSelectedAppointment(null); 
  setSelectedDate(date || null)
  setIsQuickBooking(false)
  setShowAppointmentForm(true)
}

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowPatientDetails(true);
  };

  const handleSendPaymentReminder = (patientId: string, amount: number) => {
    // In a real app, this would send SMS/WhatsApp/Email
    alert(`Payment reminder sent to patient ${patientId} for ₹${amount.toLocaleString()}`);
  };

const handleSaveAppointment = (appointment: any) => {
  setAppointments(prev => {
    const existing = prev.find(a => a.id === appointment.id)

    if (existing) {
      return prev.map(a => a.id === appointment.id ? appointment : a)
    }

    return [...prev, appointment]
  })

  setShowAppointmentForm(false)
  setSelectedAppointment(null)
}

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
  const formatTime = (time: string) => {
  if (!time) return '';

  if (time.includes('AM') || time.includes('PM')) return time;

  const cleanTime = time.replace('.', ':');
  const [h, m] = cleanTime.split(':');

  let hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;

  return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
};

  const handleUpdateAppointmentStatus = (appointmentId: string, status: string) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status } : apt
    ));
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };
  const [prefillPatientData, setPrefillPatientData] = useState<any>(null);
  const [showCreatePatientPopup, setShowCreatePatientPopup] = useState(false);
const [missingPatientData, setMissingPatientData] = useState<any>(null);

const normalizePhone = (phone: string) => phone?.replace(/\D/g, '');

  const handleCheckInPatient = (appointment: any) => {
    const appointmentPhone = normalizePhone(
    appointment.patientPhone || appointment.phone
  );

  const existingPatient = patients.find(
    p => normalizePhone(p.phone) === appointmentPhone
  );

  // Patient NOT found
  if (!existingPatient) {
    setMissingPatientData({
      name: appointment.patientName || appointment.patient,
      phone: appointment.patientPhone || appointment.phone,
    });

    setShowCreatePatientPopup(true);
    return;
  }
    // Move patient from appointments to diagnosis queue
    const queuedPatient = {
      id: appointment.id,
      appointmentId: appointment.id,
      patientName: appointment.patientName || appointment.patient,
      patientPhone: appointment.patientPhone || appointment.phone,
      appointmentTime: formatTime(appointment.time),
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
  
  
   setQueuedPatients(prev => {
  const alreadyExists = prev.some(p => p.id === appointment.id);
  if (alreadyExists) return prev; 

  return [...prev, queuedPatient];
});
    
    // Update appointment status to checked-in
  setAppointments(prev =>
    prev.map(a =>
      a.id === appointment.id
        ? { ...a, status: 'checked-in' }
        : a
    )
  );
    
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
  const [completedConsultations, setCompletedConsultations] = useState(() => {
  const stored = localStorage.getItem("completedConsultations");
  return stored ? JSON.parse(stored) : [];
});
useEffect(() => {
  localStorage.setItem(
    "completedConsultations",
    JSON.stringify(completedConsultations)
  );
}, [completedConsultations]);
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

const handleSavePatient = (patient) => {
  setPrefillPatientData(null); 
  setPatients(prev => {
    const existing = prev.find(p => p.id === patient.id);

    const updatedPatient = {
      ...patient,

      isPerson: existing
        ? existing.isPerson
        : patientFormType === 'person',

      parentId: existing
        ? existing.parentId
        : (patientFormType === 'person' ? parentPatientId : null),
      prescriptionHistory: existing?.prescriptionHistory || [],
      documents: existing?.documents || []
    };

    if (existing) {
      return prev.map(p => p.id === patient.id ? updatedPatient : p);
    }

    return [...prev, updatedPatient];
  });

  setShowPatientForm(false);
};
  const handleDeletePatient = (patientId: string) => {
  setPatients(prev => prev.filter(p => p.id !== patientId));
};

  const renderPage = () => {
    switch (currentPage) {
  //     case 'consultation-history':
  // return <ConsultationHistory />;
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
                  List ({listCount})
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
            {viewMode === 'calendar' && <AppointmentCalendar onNewAppointment={handleNewAppointment} appointments={appointments} />}
            {viewMode === 'list' && (
              
              <AppointmentList 
                appointments={appointments.filter(apt => apt.status !== 'no-show')}
onEditAppointment={(id) => {
  const apt = appointments.find(a => a.id === id)
  setSelectedAppointment(apt)
  setShowAppointmentForm(true)
}}
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
                  onEditAppointment={(id) => {
  const apt = appointments.find(a => a.id === id)
  setSelectedAppointment(apt)
  setShowAppointmentForm(true)
}}
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
              queuedPatients={queuedPatients}
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
            patients={patients}  
onAddPatient={(type, patientId) => {
  if (type === 'person') {
    setParentPatientId(patientId); 
  }

  setSelectedPatientId('');
  setPatientFormType(type === 'person' ? 'person' : 'normal');
  setShowPatientForm(true);
}}
            onViewPatient={handleViewPatient}
            onEditPatient={(patientId) => {
              setSelectedPatientId(patientId);
              setShowPatientForm(true);
            }}
onDeletePatient={(patientId) => {
  if (confirm('Are you sure you want to delete this patient?')) {
    handleDeletePatient(patientId); 
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
           invoices={invoices} 
            onCreateInvoice={() => setShowInvoiceForm(true)}
            onViewInvoice={handleViewInvoice}
            onDeleteInvoice={handleDeleteInvoice}
             onUpdateStatus={handleUpdateInvoiceStatus}
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
  <div className="min-h-screen bg-gray-50">
    <Header 
      onQuickAppointment={handleQuickAppointment} 
      onShowTodaySchedule={() => setShowTodaySchedulePopup(true)}
    />
    
    <div className="flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="flex-1 min-w-0">
        <main className="p-4 md:p-6 pb-20 md:pb-6">
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
patient={
  patientFormType === 'person'
    ? undefined   
    : patients.find(p => p.id === selectedPatientId)
}
    type={patientFormType} 
    prefillData={prefillPatientData}
  />
)}
      
      {showAppointmentForm && (
        <AppointmentForm
          onClose={() => {
            setShowAppointmentForm(false);
            setIsQuickBooking(false);
            setSelectedAppointment(null);
          }}
          onSave={handleSaveAppointment}
          appointment={selectedAppointment}  
          isQuickBooking={isQuickBooking}
          doctors={doctorsWithSchedules}
          doctorAvailability={doctorAvailability}
          appointments={appointments}
          selectedDate={selectedDate}
        />
      )}
{showCreatePatientPopup && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div
      className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
      style={{ animation: 'modalPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>

      {/* ── Top accent bar + icon ── */}
      <div className="bg-gradient-to-r from-[#349edb] to-[#005ba5] px-6 pt-6 pb-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            {/* User-search icon */}
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">Patient Not Found</h2>
            <p className="text-white/75 text-xs mt-0.5">Patient is not registered</p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5">

        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          This patient is not in the system. Review the details below and create a new record to continue.
        </p>

        {/* Data card */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100 mb-5 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="w-7 h-7 rounded-full bg-[#e6f4f1] flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-[#1a6b5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{missingPatientData?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="w-7 h-7 rounded-full bg-[#e6f4f1] flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-[#005ba5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
              <p className="text-sm font-semibold text-gray-800">{missingPatientData?.phone}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowCreatePatientPopup(false)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors duration-150"
          >
            Cancel
          </button>
<button
  onClick={() => {
    setShowCreatePatientPopup(false);
    setPrefillPatientData(missingPatientData);
    setCurrentPage('patients');
    setSelectedPatientId('');
    setShowPatientForm(true);
  }}
  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
  style={{ backgroundColor: '#005ba5' }}
>
  + Create Patient
</button>
        </div>

      </div>
    </div>
  </div>
)}
      
      {showInvoiceForm && (
        <InvoiceForm
          onClose={() => setShowInvoiceForm(false)}
onSave={(invoice) => {
  const newInvoice = {
    ...invoice,
    amount: invoice.total
  };

  setInvoices(prev => [newInvoice, ...prev]);

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
      
{showPatientDetails && selectedPatient && (
<PatientDetails
  patient={selectedPatient}
  familyMembers={familyMembers} 
  onClose={() => setShowPatientDetails(false)}
  onSendReminder={handleSendReminder} 
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
          onUpdateStatus={handleUpdateInvoiceStatus}
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
const patient = queuedPatients.find(p => p.id === consultationData.patientId);

if (patient) {
const newRecord = {
  id: Date.now(),

  // patient info
  patientId: patient.id,
  patientName: patient.patientName,
  phone: patient.patientPhone,
  treatmentType: patient.treatmentType,

  diagnosis: consultationData.diagnosis,
  observations: consultationData.observations,
  treatmentPlan: consultationData.treatmentPlan,

  prescriptions: consultationData.prescriptions || [],
  consultationNotes: consultationData.consultationNotes,
  treatmentCost: consultationData.treatmentCost,         
  followUpDate: consultationData.followUpDate,           
  followUpRequired: consultationData.followUpRequired,  

  images: consultationData.images || [],

  completedAt: new Date().toISOString(),
};

 setCompletedConsultations(prev => [...prev, newRecord]);
}
  // setCompletedConsultations(prev => {
  // const updated = [...prev, newRecord];

  // localStorage.setItem("completedConsultations", JSON.stringify(updated));

//   return updated;
// });
// }

// remove from queue
setQueuedPatients(prev =>
  prev.filter(p => p.id !== consultationData.patientId)
);
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