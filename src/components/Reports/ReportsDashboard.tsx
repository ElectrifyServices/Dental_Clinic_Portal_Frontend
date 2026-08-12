import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, Calendar, Download, IndianRupee,
  Target, UserPlus, CheckCircle, Clock, Package, Building2,
  ArrowUpRight, ArrowDownRight, Zap, Activity, AlertTriangle, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MetricCard, ContentCard, Card, CardContent, Badge, Button, FilterTabs, DataTable, Pagination, toast
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
  // { key: 'custom',    label: 'Custom'      },
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

import {
  useTotalPatientsAnalyticsQuery,
  useNewPatientsAnalyticsQuery,
  useRetentionRateAnalyticsQuery,
  useChurnRiskCountAnalyticsQuery,
  useAgeDistributionAnalyticsQuery,
  useGenderDistributionAnalyticsQuery,
  useMonthlyGrowthAnalyticsQuery,
  useChurnRiskAnalyticsQuery,
  useTotalMembersAnalyticsQuery,
  useMembershipRevenueAnalyticsQuery,
  useAvgUtilizationAnalyticsQuery,
  useRenewalRateAnalyticsQuery,
  usePlanWisePerformanceAnalyticsQuery,
  useTotalProceduresQuery,
  useCompletionRateQuery,
  useAvgProcedureCostQuery,
  useHighestRevenueQuery,
  useTopTreatmentsByRevenueQuery,
  useAllTreatmentRevenueQuery,
  useProceduresByVolumeQuery,
  useTotalBookingsAnalyticsQuery,
  useCompletedBookingsAnalyticsQuery,
  useNoShowRateAnalyticsQuery,
  useApptCompletionRateAnalyticsQuery,
  usePeakHoursHeatmapAnalyticsQuery,
  useNext7DayForecastAnalyticsQuery,
  exportAppointmentAnalytics,
  exportPatientAnalytics,
  exportTreatmentAnalytics,
  exportMembershipAnalytics,
  useTotalSkusAnalyticsQuery,
  useCriticalItemsAnalyticsQuery,
  useExpiringSoonAnalyticsQuery,
  useMonthlySpendAnalyticsQuery,
  useCriticalStockAnalyticsQuery,
  exportInventoryAnalytics,
} from '@/hooks/analytics';
import { downloadExcelFromBlob } from '@/utils/export/exportHandler';

