import React, { useState } from 'react';
import { Search, Plus, Filter, Calendar, User, FileText, Camera, MoreVertical, Stethoscope, Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Treatment } from '../../types';

const treatments: Treatment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Rajesh Kumar',
    date: '2024-01-15',
    procedure: 'Root Canal Treatment',
    tooth: '16 (Upper Right First Molar)',
    notes: 'First session completed. Pulp removed, canal cleaned and shaped. Temporary filling placed.',
    cost: 5000,
    status: 'in-progress',
    images: ['https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2'],
    nextAppointment: '2024-01-22',
    doctorId: '1',
    doctorName: 'Dr. Sharma',
    prescriptions: [
      { id: '1', medicine: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '5 days', instructions: 'Take after meals' },
      { id: '2', medicine: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '3 days', instructions: 'For pain relief' }
    ]
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Priya Sharma',
    date: '2024-01-14',
    procedure: 'Dental Cleaning & Scaling',
    tooth: 'Full mouth',
    notes: 'Complete oral prophylaxis performed. Plaque and tartar removed. Fluoride treatment applied.',
    cost: 1500,
    status: 'completed',
    doctorId: '1',
    doctorName: 'Dr. Sharma'
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Amit Singh',
    date: '2024-01-20',
    procedure: 'Crown Preparation',
    tooth: '11 (Upper Right Central Incisor)',
    notes: 'Tooth prepared for porcelain crown. Impression taken. Temporary crown placed.',
    cost: 8000,
    status: 'planned',
    nextAppointment: '2024-01-27',
    doctorId: '1',
    doctorName: 'Dr. Sharma'
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'Neha Gupta',
    date: '2024-01-12',
    procedure: 'Composite Filling',
    tooth: '36 (Lower Left First Molar)',
    notes: 'Caries removed and composite restoration placed. Bite adjusted.',
    cost: 2000,
    status: 'completed',
    doctorId: '1',
    doctorName: 'Dr. Sharma'
  },
  {
    id: '5',
    patientId: '1',
    patientName: 'Rajesh Kumar',
    date: '2024-01-10',
    procedure: 'Orthodontic Treatment',
    tooth: 'Full mouth',
    notes: 'Initial consultation completed. Treatment plan discussed. Braces installation scheduled.',
    cost: 25000,
    status: 'planned',
    nextAppointment: '2024-01-25',
    doctorId: '2',
    doctorName: 'Dr. Priya Patel'
  },
  {
    id: '6',
    patientId: '5',
    patientName: 'Suresh Patel',
    date: '2024-01-18',
    procedure: 'Dental Implant',
    tooth: '26 (Upper Left First Molar)',
    notes: 'Pre-surgical consultation completed. CT scan reviewed. Surgery scheduled.',
    cost: 35000,
    status: 'in-progress',
    nextAppointment: '2024-01-30',
    doctorId: '3',
    doctorName: 'Dr. Amit Singh'
  }
];

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
    <div id="treatment-pagination" className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
      <div id="treatment-pagination-info" className="text-sm text-gray-700 mb-4 sm:mb-0">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
      
      <div id="treatment-pagination-controls" className="flex items-center space-x-2">
        <button
          id="treatment-pagination-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Previous
        </button>
        
        <div id="treatment-pagination-numbers" className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              id={`treatment-page-${typeof page === 'number' ? page : 'ellipsis'}-${index}`}
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
          id="treatment-pagination-next"
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

interface TreatmentListProps {
  treatments: Treatment[];
  onAddTreatment: () => void;
  onViewTreatment: (treatmentId: string) => void;
  onEditTreatment: (treatmentId: string) => void;
  onManageSessions: (treatmentId: string) => void;
  onMarkCompleted: (treatmentId: string) => void;
}

