import React, { useState } from 'react';
import { Search, Plus, FileText, Stethoscope, Pill, Camera, CreditCard, Calendar, Eye, Download } from 'lucide-react';

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
  timeline?: any[];
}

interface EMRListProps {
  records: EMRRecord[];
  onAddRecord: () => void;
  onViewRecord: (record: EMRRecord) => void;
  onExportRecord: (record: EMRRecord) => void;
}

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  consultation:      { label: 'Consultation',  icon: <Stethoscope className="w-3.5 h-3.5" />, cls: 'badge badge-blue' },
  prescription:      { label: 'Prescription',  icon: <Pill className="w-3.5 h-3.5" />,        cls: 'badge badge-green' },
  'lab-report':      { label: 'Lab Report',    icon: <FileText className="w-3.5 h-3.5" />,    cls: 'badge badge-violet' },
  'x-ray':           { label: 'X-Ray',         icon: <Camera className="w-3.5 h-3.5" />,      cls: 'badge badge-amber' },
  'treatment-note':  { label: 'Treatment Note',icon: <FileText className="w-3.5 h-3.5" />,    cls: 'badge badge-indigo' },
  'billing-record':  { label: 'Billing Record',icon: <CreditCard className="w-3.5 h-3.5" />, cls: 'badge badge-gray' },
  'appointment-visit':{ label: 'Visit',        icon: <Calendar className="w-3.5 h-3.5" />,    cls: 'badge badge-blue' },
};

const TYPE_FILTERS = ['all', 'consultation', 'prescription', 'lab-report', 'x-ray', 'treatment-note'];

export function EMRList({ records, onAddRecord, onViewRecord, onExportRecord }: EMRListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.patientName.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Records</h1>
          <p className="page-subtitle">{records.length} records across all patients</p>
        </div>
        <button onClick={onAddRecord} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by patient, title or content…" value={search}
            onChange={e => setSearch(e.target.value)} className="search-input" />
        </div>
        <div className="filter-tabs">
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={typeFilter === f ? 'filter-tab-active' : 'filter-tab'}>
              {f === 'all' ? 'All' : TYPE_META[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <p className="empty-state-title">No records found</p>
            <p className="empty-state-sub">Add a new EMR record to get started.</p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Title</th>
                <th>Type</th>
                <th>Doctor</th>
                <th>Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(record => {
                const tm = TYPE_META[record.type] || TYPE_META.consultation;
                return (
                  <tr key={record.id}>
                    <td>
                      <div className="font-semibold text-gray-900">{record.patientName}</div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-800 max-w-xs truncate">{record.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{record.content}</div>
                    </td>
                    <td><span className={`${tm.cls} flex items-center gap-1 w-fit`}>{tm.icon}{tm.label}</span></td>
                    <td className="text-gray-600">{record.doctorName}</td>
                    <td className="text-gray-600 whitespace-nowrap">
                      {record.date ? new Date(record.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => onViewRecord(record)} className="btn-icon-blue" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => onExportRecord(record)} className="btn-icon" title="Export">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
