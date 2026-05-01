import React, { useState, useEffect } from 'react';
import { Search, Clock, User, Phone, MessageSquare, Stethoscope, CheckCircle, AlertTriangle, Calendar, FileText, History, UserPlus, Heart, ShieldAlert, Activity } from 'lucide-react';
import ConsultationHistoryModal from './ConsultationHistoryModal';
import { DirectConsultationPopup } from './DirectConsultationPopup';

// Calculate age from DOB
const calcAge = (dob: string) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
};

// Live waiting time
function useWaitingTime(checkInTime: string) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const compute = () => {
      if (!checkInTime) { setLabel(''); return; }
      const [h, m] = checkInTime.split(':').map(Number);
      const now = new Date();
      const checkin = new Date();
      checkin.setHours(h, m, 0, 0);
      const diff = Math.max(0, Math.floor((now.getTime() - checkin.getTime()) / 60000));
      if (diff < 60) setLabel(`${diff} min`);
      else setLabel(`${Math.floor(diff / 60)}h ${diff % 60}m`);
    };
    compute();
    const t = setInterval(compute, 60000);
    return () => clearInterval(t);
  }, [checkInTime]);
  return label;
}

// Individual card component so each has its own hook
function QueueCard({ patient, fullPatient, getStatusColor, getStatusIcon, onUpdatePatientStatus, onSelectPatient }: {
  patient: any; fullPatient: any; getStatusColor: (s: string) => string; getStatusIcon: (s: string) => JSX.Element;
  onUpdatePatientStatus: (id: string, s: string) => void; onSelectPatient: (p: any) => void;
}) {
  const waitingTime = useWaitingTime(patient.checkInTime);
  const age = fullPatient ? calcAge(fullPatient.dateOfBirth) : null;
  const gender = fullPatient?.gender || '';
  const medHistory: string[] = fullPatient?.medicalHistory
    ? (Array.isArray(fullPatient.medicalHistory) ? fullPatient.medicalHistory : fullPatient.medicalHistory.split('\n').filter(Boolean))
    : [];
  const allergies: string[] = fullPatient?.allergies
    ? (Array.isArray(fullPatient.allergies) ? fullPatient.allergies : fullPatient.allergies.split('\n').filter(Boolean))
    : [];

  return (
    <div className="card-hover p-4">
      {/* Patient Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md text-white ${patient.status === 'waiting' ? 'bg-yellow-500' : patient.status === 'in-consultation' ? 'bg-blue-500' : 'bg-green-500'}`}>
              {getStatusIcon(patient.status)}
            </div>
          </div>
          <div className="ml-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-lg">{patient.patientName}</h3>
              {fullPatient?.category && fullPatient.category !== 'regular' && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase border border-amber-200">
                  {fullPatient.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* {age !== null && <span className="text-sm text-gray-500">{age} yrs</span>} */}
              {age !== null && gender && <span className="text-gray-300"></span>}
              {gender && (
                <span className="text-sm text-gray-500">
                  Gender: <span className="capitalize">{gender}</span>
                </span>
              )}
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border mt-1 ${getStatusColor(patient.status)}`}>
              {getStatusIcon(patient.status)}
              <span className="ml-1">{patient.status.replace('-', ' ').toUpperCase()}</span>
            </span>
          </div>
        </div>
        {/* Appointment time */}
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-blue-600">{patient.appointmentTime}</div>
          <div className="text-xs text-gray-400 mt-0.5">Check-in: {patient.checkInTime}</div>
          {patient.status === 'waiting' && waitingTime && (
            <div className="flex items-center justify-end gap-1 mt-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-bold text-amber-600">{waitingTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact & Concern */}
      <div className="space-y-3 mb-4">

        <div className="flex items-start text-sm">
          <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-gray-700">{patient.patientPhone}</p>
          </div>
        </div>

        <div className="flex items-start text-sm">
          <Stethoscope className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Treatment Type</p>
            <p className="font-medium text-gray-900">
              {patient.treatmentType || '—'}
            </p>
          </div>
        </div>

        {patient.patientConcern && (
          <div className="flex items-start text-sm">
            <MessageSquare className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Patient Concern</p>
              <p className="text-gray-600 line-clamp-2">
                {patient.patientConcern}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Medical Alerts — matches PatientList style */}
      {(medHistory.length > 0 || allergies.length > 0) && (
        <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-800">Medical Alerts</span>
          </div>
          {allergies.length > 0 && (
            <div className="text-xs text-red-700 mb-1">
              <strong>Allergies:</strong> {allergies.slice(0, 3).join(', ')}{allergies.length > 3 && ` +${allergies.length - 3} more`}
            </div>
          )}
          {medHistory.length > 0 && (
            <div className="text-xs text-orange-700">
              <strong>Conditions:</strong> {medHistory.slice(0, 2).join(', ')}{medHistory.length > 2 && ` +${medHistory.length - 2} more`}
            </div>
          )}
        </div>
      )}

      {/* Stats row — matches PatientList */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="text-lg font-bold text-blue-600">{fullPatient?.totalVisits ?? 0}</div>
          <div className="text-xs text-blue-700 font-bold uppercase tracking-wider">Visits</div>
        </div>
        <div className="text-center p-3 bg-green-50/50 rounded-xl border border-green-100">
          <div className="text-lg font-bold text-green-600">{age ?? 'N/A'}</div>
          <div className="text-xs text-green-700 font-bold uppercase tracking-wider">Age</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-200">
        {patient.status === 'waiting' && (
          <button
            onClick={() => { onUpdatePatientStatus(patient.id, 'in-consultation'); onSelectPatient(patient); }}
            className="btn-primary w-full justify-center"
          >
            <Stethoscope className="w-4 h-4" />
            Start Consultation
          </button>
        )}
        {patient.status === 'in-consultation' && (
          <button
            onClick={() => onSelectPatient(patient)}
            className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <FileText className="w-4 h-4" />
            Continue Consultation
          </button>
        )}
        {patient.status === 'completed' && (
          <span className="w-full py-2.5 bg-green-100 text-green-800 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Consultation Completed
          </span>
        )}
      </div>
    </div>
  );
}

interface QueuedPatient {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  appointmentTime: string;
  treatmentType: string;
  patientConcern: string;
  checkInTime: string;
  status: 'waiting' | 'in-consultation' | 'completed';
  notes?: string;
  patientHistory?: {
    lastVisit?: string;
    totalVisits: number;
    medicalHistory: string[];
    allergies: string[];
  };
}

interface PatientQueueProps {
  doctorName: string;
  queuedPatients: QueuedPatient[];
  onSelectPatient: (patient: QueuedPatient) => void;
  onUpdatePatientStatus: (patientId: string, status: string) => void;
  onDirectConsultation: (name: string, phone: string, doctorId?: string, doctorName?: string, time?: string) => void;
  onRegisterNew: (name: string, phone: string) => void;
  patients: any[];
  doctors: any[];
  appointments: any[];
  doctorAvailability: { [key: string]: boolean };
}

export function PatientQueue({
  doctorName,
  queuedPatients,
  onSelectPatient,
  onUpdatePatientStatus,
  onDirectConsultation,
  onRegisterNew,
  patients,
  doctors,
  appointments,
  doctorAvailability
}: PatientQueueProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [showDirectPopup, setShowDirectPopup] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-consultation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'in-consultation': return <Stethoscope className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const safe = (val: any) => (val || '').toString().toLowerCase();

  const filteredPatients = queuedPatients.filter(patient => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      safe(patient.patientName).includes(search) ||
      safe(patient.treatmentType).includes(search) ||
      safe(patient.patientConcern).includes(search);

    const matchesFilter =
      filterStatus === 'all' || patient.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const waitingCount = queuedPatients.filter(p => p.status === 'waiting').length;
  const inConsultationCount = queuedPatients.filter(p => p.status === 'in-consultation').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Consultation Queue</h1>
          <p className="page-subtitle">
            Dr. {doctorName} &nbsp;·&nbsp;
            <span className="text-amber-600 font-semibold">{waitingCount} waiting</span>
            &nbsp;·&nbsp;
            <span className="text-blue-600 font-semibold">{inConsultationCount} in consultation</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
          <div className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name, treatment, or concern..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          {['all', 'waiting', 'in-consultation', 'completed'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={filterStatus === s ? 'filter-tab-active' : 'filter-tab'}>
              {s === 'all' ? 'All' : s === 'in-consultation' ? 'Consulting' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowDirectPopup(true)}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          Direct Consultation
        </button>

        <button
          onClick={() => setShowHistory(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => {
          const fullPatient = patients.find(
            p => p.phone === patient.patientPhone || p.name === patient.patientName
          );
          return (
            <QueueCard
              key={patient.id}
              patient={patient}
              fullPatient={fullPatient}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              onUpdatePatientStatus={onUpdatePatientStatus}
              onSelectPatient={onSelectPatient}
            />
          );
        })}
      </div>

      {showDirectPopup && (
        <DirectConsultationPopup
          onClose={() => setShowDirectPopup(false)}
          patients={patients}
          doctors={doctors}
          appointments={appointments}
          doctorAvailability={doctorAvailability}
          onPatientFound={(p, doctorId, doctorName, time) => {
            setShowDirectPopup(false);
            onDirectConsultation(p.name, p.phone, doctorId, doctorName, time);
          }}
          onRegisterNew={(name, phone) => {
            setShowDirectPopup(false);
            onRegisterNew(name, phone);
          }}
        />
      )}

      {showHistory && (
        <ConsultationHistoryModal
          onClose={() => setShowHistory(false)}
          patients={patients}
        />
      )}

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="card">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="empty-state-title">No patients in queue</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Patients will appear here once they check in for their appointments.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
