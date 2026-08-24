import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Clock, IndianRupee } from 'lucide-react';
import { MetricCard, ContentCard, Badge, DataTable, Pagination } from '@/components/ui';
import { Section, getFilterPayload } from './Shared';
import {
  useTotalSkusAnalyticsQuery,
  useCriticalItemsAnalyticsQuery,
  useExpiringSoonAnalyticsQuery,
  useMonthlySpendAnalyticsQuery,
  useCriticalStockAnalyticsQuery,
} from '@/hooks/analytics';

export function InventorySection({ period, startDate, endDate }: { period: string; startDate?: string; endDate?: string }) {
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
  const monthlySpendVal = typeof monthlySpendData === 'number' ? monthlySpendData : (monthlySpendData?.restockSpend ?? monthlySpendData?.monthlySpend ?? monthlySpendData?.amount ?? monthlySpendData?.total ?? 0);
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
