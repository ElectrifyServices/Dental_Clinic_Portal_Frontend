import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronDown,
  CheckCircle,
  CreditCard,
  Heart,
  Image as ImageIcon,
  Pill,
  Printer,
  Send,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { usePatientDocumentsQuery } from "../../../hooks/patients/usePatientDocumentsQuery";

// --- Reusable Empty State Component ---
const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 bg-muted/50 rounded-3xl border-2 border-dashed border-border">
    <div className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border ring-8 ring-gray-50/50">
      <Icon className="w-10 h-10 text-muted-foreground/40" />
    </div>
    <h3 className="text-lg font-bold text-foreground mb-1 uppercase tracking-tight">
      {title}
    </h3>
    <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
      {description}
    </p>
  </div>
);

// --- Medical Info Tab ---
export const MedicalInfoTab = ({ patient }: { patient: any }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Medical History */}
    <Card className="lg:col-span-1 bg-primary/5 rounded-2xl p-6 border border-primary/20 shadow-sm">
      <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
        <Heart className="w-5 h-5 mr-2 text-red-500" /> Medical History
      </h3>
      <div className="space-y-3">
        {(patient?.medicalHistoryNames || patient?.medicalHistory || patient?.medicalHistories || []).length > 0 ? (
          (patient.medicalHistoryNames || patient.medicalHistory || patient.medicalHistories).map((item: any, index: number) => {
            const name = typeof item === "object" ? (item.name || item.history?.name || item.condition || item.history_name) : item;
            return (
              <div
                key={index}
                className="bg-card rounded-xl p-4 border border-primary/10 shadow-sm animate-in fade-in duration-200"
              >
                <div className="flex items-center">
                  <Heart className="w-4 h-4 text-red-500 mr-2" />
                  <p className="text-foreground font-semibold">{name}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-red-200 mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold">No medical history recorded</p>
          </div>
        )}
      </div>
    </Card>

    {/* Allergies */}
    <Card className="lg:col-span-1 bg-destructive/5 rounded-2xl p-6 border border-destructive/20 shadow-sm">
      <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" /> Allergies & Alerts
      </h3>
      <div className="space-y-3">
        {(patient?.allergyNames || patient?.allergies || []).length > 0 ? (
          (patient.allergyNames || patient.allergies).map((allergy: any, index: number) => {
            const name = typeof allergy === "object" ? (allergy.allergy_name || allergy.name) : allergy;
            return (
              <div
                key={index}
                className="bg-card rounded-xl p-4 border border-destructive/20 shadow-sm animate-in fade-in duration-200"
              >
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-destructive mr-2" />
                  <p className="text-destructive font-semibold">{name}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-destructive font-semibold">No allergies recorded</p>
          </div>
        )}
      </div>
    </Card>
    <Card className="lg:col-span-2 bg-muted/50 rounded-2xl p-6 border border-border shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">
        Additional Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {patient.bloodGroup && (
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Blood Group</p>
            <p className="font-bold text-destructive">{patient.bloodGroup}</p>
          </div>
        )}
        {patient.occupation && (
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <User className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Occupation</p>
            <p className="font-medium text-foreground">{patient.occupation}</p>
          </div>
        )}
        {patient.maritalStatus && (
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <User className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Marital Status</p>
            <p className="font-medium text-foreground capitalize">
              {patient.maritalStatus}
            </p>
          </div>
        )}
        {patient.insuranceProvider && (
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Insurance</p>
            <p className="font-medium text-foreground">
              {patient.insuranceProvider}
            </p>
          </div>
        )}
      </div>
    </Card>
  </div>
);

// --- Appointments Tab ---
export const AppointmentsTab = ({
  patientAppointments,
  getStatusColor,
}: {
  patientAppointments: any[];
  getStatusColor: (s: string) => string;
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold text-foreground">Appointment History</h3>
    {patientAppointments.map((appointment) => (
      <Card
        key={appointment.id}
        className="bg-card rounded-2xl p-6 border border-border flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3 mt-0.5">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-base">
                {appointment.treatmentType || appointment.type}
              </p>
              <p className="text-xs text-primary font-bold mt-1">
                {appointment.date} • {appointment.time} • {appointment.duration || 15} mins
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1 font-semibold">
                Doctor: Dr. {appointment.doctorName || appointment.doctor}
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusColor(appointment.status)}`}
            >
              {appointment.status.toUpperCase()}
            </span>
            {appointment.cost > 0 && (
              <p className="font-bold text-foreground text-sm">
                ₹{appointment.cost.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Concern or clinical notes */}
        {(appointment.concern || appointment.notes) && (
          <div className="mt-2 pt-3 border-t border-border space-y-2">
            {appointment.concern && (
              <div className="text-xs text-muted-foreground/80">
                <span className="font-bold text-foreground/80">Concern:</span> {appointment.concern}
              </div>
            )}
            {appointment.notes && (
              <div className="text-xs text-muted-foreground/80 bg-card/60 p-2.5 rounded-xl border border-border/50">
                <span className="font-bold text-foreground/80">Clinical Notes:</span> {appointment.notes}
              </div>
            )}
          </div>
        )}
      </Card>
    ))}
    {patientAppointments.length === 0 && (
      <EmptyState
        icon={Calendar}
        title="No appointments found"
        description="There are no past or upcoming appointments recorded for this patient yet."
      />
    )}
  </div>
);

// --- Treatments Tab ---
export const TreatmentsTab = ({
  patientTreatments,
}: {
  patientTreatments: any[];
}) => {
  const hasInProgress = patientTreatments.some(
    (t) => t.status === "in-progress",
  );
  const hasPlanned = patientTreatments.some((t) => t.status === "planned");
  const hasCompleted = patientTreatments.some((t) => t.status === "completed");

  if (patientTreatments.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-foreground">Treatment Journey</h3>
        <EmptyState
          icon={Stethoscope}
          title="No treatments found"
          description="A treatment journey hasn't been started yet. All active, planned, and completed procedures will appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-foreground">Treatment Journey</h3>
      {hasInProgress && (
        <div>
          <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2" /> Active Treatments
          </h4>
          <div className="space-y-3">
            {patientTreatments
              .filter((t) => t.status === "in-progress")
              .map((treatment) => (
                <Card
                  key={treatment.id}
                  className="bg-primary/5 rounded-2xl p-4 border border-primary/20 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                        <Stethoscope className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {treatment.procedure}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tooth:{" "}
                          <span className="font-bold">{String(treatment.tooth) === "-1" || String(treatment.tooth) === "FM" ? "Full Mouth" : `#${treatment.tooth}`}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">
                          {new Date(treatment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-900">
                        ₹{treatment.cost.toLocaleString()}
                      </p>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary text-white uppercase">
                        IN-PROGRESS
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
      {hasPlanned && (
        <div>
          <h4 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" /> Pending Plans
          </h4>
          <div className="space-y-3">
            {patientTreatments
              .filter((t) => t.status === "planned")
              .map((treatment) => (
                <Card
                  key={treatment.id}
                  className="bg-purple-50/30 rounded-2xl p-4 border border-purple-100 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                        <Stethoscope className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {treatment.procedure}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tooth:{" "}
                          <span className="font-bold">{String(treatment.tooth) === "-1" || String(treatment.tooth) === "FM" ? "Full Mouth" : `#${treatment.tooth}`}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-900">
                        ₹{treatment.cost.toLocaleString()}
                      </p>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-200 text-purple-700 uppercase">
                        PLANNED
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
      {hasCompleted && (
        <div>
          <h4 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" /> Completed Treatments
          </h4>
          <div className="space-y-3">
            {patientTreatments
              .filter((t) => t.status === "completed")
              .map((treatment) => (
                <Card
                  key={treatment.id}
                  className="bg-green-50/30 rounded-2xl p-4 border border-green-100 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <div>
                        <p className="font-semibold text-muted-foreground">
                          {treatment.procedure}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tooth: {String(treatment.tooth) === "-1" || String(treatment.tooth) === "FM" ? "Full Mouth" : `#${treatment.tooth}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-muted-foreground/60">
                        ₹{treatment.cost.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-green-600 font-bold uppercase">
                        {new Date(treatment.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Billing Tab ---
export const BillingTab = ({
  patient,
  patientInvoices,
  getStatusColor,
  handleSendReminder,
}: {
  patient: any;
  patientInvoices: any[];
  getStatusColor: (s: string) => string;
  handleSendReminder: () => void;
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-foreground">Billing History</h3>
      {patient.outstandingBalance > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="font-semibold text-red-900">Outstanding Balance</p>
              <p className="text-2xl font-bold text-destructive">
                ₹{patient.outstandingBalance.toLocaleString()}
              </p>
            </div>
            <Button
              onClick={handleSendReminder}
              variant="destructive"
              className="flex items-center text-sm font-medium h-auto"
            >
              <Send className="w-4 h-4 mr-2" /> Send Reminder
            </Button>
          </div>
        </div>
      )}
    </div>
    {patientInvoices.map((invoice) => (
      <Card
        key={invoice.id}
        className="bg-card rounded-2xl p-6 border border-border shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-muted-foreground/60 mr-3" />
            <div>
              <p className="font-semibold text-foreground">{invoice.id}</p>
              <p className="text-sm text-muted-foreground">
                Issued: {new Date(invoice.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Due: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-foreground">
              ₹{(invoice.amount || invoice.total || 0).toLocaleString()}
            </p>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}
            >
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>
      </Card>
    ))}
    {patientInvoices.length === 0 && (
      <EmptyState
        icon={CreditCard}
        title="No invoices found"
        description="No billing records or invoices have been generated for this patient yet."
      />
    )}
  </div>
);

// --- Prescriptions Tab ---
export const PrescriptionsTab = ({
  patient,
}: {
  patient: any;
}) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const prescriptionHistory = (() => {
    const rawList = Array.isArray(patient?.prescriptionHistory) ? patient.prescriptionHistory : [];
    
    // If list has items and they already have nested prescriptions array, it's already grouped.
    if (rawList.length > 0 && Array.isArray(rawList[0].prescriptions)) {
      return rawList;
    }
    
    // If the list is flat (items contain medicine_name, medicine_id, or medicine directly), group them:
    if (rawList.length > 0 && (rawList[0].medicine_name || rawList[0].medicine_id || rawList[0].medicine)) {
      const groups: Record<string, any> = {};
      rawList.forEach((item: any) => {
        const key = item.source_id || `${item.visit_date || item.created_at || item.createdAt}_${item.procedure || item.treatment || 'Consultation'}`;
        if (!groups[key]) {
          groups[key] = {
            id: key,
            treatment: item.procedure || item.treatment || "Prescription Consultation",
            date: item.visit_date || item.created_at || item.createdAt,
            doctor_name: item.doctor_name || item.doctorName || "",
            session_number: item.session_number || item.sessionNumber || null,
            prescriptions: []
          };
        }
        groups[key].prescriptions.push(item);
      });
      return Object.values(groups);
    }
    
    return rawList;
  })();

  const getRecordDate = (record: any) => {
    const dateVal = record.date || record.treatment_date || record.created_at || record.createdAt || record.visit_date;
    if (!dateVal) return "—";
    try {
      const d = new Date(dateVal);
      return !isNaN(d.getTime()) ? d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) : String(dateVal);
    } catch (e) {
      return String(dateVal);
    }
  };

  const getRecordTreatment = (record: any) => {
    return (
      record.treatment ||
      record.procedure ||
      record.treatment_plan?.procedure ||
      record.treatmentPlan?.procedure ||
      "Prescription Consultation"
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
        <h3 className="text-lg font-bold text-foreground">
          Prescription History
        </h3>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {prescriptionHistory.length} Record{prescriptionHistory.length !== 1 ? "s" : ""}
        </span>
      </div>

      {prescriptionHistory.map((record: any, idx: number) => {
        const recordId = record.id || record._id || `record-${idx}`;
        const recordDate = getRecordDate(record);
        const recordTreatment = getRecordTreatment(record);
        const doctorName = record.doctor_name || record.doctorName || "";
        const sessionNumber = record.session_number || record.sessionNumber || null;

        const prescriptionsList = Array.isArray(record.prescriptions)
          ? record.prescriptions
          : Array.isArray(record.prescriptionItems)
          ? record.prescriptionItems
          : Array.isArray(record.items)
          ? record.items
          : [];

        // First item is open by default, others closed until clicked
        const isExpanded = expandedCards[recordId] !== undefined ? expandedCards[recordId] : idx === 0;

        return (
          <Card
            key={recordId}
            className="bg-card rounded-2xl border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 mb-4 overflow-hidden"
          >
            {/* Header section - click to expand/collapse */}
            <div 
              onClick={() => toggleCard(recordId)}
              className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-muted/30 transition-colors select-none"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mt-1 shadow-sm border border-primary/10">
                  <Pill className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-bold text-foreground leading-snug">
                      {recordTreatment}
                    </h4>
                    {sessionNumber && (
                      <span className="px-2 py-0.5 text-[10px] font-black bg-primary/10 text-primary uppercase rounded tracking-wider">
                        Session #{sessionNumber}
                      </span>
                    )}
                  </div>
                  
                  {/* Doctor and Date info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground font-semibold">
                    {doctorName && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-muted-foreground/75" />
                        Dr. {doctorName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/75" />
                      {recordDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chevron icon indicator */}
              <div className="p-1.5 hover:bg-muted rounded-full transition-colors">
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`} 
                />
              </div>
            </div>

            {/* Medicine details dropdown content */}
            {isExpanded && (
              <div className="p-5 pt-0 border-t border-border/40 bg-card space-y-3">
                <div className="pt-4 space-y-3 animate-in fade-in duration-200">
                  {prescriptionsList.map((prescription: any, index: number) => {
                    const medicineName =
                      prescription.medicine_name ||
                      prescription.medicine ||
                      prescription.medicineId ||
                      "Medicine";
                    const medicineDesc = prescription.medicine_description || prescription.description || "";
                    const dosage = prescription.dosage || prescription.dose || "";
                    const frequency = prescription.frequency || prescription.freq || "";
                    const timing = prescription.timing || "";
                    const duration = prescription.duration || "";
                    const durationType = prescription.duration_type || prescription.durationType || "";
                    const qty = prescription.qty || "";
                    const instructions = prescription.instructions || "";

                    return (
                      <div
                        key={index}
                        className="bg-muted/45 hover:bg-muted/65 transition-colors rounded-2xl p-4 border border-border/40"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                #{index + 1}
                              </span>
                              <h5 className="font-extrabold text-foreground text-sm tracking-tight">
                                {medicineName}
                              </h5>
                            </div>
                            {medicineDesc && (
                              <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium pl-6">
                                {medicineDesc}
                              </p>
                            )}
                          </div>

                          {/* Badges container */}
                          <div className="flex flex-wrap items-center gap-2 pl-6 md:pl-0">
                            {dosage && (
                              <div className="flex bg-card rounded-lg border border-border overflow-hidden shadow-sm text-[11px] font-bold">
                                <span className="px-2 py-1 bg-muted text-muted-foreground/80 border-r border-border text-[9px] font-black uppercase tracking-wider">
                                  DOSAGE
                                </span>
                                <span className="px-2 py-1 text-primary">
                                  {dosage}
                                </span>
                              </div>
                            )}
                            {frequency && (
                              <div className="flex bg-card rounded-lg border border-border overflow-hidden shadow-sm text-[11px] font-bold">
                                <span className="px-2 py-1 bg-muted text-muted-foreground/80 border-r border-border text-[9px] font-black uppercase tracking-wider">
                                  FREQ
                                </span>
                                <span className="px-2 py-1 text-primary">
                                  {frequency}
                                </span>
                              </div>
                            )}
                            {timing && (
                              <div className="flex bg-card rounded-lg border border-border overflow-hidden shadow-sm text-[11px] font-bold">
                                <span className="px-2 py-1 bg-muted text-muted-foreground/80 border-r border-border text-[9px] font-black uppercase tracking-wider">
                                  TIMING
                                </span>
                                <span className="px-2 py-1 text-primary">
                                  {timing}
                                </span>
                              </div>
                            )}
                            {duration && (
                              <div className="flex bg-card rounded-lg border border-border overflow-hidden shadow-sm text-[11px] font-bold">
                                <span className="px-2 py-1 bg-muted text-muted-foreground/80 border-r border-border text-[9px] font-black uppercase tracking-wider">
                                  DURATION
                                </span>
                                <span className="px-2 py-1 text-primary capitalize">
                                  {duration} {durationType.toLowerCase()}
                                </span>
                              </div>
                            )}
                            {qty && (
                              <span className="bg-card text-muted-foreground px-2 py-1 text-[11px] font-bold rounded-lg border border-border shadow-sm">
                                Qty: {qty}
                              </span>
                            )}
                          </div>
                        </div>

                        {instructions && (
                          <div className="mt-2.5 pt-2 border-t border-border/30 pl-6 text-xs text-muted-foreground/90 font-medium">
                            <span className="font-bold text-foreground/80">Instruction:</span> {instructions}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {prescriptionsList.length === 0 && (
                    <p className="text-xs text-muted-foreground italic pl-3">
                      No specific medicines listed in this record.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })}
      {prescriptionHistory.length === 0 && (
        <EmptyState
          icon={Pill}
          title="No prescriptions found"
          description="There are no prescriptions recorded for this patient. After a consultation, the prescription will appear here."
        />
      )}
    </div>
  );
};

// --- Documents Tab ---
export const DocumentsTab = ({
  patient,
}: {
  patient: any;
  loading: boolean;
}) => {
  const { data: documentsResponse, isLoading } = usePatientDocumentsQuery(patient?.id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Navigate through potential API response envelopes
  const rawDocuments = 
    documentsResponse?.responseObject?.data?.data || 
    documentsResponse?.responseObject?.data?.documents || 
    documentsResponse?.data?.data ||
    documentsResponse?.data?.documents || 
    (Array.isArray(documentsResponse?.responseObject?.data) ? documentsResponse.responseObject.data : null) ||
    (Array.isArray(documentsResponse?.data) ? documentsResponse.data : null) ||
    documentsResponse?.documents || 
    (Array.isArray(documentsResponse) ? documentsResponse : []);

  // Use API documents if available, otherwise fallback to patient.documents (local/mock)
  const documents = rawDocuments.length > 0 ? rawDocuments : (patient?.documents || []);

  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-6">
        Patient Documents & Images
      </h3>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc: any, index: number) => {
              const docUrl = doc.url || doc.document_url || doc.file_url;
              const docName = doc.file_name || doc.name || doc.document_name || "Document";
              
              return (
                <Card
                  key={doc.id || index}
                  className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-200 shadow-sm cursor-pointer"
                  onClick={() => {
                    if (docUrl) setSelectedImage(docUrl);
                  }}
                >
                  <img
                    src={docUrl || "https://placehold.co/400x300?text=Document"}
                    alt={docName}
                    className="w-full h-40 object-cover rounded-lg mb-3 hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Document";
                    }}
                  />
                  <h4 className="font-semibold text-foreground mb-1 truncate">{docName}</h4>
                  {(doc.doc_type || doc.type || doc.document_type) && (
                    <Badge variant="outline" className="mb-2 text-[10px] font-black uppercase text-primary border-primary/20 bg-primary/5 px-2 py-0.5 inline-flex w-fit">
                      {String(doc.doc_type || doc.type || doc.document_type).replace(/_/g, " ")}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {doc.date || doc.created_at ? new Date(doc.date || doc.created_at).toLocaleDateString() : "Unknown date"}
                  </p>
                </Card>
              );
            })}
          </div>
          {documents.length === 0 && (
            <EmptyState
              icon={ImageIcon}
              title="No documents uploaded"
              description="X-rays, dental scans, and other medical documents will be visible here once uploaded."
            />
          )}

          {/* Full Screen Image Viewer Modal */}
          {selectedImage && (
            <div 
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
              onClick={() => setSelectedImage(null)}
            >
              <Button 
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                <X className="w-6 h-6" />
              </Button>
              <img 
                src={selectedImage} 
                alt="Full View" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- Family Tab ---
export const FamilyTab = ({ familyMembers }: { familyMembers: any[] }) => {
  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Family Members</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Information about registered family members under this account
          </p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-xl text-primary text-sm font-bold border border-primary/20">
          {familyMembers.length} Linked Member
          {familyMembers.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {familyMembers.map((member) => (
          <Card
            key={member.id}
            className="bg-card rounded-2xl p-5 border border-border hover:shadow-md transition-all group shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl shadow-sm">
                  {member.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                    {member.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded tracking-wider">
                      {member.relation || "Relation N/A"}
                    </span>
                    <span className="text-xs text-muted-foreground/60 font-medium">
                      ID: {member.patientCode || member.patient_code || member.id}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${member.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
              >
                {member.status || "Active"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 border-t border-border pt-4">
              <div className="bg-muted rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> Age
                </p>
                <p className="font-bold text-foreground text-sm">
                  {calculateAge(member.dateOfBirth)} Years
                </p>
              </div>
              <div className="bg-muted rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Last Visit
                </p>
                <p className="font-bold text-foreground text-sm">
                  {member.lastVisit || "No visits"}
                </p>
              </div>
              <div className="bg-muted rounded-xl p-2.5 col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Outstanding Balance
                    </p>
                    <p
                      className={`font-bold text-sm ${member.outstandingBalance > 0 ? "text-destructive" : "text-green-600"}`}
                    >
                      ₹{(member.outstandingBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  {member.outstandingBalance > 0 && (
                    <span className="text-[10px] font-black text-red-500 bg-destructive/10 px-2 py-1 rounded uppercase animate-pulse">
                      Payment Due
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {familyMembers.length === 0 && (
        <EmptyState
          icon={User}
          title="No family members linked"
          description="This patient is currently registered as an individual account. All linked family members will appear here."
        />
      )}
    </div>
  );
};