// Helper function to build filter payload based on period string
function getFilterPayload(period: string, startDate?: string, endDate?: string) {
  if (period === 'custom') {
    return {
      timeRange: 'custom',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  }

  let timeRange = 'this_month';

  if (period === 'today') {
    timeRange = 'today';
  } else if (period === 'week') {
    timeRange = 'this_week';
  } else if (period === 'month') {
    timeRange = 'this_month';
  } else if (period === 'lastmonth') {
    timeRange = 'last_month';
  } else if (period === 'year') {
    timeRange = 'this_year';
  }

  return { timeRange };
}

// ─── Patient Analytics ────────────────────────────────────────────────────────
function PatientsSection({ period, startDate, endDate }: { period: string; startDate?: string; endDate?: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const baseFilter = getFilterPayload(period, startDate, endDate);
  const tableFilter = { ...baseFilter, page, limit };

  // 1. Total Patients API
  const { data: totalPatientsRes, isLoading: loadingTotal } = useTotalPatientsAnalyticsQuery(baseFilter);
  // 2. New Patients API
  const { data: newPatientsRes, isLoading: loadingNew } = useNewPatientsAnalyticsQuery(baseFilter);
  // 3. Retention Rate API
  const { data: retentionRes, isLoading: loadingRetention } = useRetentionRateAnalyticsQuery(baseFilter);
  // 4. Churn Risk Count API
  const { data: churnCountRes, isLoading: loadingChurnCount } = useChurnRiskCountAnalyticsQuery(baseFilter);
  // 5. Age Distribution API
  const { data: ageRes, isLoading: loadingAge } = useAgeDistributionAnalyticsQuery(baseFilter);
  // 6. Gender Distribution API
  const { data: genderRes, isLoading: loadingGender } = useGenderDistributionAnalyticsQuery(baseFilter);
  // 7. Monthly Patient Growth API
  const { data: growthRes, isLoading: loadingGrowth } = useMonthlyGrowthAnalyticsQuery(baseFilter);
  // 8. Churn Risk Patient List API
  const { data: churnListRes, isLoading: loadingChurnList } = useChurnRiskAnalyticsQuery(tableFilter);

  // Reset page to 1 if filter period changes
  useEffect(() => {
    setPage(1);
  }, [period]);

  // --- Total Patients ---
  const totalData = totalPatientsRes?.data ?? totalPatientsRes;
  const totalVal = totalData?.totalPatients ?? totalData?.total ?? totalData?.count ?? 0;
  const totalPct = totalData?.growthPercentage ?? totalData?.percentageChange;
  const totalTrend = totalPct !== undefined
    ? { value: `${Math.abs(totalPct)}%`, isUp: totalPct >= 0 }
    : undefined;

  // --- New Patients ---
  const newData = newPatientsRes?.data ?? newPatientsRes;
  const newVal = newData?.newPatients ?? newData?.total ?? newData?.count ?? 0;
  const newPct = newData?.growthPercentage ?? newData?.percentageChange;
  const newTrend = newPct !== undefined
    ? { value: `${Math.abs(newPct)}%`, isUp: newPct >= 0 }
    : undefined;

  // --- Retention Rate ---
  const retentionData = retentionRes?.data ?? retentionRes;
  const retentionVal = retentionData?.retentionRate ?? retentionData?.rate ?? retentionData?.percentage ?? 0;
  const retentionPct = retentionData?.growthPercentage ?? retentionData?.percentageChange;
  const retentionTrend = retentionPct !== undefined
    ? { value: `${Math.abs(retentionPct)}%`, isUp: retentionPct >= 0 }
    : undefined;

  // --- Churn Risk Count ---
  const churnCountData = churnCountRes?.data ?? churnCountRes;
  const churnCountVal = churnCountData?.churnRiskPatients ?? churnCountData?.count ?? churnCountData?.total ?? 0;

  // --- Age Distribution ---
  const ageDataObj = ageRes?.data ?? ageRes;
  const ageRawArray = Array.isArray(ageDataObj?.data) ? ageDataObj.data : Array.isArray(ageDataObj) ? ageDataObj : [];
  const ageGroups: { range: string; count: number; percentage: number; color: string }[] = ageRawArray.map((g: any, i: number) => ({
    range: g.ageRange ?? g.range ?? g.ageGroup ?? g.label ?? `${g.min ?? ''}-${g.max ?? ''}`,
    count: Number(g.count ?? g.value ?? 0),
    percentage: Number(g.percentage ?? 0),
    color: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][i % 4]
  }));

  const maxAge = ageGroups.length > 0 ? Math.max(...ageGroups.map(d => d.count || 0), 1) : 1;

  // --- Gender Distribution ---
  const genderDataObj = genderRes?.data ?? genderRes;
  const genderRawArray = Array.isArray(genderDataObj?.data) ? genderDataObj.data : Array.isArray(genderDataObj) ? genderDataObj : [];
  const genderSlices: { label: string; count: number; percentage: number; value: number; color: string }[] = genderRawArray.map((g: any, i: number) => {
    const rawLabel = String(g.gender ?? g.label ?? 'Unknown');
    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase();
    const count = Number(g.count ?? 0);
    const percentage = Number(g.percentage ?? g.value ?? 0);
    return {
      label,
      count,
      percentage,
      value: percentage,
      color: ['#3b82f6', '#ec4899', '#a855f7'][i % 3]
    };
  });

  // --- Monthly Patient Growth ---
  const growthDataObj = growthRes?.data ?? growthRes;
  const growthRawArray = Array.isArray(growthDataObj?.data) ? growthDataObj.data : Array.isArray(growthDataObj) ? growthDataObj : [];
  const patientGrowthData: { month: string; newPatients: number; returningPatients: number; total: number }[] = growthRawArray.map((d: any) => {
    const newPatients = Number(d.newPatients ?? d.new ?? 0);
    const returningPatients = Number(d.returningPatients ?? d.returning ?? 0);
    const total = Number(d.total ?? (newPatients + returningPatients));
    return {
      month: d.month ?? d.name ?? d.date ?? '',
      newPatients,
      returningPatients,
      total,
    };
  });

  // --- Churn Risk Table List ---
  const churnDataObj = churnListRes?.data ?? churnListRes;
  const churnRawArray = Array.isArray(churnDataObj?.patients) ? churnDataObj.patients : Array.isArray(churnDataObj?.data) ? churnDataObj.data : Array.isArray(churnDataObj) ? churnDataObj : [];
  const churnRiskList: { name: string; phone: string; lastVisit: string; days: number; visits: number }[] = churnRawArray.map((r: any) => ({
    name: r.name ?? r.patientName ?? r.full_name ?? (r.first_name ? `${r.first_name} ${r.last_name || ''}` : 'N/A'),
    phone: r.phone ?? r.phoneNumber ?? r.mobile ?? 'N/A',
    lastVisit: r.lastVisit ?? r.lastVisitDate ?? r.last_visit_date ?? 'N/A',
    days: Number(r.days ?? r.daysAgo ?? r.days_since_last_visit ?? 0),
    visits: Number(r.visits ?? r.totalVisits ?? r.total_visits ?? 0),
  }));

  const paginationInfo = churnListRes?.pagination || {};
  const totalItems = paginationInfo.total_items ?? churnListRes?.totalItems ?? churnListRes?.total ?? churnRawArray.length;
  const totalPages = paginationInfo.total_pages ?? churnListRes?.totalPages ?? (Math.ceil(totalItems / limit) || 1);

  const paginationUI = totalItems > 0 ? (
    <div className="py-4 px-6 border-t border-border/50 bg-muted/20 mt-4 rounded-xl">
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={limit}
        onPageChange={setPage}
        onPerPageChange={setLimit}
      />
    </div>
  ) : null;

  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Patients"
          value={loadingTotal ? "..." : String(totalVal)}
          icon={<Users className="w-5 h-5" />}
          variant="primary"
          trend={totalTrend}
        />
        <MetricCard
          label="New This Month"
          value={loadingNew ? "..." : String(newVal)}
          icon={<UserPlus className="w-5 h-5" />}
          variant="emerald"
          trend={newTrend}
        />
        <MetricCard
          label="Retention Rate"
          value={loadingRetention ? "..." : `${retentionVal}${String(retentionVal).endsWith('%') ? '' : '%'}`}
          icon={<Activity className="w-5 h-5" />}
          variant="indigo"
          trend={retentionTrend}
        />
        <MetricCard
          label="Churn Risk"
          value={loadingChurnCount ? "..." : String(churnCountVal)}
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Age distribution */}
        <ContentCard title="Age Distribution" subtitle="All registered patients" icon={<Users className="w-4 h-4" />}>
          {loadingAge ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading age distribution...</div>
          ) : ageGroups.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No data available</div>
          ) : (
            <div className="space-y-4">
              {ageGroups.map(g => (
                <HorizontalBar
                  key={g.range}
                  label={g.range.includes('yrs') ? g.range : `${g.range} yrs`}
                  value={g.count}
                  max={maxAge}
                  color={g.color}
                  valueLabel={
                    <span className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-800">{g.count}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                        {g.percentage}%
                      </span>
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </ContentCard>

        {/* Gender split */}
        <ContentCard title="Gender Distribution" subtitle="Patient demographics" icon={<Users className="w-4 h-4" />}>
          {loadingGender ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading gender distribution...</div>
          ) : genderSlices.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No data available</div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <DonutChart slices={genderSlices} size={120} />
              <div className="space-y-2 w-full">
                {genderSlices.map(g => (
                  <div key={g.label} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                      {g.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800">{g.count} pts</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white shadow-2xs" style={{ backgroundColor: g.color }}>
                        {g.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ContentCard>

        {/* Patient growth */}
        <ContentCard title="Monthly Patient Growth" subtitle="New vs Returning" icon={<TrendingUp className="w-4 h-4" />}>
          {loadingGrowth ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading patient growth...</div>
          ) : patientGrowthData.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No data available</div>
          ) : (
            <div className="space-y-2.5 max-h-[310px] overflow-y-auto custom-scrollbar pr-1.5 pt-0.5">
              {patientGrowthData.map((d, i) => {
                const isZero = d.total === 0;
                const newPct = d.total > 0 ? (d.newPatients / d.total) * 100 : 0;
                const returningPct = 100 - newPct;

                return (
                  <div key={i} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">{d.month}</span>
                      <span className={`text-[11px] font-bold ${isZero ? 'text-slate-400' : 'text-slate-700'}`}>
                        Total: <strong className={isZero ? 'text-slate-400 font-semibold' : 'text-slate-900 font-black'}>{d.total}</strong>
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="h-2 rounded-full overflow-hidden bg-slate-200/80 flex">
                      {!isZero && (
                        <>
                          {d.newPatients > 0 && (
                            <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${newPct}%` }} title={`${d.newPatients} New`} />
                          )}
                          {d.returningPatients > 0 && (
                            <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${returningPct}%` }} title={`${d.returningPatients} Returning`} />
                          )}
                        </>
                      )}
                    </div>

                    {/* Breakdown sub-labels */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className={`flex items-center gap-1.5 font-bold ${d.newPatients > 0 ? 'text-sky-600' : 'text-slate-400'}`}>
                        <span className={`w-2 h-2 rounded-full inline-block ${d.newPatients > 0 ? 'bg-sky-500' : 'bg-slate-300'}`} />
                        {d.newPatients} New
                      </span>
                      <span className={`flex items-center gap-1.5 font-bold ${d.returningPatients > 0 ? 'text-violet-600' : 'text-slate-400'}`}>
                        <span className={`w-2 h-2 rounded-full inline-block ${d.returningPatients > 0 ? 'bg-violet-500' : 'bg-slate-300'}`} />
                        {d.returningPatients} Returning
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ContentCard>
      </div>

      {/* Churn risk table */}
      <ContentCard
        title="Churn Risk — Patients Not Visited (>30 days)"
        icon={<Clock className="w-4 h-4" />}
        action={<Badge variant="amber">{loadingChurnList ? "..." : `${churnRiskList.length} Patients`}</Badge>}
      >
        {loadingChurnList ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading churn risk patients...</div>
        ) : churnRiskList.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">No churn risk patients found</div>
        ) : (
          <DataTable
            data={churnRiskList}
            rowKey={(r: any, idx: number) => r.phone || idx}
            columns={[
              { key: 'name',      header: 'Patient',     render: (r: any) => <span className="font-bold text-foreground">{r.name}</span> },
              { key: 'phone',     header: 'Phone',       render: (r: any) => <span className="text-muted-foreground text-xs">{r.phone}</span> },
              { key: 'lastVisit', header: 'Last Visit',  render: (r: any) => <span className="text-muted-foreground">{r.lastVisit}</span> },
              { key: 'days',      header: 'Days Ago',    align: 'center', render: (r: any) => <Badge variant={r.days > 50 ? 'red' : 'amber'}>{r.days}d</Badge> },
              { key: 'visits',    header: 'Total Visits',align: 'right',  render: (r: any) => <span className="font-bold">{r.visits}</span> },
            ]}
            footer={paginationUI || undefined}
          />
        )}
      </ContentCard>
    </Section>
  );
}

// ─── Appointment Analytics ────────────────────────────────────────────────────
const HOURS_LABELS = ['9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM'];
const DAYS_LABELS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function AppointmentsSection({ period, startDate, endDate }: { period: string; startDate?: string; endDate?: string }) {
  const filter = getFilterPayload(period, startDate, endDate);

  const { data: totalRes, isLoading: loadingTotal } = useTotalBookingsAnalyticsQuery(filter);
  const { data: completedRes, isLoading: loadingCompleted } = useCompletedBookingsAnalyticsQuery(filter);
  const { data: noShowRes, isLoading: loadingNoShow } = useNoShowRateAnalyticsQuery(filter);
  const { data: completionRes, isLoading: loadingCompletion } = useApptCompletionRateAnalyticsQuery(filter);
  const { data: heatmapRes, isLoading: loadingHeatmap } = usePeakHoursHeatmapAnalyticsQuery(filter);
  const { data: forecastRes, isLoading: loadingForecast } = useNext7DayForecastAnalyticsQuery(filter);

  // 1. Total Bookings
  const totalData = totalRes?.data ?? totalRes;
  const totalVal = totalData?.totalBookings ?? totalData?.total ?? totalData?.count ?? 0;
  const totalPct = totalData?.growthPercentage ?? totalData?.percentageChange;
  const totalTrend = totalPct !== undefined ? { value: `${Math.abs(totalPct)}%`, isUp: totalPct >= 0 } : undefined;

  // 2. Completed
  const completedData = completedRes?.data ?? completedRes;
  const completedVal = completedData?.completedBookings ?? completedData?.completed ?? completedData?.count ?? 0;
  const completedPct = completedData?.growthPercentage ?? completedData?.percentageChange;
  const completedTrend = completedPct !== undefined ? { value: `${Math.abs(completedPct)}%`, isUp: completedPct >= 0 } : undefined;

  // 3. No-Show Rate
  const noShowData = noShowRes?.data ?? noShowRes;
  const noShowVal = noShowData?.noShowRate ?? noShowData?.rate ?? noShowData?.percentage ?? 0;
  const noShowPct = noShowData?.growthPercentage ?? noShowData?.percentageChange;
  const noShowTrend = noShowPct !== undefined ? { value: `${Math.abs(noShowPct)}%`, isUp: noShowPct >= 0 } : undefined;

  // 4. Completion Rate
  const completionData = completionRes?.data ?? completionRes;
  const completionVal = completionData?.completionRate ?? completionData?.rate ?? completionData?.percentage ?? 0;
  const completionPct = completionData?.growthPercentage ?? completionData?.percentageChange;
  const completionTrend = completionPct !== undefined ? { value: `${Math.abs(completionPct)}%`, isUp: completionPct >= 0 } : undefined;

  // 5. Peak Hours Heatmap
  const heatmapDataObj = heatmapRes?.data ?? heatmapRes;
  let heatmapProcessed: any[] = [];
  let dynamicHourLabels = HOURS_LABELS;
  
  const extractHeatmap = (obj: any): any => {
    if (!obj) return null;
    if (obj.columns && obj.rows) return obj;
    if (obj.data) return extractHeatmap(obj.data);
    return null;
  };
  
  const validHeatmapObj = extractHeatmap(heatmapDataObj);
  
  if (validHeatmapObj) {
    dynamicHourLabels = validHeatmapObj.columns.map((c: any) => c.time);
    heatmapProcessed = validHeatmapObj.rows.map((row: any) => ({
      day: row.day,
      slots: row.counts.map((count: number, index: number) => ({
        hour: validHeatmapObj.columns[index]?.time || `${index}h`,
        count: count
      }))
    }));
  } else {
    const rawArr = Array.isArray(heatmapDataObj?.data) ? heatmapDataObj.data : Array.isArray(heatmapDataObj) ? heatmapDataObj : [];
    heatmapProcessed = Array.isArray(rawArr) && rawArr.length > 0 && rawArr[0].slots ? rawArr : [];
  }
  
  // 6. Next 7-Day Forecast
  const forecastDataObj = forecastRes?.data ?? forecastRes;
  const forecastRawArray = Array.isArray(forecastDataObj?.data) ? forecastDataObj.data : Array.isArray(forecastDataObj) ? forecastDataObj : [];

  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Bookings"    value={loadingTotal ? "..." : String(totalVal)} icon={<Calendar className="w-5 h-5" />} variant="primary" trend={totalTrend} />
        <MetricCard label="Completed"         value={loadingCompleted ? "..." : String(completedVal)} icon={<CheckCircle className="w-5 h-5" />} variant="emerald" trend={completedTrend} />
        <MetricCard label="No-Show Rate"      value={loadingNoShow ? "..." : `${noShowVal}${String(noShowVal).endsWith('%') ? '' : '%'}`}  icon={<Clock className="w-5 h-5" />}     variant="amber"   trend={noShowTrend} />
        <MetricCard label="Completion Rate"   value={loadingCompletion ? "..." : `${completionVal}${String(completionVal).endsWith('%') ? '' : '%'}`}   icon={<Target className="w-5 h-5" />}     variant="indigo"  trend={completionTrend} />
      </div>

      {/* Peak hours heatmap */}
      <ContentCard title="Peak Hours Heatmap" subtitle="Day × Hour appointment density" icon={<Activity className="w-4 h-4" />}>
        {loadingHeatmap ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading heatmap data...</div>
        ) : heatmapProcessed.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">No data available</div>
        ) : (
          <div className="overflow-x-auto pt-2 pb-2">
            <div className="min-w-[640px]">
              {/* Header row */}
              <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `64px repeat(${dynamicHourLabels.length}, 1fr)` }}>
                <div />
                {dynamicHourLabels.map(h => (
                  <div key={h} className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {h}
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {heatmapProcessed.map((row: any) => (
                <div key={row.day} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `64px repeat(${dynamicHourLabels.length}, 1fr)` }}>
                  <div className="text-xs font-extrabold text-slate-700 flex items-center">{row.day}</div>
                  {(row.slots || []).map((slot: any, idx: number) => (
                    <HeatmapCell key={`${slot.hour}-${idx}`} count={slot.count} day={row.day} hour={slot.hour} />
                  ))}
                </div>
              ))}

              {/* Modern Interactive Legend */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-border/50">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" /> Appointment Density
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">0</span>
                    <span>No appts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700 flex items-center justify-center">1</span>
                    <span>Light (1-3)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md bg-blue-100 border border-blue-200 text-[10px] font-bold text-blue-800 flex items-center justify-center">4</span>
                    <span>Moderate (4-6)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">7</span>
                    <span>Busy (7-9)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md bg-gradient-to-r from-violet-600 to-indigo-700 text-white text-[10px] font-extrabold flex items-center justify-center">10</span>
                    <span>Peak (10+)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ContentCard>

      {/* 7-day forecast */}
      <ContentCard title="Next 7-Day Appointment Forecast" subtitle="Projected booking density for upcoming week" icon={<Calendar className="w-4 h-4" />}>
        {loadingForecast ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading forecast...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() + i);
              const isToday = i === 0;
              const apiItem = forecastRawArray[i];
              const count = apiItem ? Number(apiItem.count ?? apiItem.bookings ?? apiItem.total ?? 0) : 0;
              const isHigh = count >= 10;
              
              const dayLabel = apiItem?.day || d.toLocaleDateString('en-US', { weekday: 'short' });
              const dateNumber = apiItem?.date ? new Date(apiItem.date).getDate() : d.getDate();
              const monthLabel = apiItem?.date ? new Date(apiItem.date).toLocaleDateString('en-US', { month: 'short' }) : d.toLocaleDateString('en-US', { month: 'short' });

              return (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between items-center text-center relative overflow-hidden ${
                    isToday
                      ? 'border-primary/40 bg-gradient-to-b from-primary/10 via-primary/5 to-white shadow-sm ring-2 ring-primary/20'
                      : 'border-border/80 bg-white hover:border-primary/30'
                  }`}
                >
                  {isToday && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                  )}

                  <div className="space-y-0.5">
                    <p className={`text-xs font-extrabold uppercase tracking-wider ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {dayLabel}
                    </p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight">
                      {dateNumber} <span className="text-[11px] font-semibold text-muted-foreground">{monthLabel}</span>
                    </p>
                  </div>

                  <div className="mt-3 w-full">
                    <div className={`py-1.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs ${
                      isToday
                        ? 'bg-primary text-white shadow-primary/20'
                        : isHigh
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                          : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                    }`}>
                      <Calendar className="w-3.5 h-3.5 opacity-80" />
                      <span>{count} Bookings</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ContentCard>
    </Section>
  );
}

// ─── Treatment Analytics ──────────────────────────────────────────────────────
function TreatmentsSection({ period }: { period: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const baseFilter = getFilterPayload(period);
  const tableFilter = { ...baseFilter, page, limit };

  // Fetch API Queries
  const { data: totalProceduresRes, isLoading: loadingTotal } = useTotalProceduresQuery(baseFilter);
  const { data: completionRateRes, isLoading: loadingCompletion } = useCompletionRateQuery(baseFilter);
  const { data: avgCostRes, isLoading: loadingAvgCost } = useAvgProcedureCostQuery(baseFilter);
  const { data: highestRevenueRes, isLoading: loadingHighest } = useHighestRevenueQuery(baseFilter);
  const { data: topTreatmentsRes, isLoading: loadingTop } = useTopTreatmentsByRevenueQuery(baseFilter);
  const { data: proceduresVolumeRes, isLoading: loadingVolume } = useProceduresByVolumeQuery(baseFilter);
  const { data: allRevenueRes, isLoading: loadingAllRevenue } = useAllTreatmentRevenueQuery(tableFilter);

  // Parsing values
  // 1. Total Procedures
  const totalData = totalProceduresRes?.data ?? totalProceduresRes;
  const totalVal = totalData?.totalProcedures ?? totalData?.total ?? totalData?.count ?? 0;
  const totalPct = totalData?.growthPercentage ?? totalData?.percentageChange;
  const totalTrend = totalPct !== undefined ? { value: `${Math.abs(totalPct)}%`, isUp: totalPct >= 0 } : undefined;

  // 2. Completion Rate
  const completionData = completionRateRes?.data ?? completionRateRes;
  const completionVal = completionData?.completionRate ?? completionData?.rate ?? completionData?.percentage ?? 0;

  // 3. Avg Cost
  const avgCostData = avgCostRes?.data ?? avgCostRes;
  const avgCostVal = avgCostData?.avgProcedureCost ?? avgCostData?.avgCost ?? avgCostData?.averageCost ?? avgCostData?.amount ?? 0;

  // 4. Highest Revenue
  const highestData = highestRevenueRes?.data ?? highestRevenueRes;
  const highestVal = highestData?.treatment ?? highestData?.highestRevenueProcedure ?? highestData?.procedureName ?? highestData?.name ?? highestData?.procedure ?? "N/A";

  // 5. Top Treatments by Revenue (Horizontal Bar Chart)
  const topDataObj = topTreatmentsRes?.data ?? topTreatmentsRes;
  const topRawArray = Array.isArray(topDataObj?.data) ? topDataObj.data : Array.isArray(topDataObj) ? topDataObj : [];
  const topTreatments = topRawArray.map((t: any) => ({
    procedure: t.treatment ?? t.procedure ?? t.procedureName ?? t.name ?? 'N/A',
    revenue: Number(t.revenue ?? t.totalRevenue ?? t.amount ?? 0),
  }));
  const maxRev = topTreatments.length > 0 ? Math.max(...topTreatments.map(t => t.revenue), 1) : 1;

  // 6. Procedures by Volume (Donut Chart)
  const volumeDataObj = proceduresVolumeRes?.data ?? proceduresVolumeRes;
  const volumeRawArray = Array.isArray(volumeDataObj?.data?.data) ? volumeDataObj.data.data : Array.isArray(volumeDataObj?.data) ? volumeDataObj.data : Array.isArray(volumeDataObj) ? volumeDataObj : [];
  const totalVolumeCount = volumeDataObj?.data?.totalCount ?? volumeDataObj?.totalVolume ?? volumeDataObj?.total ?? volumeRawArray.reduce((acc: number, curr: any) => acc + Number(curr.count ?? curr.value ?? 0), 0);
  const volumeSlices = volumeRawArray.map((t: any, i: number) => ({
    label: t.treatment ?? t.procedure ?? t.procedureName ?? t.name ?? 'N/A',
    value: Number(t.count ?? t.value ?? 0),
    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'][i % 5],
  }));

  // 7. All Treatment Revenue (DataTable)
  const allRevenueDataObj = allRevenueRes?.data ?? allRevenueRes;
  const allRevenueRawArray = Array.isArray(allRevenueDataObj?.data) 
    ? allRevenueDataObj.data 
    : Array.isArray(allRevenueDataObj?.rows)
      ? allRevenueDataObj.rows
      : Array.isArray(allRevenueDataObj) 
        ? allRevenueDataObj 
        : [];

  const allRevenueList = allRevenueRawArray.map((t: any) => ({
    procedure: t.treatment ?? t.procedure ?? t.procedureName ?? t.name ?? 'N/A',
    count: Number(t.count ?? t.cases ?? t.totalCases ?? t.value ?? 0),
    revenue: Number(t.revenue ?? t.totalRevenue ?? t.amount ?? 0),
    avg: Number(t.avg ?? t.avgCost ?? t.averageCost ?? t.avgProcedureCost ?? 0),
  }));

  const paginationInfo = allRevenueRes?.pagination || {};
  const totalItems = paginationInfo.total_items ?? allRevenueRes?.totalItems ?? allRevenueRes?.total ?? allRevenueRes?.count ?? allRevenueList.length;
  const totalPages = paginationInfo.total_pages ?? allRevenueRes?.totalPages ?? (Math.ceil(totalItems / limit) || 1);

  // Reset page to 1 if filter period changes
  useEffect(() => {
    setPage(1);
  }, [period]);

  const paginationUI = totalItems > 0 ? (
    <div className="py-4 px-6 border-t border-border/50 bg-muted/20 mt-4 rounded-xl">
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={limit}
        onPageChange={setPage}
        onPerPageChange={setLimit}
      />
    </div>
  ) : null;

  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Procedures"
          value={loadingTotal ? "..." : String(totalVal)}
          icon={<BarChart3 className="w-5 h-5" />}
          variant="gray"
          trend={totalTrend}
        />
        <MetricCard
          label="Completion Rate"
          value={loadingCompletion ? "..." : `${completionVal}${String(completionVal).endsWith('%') ? '' : '%'}`}
          icon={<CheckCircle className="w-5 h-5" />}
          variant="emerald"
        />
        <MetricCard
          label="Avg Procedure Cost"
          value={loadingAvgCost ? "..." : `₹${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(avgCostVal))}`}
          icon={<IndianRupee className="w-5 h-5" />}
          variant="primary"
        />
        <MetricCard
          label="Highest Revenue"
          value={loadingHighest ? "..." : String(highestVal)}
          icon={<Zap className="w-5 h-5" />}
          variant="indigo"
          trend={highestData?.revenue ? `₹${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(highestData.revenue))}` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by treatment */}
        <ContentCard title="Top Treatments by Revenue" icon={<TrendingUp className="w-4 h-4" />}>
          {loadingTop ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading top treatments...</div>
          ) : topTreatments.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No data available</div>
          ) : (
            <div className="space-y-4">
              {topTreatments.map((t, idx) => (
                <HorizontalBar
                  key={t.procedure + idx}
                  label={t.procedure}
                  value={t.revenue}
                  max={maxRev}
                  color="#3b82f6"
                  suffix="₹"
                />
              ))}
            </div>
          )}
        </ContentCard>

        {/* Volume vs Revenue donut */}
        <ContentCard title="Procedures by Volume" icon={<BarChart3 className="w-4 h-4" />}>
          {loadingVolume ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading procedures volume...</div>
          ) : volumeSlices.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No data available</div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <DonutChart
                slices={volumeSlices}
                size={160}
                label={String(totalVolumeCount)}
              />
              <div className="space-y-2 mt-3 w-full">
                {volumeSlices.map((t, i) => (
                  <div key={t.label + i} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </span>
                    <span className="text-xs font-black text-slate-800">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ContentCard>
      </div>

      {/* Full table */}
      <ContentCard title="All Treatment Revenue" icon={<BarChart3 className="w-4 h-4" />}>
        {loadingAllRevenue ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading treatment revenue table...</div>
        ) : (
          <DataTable
            data={allRevenueList}
            rowKey={(t: any, idx: number) => t.procedure + idx}
            columns={[
              { key: 'procedure', header: 'Treatment',    render: (t: any) => <span className="font-bold">{t.procedure}</span> },
              { key: 'count',     header: 'Cases',        align: 'center', render: (t: any) => <Badge variant="gray">{t.count}</Badge> },
              { key: 'revenue',   header: 'Total Revenue', align: 'right', render: (t: any) => <span className="font-black text-emerald-600">₹{t.revenue.toLocaleString()}</span> },
              { key: 'avg',       header: 'Avg Cost',     align: 'right', render: (t: any) => <span className="font-bold text-primary">₹{t.avg.toLocaleString()}</span> },
            ]}
            footer={paginationUI || undefined}
          />
        )}
      </ContentCard>
    </Section>
  );
}

// ─── Membership Analytics ─────────────────────────────────────────────────────
function MembershipSection({ period, startDate, endDate }: { period: string; startDate?: string; endDate?: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const baseFilter = getFilterPayload(period, startDate, endDate);
  const tableFilter = { ...baseFilter, page, limit };

  const { data: totalMembersRes, isLoading: loadingTotal } = useTotalMembersAnalyticsQuery(baseFilter);
  const { data: revRes, isLoading: loadingRev } = useMembershipRevenueAnalyticsQuery(baseFilter);
  const { data: utilRes, isLoading: loadingUtil } = useAvgUtilizationAnalyticsQuery(baseFilter);
  const { data: renewalRes, isLoading: loadingRenewal } = useRenewalRateAnalyticsQuery(baseFilter);
  const { data: planRes, isLoading: loadingPlans } = usePlanWisePerformanceAnalyticsQuery(tableFilter);

  // Reset page to 1 if filter period changes
  useEffect(() => {
    setPage(1);
  }, [period]);

  // 1. Total Members
  const totalData = totalMembersRes?.data ?? totalMembersRes;
  const totalVal = totalData?.totalMembers ?? totalData?.total ?? totalData?.count ?? 0;
  const totalPct = totalData?.growthPercentage ?? totalData?.percentageChange;
  const totalTrend = totalPct !== undefined ? { value: `${Math.abs(totalPct)}%`, isUp: totalPct >= 0 } : undefined;

  // 2. Revenue (Plans)
  const revData = revRes?.data ?? revRes;
  const revVal = revData?.revenue ?? revData?.totalRevenue ?? revData?.amount ?? revData?.total ?? 0;
  const revPct = revData?.growthPercentage ?? revData?.percentageChange;
  const revTrend = revPct !== undefined ? { value: `${Math.abs(revPct)}%`, isUp: revPct >= 0 } : undefined;

  // 3. Avg Utilization
  const utilData = utilRes?.data ?? utilRes;
  const utilVal = utilData?.benefitUsedPercentage ?? utilData?.avgUtilization ?? utilData?.utilization ?? utilData?.rate ?? utilData?.percentage ?? 0;
  const utilPct = utilData?.growthPercentage ?? utilData?.percentageChange;
  const utilTrend = utilPct !== undefined ? { value: `${Math.abs(utilPct)}%`, isUp: utilPct >= 0 } : undefined;

  // 4. Renewal Rate
  const renewalData = renewalRes?.data ?? renewalRes;
  const renewalVal = renewalData?.renewalRate ?? renewalData?.rate ?? renewalData?.percentage ?? 0;
  const renewalPct = renewalData?.growthPercentage ?? renewalData?.percentageChange;
  const renewalTrend = renewalPct !== undefined ? { value: `${Math.abs(renewalPct)}%`, isUp: renewalPct >= 0 } : undefined;

  // 5. Plan-Wise Performance Table
  const planDataObj = planRes?.data ?? planRes;
  const planListRaw = Array.isArray(planDataObj?.plans)
    ? planDataObj.plans
    : Array.isArray(planDataObj?.data)
      ? planDataObj.data
      : Array.isArray(planDataObj)
        ? planDataObj
        : [];

  const planPerformanceList = planListRaw.map((p: any) => ({
    plan: p.plan ?? p.planName ?? p.name ?? 'N/A',
    members: Number(p.members ?? p.totalMembers ?? p.memberCount ?? 0),
    revenue: Number(p.revenue ?? p.totalRevenue ?? p.amount ?? 0),
    utilization: Number(p.benefitUsedPercentage ?? p.benefitUsed ?? p.utilization ?? p.avgUtilization ?? 0),
    renewalRate: Number(p.renewalRate ?? p.rate ?? 0),
  }));

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString()}`;
  };

  const paginationInfo = planRes?.pagination || {};
  const totalItems = paginationInfo.total_items ?? planRes?.totalItems ?? planRes?.total ?? planPerformanceList.length;
  const totalPages = paginationInfo.total_pages ?? planRes?.totalPages ?? (Math.ceil(totalItems / limit) || 1);

  const paginationUI = totalItems > 0 ? (
    <div className="py-4 px-6 border-t border-border/50 bg-muted/20 mt-4 rounded-xl">
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={limit}
        onPageChange={setPage}
        onPerPageChange={setLimit}
      />
    </div>
  ) : null;

  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="TOTAL MEMBERS"
          value={loadingTotal ? "..." : String(totalVal)}
          icon={<Building2 className="w-5 h-5" />}
          variant="indigo"
          trend={totalTrend}
        />
        <MetricCard
          label="REVENUE (PLANS)"
          value={loadingRev ? "..." : (typeof revVal === 'number' ? formatCurrency(revVal) : String(revVal))}
          icon={<IndianRupee className="w-5 h-5" />}
          variant="emerald"
          trend={revTrend}
        />
        <MetricCard
          label="AVG UTILIZATION"
          value={loadingUtil ? "..." : `${utilVal}${String(utilVal).endsWith('%') ? '' : '%'}`}
          icon={<Activity className="w-5 h-5" />}
          variant="primary"
          trend={utilTrend}
        />
        <MetricCard
          label="RENEWAL RATE"
          value={loadingRenewal ? "..." : `${renewalVal}${String(renewalVal).endsWith('%') ? '' : '%'}`}
          icon={<CheckCircle className="w-5 h-5" />}
          variant="amber"
          trend={renewalTrend}
        />
      </div>

      <ContentCard title="Plan-Wise Performance" icon={<Building2 className="w-4 h-4" />}>
        {loadingPlans ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading plan performance...</div>
        ) : (
          <DataTable
            data={planPerformanceList}
            rowKey={(m: any) => m.plan}
            columns={[
              { key: 'plan',        header: 'PLAN',           render: (m: any) => <span className="font-extrabold text-slate-800">{m.plan}</span> },
              { key: 'members',     header: 'MEMBERS',        align: 'center', render: (m: any) => <Badge variant="blue">{m.members}</Badge> },
              { key: 'revenue',     header: 'REVENUE',        align: 'right',  render: (m: any) => <span className="font-black text-emerald-600">₹{m.revenue.toLocaleString()}</span> },
              { key: 'utilization', header: 'BENEFIT USED',  align: 'center', render: (m: any) => (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(m.utilization, 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{m.utilization}%</span>
                </div>
              )},
              { key: 'renewalRate', header: 'RENEWAL RATE',  align: 'right',  render: (m: any) => (
                <span className={`font-extrabold text-xs ${m.renewalRate >= 80 ? 'text-emerald-600' : m.renewalRate >= 65 ? 'text-amber-600' : 'text-rose-500'}`}>
                  {m.renewalRate}%
                </span>
              )},
            ]}
            footer={paginationUI || undefined}
          />
        )}
      </ContentCard>
    </Section>
  );
}

// ─── Inventory Analytics ──────────────────────────────────────────────────────
function InventorySection({ period, startDate, endDate }: { period: string; startDate?: string; endDate?: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const baseFilter = getFilterPayload(period, startDate, endDate);
  const tableFilter = { ...baseFilter, page, limit };

  const { data: totalSkusRes, isLoading: loadingTotalSkus } = useTotalSkusAnalyticsQuery(baseFilter);
  const { data: criticalItemsRes, isLoading: loadingCriticalItems } = useCriticalItemsAnalyticsQuery(baseFilter);
  const { data: expiringSoonRes, isLoading: loadingExpiringSoon } = useExpiringSoonAnalyticsQuery(baseFilter);
  const { data: monthlySpendRes, isLoading: loadingMonthlySpend } = useMonthlySpendAnalyticsQuery(baseFilter);
  const { data: criticalStockRes, isLoading: loadingCriticalStock } = useCriticalStockAnalyticsQuery(tableFilter);

  useEffect(() => {
    setPage(1);
  }, [period]);

  const getNestedData = (res: any) => res?.responseObject?.data ?? res?.data?.responseObject?.data ?? res?.data ?? res;

  const totalSkusData = getNestedData(totalSkusRes);
  const totalSkusVal = typeof totalSkusData === 'number' ? totalSkusData : (totalSkusData?.totalSkus ?? totalSkusData?.total ?? totalSkusData?.count ?? 0);
  const totalSkusPct = totalSkusData?.growthPercentage;
  const totalSkusTrend = totalSkusPct !== undefined ? { value: `${Math.abs(totalSkusPct)}%`, isUp: totalSkusPct >= 0 } : undefined;

  const criticalItemsData = getNestedData(criticalItemsRes);
  const criticalItemsVal = typeof criticalItemsData === 'number' ? criticalItemsData : (criticalItemsData?.criticalItems ?? criticalItemsData?.total ?? criticalItemsData?.count ?? 0);

  const expiringSoonData = getNestedData(expiringSoonRes);
  const expiringSoonVal = typeof expiringSoonData === 'number' ? expiringSoonData : (expiringSoonData?.expiringSoon ?? expiringSoonData?.total ?? expiringSoonData?.count ?? 0);

  const monthlySpendData = getNestedData(monthlySpendRes);
  const monthlySpendVal = typeof monthlySpendData === 'number' ? monthlySpendData : (monthlySpendData?.monthlySpend ?? monthlySpendData?.amount ?? monthlySpendData?.total ?? 0);
  const monthlySpendPct = monthlySpendData?.growthPercentage;
  const monthlySpendTrend = monthlySpendPct !== undefined ? { value: `${Math.abs(monthlySpendPct)}%`, isUp: monthlySpendPct >= 0 } : undefined;

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString()}`;
  };

  const criticalStockData = getNestedData(criticalStockRes);
  const criticalStockRawArray = Array.isArray(criticalStockData)
    ? criticalStockData
    : Array.isArray(criticalStockData?.items) 
      ? criticalStockData.items 
      : Array.isArray(criticalStockData?.data)
        ? criticalStockData.data
        : [];
  
  const criticalStockList = criticalStockRawArray.map((r: any) => ({
    item: r.name ?? r.item ?? r.itemName ?? 'N/A',
    category: r.category ?? 'N/A',
    stock: Number(r.currentStock ?? r.stock ?? r.stockLeft ?? 0),
    min: Number(r.minStock ?? r.min ?? r.minRequired ?? r.minimumStock ?? 0),
    unit: r.unit ?? '',
    supplier: r.supplier ?? 'N/A',
    daysLeft: r.daysLeft ? Number(r.daysLeft).toFixed(1) : 0,
  }));

  const paginationInfo = criticalStockRes?.pagination || {};
  const totalItems = paginationInfo.total_items ?? criticalStockRes?.totalItems ?? criticalStockRes?.total ?? criticalStockList.length;
  const totalPages = paginationInfo.total_pages ?? criticalStockRes?.totalPages ?? (Math.ceil(totalItems / limit) || 1);

  const paginationUI = totalItems > 0 ? (
    <div className="py-4 px-6 border-t border-border/50 bg-muted/20 mt-4 rounded-xl">
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={limit}
        onPageChange={setPage}
        onPerPageChange={setLimit}
      />
    </div>
  ) : null;

  return (
    <Section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total SKUs"      value={loadingTotalSkus ? "..." : String(totalSkusVal)}   icon={<Package className="w-5 h-5" />} variant="gray" trend={totalSkusTrend} />
        <MetricCard label="Critical Items"  value={loadingCriticalItems ? "..." : String(criticalItemsVal)}    icon={<AlertTriangle className="w-5 h-5" />} variant="rose" />
        <MetricCard label="Expiring (30d)"  value={loadingExpiringSoon ? "..." : String(expiringSoonVal)}    icon={<Clock className="w-5 h-5" />} variant="amber" />
        <MetricCard label="Monthly Spend"   value={loadingMonthlySpend ? "..." : (typeof monthlySpendVal === 'number' ? formatCurrency(monthlySpendVal) : String(monthlySpendVal))} icon={<IndianRupee className="w-5 h-5" />} variant="primary" trend={monthlySpendTrend} />
      </div>

      <ContentCard title="Critical Stock — Will Run Out Soon" icon={<Package className="w-4 h-4" />}
        action={<Badge variant="red">{loadingCriticalStock ? "..." : `${totalItems} Critical`}</Badge>}>
        {loadingCriticalStock ? (
           <div className="py-8 text-center text-xs text-muted-foreground">Loading critical stock...</div>
        ) : criticalStockList.length === 0 ? (
           <div className="py-8 text-center text-xs text-muted-foreground">No data available</div>
        ) : (
          <DataTable
            data={criticalStockList}
            rowKey={(r: any, idx: number) => r.item + idx}
            columns={[
              { key: 'item',     header: 'Item',          render: (r: any) => <span className="font-bold text-foreground">{r.item}</span> },
              { key: 'category', header: 'Category',      render: (r: any) => <Badge variant="gray">{r.category}</Badge> },
              { key: 'stock',    header: 'Stock Left',    align: 'center', render: (r: any) => (
                <span className={`font-black text-sm ${r.stock <= r.min / 4 ? 'text-rose-600' : 'text-amber-600'}`}>{r.stock} {r.unit && <span className="text-xs font-medium text-slate-500">{r.unit}</span>}</span>
              )},
              { key: 'min',      header: 'Min Required',  align: 'center', render: (r: any) => <span className="text-muted-foreground">{r.min}</span> },
              { key: 'supplier', header: 'Supplier',      render: (r: any) => <span className="text-muted-foreground text-xs">{r.supplier}</span> },
              { key: 'daysLeft', header: 'Days Left',     align: 'right',  render: (r: any) => (
                <Badge variant={Number(r.daysLeft) <= 2 ? 'red' : 'amber'}>{r.daysLeft}d</Badge>
              )},
            ]}
            footer={paginationUI || undefined}
          />
        )}
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
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const exportFnMap: Record<string, (filter: any) => Promise<any>> = {
      appointments: exportAppointmentAnalytics,
      patients: exportPatientAnalytics,
      treatments: exportTreatmentAnalytics,
      membership: exportMembershipAnalytics,
      inventory: exportInventoryAnalytics,
    };

    const exportFn = exportFnMap[activeTab];
    if (!exportFn) {
      toast.error("Export is not available for this section yet.");
      return;
    }

    try {
      setIsExporting(true);
      const filter = getFilterPayload(period);
      
      const response = await exportFn(filter);

      if (response.data instanceof Blob && response.data.type === 'application/json') {
        const text = await response.data.text();
        const json = JSON.parse(text);
        if (json?.responseStatusList?.statusList?.[0]?.statusDesc) {
          throw new Error(json.responseStatusList.statusList[0].statusDesc);
        } else {
          throw new Error("Export failed on server");
        }
      }

      await downloadExcelFromBlob(response.data, `${activeTab}-analytics-export.xlsx`);
      toast.success("Export successful");
    } catch (error: any) {
      console.error("Export failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to export data. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

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
            <Button 
              variant="outline" 
              className="gap-2 flex-shrink-0"
              onClick={handleExport}
              disabled={isExporting || !['appointments', 'patients', 'treatments', 'membership', 'inventory'].includes(activeTab)}
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Exporting...' : 'Export'}
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
          {activeTab === 'patients'     && <PatientsSection period={period} />}
          {activeTab === 'appointments' && <AppointmentsSection period={period} />}
          {activeTab === 'treatments'   && <TreatmentsSection period={period} />}
          {activeTab === 'membership'   && <MembershipSection period={period} />}
          {activeTab === 'inventory'    && <InventorySection period={period} />}
        </div>
      </AnimatePresence>
    </div>
  );
}
