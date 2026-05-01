import React, { useState } from 'react';
import { Clock, Edit, Trash2, UserX, CheckCircle, Search, MoreVertical, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface AppointmentListProps {
  appointments?: any[];
  onEditAppointment?: (id: string) => void;
  onDeleteAppointment?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onCheckInPatient?: (appointment: any) => void;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  completed:    { label: 'Completed',   cls: 'badge badge-green' },
  'in-progress':{ label: 'In Progress', cls: 'badge badge-blue' },
  'checked-in': { label: 'Checked In',  cls: 'badge badge-violet' },
  confirmed:    { label: 'Confirmed',   cls: 'badge badge-indigo' },
  scheduled:    { label: 'Scheduled',   cls: 'badge badge-gray' },
  cancelled:    { label: 'Cancelled',   cls: 'badge badge-red' },
  'no-show':    { label: 'No Show',     cls: 'badge badge-amber' },
};

const TYPE_FILTERS = ['all', 'today', 'week', 'no-show'];

const PER_PAGE = 12;

export function AppointmentList({ appointments: propAppointments = [], onEditAppointment, onDeleteAppointment, onUpdateStatus, onCheckInPatient }: AppointmentListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const today = new Date();

  const filtered = propAppointments.filter(a => {
    const name = (a.patientName || a.patient || '').toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (a.type || a.treatmentType || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'today') return matchSearch && new Date(a.date).toDateString() === today.toDateString();
    if (filter === 'week') {
      const d = new Date(a.date);
      const diff = (d.getTime() - today.getTime()) / 86400000;
      return matchSearch && diff >= 0 && diff <= 7;
    }
    if (filter === 'no-show') return matchSearch && a.status === 'no-show';
    return matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 180 });
    setOpenMenuId(prev => prev === id ? null : id);
  };

  const formatTime = (t: string) => {
    if (!t || t.includes('AM') || t.includes('PM')) return t || '—';
    const [h, m] = t.split(':');
    let hr = parseInt(h);
    const ap = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12 || 12;
    return `${hr}:${m} ${ap}`;
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{propAppointments.length} total · {propAppointments.filter(a => new Date(a.date).toDateString() === today.toDateString()).length} today</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by patient name or treatment type…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} className="search-input" />
        </div>
        <div className="filter-tabs">
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={filter === f ? 'filter-tab-active' : 'filter-tab'}>
              {f === 'all' ? 'All' : f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'No Show'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Treatment</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th className="text-right">Fee</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={9}><div className="empty-state"><Clock className="empty-state-icon" /><p className="empty-state-title">No appointments found</p><p className="empty-state-sub">Try changing the filter or search term.</p></div></td></tr>
            ) : paginated.map(a => {
              const sm = STATUS_META[a.status] || STATUS_META.scheduled;
              return (
                <tr key={a.id}>
                  <td>
                    <div className="font-semibold text-gray-900">{a.patientName || a.patient}</div>
                    {(a.patientPhone || a.phone) && <div className="text-xs text-gray-400 mt-0.5">{a.patientPhone || a.phone}</div>}
                  </td>
                  <td className="text-gray-600 max-w-[120px] truncate">{a.treatmentType || a.type}</td>
                  <td className="text-gray-600 whitespace-nowrap">{a.doctorName || '—'}</td>
                  <td className="text-gray-600 whitespace-nowrap">
                    {a.date ? new Date(a.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                  </td>
                  <td className="font-medium text-gray-800 whitespace-nowrap">{formatTime(a.time)}</td>
                  <td className="text-gray-500">{a.duration || 30}m</td>
                  <td className="text-right font-semibold text-gray-900">₹{(a.fee || 0).toLocaleString()}</td>
                  <td><span className={sm.cls}>{sm.label}</span></td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      {onCheckInPatient && a.status !== 'completed' && a.status !== 'cancelled' && (
                        <button onClick={() => onCheckInPatient(a)} className="btn-icon-blue" title="Check In">
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <div className="relative">
                        <button onClick={e => openMenu(e, a.id)} className="btn-icon" title="More"><MoreVertical className="w-4 h-4" /></button>
                        {openMenuId === a.id && createPortal(
                          <>
                            <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
                            <div className="fixed z-[9999] bg-white rounded-xl border border-gray-200 shadow-xl w-44 overflow-hidden"
                              style={{ top: menuPos.top, left: menuPos.left }}>
                              <button onClick={() => { onEditAppointment?.(a.id); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
                                <Edit className="w-4 h-4" /> Edit
                              </button>
                              {a.status !== 'no-show' ? (
                                <button onClick={() => { onUpdateStatus?.(a.id, 'no-show'); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 flex items-center gap-2.5 text-amber-700">
                                  <UserX className="w-4 h-4" /> Mark No-Show
                                </button>
                              ) : (
                                <button onClick={() => { onUpdateStatus?.(a.id, 'scheduled'); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-2.5 text-blue-700">
                                  <CheckCircle className="w-4 h-4" /> Restore
                                </button>
                              )}
                              <button onClick={() => { if (window.confirm('Delete this appointment?')) { onDeleteAppointment?.(a.id); setOpenMenuId(null); } }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2.5 text-red-600">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
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
            <p className="text-xs text-gray-500">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({length: totalPages}, (_, i) => i+1).slice(Math.max(0, page-3), page+2).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium ${p===page?'bg-blue-600 text-white':'text-gray-600 hover:bg-gray-100'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
