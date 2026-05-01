import React, { useState } from 'react';
import { Search, Plus, Filter, User, Phone, Calendar, MoreVertical, Edit, Trash2, QrCode, Download, Eye, UserCheck, UserX, Mail, MapPin, Heart, AlertTriangle, UserPlus, Building2 } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalVisits: number;
  outstandingBalance: number;
  status: 'active' | 'inactive' | 'new';
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  medicalHistory?: string[];
  allergies?: string[];
  avatar?: string;
  isPerson?: boolean;
  createdAt?: string;
  deactivatedAt?: string;
  category?: string;
  barcode?: string;
}

// const patients: Patient[] = [
//   { 
//     id: 'PAT001', 
//     name: 'Rajesh Kumar', 
//     phone: '+91 98765 43210', 
//     email: 'rajesh@email.com', 
//     lastVisit: '2024-01-10', 
//     totalVisits: 5, 
//     outstandingBalance: 0, 
//     status: 'active',
//     dateOfBirth: '1985-06-15',
//     gender: 'male',
//     address: '123 MG Road, Bangalore',
//     medicalHistory: ['Diabetes Type 2', 'Hypertension'],
//     allergies: ['Penicillin'],
//     barcode: '*PAT001*'
//   },
//   { 
//     id: 'PAT002', 
//     name: 'Priya Sharma', 
//     phone: '+91 87654 32109', 
//     email: 'priya@email.com', 
//     lastVisit: '2024-01-15', 
//     totalVisits: 1, 
//     outstandingBalance: 1500, 
//     status: 'new',
//     dateOfBirth: '1992-03-22',
//     gender: 'female',
//     address: '456 Brigade Road, Bangalore',
//     medicalHistory: [],
//     allergies: ['Latex'],
//     barcode: '*PAT002*'
//   },
//   { 
//     id: 'PAT003', 
//     name: 'Amit Singh', 
//     phone: '+91 76543 21098', 
//     email: 'amit@email.com', 
//     lastVisit: '2024-01-08', 
//     totalVisits: 12, 
//     outstandingBalance: 2500, 
//     status: 'active',
//     dateOfBirth: '1978-11-08',
//     gender: 'male',
//     address: '789 Commercial Street, Bangalore',
//     medicalHistory: ['Previous root canal'],
//     allergies: [],
//     barcode: '*PAT003*'
//   },
//   { 
//     id: 'PAT004', 
//     name: 'Neha Gupta', 
//     phone: '+91 65432 10987', 
//     email: 'neha@email.com', 
//     lastVisit: '2023-12-20', 
//     totalVisits: 3, 
//     outstandingBalance: 0, 
//     status: 'inactive',
//     dateOfBirth: '1990-07-14',
//     gender: 'female',
//     address: '321 Koramangala, Bangalore',
//     medicalHistory: ['Allergic rhinitis'],
//     allergies: ['Dust'],
//     barcode: '*PAT004*'
//   },
//   { 
//     id: 'PAT005', 
//     name: 'Suresh Patel', 
//     phone: '+91 54321 09876', 
//     email: 'suresh@email.com', 
//     lastVisit: '2024-01-12', 
//     totalVisits: 8, 
//     outstandingBalance: 800, 
//     status: 'active',
//     dateOfBirth: '1982-09-30',
//     gender: 'male',
//     address: '654 Indiranagar, Bangalore',
//     medicalHistory: ['High blood pressure'],
//     allergies: ['Iodine'],
//     barcode: '*PAT005*'
//   },
// ];

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div id="pagination-container" className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
      <div id="pagination-info" className="text-sm text-gray-700 mb-4 sm:mb-0">
        Showing <span id="pagination-start" className="font-medium">{startItem}</span> to{' '}
        <span id="pagination-end" className="font-medium">{endItem}</span> of{' '}
        <span id="pagination-total" className="font-medium">{totalItems}</span> results
      </div>
      
      <div id="pagination-controls" className="flex items-center space-x-2">
        <button
          id="pagination-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Previous
        </button>
        
        <div id="pagination-numbers" className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              id={`pagination-page-${typeof page === 'number' ? page : 'ellipsis'}-${index}`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page !== 'number'}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                page === currentPage
                  ? 'bg-blue-600 text-white shadow-sm'
                  : typeof page === 'number'
                  ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  : 'text-gray-400 cursor-default'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          id="pagination-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}

