import React, { useState } from 'react';
import { Search, Plus, Clock, CheckCircle, Calendar, Stethoscope } from 'lucide-react';
import { Treatment } from '../../types';
import { TreatmentStats } from './TreatmentList/TreatmentStats';
import { TreatmentTableRow } from './TreatmentList/TreatmentTableRow';

interface TreatmentListProps {
  treatments: Treatment[];
  onAddTreatment: () => void;
  onViewTreatment: (id: string) => void;
  onEditTreatment: (id: string) => void;
  onManageSessions: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onStartTreatment: (id: string) => void;
}

const STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  completed:   { label: 'Completed',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-100',  icon: <CheckCircle className="w-3 h-3" /> },
  'in-progress':{ label: 'In Progress', cls: 'bg-blue-50 text-blue-700 border-blue-100',   icon: <Clock className="w-3 h-3" /> },
  planned:     { label: 'Planned',     cls: 'bg-amber-50 text-amber-700 border-amber-100',  icon: <Calendar className="w-3 h-3" /> },
};

export function TreatmentList({ treatments: dynamicTreatments, onAddTreatment, onViewTreatment, onEditTreatment, onManageSessions, onMarkCompleted, onStartTreatment }: TreatmentListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const treatments = dynamicTreatments || [];

  const filtered = treatments.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.patientName.toLowerCase().includes(q) || t.procedure.toLowerCase().includes(q) ||
      t.tooth.toLowerCase().includes(q) || (t.doctorName || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totals = {
    all: treatments.length,
    active: treatments.filter(t => t.status === 'in-progress').length,
    completed: treatments.filter(t => t.status === 'completed').length,
    planned: treatments.filter(t => t.status === 'planned').length,
    revenue: treatments.reduce((s, t) => s + (Number(t.cost) < 100000000 ? Number(t.cost) || 0 : 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header bg-gradient-to-r from-gray-50 to-blue-50/30 p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-blue-50">
            <Stethoscope className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Treatment Plans</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-bold text-gray-400">{totals.all} Records Total</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-sm font-bold text-blue-600">₹{totals.revenue.toLocaleString()} Projected</span>
            </div>
          </div>
        </div>
        <button onClick={onAddTreatment} className="btn-primary py-3 px-6 shadow-lg shadow-blue-100">
          <Plus className="w-4 h-4" /> New Treatment Plan
        </button>
      </div>

      <TreatmentStats totals={totals} />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by patient, procedure, tooth or doctor…" 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            className="w-full pl-12 pr-4 py-3 text-sm border border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium" 
          />
        </div>
        <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200/50">
          {(['all', 'planned', 'in-progress', 'completed'] as const).map(s => (
            <button 
              key={s} 
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                statusFilter === s 
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {s === 'all' ? 'All Plans' : STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient & Procedure</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tooth</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Cost</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Session</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Stethoscope className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">No treatments found</h3>
                      <p className="text-sm font-medium text-gray-400 mt-1 max-w-xs">Adjust your search or create a new treatment plan to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map(t => (
                <TreatmentTableRow 
                  key={t.id}
                  treatment={t}
                  statusMeta={STATUS_META}
                  onView={onViewTreatment}
                  onEdit={onEditTreatment}
                  onManageSessions={onManageSessions}
                  onStart={onStartTreatment}
                  onComplete={onMarkCompleted}
                />
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 bg-gray-50/30">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                <button 
                  key={p} 
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${
                    p === page 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                      : 'text-gray-500 hover:bg-white hover:border-gray-200 border border-transparent'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
