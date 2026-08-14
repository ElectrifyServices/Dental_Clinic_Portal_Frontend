import React from 'react';
import { TrendingUp, IndianRupee, Target, Zap, Download } from 'lucide-react';
import { MetricCard, ContentCard } from '@/components/ui';
import { DonutChart, RevenueAreaChart } from '../../Dashboard/Charts';
import { Section, getFilterPayload } from './Shared';
import {
  useTotalRevenueQuery,
  useAvgDailyRevenueQuery,
  useCollectionRateQuery,
  useTopProcedureQuery,
  useRevenueByPaymentModeQuery,
  useDailyRevenueQuery,
  exportRevenueAnalytics
} from '../../../hooks/analytics/useRevenueAnalyticsHooks';
import { downloadExcelFromBlob } from '../../../utils/export/exportHandler';

export function RevenueSection({ period }: { period: string }) {
  const baseFilter = getFilterPayload(period);

  const { data: totalRevenueData, isLoading: loadingTotal } = useTotalRevenueQuery(baseFilter);
  const { data: avgDailyRevenueData, isLoading: loadingAvg } = useAvgDailyRevenueQuery(baseFilter);
  const { data: collectionRateData, isLoading: loadingCol } = useCollectionRateQuery(baseFilter);
  const { data: topProcedureData, isLoading: loadingTop } = useTopProcedureQuery(baseFilter);
  const { data: paymentModeData, isLoading: loadingMode } = useRevenueByPaymentModeQuery(baseFilter);
  const { data: dailyRevenueData, isLoading: loadingDaily } = useDailyRevenueQuery(baseFilter);

  // We don't have the exact shape of responses, so we will try to safely extract values.
  const extractVal = (data: any, fallback: string | number = 0) => {
    if (data === null || data === undefined) return fallback;
    if (typeof data === 'number' || typeof data === 'string') return data;
    if (typeof data === 'object') {
       // Often API responses are nested in a data property
       const unnested = data.data ?? data;
       if (typeof unnested === 'object' && unnested !== null) {
          const vals = Object.values(unnested);
          if (vals.length > 0) return vals[0] as any;
       }
       return unnested;
    }
    return fallback;
  };

  const totalRev = extractVal(totalRevenueData, 0);
  const avgRev = extractVal(avgDailyRevenueData, 0);
  const collRate = extractVal(collectionRateData, 0);
  const topProc = extractVal(topProcedureData, "N/A");

  // Payment Mode mapping
  const rawModes = Array.isArray(paymentModeData) ? paymentModeData : Array.isArray(paymentModeData?.data) ? paymentModeData.data : [];
  
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
  const mappedModes = rawModes.map((m: any, i: number) => ({
    label: m.mode || m.paymentMode || m.name || m.label || m.method || `Mode ${i+1}`,
    value: Number(m.revenue || m.amount || m.value || m.percentage || m.count || 0),
    color: colors[i % colors.length]
  })).filter(m => m.value > 0);

  // Daily Revenue mapping
  const rawDaily = Array.isArray(dailyRevenueData) ? dailyRevenueData : Array.isArray(dailyRevenueData?.data) ? dailyRevenueData.data : [];
  const mappedDaily = rawDaily.map((d: any, i: number) => ({
    date: d.date || d.day || d.label || `Day ${i+1}`,
    revenue: Number(d.invoiced || d.totalInvoiced || d.revenue || 0),
    collected: Number(d.collected || d.totalCollected || d.amount || 0)
  }));

  const onExport = async () => {
    try {
      const response = await exportRevenueAnalytics(baseFilter);
      await downloadExcelFromBlob(response.data, `Revenue_Analytics_${period}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <Section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue"      value={typeof totalRev === 'number' ? `₹${totalRev.toLocaleString()}` : totalRev}  icon={<TrendingUp className="w-5 h-5" />} variant="emerald" />
        <MetricCard label="Avg. Daily Revenue" value={typeof avgRev === 'number' ? `₹${avgRev.toLocaleString()}` : avgRev} icon={<IndianRupee className="w-5 h-5" />} variant="primary" />
        <MetricCard label="Collection Rate"    value={`${collRate}%`}     icon={<Target className="w-5 h-5" />} variant="indigo" />
        <MetricCard label="Top Procedure"      value={topProc} icon={<Zap className="w-5 h-5" />} variant="amber" />
      </div>

      {mappedDaily.length > 0 && (
        <ContentCard title="Daily Revenue" subtitle="Invoiced vs Collected" icon={<TrendingUp className="w-4 h-4" />}>
          <div className="flex items-center gap-5 mb-3 text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Invoiced</span>
            <span className="flex items-center gap-1.5"><span className="w-4 bg-emerald-500 inline-block" style={{ height: 1, borderTop: '2px dashed' }} /> Collected</span>
          </div>
          <RevenueAreaChart data={mappedDaily} height={180} />
        </ContentCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment mode donut */}
        <ContentCard title="Revenue by Payment Mode" subtitle="Collection breakdown" icon={<IndianRupee className="w-4 h-4" />}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            {mappedModes.length > 0 ? (
               <>
                 <DonutChart slices={mappedModes} size={140} label="Modes" />
                 <div className="space-y-3 min-w-[120px]">
                   {mappedModes.map(m => (
                     <div key={m.label} className="flex items-center gap-2.5">
                       <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                       <span className="text-xs text-foreground font-semibold">{m.label}</span>
                       <span className="text-xs font-black ml-auto" style={{ color: m.color }}>{m.value}%</span>
                     </div>
                   ))}
                 </div>
               </>
            ) : (
               <div className="text-muted-foreground text-sm font-medium py-10">
                 {loadingMode ? 'Loading...' : 'No payment mode data available'}
               </div>
            )}
          </div>
        </ContentCard>
      </div>
    </Section>
  );
}
