import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import {
  Search,
  Clock,
  Stethoscope,
  CheckCircle,
  AlertTriangle,
  History,
  UserPlus,
  Users,
  MessageCircle,
} from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import ConsultationHistoryModal from "./ConsultationHistoryModal";
import { DirectConsultationPopup } from "./DirectConsultationPopup";
import { QueueCard } from "./PatientQueue/QueueCard";
import { Pagination, PageHeader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

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
  onDirectConsultation: (
    name: string,
    phone: string,
    doctorId?: string,
    doctorName?: string,
    time?: string,
  ) => void;
  onRegisterNew: (name: string, phone: string) => void;
  patients: any[];
  doctors: any[];
  appointments: any[];
  doctorAvailability: any[];
  onUpdateConsultation?: (consultation: any) => Promise<void>;
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
  doctorName,
  queuedPatients,
  onSelectPatient,
  onEditConsultation,
  onUpdatePatientStatus,
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
  const { setActiveModal, setWhatsappPhone, setWhatsappPatientName } = useModal();
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localFilterStatus, setLocalFilterStatus] = useState("ALL");
  const [showHistory, setShowHistory] = useState(false);
  const [showDirectPopup, setShowDirectPopup] = useState(false);

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

  const safe = (val: any) => (val || "").toString().toLowerCase();

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
    <div className="h-full flex flex-col gap-6 min-h-0">
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
                <div className="w-2 h-2 bg-primary/100 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-primary">
                  {inConsultationCount} Consulting
                </span>
              </div>
            </div>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
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

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="w-full sm:w-[180px] shrink-0">
            <Select value={filterStatus} onValueChange={handleFilterStatusChange}>
              <SelectTrigger className="w-full h-10 rounded-xl bg-card border-border/60 text-sm font-semibold">
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => onDirectConsultation("", "")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary active:scale-95 transition-all shadow-md shadow-blue-200 font-bold text-sm flex-1 sm:flex-initial"
            >
              <UserPlus className="w-4 h-4" />
              <span>Direct</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowHistory(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-card border border-border text-muted-foreground rounded-xl hover:bg-muted active:scale-95 transition-all shadow-sm font-bold text-sm flex-1 sm:flex-initial"
            >
              <History className="w-4 h-4 text-blue-500" />
              <span>History</span>
            </Button>
          </div>
        </div>
      </div>

      {filteredPatients.length > 0 ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-2 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
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
                />
              );
            })}
          </div>

          {totalPages > 1 && onPageChange && (
            <div className="mt-4 flex justify-end shrink-0 pt-4 border-t border-border">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-12 bg-card rounded-2xl border border-border shadow-sm min-h-[300px]">
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
    </div>
  );
}
