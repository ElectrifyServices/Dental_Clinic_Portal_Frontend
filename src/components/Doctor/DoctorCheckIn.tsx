import React, { useState } from 'react';
import { Search, Clock, User, Phone, MessageSquare, Stethoscope, CheckCircle, AlertCircle, Calendar, FileText } from 'lucide-react';

interface CheckedInPatient {
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

const checkedInPatients: CheckedInPatient[] = [
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
    patientHistory: {
      lastVisit: '2024-01-05',
      totalVisits: 8,
      medicalHistory: ['Previous root canal'],
      allergies: []
    }
  }
];

interface DoctorCheckInProps {
  doctorName: string;
  onSelectPatient: (patient: CheckedInPatient) => void;
}

export function DoctorCheckIn({ doctorName, onSelectPatient }: DoctorCheckInProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [patients, setPatients] = useState(checkedInPatients);

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
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const updatePatientStatus = (patientId: string, newStatus: string) => {
    setPatients(prev => prev.map(patient => 
      patient.id === patientId ? { ...patient, status: newStatus } : patient
    ));
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientConcern.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const waitingCount = patients.filter(p => p.status === 'waiting').length;
  const inConsultationCount = patients.filter(p => p.status === 'in-consultation').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Doctor Check-In Dashboard</h2>
            <p className="text-gray-600 mt-1">Welcome, {doctorName} - Manage your checked-in patients</p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">{waitingCount} Waiting</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">{inConsultationCount} In Consultation</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}</div>
            <div className="text-sm text-gray-600">{new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, treatment, or concern..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Patients</option>
            <option value="waiting">Waiting</option>
            <option value="in-consultation">In Consultation</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Patient Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900 text-lg">{patient.patientName}</h3>
                  <p className="text-sm text-gray-600">{patient.appointmentId}</p>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border mt-1 ${getStatusColor(patient.status)}`}>
                    {getStatusIcon(patient.status)}
                    <span className="ml-1">{patient.status.replace('-', ' ').toUpperCase()}</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{patient.appointmentTime}</div>
                <div className="text-sm text-gray-500">Check-in: {patient.checkInTime}</div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{patient.patientPhone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Stethoscope className="w-4 h-4 text-gray-400 mr-3" />
                <span className="font-medium text-gray-900">{patient.treatmentType}</span>
              </div>
              <div className="flex items-start text-sm">
                <MessageSquare className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700 mb-1">Patient Concern:</p>
                  <p className="text-gray-600 line-clamp-3">{patient.patientConcern}</p>
                </div>
              </div>
            </div>

            {/* Medical History */}
            {patient.patientHistory && (
              <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-800">Medical History</span>
                </div>
                <div className="space-y-1">
                  {patient.patientHistory.allergies.length > 0 && (
                    <div className="text-xs text-red-700">
                      <strong>Allergies:</strong> {patient.patientHistory.allergies.join(', ')}
                    </div>
                  )}
                  {patient.patientHistory.medicalHistory.length > 0 && (
                    <div className="text-xs text-orange-700">
                      <strong>Conditions:</strong> {patient.patientHistory.medicalHistory.join(', ')}
                    </div>
                  )}
                  <div className="text-xs text-gray-600">
                    <strong>Visits:</strong> {patient.patientHistory.totalVisits} | 
                    <strong> Last Visit:</strong> {patient.patientHistory.lastVisit ? new Date(patient.patientHistory.lastVisit).toLocaleDateString() : 'First visit'}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                {patient.status === 'waiting' && (
                  <button
                    onClick={() => {
                      updatePatientStatus(patient.id, 'in-consultation');
                      onSelectPatient(patient);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 font-medium text-sm transition-all duration-200 flex items-center"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Start Consultation
                  </button>
                )}
                {patient.status === 'in-consultation' && (
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-sm transition-all duration-200 flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Continue Consultation
                  </button>
                )}
                {patient.status === 'completed' && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Consultation Completed
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Waiting: {Math.floor((new Date().getTime() - new Date(`2024-01-15 ${patient.checkInTime}`).getTime()) / (1000 * 60))} min
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No checked-in patients</h3>
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