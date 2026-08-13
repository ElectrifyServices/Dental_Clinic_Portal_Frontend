import React from 'react';
import { TrendingUp, IndianRupee, Target, Zap, BarChart3 } from 'lucide-react';
import { MetricCard, ContentCard } from '@/components/ui';
import { RevenueAreaChart, MonthlyBarChart, DonutChart } from '../../Dashboard/Charts';
import { MOCK_MONTHLY_REVENUE, MOCK_PAYMENT_MODES, MOCK_REVENUE_30DAYS } from '../../../data/mockAnalytics';
import { Section } from './Shared';

export function RevenueSection({ period }: { period: string }) {
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
