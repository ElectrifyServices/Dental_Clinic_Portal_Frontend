import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  CreditCard,
  Heart,
  Image as ImageIcon,
  Pill,
  Printer,
  Send,
  Stethoscope,
  User,
} from "lucide-react";
import { Card, Button } from "@/components/ui";

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
    <Card className="bg-primary/5 rounded-2xl p-6 border border-primary/30 shadow-sm">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
        <Heart className="w-5 h-5 mr-2" /> Medical History
      </h3>
      <div className="space-y-3">
        {(patient?.medicalHistoryNames || patient?.medicalHistory || []).length > 0 ? (
          (patient.medicalHistoryNames || patient.medicalHistory).map((condition: string, index: number) => (
            <div
              key={index}
              className="bg-card rounded-xl p-4 border border-primary/30 shadow-sm"
            >
              <p className="text-primary font-medium">{condition}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            <p className="text-primary">No medical history recorded</p>
          </div>
        )}
      </div>
    </Card>
    <Card className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20 shadow-sm">
      <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" /> Allergies & Alerts
      </h3>
      <div className="space-y-3">
        {(patient?.allergyNames || patient?.allergies || []).length > 0 ? (
          (patient.allergyNames || patient.allergies).map((allergy: string, index: number) => (
            <div
              key={index}
              className="bg-card rounded-xl p-4 border border-destructive/20 shadow-sm"
            >
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-destructive mr-2" />
                <p className="text-destructive font-medium">{allergy}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-destructive">No allergies recorded</p>
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
                          <span className="font-bold">#{treatment.tooth}</span>
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
                          <span className="font-bold">#{treatment.tooth}</span>
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
                        <p className="text-xs text-muted-foreground">
                          Tooth: #{treatment.tooth}
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
  handlePrintDocument,
}: {
  patient: any;
  handlePrintDocument: () => void;
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-foreground">
        Prescription History
      </h3>
      {patient.prescriptionHistory?.length > 0 && (
        <Button
          onClick={handlePrintDocument}
          className="flex items-center text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-200 h-auto"
        >
          <Printer className="w-4 h-4 mr-2" /> Print Document
        </Button>
      )}
    </div>
    {patient.prescriptionHistory?.map((record: any) => (
      <Card
        key={record.id}
        className="bg-card rounded-2xl p-4 border border-primary/20 shadow-sm hover:shadow-md transition-all duration-200 mb-4 shadow-none"
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground leading-tight">
                {record.treatment}
              </h4>
              <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">
                Date: {new Date(record.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {record.prescriptions?.map((prescription: any, index: number) => (
            <div
              key={index}
              className="bg-muted/50 rounded-xl p-3 border border-border/50"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-400">
                    #{index + 1}
                  </span>
                  <h5 className="font-bold text-foreground text-sm">
                    {prescription.medicine}
                  </h5>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                    <span className="px-2 py-1 text-[10px] bg-muted text-muted-foreground border-r border-border font-bold">
                      DOSAGE
                    </span>
                    <span className="px-2 py-1 text-[11px] text-primary font-bold">
                      {prescription.dosage}
                    </span>
                  </div>
                  <div className="flex bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                    <span className="px-2 py-1 text-[10px] bg-muted text-muted-foreground border-r border-border font-bold">
                      FREQ
                    </span>
                    <span className="px-2 py-1 text-[11px] text-primary font-bold">
                      {prescription.frequency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    ))}
    {(!patient.prescriptionHistory ||
      patient.prescriptionHistory.length === 0) && (
      <EmptyState
        icon={Pill}
        title="No prescriptions found"
        description="There are no prescriptions recorded for this patient. After a consultation, the prescription will appear here."
      />
    )}
  </div>
);

// --- Documents Tab ---
export const DocumentsTab = ({
  patient,
}: {
  patient: any;
  loading: boolean;
}) => (
  <div>
    <h3 className="text-lg font-bold text-foreground mb-6">
      Patient Documents & Images
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patient.documents?.map((doc: any) => (
        <Card
          key={doc.id}
          className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-200 shadow-sm"
        >
          <img
            src={doc.url}
            alt={doc.name}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
          <h4 className="font-semibold text-foreground mb-1">{doc.name}</h4>
          <p className="text-sm text-muted-foreground">
            {new Date(doc.date).toLocaleDateString()}
          </p>
        </Card>
      ))}
    </div>
    {(!patient.documents || patient.documents.length === 0) && (
      <EmptyState
        icon={ImageIcon}
        title="No documents uploaded"
        description="X-rays, dental scans, and other medical documents will be visible here once uploaded."
      />
    )}
  </div>
);

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
