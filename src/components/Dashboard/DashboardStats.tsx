import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Users, AlertTriangle, CreditCard, Building2 } from 'lucide-react';
import { KpiCard } from '@/components/ui';

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
      <KpiCard
        label="Today's Appointments"
        value={stats.todayAppts}
        icon={<Calendar className="w-6 h-6" />}
        sub="View schedule →"
      />
      <KpiCard
        label="Today's Revenue"
        value={`₹${stats.todayRevenue.toLocaleString()}`}
        colorClass="text-emerald-600"
        icon={<TrendingUp className="w-6 h-6" />}
        sub="From completed visits"
        subPositive
      />
      <KpiCard
        label="Total Patients"
        value={stats.totalPatients}
        icon={<Users className="w-6 h-6" />}
        sub="Registered in system"
      />
      <KpiCard
        label="Pending Invoices"
        value={stats.pendingInvoices}
        colorClass={stats.pendingInvoices > 0 ? 'text-amber-600' : 'text-foreground'}
        icon={<CreditCard className="w-6 h-6" />}
        sub={stats.pendingInvoices > 0 ? `${stats.pendingInvoices} need attention` : 'All clear'}
        subPositive={stats.pendingInvoices === 0}
      />
      <KpiCard
        label="Low Stock Items"
        value={stats.lowStock}
        colorClass={stats.lowStock > 0 ? 'text-destructive' : 'text-foreground'}
        icon={<AlertTriangle className="w-6 h-6" />}
        sub={stats.lowStock > 0 ? 'Reorder needed' : 'Levels OK'}
        subPositive={stats.lowStock === 0}
      />
      <KpiCard
        label="Corporate Members"
        value={stats.corpMembers}
        icon={<Building2 className="w-6 h-6" />}
        sub="On active plans"
      />
    </div>
  );
}

