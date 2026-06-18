// ─── Mock Analytics Data ──────────────────────────────────────────────────────
// All demo/placeholder data — replace with API calls when backend is ready

export const MOCK_REVENUE_30DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    revenue: Math.floor(8000 + Math.random() * 24000),
    collected: Math.floor(6000 + Math.random() * 20000),
  };
});

export const MOCK_MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 182000, target: 175000 },
  { month: 'Feb', revenue: 154000, target: 175000 },
  { month: 'Mar', revenue: 198000, target: 180000 },
  { month: 'Apr', revenue: 221000, target: 190000 },
  { month: 'May', revenue: 267000, target: 200000 },
  { month: 'Jun', revenue: 189000, target: 210000 },
  { month: 'Jul', revenue: 243000, target: 220000 },
  { month: 'Aug', revenue: 278000, target: 225000 },
  { month: 'Sep', revenue: 312000, target: 230000 },
  { month: 'Oct', revenue: 289000, target: 240000 },
  { month: 'Nov', revenue: 334000, target: 250000 },
  { month: 'Dec', revenue: 298000, target: 260000 },
];

export const MOCK_PAYMENT_MODES = [
  { label: 'UPI', value: 38, color: '#6366f1' },
  { label: 'Cash', value: 29, color: '#10b981' },
  { label: 'Card', value: 21, color: '#3b82f6' },
  { label: 'Corporate', value: 12, color: '#f59e0b' },
];

export const MOCK_PATIENT_GROWTH = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  new: Math.floor(18 + Math.random() * 32),
  returning: Math.floor(60 + Math.random() * 80),
}));

export const MOCK_AGE_GROUPS = [
  { range: '0–18', count: 42, color: '#6366f1' },
  { range: '19–35', count: 138, color: '#3b82f6' },
  { range: '36–50', count: 97, color: '#10b981' },
  { range: '51+',   count: 63, color: '#f59e0b' },
];

export const MOCK_GENDER = [
  { label: 'Male',   value: 52, color: '#3b82f6' },
  { label: 'Female', value: 44, color: '#ec4899' },
  { label: 'Other',  value: 4,  color: '#8b5cf6' },
];

// Peak hours heatmap: days × hours
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOURS = ['9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM'];
export const MOCK_PEAK_HOURS = DAYS.map(day => ({
  day,
  slots: HOURS.map(hour => ({
    hour,
    count: Math.floor(Math.random() * 10),
  })),
}));

export const MOCK_TOP_TREATMENTS = [
  { procedure: 'Dental Implant',     count: 87,  revenue: 1740000, avg: 20000 },
  { procedure: 'Root Canal',         count: 214, revenue: 1284000, avg: 6000  },
  { procedure: 'Scaling & Polishing',count: 342, revenue: 513000,  avg: 1500  },
  { procedure: 'Tooth Extraction',   count: 189, revenue: 378000,  avg: 2000  },
  { procedure: 'Crown & Bridge',     count: 76,  revenue: 912000,  avg: 12000 },
  { procedure: 'Orthodontics',       count: 43,  revenue: 1075000, avg: 25000 },
  { procedure: 'Teeth Whitening',    count: 98,  revenue: 294000,  avg: 3000  },
  { procedure: 'Filling',            count: 256, revenue: 384000,  avg: 1500  },
];

export const MOCK_DOCTORS = [
  {
    id: 'd1', name: 'Dr. Rajesh Kumar', specialization: 'Endodontist',
    appointments: 9, revenue: 87500, utilization: 78, patientsToday: 9,
    avatar: 'R', color: 'bg-blue-500',
    completionRate: 88,
  },
  {
    id: 'd2', name: 'Dr. Priya Sharma', specialization: 'Orthodontist',
    appointments: 7, revenue: 62000, utilization: 65, patientsToday: 7,
    avatar: 'P', color: 'bg-emerald-500',
    completionRate: 92,
  },
  {
    id: 'd3', name: 'Dr. Arjun Mehta', specialization: 'Periodontist',
    appointments: 5, revenue: 45000, utilization: 54, patientsToday: 5,
    avatar: 'A', color: 'bg-violet-500',
    completionRate: 80,
  },
];

export const MOCK_SMART_ALERTS = [
  { id: 'a1', type: 'warning',  icon: 'invoice',    message: '4 invoices overdue (>7 days)', value: '₹38,500 pending',    action: 'View Billing'    },
  { id: 'a2', type: 'danger',   icon: 'stock',      message: '3 items critically low stock', value: 'Gloves, Cotton, X-Ray Film', action: 'Order Now'  },
  { id: 'a3', type: 'info',     icon: 'followup',   message: '6 follow-ups due this week',   value: 'Last visit >30 days',action: 'Schedule'        },
  { id: 'a4', type: 'success',  icon: 'membership', message: '2 memberships expiring soon',  value: 'Expires in <15 days',action: 'Renew Plans'      },
];

export const MOCK_APPT_STATUS = [
  { label: 'Completed', count: 6,  color: '#10b981', bg: 'bg-emerald-500' },
  { label: 'Scheduled', count: 3,  color: '#6366f1', bg: 'bg-indigo-500'  },
  { label: 'Confirmed', count: 2,  color: '#3b82f6', bg: 'bg-blue-500'    },
  { label: 'Cancelled', count: 1,  color: '#f43f5e', bg: 'bg-rose-500'    },
  { label: 'No Show',   count: 1,  color: '#f59e0b', bg: 'bg-amber-500'   },
];

export const MOCK_MEMBERSHIP_STATS = [
  { plan: 'Gold Individual',  members: 48, revenue: 144000, utilization: 72, renewalRate: 84 },
  { plan: 'Silver Corporate', members: 120,revenue: 240000, utilization: 58, renewalRate: 91 },
  { plan: 'Platinum Family',  members: 23, revenue: 138000, utilization: 88, renewalRate: 78 },
  { plan: 'Basic Personal',   members: 67, revenue: 67000,  utilization: 41, renewalRate: 62 },
];

export const MOCK_INVENTORY_RISK = [
  { item: 'Examination Gloves', stock: 2,   min: 10, daysLeft: 1,  category: 'consumables' },
  { item: 'Dental Cotton Rolls', stock: 5,  min: 20, daysLeft: 2,  category: 'consumables' },
  { item: 'X-Ray Films',        stock: 8,   min: 15, daysLeft: 4,  category: 'materials'   },
  { item: 'Anesthetic Carpules', stock: 12, min: 20, daysLeft: 5,  category: 'medicines'   },
  { item: 'Composite Resin',    stock: 3,   min: 8,  daysLeft: 3,  category: 'materials'   },
];

// Dashboard KPI mock
export const MOCK_KPI = {
  todayAppointments:  { value: 13, completed: 6, remaining: 7,  trend: { value: '8%', isUp: true  } },
  todayRevenue:       { value: 87500, collected: 63200, pending: 24300, trend: { value: '12%', isUp: true } },
  newPatientsWeek:    { value: 14, trend: { value: '3%', isUp: false } },
  pendingInvoices:    { value: 4, amount: 38500,  trend: { value: '2', isUp: false } },
  lowStock:           { value: 3, trend: { value: '1', isUp: false } },
  activeMembers:      { value: 258, trend: { value: '5%', isUp: true } },
  monthlyGoal:        { target: 350000, current: 267000 },
  consultationQueue:  { value: 3 },
};
