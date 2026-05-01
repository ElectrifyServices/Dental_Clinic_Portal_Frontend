import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Stethoscope, Shield, User, IndianRupee, Calendar, MoreVertical, Phone, Mail } from 'lucide-react';
import { User as UserType } from '../../types';
import { createPortal } from 'react-dom';

interface DoctorManagementProps {
  staffMembers: UserType[];
  onAddDoctor: () => void;
  onEditDoctor: (id: string) => void;
  onDeleteDoctor: (id: string) => void;
  onUpdateStaff: (staff: any) => void;
  onManageSchedule: (id: string, name: string) => void;
  onPaySalary?: (id: string, name: string) => void;
  onViewSalaryHistory?: (id: string, name: string) => void;
}

const ROLE_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  superadmin:   { label: 'Super Admin', cls: 'badge badge-violet', icon: <Shield className="w-3 h-3" /> },
  admin:        { label: 'Admin',       cls: 'badge badge-indigo', icon: <Shield className="w-3 h-3" /> },
  doctor:       { label: 'Doctor',      cls: 'badge badge-blue',   icon: <Stethoscope className="w-3 h-3" /> },
  receptionist: { label: 'Receptionist',cls: 'badge badge-green',  icon: <User className="w-3 h-3" /> },
  assistant:    { label: 'Assistant',   cls: 'badge badge-amber',  icon: <User className="w-3 h-3" /> },
};

const ROLE_FILTERS = ['all', 'doctor', 'admin', 'receptionist', 'assistant'];

export function DoctorManagement({ staffMembers, onAddDoctor, onEditDoctor, onDeleteDoctor, onUpdateStaff, onManageSchedule, onPaySalary, onViewSalaryHistory }: DoctorManagementProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const filtered = staffMembers.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.specialization || '').toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || s.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? s.isActive : !s.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 184 });
    setOpenMenuId(prev => prev === id ? null : id);
  };

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">{staffMembers.length} staff · {staffMembers.filter(s => s.isActive).length} active</p>
        </div>
        <button onClick={onAddDoctor} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, email or specialization…" value={search}
            onChange={e => setSearch(e.target.value)} className="search-input" />
        </div>
        <div className="filter-tabs">
          {ROLE_FILTERS.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={roleFilter === r ? 'filter-tab-active' : 'filter-tab'}>
              {r === 'all' ? 'All Roles' : ROLE_META[r]?.label || r}
            </button>
          ))}
        </div>
        <div className="filter-tabs">
          {['all','active','inactive'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? 'filter-tab-active' : 'filter-tab capitalize'}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Salary</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><User className="empty-state-icon" /><p className="empty-state-title">No staff found</p></div></td></tr>
            ) : filtered.map(staff => {
              const rm = ROLE_META[staff.role] || ROLE_META.assistant;
              return (
                <tr key={staff.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {staff.avatar ? (
                        <img src={staff.avatar} alt={staff.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                          {getInitials(staff.name)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{staff.name}</div>
                        {staff.specialization && <div className="text-xs text-gray-400 mt-0.5">{staff.specialization}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className={`${rm.cls} flex items-center gap-1 w-fit`}>{rm.icon}{rm.label}</span></td>
                  <td>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" />{staff.email}</span>
                      {staff.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{staff.phone}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs text-gray-600">
                      <div>Paid: <span className="font-semibold text-gray-800">₹{(staff as any).salaryPaid || '—'}</span></div>
                      <div>Due: <span className="font-semibold text-amber-600">₹{(staff as any).salaryPending || '—'}</span></div>
                    </div>
                  </td>
                  <td>
                    <span className={staff.isActive ? 'badge badge-green' : 'badge badge-gray'}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEditDoctor(staff.id)} className="btn-icon-blue" title="Edit"><Edit className="w-4 h-4" /></button>
                      <div className="relative">
                        <button onClick={e => openMenu(e, staff.id)} className="btn-icon" title="More"><MoreVertical className="w-4 h-4" /></button>
                        {openMenuId === staff.id && createPortal(
                          <>
                            <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
                            <div className="fixed z-[9999] bg-white rounded-xl border border-gray-200 shadow-xl w-46 overflow-hidden"
                              style={{ top: menuPos.top, left: menuPos.left }}>
                              <button onClick={() => { onUpdateStaff({ ...staff, isActive: !staff.isActive }); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
                                {staff.isActive ? <><UserX className="w-4 h-4" /> Deactivate</> : <><UserCheck className="w-4 h-4" /> Activate</>}
                              </button>
                              <button onClick={() => { onManageSchedule(staff.id, staff.name); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
                                <Calendar className="w-4 h-4" /> Manage Schedule
                              </button>
                              {onPaySalary && (
                                <button onClick={() => { onPaySalary(staff.id, staff.name); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 flex items-center gap-2.5 text-green-700">
                                  <IndianRupee className="w-4 h-4" /> Pay Salary
                                </button>
                              )}
                              {onViewSalaryHistory && (
                                <button onClick={() => { onViewSalaryHistory(staff.id, staff.name); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
                                  <IndianRupee className="w-4 h-4" /> Salary History
                                </button>
                              )}
                              <button onClick={() => { onDeleteDoctor(staff.id); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2.5 text-red-600">
                                <Trash2 className="w-4 h-4" /> Remove
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
      </div>
    </div>
  );
}
