import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Stethoscope,
  MoreVertical,
} from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui";
import { AppointmentActionMenu } from "./AppointmentList/AppointmentActionMenu";
import { useDoctorsListQuery } from "../../hooks/staff/useDoctorsListQuery";
import { formatPhoneWithCountryCode } from "@/utils/phoneUtils";
import { useModal } from "../../contexts/ModalContext";

interface AppointmentListProps {
  appointments?: any[];
  onEditAppointment?: (id: string) => void;
  onDeleteAppointment?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string, cancelledReason?: string) => void;
  onCheckInPatient?: (appointment: any) => void;
  onDirectCheckIn?: (appointment: any) => void;
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

const STATUS_VARIANTS: Record<string, any> = {
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
  let hr = parseInt(h);
  const ap = hr >= 12 ? "PM" : "AM";
  return `${hr % 12 || 12}:${m} ${ap}`;
};

export function AppointmentList({
  appointments: propAppointments = [],
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

  const today = new Date();
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
      render: (a: any) => {
        const ptNameRaw =
          a.patientName ||
          (a.patient && a.patient.name) ||
          (typeof a.patient === "string" ? a.patient : "?");
        const patientName = String(
          ptNameRaw && ptNameRaw !== "[object Object]" ? ptNameRaw : "?"
        );
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary font-bold shadow-sm uppercase">
              {patientName.charAt(0)}
            </div>
            <div>
              <div 
                className="font-semibold text-foreground leading-tight mb-0.5 capitalize truncate max-w-[150px]" 
                title={patientName}
              >
                {patientName}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">
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
      render: (a: any) => {
        const doc = doctors?.find(
          (d: any) => d.id === a.doctor_id || d.id === a.doctorId
        );
        let doctorName = doc ? doc.name : a.doctorName || a.doctor || "";
        if (doctorName && typeof doctorName === "string") {
          doctorName = doctorName.replace(/^(Dr\.\s+|Dr\s+)/i, "");
        }
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-muted-foreground/60" />
            </div>
            <div>
              <div className="font-semibold text-foreground text-xs">
                Dr. {doctorName}
              </div>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">
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
      render: (a: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
            {a.date
              ? new Date(a.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />
            {formatTime(a.time)}{" "}
            <span className="text-muted-foreground/40 mx-1">•</span>{" "}
            {a.duration || 15} min
          </div>
        </div>
      ),
    },
    {
      key: "fee",
      header: "Total Fee",
      align: "right" as const,
      render: (a: any) => (
        <div className="font-semibold text-foreground text-sm">
          ₹{(a.fee || 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: "status",
      header: "Current Status",
      render: (a: any) => (
        <Badge
          variant={
            STATUS_VARIANTS[a.status] ||
            STATUS_VARIANTS[(a.status || "").toLowerCase()] ||
            STATUS_VARIANTS[
              (a.status || "").toLowerCase().replace("_", "-")
            ] ||
            "gray"
          }
          className="text-[10px] px-3 py-0.5 font-medium"
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
      render: (a: any) => (
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-xl transition-all"
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const menuHeight = 240;
              const windowHeight = window.innerHeight;
              let top = rect.bottom + 8;
              if (rect.bottom + menuHeight > windowHeight) {
                top = rect.top - menuHeight;
                if (top < 0) top = 10;
              }
              setMenuPos({ top, left: rect.right - 200 });
              setOpenMenuId(a.id === openMenuId ? null : a.id);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const paginationFooter =
    totalPages > 1 ? (
      <div className="flex items-center justify-between px-8 py-5 bg-muted/30 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
          Showing {(page - 1) * PER_PAGE + 1}–
          {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
          entries
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-xl border-border"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                variant={p === page ? "default" : "ghost"}
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs rounded-xl font-semibold transition-all ${
                  p === page
                    ? "bg-primary text-white shadow-md hover:bg-primary/90"
                    : "text-muted-foreground/60 hover:bg-muted"
                }`}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-xl border-border"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    ) : undefined;

  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-card/30 p-3 rounded-2xl border border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search patient, treatment or doctor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-10 rounded-2xl bg-card border-border"
            />
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <Input
              type="date"
              value={startDate || ""}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedDate?.(e.target.value);
                setFilter("all");
                setPage(1);
              }}
              className="h-10 rounded-2xl bg-card border-border w-36"
            />
            <span className="text-muted-foreground text-sm font-medium">to</span>
            <Input
              type="date"
              value={endDate}
              min={startDate || ""}
              onChange={(e) => {
                setEndDate(e.target.value);
                setFilter("all");
                setPage(1);
              }}
              className="h-10 rounded-2xl bg-card border-border w-36"
            />
          </div>
        </div>
        <div className="flex bg-muted p-1 rounded-2xl border border-border self-start lg:self-auto flex-shrink-0">
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
              className={`px-5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all h-9 ${
                filter === f.id
                  ? "bg-card text-primary shadow-sm ring-1 ring-black/5 hover:bg-card"
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
        columns={columns}
        data={paginated}
        rowKey={(a) => a.id}
        emptyIcon={<Clock className="w-6 h-6" />}
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
