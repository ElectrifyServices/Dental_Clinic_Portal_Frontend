import React from 'react';
import { 
  Home, Calendar, Users, FileText, CreditCard, 
  Package, BarChart3, Stethoscope, Activity, Shield, 
  DollarSign, UserCheck, Clipboard, Heart, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    color: 'blue'
  },
  { 
    id: 'appointments', 
    label: 'Appointments', 
    icon: Calendar, 
    color: 'green'
  },
  { 
    id: 'patients', 
    label: 'Patients', 
    icon: Users, 
    color: 'purple'
  },
  { 
    id: 'patient-queue', 
    label: 'Consultation', 
    icon: Activity, 
    color: 'orange'
  },
  { 
    id: 'treatments', 
    label: 'Treatments', 
    icon: Stethoscope, 
    color: 'cyan'
  },
  { 
    id: 'emr', 
    label: 'Medical Records', 
    icon: FileText, 
    color: 'indigo'
  },
  { 
    id: 'consent', 
    label: 'Consent Forms', 
    icon: Shield, 
    color: 'emerald'
  },
  { 
    id: 'billing', 
    label: 'Billing', 
    icon: CreditCard, 
    color: 'red'
  },
  { 
    id: 'inventory', 
    label: 'Inventory', 
    icon: Package, 
    color: 'yellow'
  },
  { 
    id: 'reports', 
    label: 'Analytics', 
    icon: BarChart3, 
    color: 'pink'
  },
  { 
    id: 'staff', 
    label: 'Staff', 
    icon: UserCheck, 
    color: 'violet'
  },
  { 
    id: 'profit-sharing', 
    label: 'Profit Sharing', 
    icon: DollarSign, 
    color: 'amber'
  }
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { state } = useAuth();

  const hasPermission = (permission: string) => {
    if (!state.user) return false;
    if (!state.user.permissions) return false;
    return state.user.permissions.includes('all') || state.user.permissions.includes(permission);
  };

  const canAccessItem = (itemId: string) => {
    switch (itemId) {
      case 'billing':
      case 'inventory':
      case 'reports':
      case 'staff':
      case 'profit-sharing':
        return hasPermission('all') || state.user?.role === 'admin';
      case 'patient-queue':
        return state.user?.role === 'doctor' || state.user?.role === 'admin';
      default:
        return true;
    }
  };

  const accessibleItems = menuItems.filter(item => canAccessItem(item.id));

  return (
    <div className="hidden md:flex md:flex-col md:w-72 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Stethoscope className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <span className="text-lg font-bold text-white">DentalCare Pro</span>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu - Fixed Height Grid */}
      <div className="flex-1 p-3">
        <div className="grid grid-cols-2 gap-2 h-full">
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? `bg-${item.color}-50 border-2 border-${item.color}-200 shadow-md` 
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {/* Background gradient for active state */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 opacity-50`}></div>
                )}
                
                {/* Icon */}
                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-all duration-200 ${
                  isActive 
                    ? `bg-${item.color}-100 shadow-sm` 
                    : 'bg-white group-hover:bg-gray-200'
                }`}>
                  <Icon className={`w-5 h-5 transition-all duration-200 ${
                    isActive 
                      ? `text-${item.color}-600` 
                      : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                </div>
                
                {/* Label */}
                <span className={`relative z-10 text-xs font-medium text-center leading-tight transition-all duration-200 ${
                  isActive 
                    ? `text-${item.color}-700` 
                    : 'text-gray-600 group-hover:text-gray-800'
                }`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute top-1 right-1 w-2 h-2 bg-${item.color}-500 rounded-full shadow-sm`}></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Info at Bottom */}
      {/* <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              {state.user?.avatar ? (
                <img src={state.user.avatar} alt={state.user.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <Users className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{state.user?.name}</p>
              <div className="flex items-center">
                <span className="text-xs text-gray-600 capitalize">{state.user?.role}</span>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}