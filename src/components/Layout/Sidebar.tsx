// import React from 'react';
// import { 
//   Home, Calendar, Users, FileText, CreditCard, 
//   Package, BarChart3, Stethoscope, Activity, Shield, 
//   DollarSign, UserCheck, ChevronLeft, ChevronRight
// } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
 
// interface SidebarProps {
//   currentPage: string;
//   onPageChange: (page: string) => void;
// }
 
// const menuItems = [
//   { id: 'dashboard',      label: 'Dashboard',      icon: Home,        color: 'blue'    },
//   { id: 'appointments',   label: 'Appointments',   icon: Calendar,    color: 'green'   },
//   { id: 'patients',       label: 'Patients',       icon: Users,       color: 'purple'  },
//   { id: 'patient-queue',  label: 'Consultation',   icon: Activity,    color: 'orange'  },
//   { id: 'treatments',     label: 'Treatments',     icon: Stethoscope, color: 'cyan'    },
//   { id: 'emr',            label: 'Medical Records',icon: FileText,    color: 'indigo'  },
//   { id: 'consent',        label: 'Consent Forms',  icon: Shield,      color: 'emerald' },
//   { id: 'billing',        label: 'Billing',        icon: CreditCard,  color: 'red'     },
//   { id: 'inventory',      label: 'Inventory',      icon: Package,     color: 'yellow'  },
//   { id: 'reports',        label: 'Analytics',      icon: BarChart3,   color: 'pink'    },
//   { id: 'staff',          label: 'Staff',          icon: UserCheck,   color: 'violet'  },
//   { id: 'profit-sharing', label: 'Profit Sharing', icon: DollarSign,  color: 'amber'   },
// ];
 
// export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
//   const { state } = useAuth();
//   const [isCollapsed, setIsCollapsed] = React.useState(false);
 
//   const hasPermission = (permission: string) => {
//     if (!state.user) return false;
//     if (!state.user.permissions) return false;
//     return state.user.permissions.includes('all') || state.user.permissions.includes(permission);
//   };
 
//   const canAccessItem = (itemId: string) => {
//     switch (itemId) {
//       case 'billing':
//       case 'inventory':
//       case 'reports':
//       case 'staff':
//       case 'profit-sharing':
//         return hasPermission('all') || state.user?.role === 'admin';
//       case 'patient-queue':
//         return state.user?.role === 'doctor' || state.user?.role === 'admin';
//       default:
//         return true;
//     }
//   };
 
//   const accessibleItems = menuItems.filter(item => canAccessItem(item.id));
 
//   return (
//     /*
//       `relative` + `overflow-visible` on the wrapper is the KEY:
//       - The toggle button uses `absolute right-0 translate-x-1/2`
//         which places it exactly on the sidebar's right border edge.
//       - `overflow-visible` ensures the button isn't clipped by the sidebar.
//       - `z-50` on the button keeps it above the main content area.
//     */
//     <div className={`
//       relative hidden md:flex md:flex-col overflow-visible
//       ${isCollapsed ? 'md:w-16' : 'md:w-72'}
//       bg-white border-r border-gray-200
//       h-[calc(100vh-4rem)] sticky top-16
//       transition-all duration-300 flex-shrink-0
//     `}>
 
//       {/* ── TOGGLE BUTTON — sits on the right edge of the sidebar ──
//           - absolute + right-0        → aligns to sidebar's right side
//           - translate-x-1/2           → pushes half the button outside the sidebar
//           - top-6                     → below the header, near top of nav
//           - z-50                      → floats above main content
//       */}
//       <button
//         onClick={() => setIsCollapsed(!isCollapsed)}
//         title={isCollapsed ? 'Expand' : 'Collapse'}
//         className="
//           absolute top-6 right-0 translate-x-1/2 z-50
//           w-6 h-6 flex items-center justify-center
//           bg-white border border-gray-300 rounded-full
//           shadow-md hover:shadow-lg hover:bg-blue-50
//           transition-all duration-200 group
//         "
//       >
//         {isCollapsed
//           ? <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600 transition-colors" />
//           : <ChevronLeft  className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600 transition-colors" />
//         }
//       </button>
 
