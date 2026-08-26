import React, { useState } from "react";
import { Phone, Calendar, TrendingUp, User, ChevronLeft, ChevronRight } from "lucide-react";

import { StatusBadge, ContentCard, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, SearchInput, Pagination } from "@/components/ui";

import { useRecentPatients } from "../../hooks/dashboard/useDashboardAnalytics";
import { useDebounce } from "../../hooks/useDebounce";

export function RecentPatients({ period = 'today', customStart, customEnd }: { period?: string, customStart?: string, customEnd?: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: responseData } = useRecentPatients(page, limit, debouncedSearch, period, customStart, customEnd);

  const patients = Array.isArray(responseData)
    ? responseData
    : (responseData?.data || responseData?.items || []);

  const pagination = responseData?.pagination || null;

  type PatientStatus = "active" | "new" | "inactive";
  const STATUS_VARIANT: Record<PatientStatus, "green" | "blue" | "gray"> = {
    active: "green",
    new: "blue",
    inactive: "gray",
  };

  const periodLabel = period === 'today' ? "Today" : period === 'week' ? "This Week" : period === 'month' ? "This Month" : "This Year";
  const totalPages = pagination?.total_pages || Math.max(1, Math.ceil(patients.length / limit));
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
    <ContentCard
      title="Patients"
      subtitle={`Registered within · ${periodLabel}`}
      icon={<TrendingUp className="w-4 h-4" />}
      bodyClassName="p-0 flex flex-col"
    >
      <div className="p-4 border-b border-border bg-muted/20">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search patients..."
          className="w-full max-w-none"
        />
      </div>
      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-primary/5">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-[15px] font-bold text-foreground mb-1 uppercase tracking-tight">
            Begin your practice
          </h3>
          <p className="text-xs text-muted-foreground text-center max-w-[220px] leading-relaxed">
            Your patient directory is currently empty. Start by registering your
            first patient.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <TrendingUp className="w-3 h-3" />
            Ready for Growth
          </div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border flex-1">
            {patients.map((p: any, i: number) => (
              <div
                key={p.id || i}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                  {p.name?.[0]?.toUpperCase() ?? "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {p.name}
                    </span>
                    <StatusBadge
                      variant={
                        STATUS_VARIANT[p.status as PatientStatus] ?? "gray"
                      }
                    >
                      {p.status || "new"}
                    </StatusBadge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      {p.phone}
                    </span>
                    {p.lastVisitDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2 border-l border-border pl-2">
                        Last visit: {new Date(p.lastVisitDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  {p.totalVisits || 0} visit{p.totalVisits !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
          {(totalPages > 1 || patients.length > 0) && (
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
        </>
      )}
    </ContentCard>
  );
}
