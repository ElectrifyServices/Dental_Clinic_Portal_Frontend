import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Users, AlertTriangle, CreditCard, Building2 } from 'lucide-react';
import { MetricCard } from '@/components/ui';

interface StatsState {
  todayAppts: number;
  todayRevenue: number;
  totalPatients: number;
  pendingInvoices: number;
  lowStock: number;
  corpMembers: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsState>({
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
      <MetricCard
        label="Today's Appointments"
        value={stats.todayAppts}
        icon={<Calendar className="w-5 h-5" />}
        variant="gray"
      />
      <MetricCard
        label="Today's Revenue"
        value={`₹${stats.todayRevenue.toLocaleString()}`}
        variant="emerald"
        icon={<TrendingUp className="w-5 h-5" />}
      />
      <MetricCard
        label="Total Patients"
        value={stats.totalPatients}
        variant="primary"
        icon={<Users className="w-5 h-5" />}
      />
      <MetricCard
        label="Pending Invoices"
        value={stats.pendingInvoices}
        variant={stats.pendingInvoices > 0 ? "amber" : "gray"}
        icon={<CreditCard className="w-5 h-5" />}
      />
      <MetricCard
        label="Low Stock Items"
        value={stats.lowStock}
        variant={stats.lowStock > 0 ? "rose" : "gray"}
        icon={<AlertTriangle className="w-5 h-5" />}
      />
      <MetricCard
        label="Corporate Members"
        value={stats.corpMembers}
        variant="indigo"
        icon={<Building2 className="w-5 h-5" />}
      />
    </div>
  );
}

