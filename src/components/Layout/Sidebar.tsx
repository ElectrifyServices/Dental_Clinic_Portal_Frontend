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
  { id: 'dashboard', label: 'Dashboard', icon: Home, group: 'main' },
  { id: 'appointments', label: 'Appointments', icon: Calendar, group: 'main' },
  { id: 'patients', label: 'Patients', icon: Users, group: 'main' },
  { id: 'patient-queue', label: 'Consultation', icon: Activity, group: 'clinical' },
  { id: 'treatments', label: 'Treatments', icon: Stethoscope, group: 'clinical' },
  { id: 'emr', label: 'Medical Records', icon: FileText, group: 'clinical' },
  { id: 'consent', label: 'Consent Forms', icon: Shield, group: 'clinical' },
  { id: 'billing', label: 'Billing', icon: CreditCard, group: 'admin' },
  { id: 'inventory', label: 'Inventory', icon: Package, group: 'admin' },
  { id: 'reports', label: 'Analytics', icon: BarChart3, group: 'admin' },
  { id: 'staff', label: 'Staff', icon: UserCheck, group: 'admin' },
  { id: 'profit-sharing', label: 'Profit Sharing', icon: DollarSign, group: 'admin' },
  { id: 'corporate-plans', label: 'Corporate Plans', icon: Building2, group: 'superadmin' },
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
      case 'admin': return { label: 'Admin', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'doctor': return { label: 'Doctor', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'receptionist': return { label: 'Receptionist', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
      default: return { label: role || '', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };
  const rl = roleLabel();

  // Determine active group color
  const activeItem = ALL_ITEMS.find(i => i.id === currentPage);
  const activeGroup = activeItem?.group || 'main';

  const getThemeColor = (group: string) => {
    switch (group) {
      case 'clinical': return 'emerald';
      case 'admin': return 'amber';
      case 'superadmin': return 'violet';
      default: return 'blue';
    }
  };

  const themeColor = getThemeColor(activeGroup);
  const themeClasses = {
    blue: 'bg-blue-600 text-blue-600',
    emerald: 'bg-emerald-600 text-emerald-600',
    amber: 'bg-amber-500 text-amber-500',
    violet: 'bg-violet-600 text-violet-600'
  }[themeColor];

  return (
    <aside className={`
      relative hidden md:flex md:flex-col flex-shrink-0
      ${collapsed ? 'md:w-[60px]' : 'md:w-[240px]'}
      bg-white border-r border-gray-100 h-screen sticky top-0
      transition-all duration-300 overflow-visible
    `}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[68px] -right-3.5 z-50 w-7 h-7 flex items-center justify-center bg-white border border-gray-100 rounded-full shadow-md hover:bg-gray-50 transition-all group"
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          : <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />}
      </button>

      {/* Logo - Compact */}
      <div className="flex items-center h-16 px-4 border-b border-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-colors duration-500 ${themeClasses.split(' ')[0]}`}>
            <Stethoscope className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-gray-900 text-[14px] block leading-none tracking-tight">DentalCare Pro</span>
              <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 block transition-colors duration-500 ${themeClasses.split(' ')[1]}`}>
                {activeGroup === 'main' ? 'Overview' : activeGroup.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav - Strict No Scroll */}
      <nav className="flex-1 flex flex-col py-4 px-2 space-y-4 overflow-hidden">
        {groups.map(group => (
          <div key={group} className="space-y-1">
            {!collapsed && (
              <p className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 mb-1 transition-colors duration-500
                ${activeGroup === group 
                  ? group === 'clinical' ? 'text-emerald-600' : group === 'admin' ? 'text-amber-500' : group === 'superadmin' ? 'text-violet-600' : 'text-blue-600'
                  : 'text-gray-400'
                }
              `}>
                {GROUP_LABELS[group]}
              </p>
            )}
            <div className="space-y-0.5">
              {visible.filter(i => i.group === group).map(item => {
                const Icon = item.icon;
                const active = currentPage === item.id;

                const getActiveStyle = () => {
                  switch (group) {
                    case 'clinical': return active ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700';
                    case 'admin': return active ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:bg-amber-50 hover:text-amber-700';
                    case 'superadmin': return active ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-500 hover:bg-violet-50 hover:text-violet-700';
                    default: return active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-700';
                  }
                };

                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                      transition-all duration-200 group border border-transparent
                      ${getActiveStyle()}
                      ${active ? 'scale-[1.02]' : 'hover:scale-[1.02]'}
                    `}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${active ? 'scale-110' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Compact */}
      <div className="mt-auto border-t border-gray-100 p-3 bg-gray-50/30 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 mb-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md transition-colors duration-500 ${themeClasses.split(' ')[0]}`}>
              {state.user?.name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-900 truncate leading-tight uppercase">{state.user?.name}</p>
              <p className="text-[9px] text-gray-500 font-medium uppercase tracking-tighter">{rl.label}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed ? 'Sign Out' : undefined}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all uppercase tracking-wide"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
