import type { ApiAny } from "../../types/api";
import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Stethoscope, MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui";
import { AppointmentActionMenu } from "./AppointmentList/AppointmentActionMenu";
import { useDoctorsListQuery } from "../../hooks/staff/useDoctorsListQuery";
import { formatPhoneWithCountryCode } from "@/utils/phoneUtils";
import { useModal } from "../../contexts/ModalContext";
 
interface AppointmentListProps {
  appointments?: ApiAny[];
  onEditAppointment?: (id: string) => void;
  onDeleteAppointment?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string, cancelledReason?: string) => void;
  onCheckInPatient?: (appointment: ApiAny) => void;
  onDirectCheckIn?: (appointment: ApiAny) => void;
  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  apptFilter?: string;
  onFilterChange?: (filter: string) => void;
  startDate?: string;
  setStartDate?: (date: string) => void;
  endDate?: string;
  setEndDate?: (date: string) => void;
  checkingInApptId?: string | null;
}

const STATUS_VARIANTS: Record<string, ApiAny> = {
  completed: "green",
  "in-progress": "blue",
  "checked-in": "green",
  confirmed: "indigo",
  scheduled: "gray",
  cancelled: "red",
  "no-show": "amber",
  "follow-up": "violet",
  follow_up: "violet",
  FOLLOW_UP: "violet",
};

