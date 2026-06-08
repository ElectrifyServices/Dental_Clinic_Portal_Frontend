import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AppointmentTableRow } from "./AppointmentList/AppointmentTableRow";
import { AppointmentActionMenu } from "./AppointmentList/AppointmentActionMenu";
import { useDoctorsListQuery } from "../../hooks/staff/useDoctorsListQuery";

interface AppointmentListProps {
  appointments?: any[];
  onEditAppointment?: (id: string) => void;
  onDeleteAppointment?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onCheckInPatient?: (appointment: any) => void;
  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  apptFilter?: string;
  onFilterChange?: (filter: string) => void;
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

export function AppointmentList({
  appointments: propAppointments = [],
  onEditAppointment,
  onDeleteAppointment,
  onUpdateStatus,
  onCheckInPatient,
  selectedDate,
  setSelectedDate,
  searchValue,
  onSearchChange,
  apptFilter,
  onFilterChange,
}: AppointmentListProps) {
  const [localSearch, setLocalSearch] = useState("");
  const searchTerm = searchValue !== undefined ? searchValue : localSearch;
  const setSearchTerm = onSearchChange ?? setLocalSearch;

  const [localFilter, setLocalFilter] = useState("all");
  const filter = apptFilter !== undefined ? apptFilter : localFilter;
  const setFilter = onFilterChange ?? setLocalFilter;
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const { doctors } = useDoctorsListQuery();

  const today = new Date();
  const filtered = propAppointments.filter((a) => {
    const ptName = a.patientName || (a.patient && a.patient.name) || (typeof a.patient === 'string' ? a.patient : "");
    const name = String(ptName || "").toLowerCase();
    const searchMatch =
      name.includes(searchTerm.toLowerCase()) ||
      (a.treatmentType || a.type || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    let dateMatch = true;
    if (selectedDate) {
      const aDate = new Date(a.date);
      const aDateString = `${aDate.getFullYear()}-${String(aDate.getMonth() + 1).padStart(2, '0')}-${String(aDate.getDate()).padStart(2, '0')}`;
      dateMatch = (aDateString === selectedDate);
    }

    if (filter === "today")
      return (
        searchMatch && new Date(a.date).toDateString() === today.toDateString()
      );
    if (filter === "week") {
      const diff = (new Date(a.date).getTime() - today.getTime()) / 86400000;
      return searchMatch && diff >= 0 && diff <= 7;
    }
    return searchMatch && dateMatch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const formatTime = (t: string) => {
    if (!t || t.includes("AM") || t.includes("PM")) return t || "—";
    const [h, m] = t.split(":");
    let hr = parseInt(h);
    const ap = hr >= 12 ? "PM" : "AM";
    return `${hr % 12 || 12}:${m} ${ap}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 max-w-2xl">
          <div className="relative flex-1 max-w-md">
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
          <div className="w-48">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate?.(e.target.value);
                setFilter("all"); // reset other filters if user picks a date manually
                setPage(1);
              }}
              className="h-10 rounded-2xl bg-card border-border"
            />
          </div>
        </div>
        <div className="flex bg-muted p-1 rounded-2xl border border-border self-start">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilter(f.id);
                setPage(1);
              }}
              className={`px-5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all ${
                filter === f.id
                  ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
                  : "text-muted-foreground/60 hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {[
                  "Patient Details",
                  "Doctor",
                  "Schedule",
                  "Total Fee",
                  "Current Status",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-5 font-semibold text-muted-foreground/60 uppercase tracking-widest text-[10px] ${i === 3 ? "text-right" : i === 5 ? "text-center" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
                    <p className="text-muted-foreground/60 font-semibold uppercase tracking-widest text-[10px]">
                      No records found
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((a) => (
                  <AppointmentTableRow
                    key={a.id}
                    appointment={a}
                    doctors={doctors}
                    statusVariants={STATUS_VARIANTS}
                    formatTime={formatTime}
                    onOpenMenu={(e, id) => {
                      e.stopPropagation();
                      const rect = (
                        e.currentTarget as HTMLElement
                      ).getBoundingClientRect();
                      const menuHeight = 240; // Estimated height for appointment menu (has more items)
                      const windowHeight = window.innerHeight;

                      let top = rect.bottom + 8;
                      if (rect.bottom + menuHeight > windowHeight) {
                        top = rect.top - menuHeight;
                        if (top < 0) top = 10;
                      }

                      setMenuPos({ top, left: rect.right - 200 });
                      setOpenMenuId(id === openMenuId ? null : id);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-xs rounded-xl font-semibold transition-all ${p === page ? "bg-primary text-white shadow-md" : "text-muted-foreground/60 hover:bg-muted"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
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
        )}
      </div>

      {openMenuId &&
        createPortal(
          <AppointmentActionMenu
            appointment={propAppointments.find((a) => a.id === openMenuId)}
            onEdit={onEditAppointment}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDeleteAppointment}
            onCheckIn={onCheckInPatient}
            onClose={() => setOpenMenuId(null)}
            pos={menuPos}
          />,
          document.body,
        )}
    </div>
  );
}
