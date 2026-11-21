import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, Clock, TrendingUp } from 'lucide-react';
import { MetricCard, ContentCard, Badge, DataTable, Pagination } from '@/components/ui';
import { HorizontalBar, DonutChart } from '../../Dashboard/Charts';
import { Section, getFilterPayload } from './Shared';
import {
  useTotalPatientsAnalyticsQuery,
  useNewPatientsAnalyticsQuery,
  useRetentionRateAnalyticsQuery,
  useChurnRiskCountAnalyticsQuery,
  useAgeDistributionAnalyticsQuery,
  useGenderDistributionAnalyticsQuery,
  useMonthlyGrowthAnalyticsQuery,
  useChurnRiskAnalyticsQuery,
} from '@/hooks/analytics';

export function PatientsSection({ period, startDate, endDate }: { period: string; startDate?: string; endDate?: string }) {
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
