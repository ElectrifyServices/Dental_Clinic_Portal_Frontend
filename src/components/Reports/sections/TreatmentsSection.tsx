import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, IndianRupee, Zap, TrendingUp } from 'lucide-react';
import { MetricCard, ContentCard, Badge, DataTable, Pagination } from '@/components/ui';
import { HorizontalBar, DonutChart } from '../../Dashboard/Charts';
import { Section, getFilterPayload } from './Shared';
import {
  useTotalProceduresQuery,
  useCompletionRateQuery,
  useAvgProcedureCostQuery,
  useHighestRevenueQuery,
  useTopTreatmentsByRevenueQuery,
  useProceduresByVolumeQuery,
  useAllTreatmentRevenueQuery,
} from '@/hooks/analytics';

export function TreatmentsSection({ period }: { period: string }) {
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
