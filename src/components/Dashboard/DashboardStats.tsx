import React from 'react';
import {
  Calendar, TrendingUp, Users, AlertTriangle, CreditCard, Building2,
  ArrowUpRight, ArrowDownRight, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MetricCard } from '@/components/ui';
import { RevenueAreaChart } from './Charts';
import {
  useAppointmentsCount,
  useRevenue,
  usePatientsCount,
  usePendingInvoices,
  useLowStockItems,
  useCorporateMembers,
  useRevenueTrend,
  useAvgDailyRevenue,
  useApptCompletionRate,
  usePatientRetention
} from '../../hooks/dashboard/useDashboardAnalytics';

const extractValue = (data: any): string | number => {
  if (data === null || data === undefined) return 0;
  if (typeof data === 'number' || typeof data === 'string') return data;
  if (typeof data === 'object') {
    if ('count' in data) return data.count;
    if ('value' in data) return data.value;
    if ('total' in data) return data.total;
    if ('appointmentsCount' in data) return data.appointmentsCount;
    if ('patientsCount' in data) return data.patientsCount;
    const values = Object.values(data);
    if (values.length > 0 && (typeof values[0] === 'number' || typeof values[0] === 'string')) {
      return values[0] as string | number;
    }
  }
  return 0;
};

export function EnhancedDashboardStats({ period = 'today', customStart, customEnd }: { period?: string, customStart?: string, customEnd?: string }) {
  // Helpers
  const periodLabel = period === 'today' ? "Today's" : period === 'week' ? "This Week's" : period === 'month' ? "This Month's" : period === 'year' ? "This Year's" : "Custom Period";
  const periodSuffix = period === 'today' ? "(Today)" : period === 'week' ? "(Week)" : period === 'month' ? "(Month)" : period === 'year' ? "(Year)" : "(Custom)";

  // API Hooks
  const { data: appointmentsCount = 0 } = useAppointmentsCount(period, customStart, customEnd);
  const { data: revenueData = {} } = useRevenue(period, customStart, customEnd);
  const { data: patientsCount = 0 } = usePatientsCount(period, customStart, customEnd);
  const { data: pendingInvoices = 0 } = usePendingInvoices();
  const { data: lowStockItems = 0 } = useLowStockItems();
  const { data: corporateMembers = 0 } = useCorporateMembers();
  const { data: revenueTrend = [] } = useRevenueTrend();

  const mappedRevenueTrend = React.useMemo(() => {
    let arr = revenueTrend as any;
    if (arr && typeof arr === 'object' && !Array.isArray(arr)) {
      if (Array.isArray(arr.data)) arr = arr.data;
      else if (Array.isArray(arr.items)) arr = arr.items;
      else if (Array.isArray(arr.trend)) arr = arr.trend;
      else arr = Object.values(arr).find(Array.isArray) || [];
    }

    if (!Array.isArray(arr)) return [];

    return arr.map((d: any) => ({
      date: d.month || d.date || d.name || '',
      revenue: typeof d.invoiced === 'number' ? d.invoiced : (Number(d.revenue) || Number(d.invoiced) || 0),
      collected: typeof d.collected === 'number' ? d.collected : (Number(d.collected) || 0)
    }));
  }, [revenueTrend]);

  const { data: avgDailyRevenue = 0 } = useAvgDailyRevenue();
  const { data: apptCompletionRate = 0 } = useApptCompletionRate();
  const { data: patientRetention = 0 } = usePatientRetention();

  const cards = [
    {
      label: `${periodLabel} Appointments`,
      value: extractValue(appointmentsCount),
      icon: <Calendar className="w-5 h-5" />,
      variant: 'gray' as const,
      sub: `Total scheduled`,
    },
    {
      label: `${periodLabel} Revenue`,
      value: `₹${((extractValue(revenueData?.totalCollected) || extractValue(revenueData?.revenue) || extractValue(revenueData) || 0) as number / 1000).toFixed(0)}k`,
      icon: <TrendingUp className="w-5 h-5" />,
      variant: 'emerald' as const,
      sub: `Total collected`,
    },
    {
      label: `New Patients ${periodSuffix}`,
      value: extractValue(patientsCount),
      icon: <Users className="w-5 h-5" />,
      variant: 'primary' as const,
      sub: 'Total new patients',
    },
    {
      label: 'Pending Invoices',
      value: extractValue(pendingInvoices),
      icon: <CreditCard className="w-5 h-5" />,
      variant: Number(extractValue(pendingInvoices)) > 0 ? 'amber' as const : 'gray' as const,
      sub: `Outstanding count`,
    },
    {
      label: 'Low Stock Items',
      value: extractValue(lowStockItems),
      icon: <AlertTriangle className="w-5 h-5" />,
      variant: Number(extractValue(lowStockItems)) > 0 ? 'rose' as const : 'gray' as const,
      sub: 'Items at critical level',
    },
    {
      label: 'Active Members',
      value: extractValue(corporateMembers),
      icon: <Building2 className="w-5 h-5" />,
      variant: 'indigo' as const,
      sub: 'Corporate + Individual',
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
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
              sub={c.sub}
            />
          </motion.div>
        ))}
      </div>

      {/* Revenue chart + goal strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Revenue Trend</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                This graph shows monthly data (ignores top date filter)
              </p>
            </div>

            {/* Display totals from API instead of legend */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-4 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-blue-600">
                  Total Invoiced: ₹{Number(revenueTrend?.totalInvoiced || 0).toLocaleString('en-IN')}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  Total Revenue: ₹{Number(revenueTrend?.totalRevenue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              {/* {(revenueTrend?.totalInvoicesCount || 0) > 0 && (
                 <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest">
                   {revenueTrend?.totalInvoicesCount} Invoices
                 </span>
              )} */}
            </div>
          </div>
          {mappedRevenueTrend.length > 0 ? (
            <RevenueAreaChart data={mappedRevenueTrend} height={160} />
          ) : (
            <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm font-medium">No trend data available</div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Quick stat strip */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-card flex flex-col gap-3 h-full justify-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Quick Insights</p>
            {[
              { label: 'Avg. Daily Revenue', val: `₹${extractValue(avgDailyRevenue)}`, up: true },
              { label: 'Appt Completion Rate', val: `${extractValue(apptCompletionRate)}%`, up: true },
              { label: 'Patient Retention', val: `${extractValue(patientRetention)}%`, up: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 last:pb-0">
                <span className="text-xs text-muted-foreground font-semibold">{item.label}</span>
                <span className={`text-sm font-black flex items-center gap-1 ${item.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {item.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
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
