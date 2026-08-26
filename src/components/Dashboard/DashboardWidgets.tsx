import React from 'react';
import { User, TrendingUp, Clock, UserRound } from 'lucide-react';
import { DonutChart } from './Charts';
import { StatusBadge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SearchInput, Card, Pagination } from '@/components/ui';
import { useAppointmentStatusBreakdown, useDoctorPerformance } from '../../hooks/dashboard/useDashboardAnalytics';

function CircleProgress({ value, color = '#3b82f6', size = 48 }: { value: number; color?: string; size?: number }) {
  const r = 18; const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="4" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" />
      <text x="24" y="28" textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="Inter,sans-serif">
        {value}%
      </text>
    </svg>
  );
}

export function AppointmentStatusWidget({ period = 'today', customStart, customEnd }: { period?: string, customStart?: string, customEnd?: string }) {
  const { data: statusData = {} } = useAppointmentStatusBreakdown(period, customStart, customEnd);
  
  const breakdown = Array.isArray(statusData?.breakdown) ? statusData.breakdown : [];
  const total = statusData?.total || 0;

  const statusStyles: Record<string, { bg: string, color: string }> = {
    'Completed': { bg: 'bg-emerald-500', color: '#10b981' },
    'Scheduled': { bg: 'bg-blue-500', color: '#3b82f6' },
    'Confirmed': { bg: 'bg-indigo-500', color: '#6366f1' },
    'In Progress': { bg: 'bg-amber-500', color: '#f59e0b' },
    'Cancelled': { bg: 'bg-rose-500', color: '#f43f5e' },
    'No Show': { bg: 'bg-gray-500', color: '#6b7280' },
  };

  let mappedStatuses = breakdown.map((s: any) => ({
    label: s.status,
    value: s.count || 0,
    ...(statusStyles[s.status] || { bg: 'bg-purple-500', color: '#a855f7' })
  }));

  if (total === 0 && mappedStatuses.length === 0) {
    mappedStatuses = [{ label: 'No Data', value: 1, bg: 'bg-gray-200', color: '#e5e7eb' }];
  }

  const slices = mappedStatuses.map(s => ({ label: s.label, value: s.value, color: s.color }));
  
  const periodLabel = period === 'today' ? "Today's Status" : period === 'week' ? "This Week's Status" : period === 'month' ? "This Month's Status" : period === 'year' ? "This Year's Status" : "Custom Period Status";

  return (
    <Card className="p-5 shadow-card h-full">
      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
        {periodLabel}
      </p>
      <div className="flex items-center gap-4">
        <DonutChart slices={slices} size={100} label={`${total}`} />
        <div className="flex-1 space-y-2">
          {mappedStatuses.map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${s.bg}`} />
                <span className="text-[11px] text-muted-foreground font-medium">{s.label}</span>
              </div>
              <span className="text-[11px] font-black text-foreground">{s.label === 'No Data' ? 0 : s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

import { useDebounce } from '../../hooks/useDebounce';

const DOCTOR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'
];

export function DoctorPerformanceWidget({ period = 'today', customStart, customEnd }: { period?: string, customStart?: string, customEnd?: string }) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(5);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const { data: responseData } = useDoctorPerformance(page, limit, debouncedSearch, period, customStart, customEnd);
  const doctors = Array.isArray(responseData) 
    ? responseData 
    : (responseData?.data || responseData?.items || []);
  
  const pagination = responseData?.pagination || null;
  const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : period === 'year' ? 'This Year' : 'Custom Period';

  const totalPages = pagination?.total_pages || Math.max(1, Math.ceil(doctors.length / limit));
  const currentPage = page;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pageNumbers.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pageNumbers.push('...');
    }
  }
  const displayPages = pageNumbers.filter((val, index, arr) => val !== '...' || arr[index - 1] !== '...');

  return (
    <Card className="flex flex-col shadow-card h-full overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Doctor Performance · {periodLabel}
        </p>
      </div>
      <div className="p-4 border-b border-border bg-muted/20">
        <SearchInput 
          value={search} 
          onChange={(v) => { setSearch(v); setPage(1); }} 
          placeholder="Search doctors..." 
          className="w-full max-w-none"
        />
      </div>
      <div className="flex-1 p-5 space-y-4">
        {doctors && doctors.length > 0 ? (
          doctors.map((doc: any, index: number) => {
            const colorClass = DOCTOR_COLORS[index % DOCTOR_COLORS.length];
            return (
              <div key={doc.id || index} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${colorClass} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                  {doc.profilePictureUrl ? (
                    <img src={doc.profilePictureUrl} alt={doc.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    doc.name?.substring(0, 2).toUpperCase() || <UserRound className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground truncate">{doc.name}</span>
                    <span className="text-[10px] font-black text-emerald-600">{doc.revenueFormatted || `₹${doc.revenueGenerated || 0}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${doc.utilizationRate || 0}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground flex-shrink-0">
                      {doc.utilizationRate || 0}% util
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {doc.totalAppointments || 0} appts
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {doc.completionRate || 0}% completion
                    </span>
                  </div>
                </div>
                <CircleProgress value={doc.completionRate || 0} size={44} />
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center text-muted-foreground text-xs font-medium">No doctor performance data available</div>
        )}
      </div>
      {(totalPages > 1 || doctors.length > 0) && (
        <div className="mt-auto border-t border-border/50 bg-muted/10">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={pagination?.total_items || (totalPages * limit)}
            perPage={limit}
            onPageChange={setPage}
            onPerPageChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          />
        </div>
      )}
    </Card>
  );
}