const TYPE_FILTERS = [
  { id: "all", label: "All Appointments" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
];

const PER_PAGE = 10;

const formatTime = (t: string) => {
  if (!t) return "—";
  const upper = t.toUpperCase();
  if (upper.includes("AM") || upper.includes("PM")) return upper;
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  const ap = hr >= 12 ? "PM" : "AM";
  return `${hr % 12 || 12}:${m} ${ap}`;
};

export function AppointmentList({
  appointments: propAppointments = [],
  isNoShowView: _isNoShowView = false,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateStatus,
  onCheckInPatient,
  onDirectCheckIn,
  selectedDate,
  setSelectedDate,
  searchValue,
  onSearchChange,
  apptFilter,
  onFilterChange,
  startDate: propStartDate,
  setStartDate: propSetStartDate,
  endDate: propEndDate,
  setEndDate: propSetEndDate,
  checkingInApptId,
}: AppointmentListProps) {
  const { setActiveModal, setWhatsappPhone, setWhatsappPatientName } = useModal();
  const [localSearch, setLocalSearch] = useState("");
  const searchTerm = searchValue !== undefined ? searchValue : localSearch;
  const setSearchTerm = onSearchChange ?? setLocalSearch;

  const [localFilter, setLocalFilter] = useState("all");
  const filter = apptFilter !== undefined ? apptFilter : localFilter;
  const setFilter = onFilterChange ?? setLocalFilter;
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, "0")}-${String(nextWeek.getDate()).padStart(2, "0")}`;

  const initialFilter = apptFilter !== undefined ? apptFilter : "all";
  const [localStartDate, setLocalStartDate] = useState<string>(() => {
    if (selectedDate) return selectedDate;
    if (initialFilter === "today" || initialFilter === "week") return todayStr;
    return "";
  });
  const [localEndDate, setLocalEndDate] = useState<string>(() => {
    if (initialFilter === "today") return todayStr;
    if (initialFilter === "week") return nextWeekStr;
    return "";
  });

  const startDate = propStartDate !== undefined ? propStartDate : localStartDate;
  const setStartDate = propSetStartDate ?? setLocalStartDate;

  const endDate = propEndDate !== undefined ? propEndDate : localEndDate;
  const setEndDate = propSetEndDate ?? setLocalEndDate;

  const { doctors } = useDoctorsListQuery();

  const _today = new Date();
  const filtered = propAppointments.filter((a) => {
    const ptName =
      a.patientName ||
      (a.patient && a.patient.name) ||
      (typeof a.patient === "string" ? a.patient : "");
    const name = String(ptName || "").toLowerCase();
    const searchMatch =
      name.includes(searchTerm.toLowerCase()) ||
      (a.treatmentType || a.type || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    let dateMatch = true;
    if (startDate) {
      const aDate = new Date(a.date);
      const aDateString = `${aDate.getFullYear()}-${String(aDate.getMonth() + 1).padStart(2, "0")}-${String(aDate.getDate()).padStart(2, "0")}`;
      if (endDate) {
        dateMatch = aDateString >= startDate && aDateString <= endDate;
      } else {
        dateMatch = aDateString === startDate;
      }
    }
    return searchMatch && dateMatch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const columns = [
    {
      key: "patient",
      header: "Patient Details",
      render: (a: ApiAny) => {
        const ptNameRaw =
          a.patientName ||
          (a.patient && a.patient.name) ||
          (typeof a.patient === "string" ? a.patient : "?");
        const patientName = String(
          ptNameRaw && ptNameRaw !== "[object Object]" ? ptNameRaw : "?"
        );
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center text-primary font-bold text-xs shadow-xs uppercase shrink-0">
              {patientName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div 
                className="font-semibold text-foreground text-xs leading-tight mb-0.5 capitalize truncate max-w-[150px]" 
                title={patientName}
              >
                {patientName}
              </div>
              <div className="text-[9.5px] text-muted-foreground font-medium">
                {formatPhoneWithCountryCode(a.patientPhone || a.phone, a.country_code)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (a: ApiAny) => {
        const doc = doctors?.find(
          (d: ApiAny) => d.id === a.doctor_id || d.id === a.doctorId
        );
        let doctorName = doc ? doc.name : a.doctorName || a.doctor || "";
        if (doctorName && typeof doctorName === "string") {
          doctorName = doctorName.replace(/^(Dr\.\s+|Dr\s+)/i, "");
        }
        return (
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-md bg-muted flex items-center justify-center shrink-0">
              <Stethoscope className="w-3.5 h-3.5 text-muted-foreground/60" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground text-xs">
                Dr. {doctorName}
              </div>
              <div className="text-[9.5px] text-muted-foreground/70 mt-0.5 truncate">
                {a.treatmentType || a.type}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "schedule",
      header: "Schedule",
      render: (a: ApiAny) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs">
            <CalendarIcon className="w-3 h-3 text-muted-foreground/60" />
            {a.date
              ? new Date(a.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"}
          </div>
          <div className="flex items-center gap-1 text-[9.5px] text-muted-foreground/70">
            <Clock className="w-3 h-3 text-muted-foreground/40" />
            {formatTime(a.time)}{" "}
            <span className="text-muted-foreground/40 mx-0.5">•</span>{" "}
            {a.duration || 15} min
          </div>
        </div>
      ),
    },
    {
      key: "fee",
      header: "Total Fee",
      align: "right" as const,
      render: (a: ApiAny) => (
        <div className="font-semibold text-foreground text-xs sm:text-sm">
          ₹{(a.fee || 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: "status",
      header: "Current Status",
      render: (a: ApiAny) => (
        <Badge
          variant={
            STATUS_VARIANTS[a.status] ||
            STATUS_VARIANTS[(a.status || "").toLowerCase()] ||
            STATUS_VARIANTS[
              (a.status || "").toLowerCase().replace("_", "-")
            ] ||
            "gray"
          }
          className="text-[9.5px] px-2.5 py-0.5 font-medium"
        >
          {String(a.status || "")
            .replace("_", " ")
            .replace("-", " ")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "left" as const,
      render: (a: ApiAny) => (
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="icon"
            className="h-7.5 w-7.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-lg transition-all"
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const menuHeight = 190;
              const windowHeight = window.innerHeight;
              let top = rect.bottom + 4;
              if (rect.bottom + menuHeight > windowHeight) {
                top = Math.max(10, rect.top - menuHeight);
              }
              setMenuPos({ top, left: Math.max(10, rect.right - 192) });
              setOpenMenuId(a.id === openMenuId ? null : a.id);
            }}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const visiblePages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
    );
  }, [totalPages, page]);

  const paginationFooter =
    filtered.length > 0 ? (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 py-2.5 bg-muted/20 border-t border-border">
        <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider shrink-0">
          Showing {(page - 1) * PER_PAGE + 1}–
          {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
          entries
        </p>
        <div className="flex items-center gap-1.5 shrink-0 max-w-full overflow-x-auto">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg border-border shrink-0"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <div className="flex items-center gap-1">
            {visiblePages.map((p, i) => {
              const prev = visiblePages[i - 1];
              return (
                <React.Fragment key={p}>
                  {prev && p - prev > 1 && (
                    <span className="w-5 text-center text-xs text-muted-foreground/60 select-none">
                      …
                    </span>
                  )}
                  <Button
                    variant={p === page ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs rounded-lg font-semibold transition-all shrink-0 ${
                      p === page
                        ? "bg-primary text-white shadow-xs hover:bg-primary/90"
                        : "text-muted-foreground/60 hover:bg-muted"
                    }`}
                  >
                    {p}
                  </Button>
                </React.Fragment>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg border-border shrink-0"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    ) : undefined;

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Filters row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-2.5 bg-card/60 p-2 sm:p-2.5 rounded-xl border border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search patient, treatment or doctor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-8.5 sm:h-9 rounded-xl bg-card border-border text-xs"
            />
          </div>
          <div className="flex w-full sm:w-auto items-center gap-1.5">
            <DatePicker
              value={startDate || ""}
              onChange={(val) => {
                setStartDate(val);
                setSelectedDate?.(val);
                setFilter("all");
                setPage(1);
              }}
              className="h-8.5 sm:h-9 rounded-xl bg-card border-border w-28 sm:w-32 text-xs"
            />
            <span className="text-muted-foreground text-xs font-medium">to</span>
            <DatePicker
              value={endDate}
              min={startDate || ""}
              onChange={(val) => {
                setEndDate(val);
                setFilter("all");
                setPage(1);
              }}
              className="h-8.5 sm:h-9 rounded-xl bg-card border-border w-28 sm:w-32 text-xs"
            />
          </div>
        </div>
        <div className="flex bg-muted p-0.5 rounded-xl border border-border self-start lg:self-auto shrink-0">
          {TYPE_FILTERS.map((f) => (
            <Button
              variant="ghost"
              key={f.id}
              onClick={() => {
                setFilter(f.id);
                setPage(1);
                if (f.id === "today") {
                  setStartDate(todayStr);
                  setEndDate(todayStr);
                  setSelectedDate?.(todayStr);
                } else if (f.id === "week") {
                  setStartDate(todayStr);
                  setEndDate(nextWeekStr);
                } else if (f.id === "all") {
                  setStartDate("");
                  setEndDate("");
                }
              }}
              className={`px-3 sm:px-3.5 py-1 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition-all h-7 sm:h-7.5 ${
                filter === f.id
                  ? "bg-card text-primary shadow-xs ring-1 ring-black/5 hover:bg-card"
                  : "text-muted-foreground/60 hover:text-primary hover:bg-transparent"
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        compact
        columns={columns}
        data={paginated}
        rowKey={(a) => a.id}
        emptyIcon={<Clock className="w-5 h-5" />}
        emptyTitle="No records found"
        footer={paginationFooter}
      />

      {/* Portal action menu */}
      {openMenuId &&
        createPortal(
          <AppointmentActionMenu
            appointment={propAppointments.find((a) => a.id === openMenuId)}
            onEdit={onEditAppointment}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDeleteAppointment}
            onCheckIn={onCheckInPatient}
            onDirectCheckIn={onDirectCheckIn}
            onClose={() => setOpenMenuId(null)}
            pos={menuPos}
            checkingInApptId={checkingInApptId}
            onWhatsappHistory={(phone, name) => {
              setWhatsappPhone(phone);
              setWhatsappPatientName(name);
              setActiveModal("whatsappHistory");
            }}
          />,
          document.body
        )}
    </div>
  );
}
