import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Calendar, Download, IndianRupee,
  Target, UserPlus, CheckCircle, Clock, Package, Building2,
  ArrowUpRight, ArrowDownRight, Zap, Activity, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MetricCard, ContentCard, Card, CardContent, Badge, Button, FilterTabs, DataTable,
} from '@/components/ui';
import {
  RevenueAreaChart, MonthlyBarChart, DonutChart, HorizontalBar, HeatmapCell,
} from '../Dashboard/Charts';
import {
  MOCK_MONTHLY_REVENUE, MOCK_PAYMENT_MODES, MOCK_REVENUE_30DAYS,
  MOCK_PATIENT_GROWTH, MOCK_AGE_GROUPS, MOCK_GENDER,
  MOCK_PEAK_HOURS, MOCK_TOP_TREATMENTS, MOCK_MEMBERSHIP_STATS, MOCK_INVENTORY_RISK,
} from '../../data/mockAnalytics';

// ─── Date Range Picker ─────────────────────────────────────────────────────────
const PERIODS = [
  { key: 'today',     label: 'Today'       },
  { key: 'week',      label: 'This Week'   },
  { key: 'month',     label: 'This Month'  },
  { key: 'lastmonth', label: 'Last Month'  },
  { key: 'year',      label: 'This Year'   },
];

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {children}
    </motion.div>
  );
}

