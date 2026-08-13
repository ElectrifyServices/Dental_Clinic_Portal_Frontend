import React from "react";
import { Phone, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { ContentCard, Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SearchInput } from "@/components/ui";
import { Appointment } from "@/types";

const STATUS_META: Record<string, { label: string; variant: any }> = {
  scheduled: { label: "Scheduled", variant: "gray" },
  confirmed: { label: "Confirmed", variant: "indigo" },
  "checked-in": { label: "Checked In", variant: "purple" },
  "in-progress": { label: "In Progress", variant: "blue" },
  completed: { label: "Completed", variant: "green" },
  cancelled: { label: "Cancelled", variant: "red" },
  "no-show": { label: "No Show", variant: "amber" },
};

export function TodayAppointments({
  appointments = [],
  period = 'today',
  pagination,
  page,
  setPage,
  limit,
  setLimit,
  apptSearch = "",
  setApptSearch
}: {
  appointments: Appointment[];
  period?: string;
  customStart?: string;
  customEnd?: string;
  pagination?: any;
  page?: number;
  setPage?: (p: number) => void;
  limit?: number;
  setLimit?: (l: number) => void;
  apptSearch?: string;
  setApptSearch?: (s: string) => void;
}) {
  const periodLabel = period === 'today' ? "Today's" : period === 'week' ? "This Week's" : period === 'month' ? "This Month's" : "This Year's";

  const currentPage = page || 1;
  const itemsPerPage = limit || 10;
  const totalPages = pagination?.total_pages || Math.max(1, Math.ceil(appointments.length / itemsPerPage));
  
  // Create array of page numbers to show
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and adjacent pages
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pageNumbers.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pageNumbers.push('...');
    }
  }
  
  // Remove duplicate '...'
  const displayPages = pageNumbers.filter((val, index, arr) => val !== '...' || arr[index - 1] !== '...');

  return (
    <ContentCard
      title={`${periodLabel} Appointments`}
      subtitle={`${pagination?.total_items || appointments.length} scheduled for ${period === 'today' ? new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : 'this period'}`}
      icon={<Calendar className="w-5 h-5" />}
      bodyClassName="p-0 flex flex-col h-full min-h-[400px]"
      className="h-full"
    >
      <div className="p-4 border-b border-border bg-muted/20">
        <SearchInput 
          value={apptSearch} 
          onChange={(v) => { 
            if (setApptSearch) setApptSearch(v); 
            if (setPage) setPage(1); 
          }} 
          placeholder="Search appointments..." 
          className="w-full max-w-none"
        />
      </div>
      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-primary/5">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-sm font-black text-foreground mb-1 uppercase tracking-[0.1em]">
            Schedule is clear
          </h3>
          <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest leading-relaxed">
            No appointments found for {period}
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/50 flex-1">
            {appointments.map((appt, i) => {
              const sm = STATUS_META[appt.status] ?? STATUS_META.scheduled;
              return (
                <div
                  key={appt.id || i}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-all group"
                >
                  <div className="w-16 flex-shrink-0">
                    <span className="text-xs font-black text-primary tracking-tight">
                      {appt.time}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm text-foreground truncate tracking-tight">
                        {appt.patientName}
                      </span>
                      <Badge
                        variant={sm.variant}
                        className="text-[8px] font-black uppercase px-1.5 h-4 tracking-tighter"
                      >
                        {sm.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">
                        {appt.treatmentType || appt.type}
                      </span>
                      {appt.patientPhone && (
                        <span className="text-[10px] text-primary/60 font-mono tracking-tighter flex items-center gap-1 flex-shrink-0 opacity-60">
                          <Phone className="w-3 h-3" />
                          {appt.patientPhone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest flex-shrink-0">
                    {appt.duration || 15} MIN
                  </div>
                </div>
              );
            })}
          </div>
          {(totalPages > 1 || (appointments.length > 0 && limit)) && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border/50 mt-auto bg-muted/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Items per page:
                </span>
                <Select
                  value={String(limit || 10)}
                  onValueChange={(val) => {
                    if (setLimit) setLimit(Number(val));
                    if (setPage) setPage(1);
                  }}
                >
                  <SelectTrigger className="h-6 text-[10px] px-2 w-[60px] font-bold">
                    <SelectValue placeholder={String(limit || 10)} />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)} className="text-[10px] font-bold">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => setPage && setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {displayPages.map((p, idx) => (
                  <Button
                    key={idx}
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon-xs"
                    onClick={() => p !== '...' && setPage && setPage(p as number)}
                    disabled={p === '...'}
                    className={`h-7 min-w-[28px] px-1 text-xs font-bold ${p === '...' ? 'border-none shadow-none cursor-default bg-transparent text-muted-foreground hover:bg-transparent' : ''}`}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => setPage && setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </ContentCard>
  );
}