export function TreatmentList({ treatments: dynamicTreatments, onAddTreatment, onViewTreatment, onEditTreatment, onManageSessions, onMarkCompleted }: TreatmentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProcedure, setFilterProcedure] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredTreatments = (dynamicTreatments || treatments).filter(treatment => {
    const matchesSearch = treatment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.tooth.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (treatment.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || treatment.status === filterStatus;
    const matchesProcedure = filterProcedure === 'all' || treatment.procedure === filterProcedure;
    return matchesSearch && matchesStatus && matchesProcedure;
  });

  // Pagination logic
  const totalItems = filteredTreatments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTreatments = filteredTreatments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterProcedure, viewMode]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('treatment-list-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'planned': return <Calendar className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const uniqueProcedures = [...new Set((dynamicTreatments || treatments).map(t => t.procedure))];
  const totalTreatments = (dynamicTreatments || treatments).length;
  const activeTreatments = (dynamicTreatments || treatments).filter(t => t.status === 'in-progress').length;
  const completedTreatments = (dynamicTreatments || treatments).filter(t => t.status === 'completed').length;
  const totalRevenue = (dynamicTreatments || treatments).reduce((sum, t) => sum + (t.cost || 0), 0);

  const renderTableView = () => (
    <div id="treatment-table-container" className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table id="treatment-table" className="min-w-full">
          <thead id="treatment-table-header" className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th id="treatment-header-patient" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient & Treatment</th>
              <th id="treatment-header-doctor" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
              <th id="treatment-header-date" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Status</th>
              <th id="treatment-header-cost" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
              <th id="treatment-header-next" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Next Session</th>
              <th id="treatment-header-actions" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="treatment-table-body" className="divide-y divide-gray-200">
            {paginatedTreatments.map((treatment, index) => (
              <tr key={`${treatment.id}-${index}`} id={`treatment-row-${treatment.id}`} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mr-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                        <User className="w-8 h-8 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{treatment.patientName}</div>
                      <div className="text-xs text-gray-500 font-mono">PAT{treatment.patientId?.slice(-3) || '001'}</div>
                      <div className="text-sm text-gray-600">{treatment.procedure}</div>
                      <div className="text-xs text-gray-500">{treatment.tooth}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{treatment.doctorName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 mb-2">{new Date(treatment.date).toLocaleDateString('en-IN')}</div>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(treatment.status)}`}>
                    {getStatusIcon(treatment.status)}
                    <span className="ml-1">{treatment.status.replace('-', ' ').toUpperCase()}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="font-bold text-gray-900">₹{treatment.cost.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {treatment.nextAppointment ? (
                    <div className="text-sm text-blue-600 font-medium">
                      {new Date(treatment.nextAppointment).toLocaleDateString('en-IN')}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No upcoming session</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewTreatment(treatment.id)}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                      title="View Details"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditTreatment(treatment.id)}
                      className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200"
                      title="Edit Treatment"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onManageSessions(treatment.id)}
                      className="p-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200"
                      title="Manage Sessions"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    {treatment.status === 'in-progress' && (
                      <button 
                        onClick={() => onMarkCompleted(treatment.id)}
                        className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all duration-200"
                        title="Mark Completed"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
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

  const renderGridView = () => (
    <div id="treatment-grid-container">
      <div id="treatment-grid" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedTreatments.map((treatment, index) => (
          <div key={`${treatment.id}-${index}`} id={`treatment-card-${treatment.id}`} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                  <User className="w-10 h-10 text-gray-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-gray-900 text-lg">{treatment.procedure}</h3>
                <p className="text-xs text-gray-500 font-mono">PAT{treatment.patientId?.slice(-3) || '001'}</p>
                <p className="text-gray-600">{treatment.tooth}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center ${getStatusColor(treatment.status)}`}>
                {getStatusIcon(treatment.status)}
                <span className="ml-1">{treatment.status.replace('-', ' ').toUpperCase()}</span>
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm">
              <User className="w-4 h-4 text-gray-400 mr-3" />
              <span className="font-medium text-gray-900">{treatment.patientName}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-gray-600">
                {new Date(treatment.date).toLocaleDateString('en-IN')}
                {treatment.nextAppointment && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • Next: {new Date(treatment.nextAppointment).toLocaleDateString('en-IN')}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-start text-sm">
              <FileText className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
              <p className="text-gray-600 line-clamp-2">{treatment.notes}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-lg font-bold text-gray-900">
              ₹{treatment.cost.toLocaleString()}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onViewTreatment(treatment.id)}
                className="px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium text-sm transition-all duration-200"
              >
                View
              </button>
              <button
                onClick={() => onManageSessions(treatment.id)}
                className="px-3 py-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 font-medium text-sm transition-all duration-200"
              >
                Sessions
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

  return (
    <div id="treatment-list-container" className="space-y-6">
      {/* Header with Statistics */}
      <div id="treatment-header" className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Treatment Management</h2>
            <p className="text-gray-600">Track procedures and patient progress across all treatments</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
            <div className="bg-white rounded-xl p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{totalTreatments}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-orange-600">{activeTreatments}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-green-600">{completedTreatments}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-purple-600">₹{(totalRevenue / 1000).toFixed(0)}K</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, procedure, tooth, or doctor..."
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
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterProcedure}
              onChange={(e) => setFilterProcedure(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Procedures</option>
              {uniqueProcedures.map(procedure => (
                <option key={procedure} value={procedure}>{procedure}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 rounded-xl p-1 flex">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
            </div>
            <button
              onClick={onAddTreatment}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Treatment
            </button>
          </div>
        </div>
      </div>

      {/* Treatment List */}
      {viewMode === 'table' ? renderTableView() : renderGridView()}

      {/* Empty State */}
      {paginatedTreatments.length === 0 && (
        <div id="treatment-empty-state" className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No treatments found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all' || filterProcedure !== 'all' || currentPage > 1
              ? 'Try adjusting your search criteria or filters.'
              : 'Start by creating treatment plans for your patients.'
            }
          </p>
          <button
            id="create-first-treatment-btn"
            onClick={onAddTreatment}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Create First Treatment
          </button>
        </div>
      )}
    </div>
  );
}