//       {/* ── HEADER — logo only, no toggle here ── */}
//       <div className="flex items-center h-16 px-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600 flex-shrink-0">
//         <div className="flex items-center gap-2 min-w-0">
//           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
//             <Stethoscope className="w-5 h-5 text-blue-600" />
//           </div>
//           {!isCollapsed && (
//             <span className="text-lg font-bold text-white whitespace-nowrap truncate">
//               DentalCare Pro
//             </span>
//           )}
//         </div>
//       </div>
 
//       {/* ── SCROLLABLE NAV GRID ── */}
//       <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar">
//         <div className={`grid ${isCollapsed ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-2'} auto-rows-max`}>
//           {accessibleItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = currentPage === item.id;
 
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => onPageChange(item.id)}
//                 title={isCollapsed ? item.label : ''}
//                 className={`
//                   flex flex-col items-center justify-center p-3 rounded-xl
//                   transition-all duration-200 group relative overflow-hidden
//                   ${isActive
//                     ? `bg-${item.color}-50 border-2 border-${item.color}-200 shadow-md`
//                     : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200 hover:shadow-sm'
//                   }
//                 `}
//               >
//                 {/* Active gradient background */}
//                 {isActive && (
//                   <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 opacity-50`} />
//                 )}
 
//                 {/* Icon container */}
//                 <div className={`
//                   relative z-10 w-8 h-8 rounded-lg flex items-center justify-center
//                   ${isCollapsed ? '' : 'mb-2'}
//                   transition-all duration-200
//                   ${isActive ? `bg-${item.color}-100 shadow-sm` : 'bg-white group-hover:bg-gray-200'}
//                 `}>
//                   <Icon className={`w-5 h-5 transition-all duration-200 ${
//                     isActive ? `text-${item.color}-600` : 'text-gray-500 group-hover:text-gray-700'
//                   }`} />
//                 </div>
 
//                 {/* Label */}
//                 {!isCollapsed && (
//                   <span className={`relative z-10 text-xs font-medium text-center leading-tight ${
//                     isActive ? `text-${item.color}-700` : 'text-gray-600 group-hover:text-gray-800'
//                   }`}>
//                     {item.label}
//                   </span>
//                 )}
 
//                 {/* Active indicator dot */}
//                 {isActive && (
//                   <div className={`absolute top-1 right-1 w-2 h-2 bg-${item.color}-500 rounded-full shadow-sm`} />
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }



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
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className={`hidden md:flex md:flex-col ${isCollapsed ? 'md:w-16' : 'md:w-72'} bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300`}>
      {/* Header */}
<div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600">

  {/* Left */}
  <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2'}`}>
    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
      <Stethoscope className="w-5 h-5 text-blue-600" />
    </div>

    {!isCollapsed && (
      <span className="text-lg font-bold text-white whitespace-nowrap">
        DentalCare Pro
      </span>
    )}
  </div>

  {/* Toggle */}
</div>
<button
  onClick={() => setIsCollapsed(!isCollapsed)}
  className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-50
             w-7 h-7 flex items-center justify-center
             bg-white border border-gray-200 rounded-full shadow-md
             hover:bg-gray-100 transition-all duration-300"
>
  <ChevronRight
    className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
      isCollapsed ? 'rotate-180' : ''
    }`}
  />
</button>
{/* <button
  onClick={() => setIsCollapsed(!isCollapsed)}
  className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-50
             w-7 h-7 flex items-center justify-center
             bg-blue-600 text-white rounded-md shadow-md
             hover:bg-blue-700 transition-all duration-300"
>
  <ChevronRight
    className={`w-4 h-4 transition-transform duration-300 ${
      isCollapsed ? 'rotate-180' : ''
    }`}
  />
</button> */}
      {/* Navigation Menu - Fixed Height Grid */}
      <div className="flex-1 p-3">
        <div className={`grid ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'} ${
  isCollapsed ? 'gap-3' : 'gap-2'
} h-full`}>
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
                {!isCollapsed && (
                <span className={`relative z-10 text-xs font-medium text-center leading-tight transition-all duration-200 ${
                  isActive 
                    ? `text-${item.color}-700` 
                    : 'text-gray-600 group-hover:text-gray-800'
                }`}>
                  {item.label}
                </span>
                )}
                
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