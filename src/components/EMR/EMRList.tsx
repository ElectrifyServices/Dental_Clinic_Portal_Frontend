import React, { useState } from 'react';
import { Search, Plus, Filter, Calendar, User, FileText, Download, Eye, Stethoscope, Pill, Camera, CreditCard } from 'lucide-react';

interface EMRRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'consultation' | 'prescription' | 'lab-report' | 'x-ray' | 'treatment-note' | 'billing-record' | 'appointment-visit';
  title: string;
  content: string;
  attachments?: string[];
  doctorId: string;
  doctorName: string;
}

interface EMRListProps {
  records: EMRRecord[];
  onAddRecord: () => void;
  onViewRecord: (record: EMRRecord) => void;
  onExportRecord: (record: EMRRecord) => void;
}

export function EMRList({ records, onAddRecord, onViewRecord, onExportRecord }: EMRListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'prescription': return 'bg-green-100 text-green-800';
      case 'lab-report': return 'bg-purple-100 text-purple-800';
      case 'x-ray': return 'bg-orange-100 text-orange-800';
      case 'treatment-note': return 'bg-yellow-100 text-yellow-800';
      case 'billing-record': return 'bg-indigo-100 text-indigo-800';
      case 'appointment-visit': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="w-4 h-4" />;
      case 'prescription': return <Pill className="w-4 h-4" />;
      case 'lab-report': return <FileText className="w-4 h-4" />;
      case 'x-ray': return <Camera className="w-4 h-4" />;
      case 'treatment-note': return <FileText className="w-4 h-4" />;
      case 'billing-record': return <CreditCard className="w-4 h-4" />;
      case 'appointment-visit': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
                       record.type === filterType || 
                       (record.timeline && record.timeline.some((item: any) => item.type === filterType));
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Electronic Medical Records</h2>
          <p className="text-gray-600 mt-1">Comprehensive patient medical history and documentation</p>
        </div>
        <button
          onClick={onAddRecord}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search records by patient, title, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none bg-white font-medium text-gray-700"
        >
          <option value="all">All Records</option>
          <option value="consultation">Consultations</option>
          <option value="treatment-note">Treatments</option>
          <option value="billing-record">Billing</option>
          <option value="appointment-visit">Appointments</option>
          <option value="prescription">Prescriptions</option>
          <option value="x-ray">X-Rays</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  {getTypeIcon(record.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{record.title}</h3>
                  <p className="text-sm text-gray-600">{record.patientName}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(record.type)}`}>
                {record.type.replace('-', ' ').toUpperCase()}
              </span>
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{record.content}</p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(record.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {record.doctorName}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => onViewRecord(record)}
                className="px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium text-sm flex items-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              <button 
                onClick={() => onExportRecord(record)}
                className="px-3 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 font-medium text-sm flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No EMR records found</h3>
          <p className="text-gray-600 mb-4">Medical records will appear here as consultations are completed.</p>
          <button
            onClick={onAddRecord}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Add First Record
          </button>
        </div>
      )}
    </div>
  );
}