interface PatientListProps {
  patients: Patient[];
  onAddPatient: (type?: string, patientId?: string) => void;
  onViewPatient: (patientId: string) => void;
  onEditPatient: (patientId: string) => void;
  onDeletePatient: (patientId: string) => void;
  onExportPatient?: (patientId: string) => void;
  onToggleStatus?: (patientId: string, newStatus: 'active' | 'inactive') => void;
}

export function PatientList({ patients, onAddPatient, onViewPatient, onEditPatient, onDeletePatient, onExportPatient, onToggleStatus }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 items per page for grid, 10 for table

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || patient.category === filterCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  // Pagination logic
  const totalItems = filteredPatients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, viewMode]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of patient list
    document.getElementById('patient-list-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="w-3 h-3" />;
      case 'inactive': return <UserX className="w-3 h-3" />;
      case 'new': return <User className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const handleAction = async (action: () => void, actionId: string) => {
    setActionLoading(actionId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    action();
    setActionLoading(null);
  };

  const printBarcode = (patient: Patient) => {
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
            .print-note {
              font-size: 12px;
              color: #666;
              margin-top: 20px;
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
              <div class="info-row">
                <span><strong>ID:</strong></span>
                <span>${patient.id}</span>
              </div>
              <div class="info-row">
                <span><strong>Name:</strong></span>
                <span>${patient.name}</span>
              </div>
              <div class="info-row">
                <span><strong>Phone:</strong></span>
                <span>${patient.phone}</span>
              </div>
              <div class="info-row">
                <span><strong>Email:</strong></span>
                <span>${patient.email}</span>
              </div>
              <div class="info-row">
                <span><strong>Status:</strong></span>
                <span>${patient.status.toUpperCase()}</span>
              </div>
            </div>
            
            <div class="print-note">
              <p>Scan this barcode for quick patient identification</p>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
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

  const activePatients = patients.filter(p => p.status === 'active').length;
  const newPatients = patients.filter(p => p.status === 'new').length;
  const totalBalance = patients.reduce((sum, p) => sum + p.outstandingBalance, 0);

  const renderGridView = () => (
    <div id="patient-grid-container">
      <div id="patient-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {paginatedPatients.map((patient) => (
          <div key={patient.id} id={`patient-card-${patient.id}`} className="card-hover p-4 lg:p-5">
          {/* Patient Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                  {patient.avatar ? (
                    <img src={patient.avatar} alt={patient.name} className="w-16 h-16 object-cover rounded-2xl" />
                  ) : (
                    <User className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                  patient.status === 'active' ? 'bg-green-500' : 
                  patient.status === 'new' ? 'bg-blue-500' : 'bg-gray-500'
                }`}>
                  {getStatusIcon(patient.status)}
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-lg truncate" title={patient.name}>{patient.name}</h3>
                  {patient.category && patient.category !== 'regular' && patient.category !== 'corporate' && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase border border-amber-200">
                      {patient.category}
                    </span>
                  )}
                  {(patient as any).corporatePlanId && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 rounded uppercase">
                      <Building2 className="w-2.5 h-2.5" />
                      {(patient as any).corporatePlanName || 'Corporate'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-mono">{patient.id}</p>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border mt-1 ${getStatusColor(patient.status)}`}>
                  {getStatusIcon(patient.status)}
                  <span className="ml-1">{patient.status.toUpperCase()}</span>
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onExportPatient?.(patient.id)}
                className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => printBarcode(patient)}
                className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                title="Print Barcode"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <span className="text-gray-600">{patient.phone}</span>
            </div>
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <span className="text-gray-600 truncate">{patient.email}</span>
            </div>
            {patient.address && (
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 line-clamp-2">{patient.address}</span>
              </div>
            )}
          </div>

          {/* Medical Alerts */}
          {(patient.medicalHistory?.length > 0 || patient.allergies?.length > 0) && (
            <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-800">Medical Alerts</span>
              </div>
              {patient.allergies?.length > 0 && (
                <div className="text-xs text-red-700 mb-1">
                  <strong>Allergies:</strong> {patient.allergies.join(', ')}
                </div>
              )}
              {patient.medicalHistory?.length > 0 && (
                <div className="text-xs text-orange-700">
                  <strong>Conditions:</strong> {patient.medicalHistory.slice(0, 2).join(', ')}
                  {patient.medicalHistory.length > 2 && ` +${patient.medicalHistory.length - 2} more`}
                </div>
              )}
            </div>
          )}

          {/* Visit Statistics */}
          <div className="grid grid-cols-3 gap-2 lg:gap-3 mb-4">
            <div className="text-center p-2 lg:p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-center min-w-0">
              <div className="text-lg font-bold text-blue-600">{patient.totalVisits || 0}</div>
              <div className="text-[10px] lg:text-xs text-blue-700 font-bold uppercase tracking-wider">Visits</div>
            </div>
            <div className="text-center p-2 lg:p-3 bg-green-50/50 rounded-xl border border-green-100 flex flex-col justify-center min-w-0">
              <div className="text-lg font-bold text-green-600">
                {patient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'}
              </div>
              <div className="text-[10px] lg:text-xs text-green-700 font-bold uppercase tracking-wider">Age</div>
            </div>
            <div className="text-center p-2 lg:p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-col justify-center min-w-0">
              <div className={`text-lg font-bold ${patient.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{patient.outstandingBalance >= 1000 ? `${(patient.outstandingBalance / 1000).toFixed(1)}k` : (patient.outstandingBalance || 0)}
              </div>
              <div className="text-[10px] lg:text-xs text-purple-700 font-bold uppercase tracking-wider">Balance</div>
            </div>
          </div>

          {/* Registration Date */}
          <div className={`mb-2 p-3 rounded-xl border ${patient.status === 'inactive' ? 'bg-red-50/30 border-red-50' : 'bg-blue-50/30 border-blue-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserPlus className={`w-4 h-4 mr-2 ${patient.status === 'inactive' ? 'text-red-500' : 'text-blue-500'}`} />
                <span className="text-sm text-gray-700">Registered period</span>
              </div>
              <span className={`text-sm font-bold ${patient.status === 'inactive' ? 'text-red-900' : 'text-gray-900'}`}>
                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-IN') : 'New'}
                {patient.status === 'inactive' && patient.deactivatedAt && (
                  <span className="ml-1 text-gray-500"> - {new Date(patient.deactivatedAt).toLocaleDateString('en-IN')}</span>
                )}
                {patient.status === 'active' && <span className="ml-1 text-green-500"> (Present)</span>}
              </span>
            </div>
          </div>

          {/* Last Visit */}
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">Last Visit</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {patient.lastVisit && patient.lastVisit !== "0001-01-01" && new Date(patient.lastVisit).getFullYear() > 1970
                  ? new Date(patient.lastVisit).toLocaleDateString('en-IN')
                  : 'No visits yet'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAction(() => onViewPatient(patient.id), `view-${patient.id}`)}
                disabled={actionLoading === `view-${patient.id}`}
                className="px-3 py-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white font-bold text-xs transition-all duration-200 flex items-center disabled:opacity-50 border border-blue-100"
              >
                {actionLoading === `view-${patient.id}` ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                )}
                View
              </button>
              <button
                onClick={() => handleAction(() => onEditPatient(patient.id), `edit-${patient.id}`)}
                disabled={actionLoading === `edit-${patient.id}`}
                className="px-3 py-2 text-green-600 bg-green-50 rounded-xl hover:bg-green-600 hover:text-white font-bold text-xs transition-all duration-200 flex items-center disabled:opacity-50 border border-green-100"
              >
                {actionLoading === `edit-${patient.id}` ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                ) : (
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                )}
                Edit
              </button>
              {!patient.isPerson && (
                <button
                  onClick={() => handleAction(() => onAddPatient('person', patient.id), 'person')}
                  className="px-3 py-2 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white font-bold text-xs flex items-center border border-indigo-100 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Person
                </button>
              )}
              <button
                onClick={() => onToggleStatus?.(patient.id, patient.status === 'inactive' ? 'active' : 'inactive')}
                className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center border transition-all ${
                  patient.status === 'inactive' 
                    ? 'text-green-600 bg-green-50 border-green-100 hover:bg-green-600 hover:text-white' 
                    : 'text-orange-600 bg-orange-50 border-orange-100 hover:bg-orange-600 hover:text-white'
                }`}
              >
                {patient.status === 'inactive' ? <UserCheck className="w-3.5 h-3.5 mr-1.5" /> : <UserX className="w-3.5 h-3.5 mr-1.5" />}
                {patient.status === 'inactive' ? 'Activate' : 'Deactivate'}
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => printBarcode(patient)}
                className="p-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200"
                title="Print Barcode"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setPatientToDelete(patient);
                  setDeleteConfirmText("");
                }}
                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                title="Delete Patient"
              >
                {actionLoading === `delete-${patient.id}` ? (
                  <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );

  const renderTableView = () => (
    <div id="patient-table-container" className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table id="patient-table" className="min-w-full">
          <thead id="patient-table-header" className="bg-gray-50">
            <tr>
              <th id="header-patient" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
              <th id="header-contact" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
              <th id="header-medical" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Medical Info</th>
              <th id="header-visits" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Visits</th>
              <th id="header-balance" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
              <th id="header-status" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th id="header-actions" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="patient-table-body" className="divide-y divide-gray-200">
            {paginatedPatients.map((patient) => (
              <tr key={patient.id} id={`patient-row-${patient.id}`} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mr-4">
                      {patient.avatar ? (
                        <img src={patient.avatar} alt={patient.name} className="w-12 h-12 object-cover rounded-xl" />
                      ) : (
                        <User className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900">{patient.name}</div>
                        {patient.category && patient.category !== 'regular' && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase border border-amber-200">
                            {patient.category}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">{patient.id}</div>
                      <div className="text-xs text-gray-500">
                        {patient.dateOfBirth && `Age: ${Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="w-3 h-3 mr-2 text-gray-400" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-2 text-gray-400" />
                      <span className="truncate max-w-[150px]">{patient.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {patient.allergies?.length > 0 && (
                      <div className="flex items-center">
                        <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                        <span className="text-xs text-red-600 font-medium">
                          {patient.allergies.slice(0, 2).join(', ')}
                          {patient.allergies.length > 2 && ` +${patient.allergies.length - 2}`}
                        </span>
                      </div>
                    )}
                    {patient.medicalHistory?.length > 0 && (
                      <div className="flex items-center">
                        <Heart className="w-3 h-3 text-orange-500 mr-1" />
                        <span className="text-xs text-orange-600">
                          {patient.medicalHistory.slice(0, 1).join(', ')}
                          {patient.medicalHistory.length > 1 && ` +${patient.medicalHistory.length - 1}`}
                        </span>
                      </div>
                    )}
                    {(!patient.allergies?.length && !patient.medicalHistory?.length) && (
                      <span className="text-xs text-gray-400">No alerts</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{patient.totalVisits}</div>
                    <div className="text-xs text-gray-500">
                      Last: {new Date(patient.lastVisit).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${patient.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{patient.outstandingBalance.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(patient.status)}`}>
                    {getStatusIcon(patient.status)}
                    <span className="ml-1">{patient.status.toUpperCase()}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction(() => onViewPatient(patient.id), `view-${patient.id}`)}
                      disabled={actionLoading === `view-${patient.id}`}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 disabled:opacity-50"
                      title="View Details"
                    >
                      {actionLoading === `view-${patient.id}` ? (
                        <div className="w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(() => onEditPatient(patient.id), `edit-${patient.id}`)}
                      disabled={actionLoading === `edit-${patient.id}`}
                      className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 disabled:opacity-50"
                      title="Edit Patient"
                    >
                      {actionLoading === `edit-${patient.id}` ? (
                        <div className="w-4 h-4 border border-green-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Edit className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onExportPatient?.(patient.id)}
                      className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200"
                      title="Export Data"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => printBarcode(patient)}
                      className="p-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200"
                      title="Print Barcode"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setPatientToDelete(patient);
                        setDeleteConfirmText("");
                      }}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                      title="Delete Patient"
                    >
                      {actionLoading === `delete-${patient.id}` ? (
                        <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );

  return (
    <div id="patient-list-container" className="space-y-4 lg:space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">
            {patients.length} total · {activePatients} active · {newPatients} new · ₹{totalBalance.toLocaleString()} outstanding
          </p>
        </div>
        <button
          id="add-patient-btn"
          onClick={() => handleAction(() => onAddPatient('normal'), 'add-patient')}
          disabled={actionLoading === 'add-patient'}
          className="btn-primary"
        >
          {actionLoading === 'add-patient' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Patient
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: patients.length, color: 'text-gray-900' },
          { label: 'Active', value: activePatients, color: 'text-emerald-600' },
          { label: 'New', value: newPatients, color: 'text-blue-600' },
          { label: 'Outstanding', value: `₹${totalBalance >= 1000 ? `${(totalBalance/1000).toFixed(0)}K` : totalBalance}`, color: totalBalance > 0 ? 'text-red-600' : 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="kpi-card text-center py-3">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            id="patient-search"
            type="text"
            placeholder="Search by name, phone, email or ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select w-auto"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="new">New</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="form-select w-auto"
        >
          <option value="all">All Categories</option>
          <option value="regular">Regular</option>
          <option value="family">Family</option>
          <option value="staff">Clinic Staff</option>
          <option value="corporate">Corporate</option>
          <option value="vip">VIP</option>
          <option value="complimentary">Complimentary</option>
        </select>
        <div className="hidden sm:flex bg-gray-100 rounded-xl p-1">
          <button onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Grid
          </button>
          <button onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Table
          </button>
        </div>
      </div>

      {/* Patient List */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading patients...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? renderGridView() : renderTableView()}
        </>
      )}

      {/* Empty State */}
      {paginatedPatients.length === 0 && !loading && (
        <div id="patient-empty-state" className="card">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' || currentPage > 1
              ? 'Try adjusting your search criteria or filters.'
              : 'Start by adding your first patient to the system.'
            }
          </p>
          <button
            id="add-first-patient-btn"
            onClick={onAddPatient}
            className="btn-primary"
          >
            New First Patient
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transform animate-in zoom-in-95 duration-300">
            <div className="bg-red-600 p-6 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold">Delete Patient?</h3>
              <p className="text-red-100 mt-2">This action cannot be undone. All patient records, visit history, and medical alerts will be permanently removed.</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Deleting Patient</p>
                <p className="text-lg font-bold text-gray-900">{patientToDelete.name}</p>
                <p className="text-sm text-gray-600 font-mono">{patientToDelete.id}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="Type DELETE"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPatientToDelete(null)}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmText === 'DELETE') {
                      handleAction(() => onDeletePatient(patientToDelete.id), `delete-${patientToDelete.id}`);
                      setPatientToDelete(null);
                    }
                  }}
                  disabled={deleteConfirmText !== 'DELETE' || (actionLoading !== null && actionLoading.startsWith('delete-'))}
                  className="flex-[1.5] bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-red-200"
                >
                  {actionLoading === `delete-${patientToDelete.id}` ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    'Delete Permanently'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}