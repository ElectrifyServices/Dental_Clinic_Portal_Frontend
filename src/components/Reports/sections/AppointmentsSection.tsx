import React from 'react';
import { Activity, Calendar, CheckCircle, Clock, Target } from 'lucide-react';
import { MetricCard, ContentCard } from '@/components/ui';
import { HeatmapCell } from '../../Dashboard/Charts';
import { Section, getFilterPayload } from './Shared';
import {
  useTotalBookingsAnalyticsQuery,
  useCompletedBookingsAnalyticsQuery,
  useNoShowRateAnalyticsQuery,
  useApptCompletionRateAnalyticsQuery,
  usePeakHoursHeatmapAnalyticsQuery,
  useNext7DayForecastAnalyticsQuery,
} from '@/hooks/analytics';

const HOURS_LABELS = ['9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM'];

export function AppointmentsSection({ period, startDate, endDate }: { period: string; startDate?: string; endDate?: string }) {
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
