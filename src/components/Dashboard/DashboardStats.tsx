import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Users, AlertTriangle, CreditCard, Building2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
  subPositive?: boolean;
}

function StatCard({ title, value, icon, iconBg, sub, subPositive }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && (
            <p className={`text-xs mt-1.5 font-medium ${subPositive !== false ? 'text-emerald-600' : 'text-red-500'}`}>{sub}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState({
    todayAppts: 0, todayRevenue: 0, totalPatients: 0,
    pendingInvoices: 0, lowStock: 0, corpMembers: 0,
  });

  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const appts: any[] = JSON.parse(localStorage.getItem('appointments') || '[]');
      const patients: any[] = JSON.parse(localStorage.getItem('patients') || '[]');
      const invoices: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const inventory: any[] = JSON.parse(localStorage.getItem('inventory') || '[]');
      const todayA = appts.filter(a => new Date(a.date).toDateString() === today);
      setStats({
        todayAppts: todayA.length,
        todayRevenue: todayA.filter(a => a.status === 'completed').reduce((s, a) => s + (Number(a.fee) || 0), 0),
        totalPatients: patients.length,
        pendingInvoices: invoices.filter(i => ['draft', 'sent', 'overdue'].includes(i.status)).length,
        lowStock: inventory.filter(i => i.currentStock <= i.minStock).length,
        corpMembers: patients.filter(p => p.corporatePlanId).length,
      });
    } catch { /* safe default */ }
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard title="Today's Appointments" value={stats.todayAppts}
        icon={<Calendar className="w-5 h-5 text-white" />} iconBg="bg-blue-500"
        sub="View schedule →" />
      <StatCard title="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`}
        icon={<TrendingUp className="w-5 h-5 text-white" />} iconBg="bg-emerald-500"
        sub="From completed visits" subPositive={true} />
      <StatCard title="Total Patients" value={stats.totalPatients}
        icon={<Users className="w-5 h-5 text-white" />} iconBg="bg-indigo-500"
        sub="Registered in system" />
      <StatCard title="Pending Invoices" value={stats.pendingInvoices}
        icon={<CreditCard className="w-5 h-5 text-white" />} iconBg="bg-amber-500"
        sub={stats.pendingInvoices > 0 ? `${stats.pendingInvoices} need attention` : 'All clear'}
        subPositive={stats.pendingInvoices === 0} />
      <StatCard title="Low Stock Items" value={stats.lowStock}
        icon={<AlertTriangle className="w-5 h-5 text-white" />}
        iconBg={stats.lowStock > 0 ? 'bg-red-500' : 'bg-gray-400'}
        sub={stats.lowStock > 0 ? 'Reorder needed' : 'Levels OK'}
        subPositive={stats.lowStock === 0} />
      <StatCard title="Corporate Members" value={stats.corpMembers}
        icon={<Building2 className="w-5 h-5 text-white" />} iconBg="bg-violet-500"
        sub="On active plans" />
    </div>
  );
}
