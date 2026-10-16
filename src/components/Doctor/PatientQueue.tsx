import type { ApiAny } from "../../types/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Search, Clock, Stethoscope, CheckCircle, AlertTriangle, History, UserPlus, Users, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/contexts/ModalContext";
import ConsultationHistoryModal from "./ConsultationHistoryModal";
import { DirectConsultationPopup } from "./DirectConsultationPopup";
import { QueueCard } from "./PatientQueue/QueueCard";
import { Pagination, PageHeader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, ConfirmModal, toast, Label } from "@/components/ui";

interface QueuedPatient {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  appointmentTime: string;
  treatmentType: string;
  patientConcern: string;
  checkInTime: string;
  status: "waiting" | "in-consultation" | "completed";
  notes?: string;
  patientHistory?: {
    lastVisit?: string;
    totalVisits: number;
    medicalHistory: string[];
    allergies: string[];
  };
}

interface PatientQueueProps {
  doctorName: string;
  queuedPatients: QueuedPatient[];
  onSelectPatient: (patient: QueuedPatient) => void;
  onEditConsultation?: (patient: QueuedPatient) => void;
  onUpdatePatientStatus: (patientId: string, status: string) => void;
  onDeleteConsultation?: (patientId: string) => Promise<void> | void;
  onDirectConsultation: (
    name: string,
    phone: string,
    doctorId?: string,
    doctorName?: string,
    time?: string,
  ) => void;
  onRegisterNew: (name: string, phone: string) => void;
  patients: ApiAny[];
  doctors: ApiAny[];
  appointments: ApiAny[];
  doctorAvailability: ApiAny[];
  onUpdateConsultation?: (consultation: ApiAny) => Promise<void>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  perPage?: number;
  onPerPageChange?: (limit: number) => void;
  onPageChange?: (page: number) => void;
}

