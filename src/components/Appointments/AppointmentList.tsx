import React, { useState } from 'react';
import {
  Clock, User, Phone, MapPin, MoreVertical,
  Edit, Trash2, UserX, CheckCircle, Search, Filter,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface Appointment {
  id: string;
  time: string;
  patient: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  phone: string;
  duration: string;
}

const appointments: Appointment[] = [
  { id: '1', time: '09:00 AM', patient: 'Rajesh Kumar',  type: 'Regular Checkup', status: 'completed',   phone: '+91 98765 43210', duration: '30 min' },
  { id: '2', time: '10:30 AM', patient: 'Priya Sharma',  type: 'Teeth Cleaning',  status: 'in-progress', phone: '+91 87654 32109', duration: '45 min' },
  { id: '3', time: '12:00 PM', patient: 'Amit Singh',    type: 'Root Canal',      status: 'confirmed',   phone: '+91 76543 21098', duration: '60 min' },
  { id: '4', time: '02:30 PM', patient: 'Neha Gupta',    type: 'Dental Filling',  status: 'scheduled',   phone: '+91 65432 10987', duration: '45 min' },
  { id: '5', time: '04:00 PM', patient: 'Suresh Patel',  type: 'Crown Fitting',   status: 'scheduled',   phone: '+91 54321 09876', duration: '90 min' },
];

// ── avatar colour palette (cycles) ──────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { bg: 'bg-teal-100',   text: 'text-teal-700'   },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  { bg: 'bg-rose-100',   text: 'text-rose-700'   },
];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem   = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      id="appointment-pagination"
      className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-gray-100 bg-white rounded-b-xl"
    >
      <p id="appointment-pagination-info" className="text-xs text-gray-500 mb-3 sm:mb-0">
        Showing <span className="font-medium text-gray-700">{startItem}</span>–
        <span className="font-medium text-gray-700">{endItem}</span> of{' '}
        <span className="font-medium text-gray-700">{totalItems}</span> results
      </p>

      <div id="appointment-pagination-controls" className="flex items-center gap-1">
        <button
          id="appointment-pagination-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            id={`appointment-page-${page}`}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 text-xs font-medium rounded-lg transition-all ${
              page === currentPage
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          id="appointment-pagination-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── AppointmentList ──────────────────────────────────────────────────────────
interface AppointmentListProps {
  appointments?: any[];
  onEditAppointment?:  (appointmentId: string) => void;
  onDeleteAppointment?: (appointmentId: string) => void;
  onUpdateStatus?:     (appointmentId: string, status: string) => void;
  onCheckInPatient?:   (appointment: any) => void;
}

export function AppointmentList({
  appointments: propAppointments,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateStatus,
  onCheckInPatient,
}: AppointmentListProps) {
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage]                  = useState(10);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [openMenu, setOpenMenu]         = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // ── original logic (untouched) ────────────────────────────────────────────
  // const displayAppointments =
  //   propAppointments && propAppointments.length > 0
  //     ? [...propAppointments].sort((a, b) => {
  //         const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
  //         if (dateCompare !== 0) return dateCompare;
  //         return a.time.localeCompare(b.time);
  //       })
  //     : [...appointments].sort((a, b) => {
  //         const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
  //         if (dateCompare !== 0) return dateCompare;
  //         return a.time.localeCompare(b.time);
  //       });
