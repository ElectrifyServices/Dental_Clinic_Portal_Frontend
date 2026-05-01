import React, { useState } from 'react';
import {
  Search, Plus, Edit, FileText, Clock, CheckCircle, AlertCircle,
  Calendar, Stethoscope, MoreVertical, User, Play
} from 'lucide-react';
import { Treatment } from '../../types';
import { createPortal } from 'react-dom';

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
  completed:   { label: 'Completed',   cls: 'badge badge-green',  icon: <CheckCircle className="w-3 h-3" /> },
  'in-progress':{ label: 'In Progress', cls: 'badge badge-blue',   icon: <Clock className="w-3 h-3" /> },
  planned:     { label: 'Planned',     cls: 'badge badge-amber',  icon: <Calendar className="w-3 h-3" /> },
};

export function TreatmentList({ treatments: dynamicTreatments, onAddTreatment, onViewTreatment, onEditTreatment, onManageSessions, onMarkCompleted, onStartTreatment }: TreatmentListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

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

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 180 });
    setOpenMenuId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Treatments</h1>
          <p className="page-subtitle">{totals.all} total · {totals.active} active · ₹{totals.revenue.toLocaleString()} revenue</p>
        </div>
        <button onClick={onAddTreatment} className="btn-primary">
          <Plus className="w-4 h-4" /> New Treatment
        </button>
      </div>

      {/* KPI mini row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: totals.all, color: 'text-gray-900' },
          { label: 'In Progress', value: totals.active, color: 'text-blue-600' },
          { label: 'Completed', value: totals.completed, color: 'text-emerald-600' },
          { label: 'Planned', value: totals.planned, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="kpi-card text-center py-3">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by patient, procedure, tooth or doctor…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} className="search-input" />
        </div>
        <div className="filter-tabs">
          {(['all', 'planned', 'in-progress', 'completed'] as const).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={statusFilter === s ? 'filter-tab-active' : 'filter-tab'}>
              {s === 'all' ? 'All' : STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient & Procedure</th>
              <th>Tooth</th>
              <th>Doctor</th>
              <th>Date</th>
              <th className="text-right">Cost</th>
              <th>Status</th>
              <th>Next Session</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8}><div className="empty-state"><Stethoscope className="empty-state-icon" /><p className="empty-state-title">No treatments found</p><p className="empty-state-sub">Adjust your search or create a new treatment plan.</p></div></td></tr>
            ) : paginated.map(t => {
              const sm = STATUS_META[t.status] || STATUS_META.planned;
              const cost = Number(t.cost) < 100000000 ? Number(t.cost) : 0;
              return (
                <tr key={t.id}>
                  <td>
                    <div className="font-semibold text-gray-900">{t.patientName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.procedure}</div>
                  </td>
                  <td className="text-gray-600 text-xs max-w-[100px] truncate">{t.tooth || '—'}</td>
                  <td className="text-gray-600 whitespace-nowrap">{t.doctorName}</td>
                  <td className="text-gray-500 whitespace-nowrap">
                    {t.date ? new Date(t.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                  </td>
                  <td className="text-right font-semibold text-gray-900">₹{cost.toLocaleString()}</td>
                  <td><span className={`${sm.cls} flex items-center gap-1 w-fit`}>{sm.icon}{sm.label}</span></td>
                  <td className="text-gray-500 text-xs whitespace-nowrap">
                    {t.nextAppointment ? new Date(t.nextAppointment).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : '—'}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onViewTreatment(t.id)} className="btn-icon-blue" title="View"><FileText className="w-4 h-4" /></button>
                      <div className="relative">
                        <button onClick={e => openMenu(e, t.id)} className="btn-icon" title="More"><MoreVertical className="w-4 h-4" /></button>
                        {openMenuId === t.id && createPortal(
                          <>
                            <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
                            <div className="fixed z-[9999] bg-white rounded-xl border border-gray-200 shadow-xl w-44 overflow-hidden"
                              style={{ top: menuPos.top, left: menuPos.left }}>
                              <button onClick={() => { onEditTreatment(t.id); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
                                <Edit className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => { onManageSessions(t.id); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
                                <Clock className="w-4 h-4" /> Manage Sessions
                              </button>
                              {t.status === 'planned' && (
                                <button onClick={() => { onStartTreatment(t.id); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-2.5 text-blue-700">
                                  <Play className="w-4 h-4" /> Start Treatment
                                </button>
                              )}
                              {t.status === 'in-progress' && (
                                <button onClick={() => { onMarkCompleted(t.id); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 flex items-center gap-2.5 text-emerald-700">
                                  <CheckCircle className="w-4 h-4" /> Mark Completed
                                </button>
                              )}
                            </div>
                          </>,
                          document.body
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary px-2 py-1 text-xs disabled:opacity-40">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-secondary px-2 py-1 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
