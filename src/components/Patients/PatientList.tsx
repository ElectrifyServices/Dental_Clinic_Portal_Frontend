import React, { useState } from 'react';
import { Search, Plus, Filter, User, Phone, Calendar, MoreVertical, Edit, Trash2, QrCode, Download, Eye, UserCheck, UserX, Mail, MapPin, Heart, AlertTriangle, UserPlus } from 'lucide-react';

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
  barcode?: string;
  isPerson?: boolean;
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
}

export function PatientList({ patients, onAddPatient, onViewPatient, onEditPatient, onDeletePatient }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 items per page for grid, 10 for table

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
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
  }, [searchTerm, filterStatus, viewMode]);

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
      <div id="patient-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
        {paginatedPatients.map((patient) => (
          <div key={patient.id} id={`patient-card-${patient.id}`} className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
                <h3 className="font-bold text-gray-900 text-lg">{patient.name}</h3>
                <p className="text-sm text-gray-600 font-mono">{patient.id}</p>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border mt-1 ${getStatusColor(patient.status)}`}>
                  {getStatusIcon(patient.status)}
                  <span className="ml-1">{patient.status.toUpperCase()}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => printBarcode(patient)}
              className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
              title="Print Barcode"
            >
              <QrCode className="w-4 h-4" />
            </button>
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
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="text-lg font-bold text-blue-600">{patient.totalVisits}</div>
              <div className="text-xs text-blue-700">Total Visits</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-lg font-bold text-green-600">
                {patient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'}
              </div>
              <div className="text-xs text-green-700">Age</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
              <div className={`text-lg font-bold ${patient.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{patient.outstandingBalance.toLocaleString()}
              </div>
              <div className="text-xs text-purple-700">Balance</div>
            </div>
          </div>

          {/* Last Visit */}
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">Last Visit</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {new Date(patient.lastVisit).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction(() => onViewPatient(patient.id), `view-${patient.id}`)}
                disabled={actionLoading === `view-${patient.id}`}
                className="px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium text-sm transition-all duration-200 flex items-center disabled:opacity-50"
              >
                {actionLoading === `view-${patient.id}` ? (
                  <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
                ) : (
                  <Eye className="w-3 h-3 mr-1" />
                )}
                View
              </button>
              <button
                onClick={() => handleAction(() => onEditPatient(patient.id), `edit-${patient.id}`)}
                disabled={actionLoading === `edit-${patient.id}`}
                className="px-3 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 font-medium text-sm transition-all duration-200 flex items-center disabled:opacity-50"
              >
                {actionLoading === `edit-${patient.id}` ? (
                  <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin mr-1" />
                ) : (
                  <Edit className="w-3 h-3 mr-1" />
                )}
                Edit
              </button>
     {!patient.isPerson && (
  <button
    onClick={() => handleAction(() => onAddPatient('person', patient.id), 'person')}
    className="px-3 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 font-medium text-sm flex items-center"
  >
    <UserPlus className="w-4 h-4 mr-1" />
    Person
  </button>
)}
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
                onClick={() => handleAction(() => onDeletePatient(patient.id), `delete-${patient.id}`)}
                disabled={actionLoading === `delete-${patient.id}`}
                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 disabled:opacity-50"
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
    <div id="patient-table-container" className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table id="patient-table" className="min-w-full">
          <thead id="patient-table-header" className="bg-gradient-to-r from-gray-50 to-gray-100">
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
                      <div className="font-semibold text-gray-900">{patient.name}</div>
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
                      onClick={() => printBarcode(patient)}
                      className="p-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200"
                      title="Print Barcode"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction(() => onDeletePatient(patient.id), `delete-${patient.id}`)}
                      disabled={actionLoading === `delete-${patient.id}`}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 disabled:opacity-50"
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
    <div id="patient-list-container" className="space-y-4 lg:space-y-6">
      {/* Enhanced Header with Statistics */}
      <div id="patient-header" className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-blue-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 id="patient-title" className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Patient Management</h2>
            <p className="text-gray-600">Comprehensive patient database with medical records and barcode system</p>
          </div>
          <div id="patient-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full lg:w-auto">
            <div id="stat-total" className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-4 text-center border border-blue-200 shadow-sm">
              <div className="text-xl lg:text-2xl font-bold text-blue-600">{patients.length}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
            <div id="stat-active" className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-4 text-center border border-blue-200 shadow-sm">
              <div className="text-xl lg:text-2xl font-bold text-green-600">{activePatients}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div id="stat-new" className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-4 text-center border border-blue-200 shadow-sm">
              <div className="text-xl lg:text-2xl font-bold text-orange-600">{newPatients}</div>
              <div className="text-sm text-gray-600">New Patients</div>
            </div>
            <div id="stat-balance" className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-4 text-center border border-blue-200 shadow-sm">
              <div className="text-xl lg:text-2xl font-bold text-purple-600">₹{(totalBalance / 1000).toFixed(0)}K</div>
              <div className="text-sm text-gray-600">Outstanding</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div id="patient-controls" className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search id="search-icon" className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="patient-search"
                type="text"
                placeholder="Search by name, phone, email, or patient ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <select
              id="patient-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new">New Patients</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <div id="view-mode-toggle" className="bg-gray-100 rounded-lg lg:rounded-xl p-1 flex">
              <button
                id="view-mode-grid"
                onClick={() => setViewMode('grid')}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 text-sm font-medium rounded-md lg:rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                id="view-mode-table"
                onClick={() => setViewMode('table')}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 text-sm font-medium rounded-md lg:rounded-lg transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
            </div>
            <button
              id="add-patient-btn"
              onClick={() => handleAction(() => onAddPatient('normal'), 'add-patient')}
              disabled={actionLoading === 'add-patient'}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {actionLoading === 'add-patient' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Patient
            </button>
          </div>
        </div>
      </div>

      {/* Patient List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
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
        <div id="patient-empty-state" className="text-center py-12 lg:py-16 bg-white rounded-xl lg:rounded-2xl border border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all' || currentPage > 1
              ? 'Try adjusting your search criteria or filters.'
              : 'Start by adding your first patient to the system.'
            }
          </p>
          <button
            id="add-first-patient-btn"
            onClick={onAddPatient}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add First Patient
          </button>
        </div>
      )}
    </div>
  );
}