import React, { useMemo } from 'react';
import {
  Calendar, TrendingUp, Users, AlertTriangle, CreditCard, Building2,
  Clock, Target, ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MetricCard } from '@/components/ui';
import { MOCK_KPI, MOCK_REVENUE_30DAYS } from '../../data/mockAnalytics';
import { RevenueAreaChart, MiniSparkline } from './Charts';

function Greeting() {
  const hour = new Date().getHours();
  const name = 'Doctor';
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const day = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">
        {greeting}, <span className="text-primary">{name}</span>
      </h1>
      <p className="text-xs text-muted-foreground font-medium mt-0.5">{day}</p>
    </div>
  );
}

function GoalProgressBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
        <span>Monthly Revenue Goal</span>
        <span className="text-foreground">
          ₹{(current / 1000).toFixed(0)}k / ₹{(target / 1000).toFixed(0)}k
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground font-medium">
        {pct.toFixed(1)}% of target achieved · ₹{((target - current) / 1000).toFixed(0)}k remaining
      </p>
    </div>
  );
}

export function EnhancedDashboardStats() {
  const kpi = MOCK_KPI;
  const sparkData = MOCK_REVENUE_30DAYS.map(d => d.revenue);

  const cards = [
    {
      label: "Today's Appointments",
      value: kpi.todayAppointments.value,
      icon: <Calendar className="w-5 h-5" />,
      variant: 'gray' as const,
      trend: kpi.todayAppointments.trend,
      sub: `${kpi.todayAppointments.completed} completed · ${kpi.todayAppointments.remaining} remaining`,
    },
    {
      label: "Today's Revenue",
      value: `₹${(kpi.todayRevenue.value / 1000).toFixed(0)}k`,
      icon: <TrendingUp className="w-5 h-5" />,
      variant: 'emerald' as const,
      trend: kpi.todayRevenue.trend,
      sub: `₹${(kpi.todayRevenue.collected / 1000).toFixed(0)}k collected · ₹${(kpi.todayRevenue.pending / 1000).toFixed(0)}k pending`,
    },
    {
      label: 'New Patients (Week)',
      value: kpi.newPatientsWeek.value,
      icon: <Users className="w-5 h-5" />,
      variant: 'primary' as const,
      trend: kpi.newPatientsWeek.trend,
      sub: 'vs last week',
    },
    {
      label: 'Pending Invoices',
      value: kpi.pendingInvoices.value,
      icon: <CreditCard className="w-5 h-5" />,
      variant: kpi.pendingInvoices.value > 0 ? 'amber' as const : 'gray' as const,
      trend: kpi.pendingInvoices.trend,
      sub: `₹${(kpi.pendingInvoices.amount / 1000).toFixed(0)}k outstanding`,
    },
    {
      label: 'Low Stock Items',
      value: kpi.lowStock.value,
      icon: <AlertTriangle className="w-5 h-5" />,
      variant: kpi.lowStock.value > 0 ? 'rose' as const : 'gray' as const,
      trend: kpi.lowStock.trend,
      sub: 'Items at critical level',
    },
    {
      label: 'Active Members',
      value: kpi.activeMembers.value,
      icon: <Building2 className="w-5 h-5" />,
      variant: 'indigo' as const,
      trend: kpi.activeMembers.trend,
      sub: 'Corporate + Individual',
    },
    {
      label: 'Queue Right Now',
      value: kpi.consultationQueue.value,
      icon: <Clock className="w-5 h-5" />,
      variant: 'gray' as const,
      sub: 'Patients waiting',
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <MetricCard
              label={c.label}
              value={c.value}
              icon={c.icon}
              variant={c.variant}
              trend={c.trend}
            />
          </motion.div>
        ))}
      </div>

      {/* Revenue chart + goal strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Revenue Trend</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Last 30 days · invoiced vs collected</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Invoiced
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 border-dashed border-t-2 border-emerald-500 inline-block" /> Collected
              </span>
            </div>
          </div>
          <RevenueAreaChart data={MOCK_REVENUE_30DAYS} height={160} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Goal Progress */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <GoalProgressBar current={kpi.monthlyGoal.current} target={kpi.monthlyGoal.target} />
          </div>

          {/* Quick stat strip */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-card flex flex-col gap-3">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quick Insights</p>
            {[
              { label: 'Avg. Daily Revenue', val: '₹8,900', up: true },
              { label: 'Appt Completion Rate', val: '88%', up: true },
              { label: 'Patient Retention', val: '74%', up: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                <span className={`text-xs font-black flex items-center gap-1 ${item.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {item.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