export function PatientQueue({
  doctorName: _doctorName,
  queuedPatients,
  onSelectPatient,
  onEditConsultation,
  onUpdatePatientStatus,
  onDeleteConsultation,
  onDirectConsultation,
  onRegisterNew,
  patients,
  doctors,
  appointments,
  doctorAvailability,
  searchTerm: propSearchTerm,
  onSearchChange,
  filterStatus: propFilterStatus,
  onFilterStatusChange,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  perPage = 10,
  onPerPageChange,
  onPageChange,
}: PatientQueueProps) {
  const { setActiveModal: _setActiveModal, setWhatsappPhone: _setWhatsappPhone, setWhatsappPatientName: _setWhatsappPatientName } = useModal();
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localFilterStatus, setLocalFilterStatus] = useState("ALL");
  const [showHistory, setShowHistory] = useState(false);
  const [showDirectPopup, setShowDirectPopup] = useState(false);
  const [deleteConfirmPatient, setDeleteConfirmPatient] = useState<ApiAny | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmPatient) return;
    try {
      setIsDeleting(true);
      await onDeleteConsultation?.(deleteConfirmPatient.id);
      toast.success("Consultation deleted successfully");
      setDeleteConfirmPatient(null);
    } catch (err: ApiAny) {
      toast.error(err?.message || "Failed to delete consultation");
    } finally {
      setIsDeleting(false);
    }
  };

  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : localSearchTerm;
  const filterStatus = propFilterStatus !== undefined ? propFilterStatus : localFilterStatus;
  const handleSearchChange = onSearchChange || setLocalSearchTerm;
  const handleFilterStatusChange = onFilterStatusChange || setLocalFilterStatus;

  const getStatusColor = (status: string) => {  
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_PROGRESS":
        return "bg-primary/10 text-primary border-primary/30";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Stethoscope className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const safe = (val: ApiAny) => (val || "").toString().toLowerCase();

  const filteredPatients = queuedPatients.filter((patient) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      safe(patient.patientName).includes(search) ||
      safe(patient.treatmentType).includes(search) ||
      safe(patient.patientConcern).includes(search);
    const matchesFilter = filterStatus === "ALL" || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const waitingCount = queuedPatients.filter(
    (p) => p.status === "PENDING",
  ).length;
  const inConsultationCount = queuedPatients.filter(
    (p) => p.status === "IN_PROGRESS",
  ).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <PageHeader
        title="Consultation Queue"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 bg-card/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border shadow-sm w-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-amber-600">
                  {waitingCount} Waiting
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-bold text-primary">
                  {inConsultationCount} Consulting
                </span>
              </div>
            </div>
          </div>
        }
      />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm shrink-0">
          <div className="relative flex-1 group w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search by patient name, treatment, or concern..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm border border-border rounded-xl bg-muted/50 focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              className={cn("h-10 gap-2 shrink-0", filterStatus !== "ALL" && "border-primary bg-primary/10 text-primary hover:bg-primary/15")}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {filterStatus !== "ALL" && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px]">1</span>
              )}
            </Button>

            {filterStatus !== "ALL" && (
              <Button variant="ghost" onClick={() => handleFilterStatusChange("ALL")} className="h-10 gap-1 text-muted-foreground shrink-0">
                <X className="w-3 h-3" /> <span className="hidden sm:inline">Clear</span>
              </Button>
            )}

            <Button
              onClick={() => onDirectConsultation("", "")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary active:scale-95 transition-all shadow-md shadow-blue-200 font-bold text-sm flex-1 sm:flex-initial"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Direct</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowHistory(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-card border border-border text-muted-foreground rounded-xl hover:bg-muted active:scale-95 transition-all shadow-sm font-bold text-sm flex-1 sm:flex-initial"
            >
              <History className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">History</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Status</Label>
                <Select value={filterStatus} onValueChange={handleFilterStatusChange}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-muted/50 border-border/60 text-sm font-semibold">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>All Status</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PENDING">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span>Pending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        <span>In Progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Completed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredPatients.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => {
              const fullPatient = patients.find(
                (p) =>
                  p.phone === patient.patientPhone ||
                  p.name === patient.patientName,
              );
              return (
                <QueueCard
                  key={patient.id}
                  patient={patient}
                  fullPatient={fullPatient}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  onUpdatePatientStatus={onUpdatePatientStatus}
                  onSelectPatient={onSelectPatient}
                  onEditConsultation={onEditConsultation}
                  onDeleteConsultation={(p) => setDeleteConfirmPatient(p)}
                />
              );
            })}
          </div>

          {onPageChange && (
            <div className="pt-4 pb-6 border-t border-border">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                className="px-0 py-1"
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-card rounded-2xl border border-border shadow-sm min-h-[300px]">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No patients found</h3>
          <p className="text-sm text-muted-foreground max-w-sm text-center px-6">
            {searchTerm || filterStatus !== "ALL"
              ? "Try adjusting your search criteria or filters."
              : "Patients will appear here once they check in for their appointments."}
          </p>
        </div>
      )}

      {showDirectPopup && (
        <DirectConsultationPopup
          onClose={() => setShowDirectPopup(false)}
          patients={patients}
          doctors={doctors}
          appointments={appointments}
          doctorAvailability={doctorAvailability}
          onPatientFound={(p, doctorId, doctorName, time) => {
            setShowDirectPopup(false);
            onDirectConsultation(p.name, p.phone, doctorId, doctorName, time);
          }}
          onRegisterNew={(name, phone) => {
            setShowDirectPopup(false);
            onRegisterNew(name, phone);
          }}
        />
      )}

      {showHistory && (
        <ConsultationHistoryModal
          onClose={() => setShowHistory(false)}
          patients={patients}
        />
      )}

      {deleteConfirmPatient && (
        <ConfirmModal
          title="Delete Consultation"
          message={`Are you sure you want to delete the consultation for "${deleteConfirmPatient.patientName}"? This will cancel the linked appointment and remove the patient from the queue.`}
          confirmLabel="Yes, Delete"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmPatient(null)}
        />
      )}
    </div>
  );
}
