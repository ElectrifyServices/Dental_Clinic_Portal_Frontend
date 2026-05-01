import React, { useState } from 'react';
import {
  Home, Calendar, Users, FileText, CreditCard,
  Package, BarChart3, Stethoscope, Activity, Shield,
  DollarSign, UserCheck, ChevronLeft, ChevronRight,
  Building2, LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const ALL_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',       icon: Home,        group: 'main' },
  { id: 'appointments',   label: 'Appointments',     icon: Calendar,    group: 'main' },
  { id: 'patients',       label: 'Patients',         icon: Users,       group: 'main' },
  { id: 'patient-queue',  label: 'Consultation',     icon: Activity,    group: 'clinical' },
  { id: 'treatments',     label: 'Treatments',       icon: Stethoscope, group: 'clinical' },
  { id: 'emr',            label: 'Medical Records',  icon: FileText,    group: 'clinical' },
  { id: 'consent',        label: 'Consent Forms',    icon: Shield,      group: 'clinical' },
  { id: 'billing',        label: 'Billing',          icon: CreditCard,  group: 'admin' },
  { id: 'inventory',      label: 'Inventory',        icon: Package,     group: 'admin' },
  { id: 'reports',        label: 'Analytics',        icon: BarChart3,   group: 'admin' },
  { id: 'staff',          label: 'Staff',            icon: UserCheck,   group: 'admin' },
  { id: 'profit-sharing', label: 'Profit Sharing',   icon: DollarSign,  group: 'admin' },
  { id: 'corporate-plans',label: 'Corporate Plans',  icon: Building2,   group: 'superadmin' },
];

const GROUP_LABELS: Record<string, string> = {
  main: 'Overview', clinical: 'Clinical', admin: 'Administration', superadmin: 'Super Admin',
};

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { state, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const role = state.user?.role;
  const perms = state.user?.permissions || [];
  const hasAll = perms.includes('all');

  const canAccess = (item: typeof ALL_ITEMS[0]) => {
    if (item.group === 'superadmin') return role === 'superadmin';
    if (item.id === 'patient-queue') return role === 'doctor' || hasAll;
    if (item.group === 'admin') {
      if (hasAll) return true;
      if (role === 'receptionist') return ['billing', 'consent'].includes(item.id);
      return false;
    }
    return true;
  };

  const visible = ALL_ITEMS.filter(canAccess);
  const groups = ['main', 'clinical', 'admin', 'superadmin'].filter(g => visible.some(i => i.group === g));

  const roleLabel = () => {
    switch (role) {
      case 'superadmin': return { label: 'Super Admin', cls: 'bg-violet-100 text-violet-700 border-violet-200' };
      case 'admin':      return { label: 'Admin', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'doctor':     return { label: 'Doctor', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'receptionist': return { label: 'Receptionist', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
      default: return { label: role || '', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };
  const rl = roleLabel();

  return (
    <aside className={`
      relative hidden md:flex md:flex-col flex-shrink-0 overflow-visible
      ${collapsed ? 'md:w-[60px]' : 'md:w-[220px]'}
      bg-white border-r border-gray-200 h-screen sticky top-0
      transition-all duration-300
    `}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[72px] -right-3.5 z-50 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:bg-blue-50 hover:border-blue-300 transition-all group"
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600" />
          : <ChevronLeft  className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600" />}
      </button>

      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-[18px] h-[18px] text-white" />
          </div>
          {!collapsed && <span className="font-bold text-gray-900 text-[15px] truncate">DentalCare Pro</span>}
        </div>
      </div>

      {/* User strip */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {state.user?.name?.[0] ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{state.user?.name}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${rl.cls}`}>{rl.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-3 custom-scrollbar">
        {groups.map(group => (
          <div key={group}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">
                {GROUP_LABELS[group]}
              </p>
            )}
            <div className="space-y-0.5">
              {visible.filter(i => i.group === group).map(item => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                const isSA = item.group === 'superadmin';
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium
                      transition-all duration-150 group
                      ${active
                        ? isSA ? 'bg-violet-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                    `}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && isSA && !active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-gray-100 p-2 flex-shrink-0">
        <button
          onClick={logout}
          title={collapsed ? 'Sign Out' : undefined}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
