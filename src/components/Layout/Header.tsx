import React, { useState } from 'react';
import { Bell, LogOut, Calendar, Plus, ChevronDown, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onShowTodaySchedule: () => void;
  onQuickAppointment?: () => void;
}

export function Header({ onShowTodaySchedule, onQuickAppointment }: HeaderProps) {
  const { state, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const roleMeta = () => {
    switch (state.user?.role) {
      case 'superadmin': return { label: 'Super Admin', cls: 'bg-violet-100 text-violet-700 border-violet-200' };
      case 'admin': return { label: 'Admin', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'doctor': return { label: 'Doctor', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'receptionist': return { label: 'Receptionist', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
      default: return { label: state.user?.role || '', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };
  const rm = roleMeta();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-[15px]">DentalCare Pro</span>
        </div>
        {/* Quick actions */}
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={onShowTodaySchedule}
            className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-all">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Today's Schedule</span>
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {state.user?.name?.[0] ?? 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-gray-900 leading-tight">{state.user?.name}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${rm.cls}`}>{rm.label}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{state.user?.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{state.user?.email}</p>
              </div>
              <button onClick={() => { logout(); setShowMenu(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