const displayAppointments = propAppointments ? [...propAppointments] : [];
  const filteredAppointments = displayAppointments.filter(a => {
    const matchSearch = (a.patient || a.patientName || '')
      .toLowerCase()
      .includes(search.toLowerCase());

    const today = new Date();

    if (filter === 'today')
      return matchSearch && new Date(a.date).toDateString() === today.toDateString();

    if (filter === 'week') {
      const d    = new Date(a.date);
      const diff = (d.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return matchSearch && diff >= 0 && diff <= 7;
    }

    if (filter === 'no-show') return matchSearch && a.status === 'no-show';

    return matchSearch;
  });

  const totalItems            = filteredAppointments.length;
  const totalPages            = Math.ceil(totalItems / itemsPerPage);
  const startIndex            = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':   return { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: 'Completed'   };
      case 'in-progress': return { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   label: 'In Progress' };
      case 'checked-in':  return { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', label: 'Checked In'  };
      case 'confirmed':   return { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  label: 'Confirmed'   };
      case 'scheduled':   return { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   label: 'Scheduled'   };
      case 'cancelled':   return { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    label: 'Cancelled'   };
      case 'no-show':     return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'No Show'     };
      default:            return { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   label: status        };
    }
  };

  const handleMarkNoShow       = (id: string) => onUpdateStatus?.(id, 'no-show');
  const handleEditAppointment  = (id: string) => onEditAppointment?.(id);
  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?'))
      onDeleteAppointment?.(id);
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      id="appointment-list-container"
      className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full"
      onClick={() => setOpenMenu(null)}
    >
      {/* ── Header ── */}
      <div
        id="appointment-list-header"
        className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h3 id="appointment-list-title" className="text-base font-semibold text-gray-900">
            Today's Schedule
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">January 15, 2024</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patient..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none w-48 transition-all placeholder-gray-400"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <select
              value={filter}
              onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-7 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none appearance-none w-36 transition-all text-gray-700"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              {/* <option value="no-show">No Show</option> */}
            </select>
            <span className="pointer-events-none absolute right-2 top-2.5 text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ── List ── */}
      <div id="appointment-list-body" className="divide-y divide-gray-50 flex-1 overflow-y-auto">
        {paginatedAppointments.map((appointment, idx) => {
          const st  = getStatusConfig(appointment.status);
          const av  = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const name = appointment.patient || appointment.patientName || '';

          return (
            <div
              key={appointment.id}
              id={`appointment-item-${appointment.id}`}
              className="px-6 py-4 hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">

                {/* LEFT — time + avatar + details */}
                <div className="flex items-center gap-4 min-w-0">

                  {/* Time block */}
                  <div
                    id={`appointment-time-${appointment.id}`}
                    className="text-center min-w-[52px]"
                  >
                    <div className="text-sm font-semibold text-gray-900 tabular-nums leading-tight">
                      {appointment.time}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {appointment.duration || '30 min'}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full ${av.bg} ${av.text} flex items-center justify-center text-xs font-semibold flex-shrink-0`}
                  >
                    {getInitials(name)}
                  </div>

                  {/* Details */}
                  <div id={`appointment-details-${appointment.id}`} className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {name}
                      </h4>
                      <span
                        id={`appointment-status-${appointment.id}`}
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${st.bg} ${st.text} ${st.border}`}
                      >
                        {st.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {appointment.treatment || appointment.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        {appointment.phone || appointment.patientPhone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT — actions */}
                <div
                  id={`appointment-actions-${appointment.id}`}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  {appointment.status === 'scheduled' && (
                    <button
                      id={`checkin-btn-${appointment.id}`}
                      onClick={() =>
  onCheckInPatient?.({
    ...appointment,
    status: "checked-in"
  })
}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Check In
                    </button>
                  )}

                  {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                    <button
                      id={`noshow-btn-${appointment.id}`}
                      onClick={() => handleMarkNoShow(appointment.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      No Show
                    </button>
                  )}

                  {/* Three-dot menu */}
                  <div
                    id={`appointment-menu-${appointment.id}`}
                    className="relative"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      id={`appointment-menu-btn-${appointment.id}`}
onClick={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();

  setMenuPosition({
    top: rect.bottom + window.scrollY + 5,
    left: rect.left + window.scrollX - 150, // adjust based on width
  });

  setOpenMenu(openMenu === appointment.id ? null : appointment.id);
}}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

{openMenu === appointment.id &&
  createPortal(
    <div
      className="fixed z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
      }}
    >
      <button
        onClick={() => { handleEditAppointment(appointment.id); setOpenMenu(null); }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
      >
        Edit Appointment
      </button>

      <button
        onClick={() => { handleDeleteAppointment(appointment.id); setOpenMenu(null); }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
      >
        Delete Appointment
      </button>
    </div>,
    document.body
  )
}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {paginatedAppointments.length === 0 && (
          <div id="appointment-empty-state" className="py-14 text-center">
            <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No appointments found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Pagination */}
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
}