// ─── Revenue Analytics ────────────────────────────────────────────────────────
function RevenueSection({ period }: { period: string }) {
  const maxRevenue = Math.max(...MOCK_MONTHLY_REVENUE.map(d => d.revenue));
  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue"      value="₹32.8L"  icon={<TrendingUp className="w-5 h-5" />} variant="emerald" trend={{ value: '14%', isUp: true }} />
        <MetricCard label="Avg. Daily Revenue" value="₹10,900" icon={<IndianRupee className="w-5 h-5" />} variant="primary" trend={{ value: '6%', isUp: true }} />
        <MetricCard label="Collection Rate"    value="86%"     icon={<Target className="w-5 h-5" />} variant="indigo" trend={{ value: '2%', isUp: true }} />
        <MetricCard label="Top Procedure"      value="Implant" icon={<Zap className="w-5 h-5" />} variant="amber" />
      </div>

      {/* 30-day area chart */}
      <ContentCard title="Daily Revenue (Last 30 Days)" subtitle="Invoiced vs Collected" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="flex items-center gap-5 mb-3 text-[10px] font-bold text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Invoiced</span>
          <span className="flex items-center gap-1.5"><span className="w-4 bg-emerald-500 inline-block" style={{ height: 1, borderTop: '2px dashed' }} /> Collected</span>
        </div>
        <RevenueAreaChart data={MOCK_REVENUE_30DAYS} height={180} />
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly bar chart */}
        <ContentCard title="Monthly Revenue vs Target" subtitle="12-month comparison" icon={<BarChart3 className="w-4 h-4" />}>
          <div className="flex items-center gap-4 mb-3 text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-400 inline-block border-t-2 border-dashed border-amber-400" /> Target</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Met Target</span>
          </div>
          <MonthlyBarChart data={MOCK_MONTHLY_REVENUE} />
        </ContentCard>

        {/* Payment mode donut */}
        <ContentCard title="Revenue by Payment Mode" subtitle="Collection breakdown" icon={<IndianRupee className="w-4 h-4" />}>
          <div className="flex items-center justify-center gap-8">
            <DonutChart slices={MOCK_PAYMENT_MODES} size={140} label="₹32.8L" />
            <div className="space-y-3">
              {MOCK_PAYMENT_MODES.map(m => (
                <div key={m.label} className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-xs text-foreground font-semibold">{m.label}</span>
                  <span className="text-xs font-black ml-auto" style={{ color: m.color }}>{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ContentCard>
      </div>
    </Section>
  );
}

// ─── Patient Analytics ────────────────────────────────────────────────────────
function PatientsSection() {
  const maxGrowth = Math.max(...MOCK_PATIENT_GROWTH.map(d => d.new + d.returning));
  const maxAge = Math.max(...MOCK_AGE_GROUPS.map(d => d.count));
  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Patients"    value="340"  icon={<Users className="w-5 h-5" />} variant="primary" trend={{ value: '8%', isUp: true }} />
        <MetricCard label="New This Month"    value="42"   icon={<UserPlus className="w-5 h-5" />} variant="emerald" trend={{ value: '5%', isUp: true }} />
        <MetricCard label="Retention Rate"    value="74%"  icon={<Activity className="w-5 h-5" />} variant="indigo" trend={{ value: '3%', isUp: false }} />
        <MetricCard label="Churn Risk"        value="18"   icon={<Clock className="w-5 h-5" />} variant="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Age distribution */}
        <ContentCard title="Age Distribution" subtitle="All registered patients" icon={<Users className="w-4 h-4" />}>
          <div className="space-y-4">
            {MOCK_AGE_GROUPS.map(g => (
              <HorizontalBar key={g.range} label={`${g.range} yrs`} value={g.count} max={maxAge} color={g.color} />
            ))}
          </div>
        </ContentCard>

        {/* Gender split */}
        <ContentCard title="Gender Distribution" subtitle="Patient demographics" icon={<Users className="w-4 h-4" />}>
          <div className="flex flex-col items-center gap-4">
            <DonutChart slices={MOCK_GENDER} size={120} />
            <div className="space-y-2 w-full">
              {MOCK_GENDER.map(g => (
                <div key={g.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                    {g.label}
                  </span>
                  <span className="text-xs font-black" style={{ color: g.color }}>{g.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ContentCard>

        {/* Patient growth */}
        <ContentCard title="Monthly Patient Growth" subtitle="New vs Returning" icon={<TrendingUp className="w-4 h-4" />}>
          <div className="space-y-2 mt-2">
            {MOCK_PATIENT_GROWTH.map((d, i) => {
              const total = d.new + d.returning;
              const newPct = (d.new / total) * 100;
              return (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>{d.month}</span>
                    <span className="text-foreground font-bold">{total}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-muted flex">
                    <div className="h-full bg-primary transition-all" style={{ width: `${newPct}%` }} />
                    <div className="h-full bg-primary/20 flex-1" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary inline-block" /> New</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/20 inline-block" /> Returning</span>
          </div>
        </ContentCard>
      </div>

      {/* Churn risk table */}
      <ContentCard title="Churn Risk — Patients Not Visited (>30 days)" icon={<Clock className="w-4 h-4" />}
        action={<Badge variant="amber">18 Patients</Badge>}>
        <DataTable
          data={[
            { name: 'Ramesh Gupta',    phone: '98765-43210', lastVisit: '14 Apr 2026', days: 63, visits: 4 },
            { name: 'Sunita Verma',   phone: '91234-56789', lastVisit: '25 Apr 2026', days: 52, visits: 2 },
            { name: 'Kiran Patel',    phone: '87654-32109', lastVisit: '3 May 2026',  days: 44, visits: 7 },
            { name: 'Anil Sharma',    phone: '76543-21098', lastVisit: '8 May 2026',  days: 39, visits: 1 },
            { name: 'Meera Singh',    phone: '65432-10987', lastVisit: '12 May 2026', days: 35, visits: 3 },
          ]}
          rowKey={(r: any) => r.phone}
          columns={[
            { key: 'name',      header: 'Patient',     render: (r: any) => <span className="font-bold text-foreground">{r.name}</span> },
            { key: 'phone',     header: 'Phone',       render: (r: any) => <span className="text-muted-foreground text-xs">{r.phone}</span> },
            { key: 'lastVisit', header: 'Last Visit',  render: (r: any) => <span className="text-muted-foreground">{r.lastVisit}</span> },
            { key: 'days',      header: 'Days Ago',    align: 'center', render: (r: any) => <Badge variant={r.days > 50 ? 'red' : 'amber'}>{r.days}d</Badge> },
            { key: 'visits',    header: 'Total Visits',align: 'right',  render: (r: any) => <span className="font-bold">{r.visits}</span> },
          ]}
        />
      </ContentCard>
    </Section>
  );
}

// ─── Appointment Analytics ────────────────────────────────────────────────────
const HOURS_LABELS = ['9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM'];
const DAYS_LABELS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function AppointmentsSection() {
  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Bookings"    value="1,248" icon={<Calendar className="w-5 h-5" />} variant="gray"    trend={{ value: '11%', isUp: true }} />
        <MetricCard label="Completed"         value="1,098" icon={<CheckCircle className="w-5 h-5" />} variant="emerald" trend={{ value: '8%', isUp: true }} />
        <MetricCard label="No-Show Rate"      value="6.8%"  icon={<Clock className="w-5 h-5" />}     variant="amber"   trend={{ value: '1.2%', isUp: false }} />
        <MetricCard label="Completion Rate"   value="88%"   icon={<Target className="w-5 h-5" />}     variant="primary" trend={{ value: '3%', isUp: true }} />
      </div>

      {/* Peak hours heatmap */}
      <ContentCard title="Peak Hours Heatmap" subtitle="Day × Hour appointment density" icon={<Activity className="w-4 h-4" />}>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header row */}
            <div className="grid gap-1.5 mb-1" style={{ gridTemplateColumns: `56px repeat(${HOURS_LABELS.length}, 1fr)` }}>
              <div />
              {HOURS_LABELS.map(h => (
                <div key={h} className="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                  {h}
                </div>
              ))}
            </div>
            {/* Heatmap rows */}
            {MOCK_PEAK_HOURS.map(row => (
              <div key={row.day} className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: `56px repeat(${HOURS_LABELS.length}, 1fr)` }}>
                <div className="text-[10px] font-bold text-muted-foreground flex items-center">{row.day}</div>
                {row.slots.map(slot => (
                  <HeatmapCell key={slot.hour} count={slot.count} />
                ))}
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[9px] text-muted-foreground font-medium">Low</span>
              {[0.08, 0.25, 0.45, 0.65, 0.85].map((a, i) => (
                <div key={i} className="w-5 h-4 rounded-sm" style={{ backgroundColor: `rgba(59,130,246,${a})` }} />
              ))}
              <span className="text-[9px] text-muted-foreground font-medium">High</span>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* 7-day forecast */}
      <ContentCard title="Next 7-Day Appointment Forecast" icon={<Calendar className="w-4 h-4" />}>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() + i);
            const isToday = i === 0;
            const count = Math.floor(Math.random() * 12 + 3);
            return (
              <div key={i} className={`p-3 rounded-xl border text-center transition-all ${isToday ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card'}`}>
                <p className={`text-[10px] font-black uppercase ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-lg font-black text-foreground my-1">{d.getDate()}</p>
                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${count > 0 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{count}</div>
              </div>
            );
          })}
        </div>
      </ContentCard>
    </Section>
  );
}

// ─── Treatment Analytics ──────────────────────────────────────────────────────
function TreatmentsSection() {
  const maxRev = Math.max(...MOCK_TOP_TREATMENTS.map(t => t.revenue));
  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Procedures"   value="1,305"  icon={<BarChart3 className="w-5 h-5" />} variant="gray"    trend={{ value: '9%', isUp: true }} />
        <MetricCard label="Completion Rate"    value="91%"    icon={<CheckCircle className="w-5 h-5" />} variant="emerald" />
        <MetricCard label="Avg Procedure Cost" value="₹4,820" icon={<IndianRupee className="w-5 h-5" />} variant="primary" />
        <MetricCard label="Highest Revenue"    value="Implant" icon={<Zap className="w-5 h-5" />} variant="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by treatment */}
        <ContentCard title="Top Treatments by Revenue" icon={<TrendingUp className="w-4 h-4" />}>
          <div className="space-y-4">
            {MOCK_TOP_TREATMENTS.slice(0, 6).map(t => (
              <HorizontalBar
                key={t.procedure}
                label={t.procedure}
                value={t.revenue}
                max={maxRev}
                color="#3b82f6"
                suffix="₹"
              />
            ))}
          </div>
        </ContentCard>

        {/* Volume vs Revenue donut */}
        <ContentCard title="Procedures by Volume" icon={<BarChart3 className="w-4 h-4" />}>
          <DonutChart
            slices={MOCK_TOP_TREATMENTS.slice(0, 5).map((t, i) => ({
              label: t.procedure,
              value: t.count,
              color: ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#f43f5e'][i],
            }))}
            size={160}
            label="1,305"
          />
          <div className="space-y-2 mt-3">
            {MOCK_TOP_TREATMENTS.slice(0, 5).map((t, i) => (
              <div key={t.procedure} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#f43f5e'][i] }} />
                  {t.procedure}
                </span>
                <span className="text-xs font-black text-foreground">{t.count}</span>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Full table */}
      <ContentCard title="All Treatment Revenue" icon={<BarChart3 className="w-4 h-4" />}>
        <DataTable
          data={MOCK_TOP_TREATMENTS}
          rowKey={(t: any) => t.procedure}
          columns={[
            { key: 'procedure', header: 'Treatment',    render: (t: any) => <span className="font-bold">{t.procedure}</span> },
            { key: 'count',     header: 'Cases',        align: 'center', render: (t: any) => <Badge variant="gray">{t.count}</Badge> },
            { key: 'revenue',   header: 'Total Revenue', align: 'right', render: (t: any) => <span className="font-black text-emerald-600">₹{t.revenue.toLocaleString()}</span> },
            { key: 'avg',       header: 'Avg Cost',     align: 'right', render: (t: any) => <span className="font-bold text-primary">₹{t.avg.toLocaleString()}</span> },
          ]}
        />
      </ContentCard>
    </Section>
  );
}

// ─── Membership Analytics ─────────────────────────────────────────────────────
function MembershipSection() {
  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Members"    value="258"     icon={<Building2 className="w-5 h-5" />} variant="indigo"  trend={{ value: '12%', isUp: true }} />
        <MetricCard label="Revenue (Plans)"  value="₹5.9L"   icon={<IndianRupee className="w-5 h-5" />} variant="emerald" />
        <MetricCard label="Avg Utilization"  value="64.75%"  icon={<Activity className="w-5 h-5" />} variant="primary" />
        <MetricCard label="Renewal Rate"     value="78.75%"  icon={<CheckCircle className="w-5 h-5" />} variant="amber" />
      </div>

      <ContentCard title="Plan-Wise Performance" icon={<Building2 className="w-4 h-4" />}>
        <DataTable
          data={MOCK_MEMBERSHIP_STATS}
          rowKey={(m: any) => m.plan}
          columns={[
            { key: 'plan',        header: 'Plan',           render: (m: any) => <span className="font-bold">{m.plan}</span> },
            { key: 'members',     header: 'Members',        align: 'center', render: (m: any) => <Badge variant="blue">{m.members}</Badge> },
            { key: 'revenue',     header: 'Revenue',        align: 'right',  render: (m: any) => <span className="font-black text-emerald-600">₹{m.revenue.toLocaleString()}</span> },
            { key: 'utilization', header: 'Benefit Used',  align: 'center', render: (m: any) => (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${m.utilization}%` }} />
                </div>
                <span className="text-xs font-bold">{m.utilization}%</span>
              </div>
            )},
            { key: 'renewalRate', header: 'Renewal Rate',  align: 'right',  render: (m: any) => (
              <span className={`font-bold text-xs ${m.renewalRate >= 80 ? 'text-emerald-600' : m.renewalRate >= 65 ? 'text-amber-600' : 'text-rose-500'}`}>
                {m.renewalRate}%
              </span>
            )},
          ]}
        />
      </ContentCard>
    </Section>
  );
}

// ─── Inventory Analytics ──────────────────────────────────────────────────────
function InventorySection() {
  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total SKUs"      value="84"   icon={<Package className="w-5 h-5" />} variant="gray" />
        <MetricCard label="Critical Items"  value="3"    icon={<AlertTriangle className="w-5 h-5" />} variant="rose" />
        <MetricCard label="Expiring (30d)"  value="7"    icon={<Clock className="w-5 h-5" />} variant="amber" />
        <MetricCard label="Monthly Spend"   value="₹48k" icon={<IndianRupee className="w-5 h-5" />} variant="primary" />
      </div>

      <ContentCard title="Critical Stock — Will Run Out Soon" icon={<Package className="w-4 h-4" />}
        action={<Badge variant="red">3 Critical</Badge>}>
        <DataTable
          data={MOCK_INVENTORY_RISK}
          rowKey={(r: any) => r.item}
          columns={[
            { key: 'item',     header: 'Item',          render: (r: any) => <span className="font-bold text-foreground">{r.item}</span> },
            { key: 'category', header: 'Category',      render: (r: any) => <Badge variant="gray">{r.category}</Badge> },
            { key: 'stock',    header: 'Stock Left',    align: 'center', render: (r: any) => (
              <span className={`font-black text-sm ${r.stock <= r.min / 4 ? 'text-rose-600' : 'text-amber-600'}`}>{r.stock}</span>
            )},
            { key: 'min',      header: 'Min Required',  align: 'center', render: (r: any) => <span className="text-muted-foreground">{r.min}</span> },
            { key: 'daysLeft', header: 'Days Left',     align: 'right',  render: (r: any) => (
              <Badge variant={r.daysLeft <= 2 ? 'red' : 'amber'}>{r.daysLeft}d</Badge>
            )},
          ]}
        />
      </ContentCard>
    </Section>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const REPORT_TABS = [
  { id: 'revenue',     label: 'Revenue',     icon: TrendingUp,   color: 'from-emerald-500 to-teal-600'     },
  { id: 'patients',    label: 'Patients',    icon: Users,        color: 'from-blue-500 to-indigo-600'      },
  { id: 'appointments',label: 'Appointments',icon: Calendar,     color: 'from-violet-500 to-purple-600'    },
  { id: 'treatments',  label: 'Treatments',  icon: BarChart3,    color: 'from-amber-500 to-orange-600'     },
  { id: 'membership',  label: 'Membership',  icon: Building2,    color: 'from-indigo-500 to-violet-600'    },
  { id: 'inventory',   label: 'Inventory',   icon: Package,      color: 'from-rose-500 to-red-600'         },
];

export function ReportsDashboard({ patients, appointments, treatments, invoices }: any) {
  const [period, setPeriod]   = useState('month');
  const [activeTab, setTab]   = useState('revenue');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-border/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Clinic Analytics</h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Performance insights across revenue, patients, appointments & more
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FilterTabs
              tabs={PERIODS}
              active={period}
              onChange={setPeriod}
            />
            <Button variant="outline" className="gap-2 flex-shrink-0">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        <div className="h-px bg-border/50 mx-0" />

        {/* Tab bar */}
        <div className="flex overflow-x-auto scrollbar-hide">
          {REPORT_TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 border-b-2 transition-all text-sm font-bold whitespace-nowrap ${
                  active
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${tab.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                {tab.label}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <div key={activeTab}>
          {activeTab === 'revenue'      && <RevenueSection period={period} />}
          {activeTab === 'patients'     && <PatientsSection />}
          {activeTab === 'appointments' && <AppointmentsSection />}
          {activeTab === 'treatments'   && <TreatmentsSection />}
          {activeTab === 'membership'   && <MembershipSection />}
          {activeTab === 'inventory'    && <InventorySection />}
        </div>
      </AnimatePresence>
    </div>
  );
}
