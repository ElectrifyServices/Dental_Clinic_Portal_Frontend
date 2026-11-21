import React, { useState, useEffect } from 'react';
import { Building2, IndianRupee, Activity, CheckCircle } from 'lucide-react';
import { MetricCard, ContentCard, DataTable, Badge, Pagination } from '@/components/ui';
import { Section, getFilterPayload } from './Shared';
import {
  useTotalMembersAnalyticsQuery,
  useMembershipRevenueAnalyticsQuery,
  useAvgUtilizationAnalyticsQuery,
  useRenewalRateAnalyticsQuery,
  usePlanWisePerformanceAnalyticsQuery,
} from '@/hooks/analytics';

export function MembershipSection({ period, startDate, endDate }: { period: string; startDate?: string; endDate?: string }) {
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
