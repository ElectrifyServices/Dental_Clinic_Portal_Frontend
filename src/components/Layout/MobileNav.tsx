import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Users, CreditCard, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ITEMS = [
  { id: 'dashboard',    label: 'Home',     icon: Home,      roles: ['all'] },
  { id: 'appointments', label: 'Calendar', icon: Calendar,  roles: ['all'] },
  { id: 'patients',     label: 'Patients', icon: Users,     roles: ['all'] },
  { id: 'patient-queue',label: 'Queue',    icon: Activity,  roles: ['doctor','admin','superadmin'] },
  { id: 'billing',      label: 'Billing',  icon: CreditCard,roles: ['admin','superadmin','receptionist'] },
];

export function MobileNav() {
  const { state } = useAuth();
  const role = state.user?.role || '';
  const visible = ITEMS.filter(i => i.roles.includes('all') || i.roles.includes(role));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-40">
      <div className="flex justify-around items-center">
        {visible.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-1.5 rounded-xl min-w-0 transition-colors ${
                  isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
