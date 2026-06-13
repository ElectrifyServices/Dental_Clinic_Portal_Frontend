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
} from "lucide-react";
import ConsultationHistoryModal from "./ConsultationHistoryModal";
import { DirectConsultationPopup } from "./DirectConsultationPopup";
import { QueueCard } from "./PatientQueue/QueueCard";

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
  onUpdateConsultation: (id: string, updates: any) => void;
  patients: any[];
  doctors: any[];
  appointments: any[];
  doctorAvailability: { [key: string]: boolean };
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  filterStatus?: string;
  onFilterStatusChange?: (value: string) => void;
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
}: PatientQueueProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header bg-gradient-to-r from-primary/10 to-indigo-50/30 p-6 rounded-3xl border border-primary/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center shadow-sm border border-primary/20 shrink-0">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Consultation Queue
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-sm font-medium text-muted-foreground">
                Dr. {doctorName}
              </span>
              <span className="w-1 h-1 bg-muted rounded-full hidden sm:inline" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-amber-600">
                    {waitingCount} Waiting
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary/100 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-primary">
                    {inConsultationCount} Consulting
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-card/80 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white shadow-sm self-start md:self-auto">
          <Clock className="w-5 h-5 text-blue-500" />
          <div className="text-right">
            <div className="text-lg font-black text-foreground leading-none">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
        </div>
      </div>

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

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center bg-muted/80 p-1 rounded-xl border border-border/60 overflow-x-auto scrollbar-none w-full sm:w-auto shrink-0">
            {[
              {
                id: "ALL",
                label: "All",
                icon: <Users className="w-3.5 h-3.5" />,
              },
              {
                id: "PENDING",
                label: "Pending",
                icon: <Clock className="w-3.5 h-3.5" />,
              },
              {
                id: "IN_PROGRESS",
                label: "In Progress",
                icon: <Stethoscope className="w-3.5 h-3.5" />,
              },
              {
                id: "COMPLETED",
                label: "Completed",
                icon: <CheckCircle className="w-3.5 h-3.5" />,
              },
            ].map((s) => (
              <Button
                key={s.id}
                variant={filterStatus === s.id ? "default" : "ghost"}
                onClick={() => handleFilterStatusChange(s.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
                  filterStatus === s.id
                    ? "bg-card text-primary shadow-sm border border-border hover:bg-card/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* <Button
              onClick={() => setShowDirectPopup(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary active:scale-95 transition-all shadow-md shadow-blue-200 font-bold text-sm flex-1 sm:flex-initial"
            >
              <UserPlus className="w-4 h-4" />
              <span>Direct</span>
            </Button> */}

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

      {/* Patient Cards */}
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
            />
          );
        })}
      </div>

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

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="card text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-muted-foreground/60" />
          </div>
          <h3 className="empty-state-title">No patients found</h3>
          <p className="text-muted-foreground mb-4 px-6">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search criteria or filters."
              : "Patients will appear here once they check in for their appointments."}
          </p>
        </div>
      )}
    </div>
  );
}
