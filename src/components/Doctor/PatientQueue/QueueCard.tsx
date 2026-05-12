import { useState, useEffect } from "react";
import {
  User,
  Clock,
  Phone,
  Stethoscope,
  MessageSquare,
  AlertTriangle,
  FileText,
  CheckCircle,
} from "lucide-react";

// Calculate age from DOB
const calcAge = (dob: string) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  )
    age--;
  return age;
};

// Live waiting time
function useWaitingTime(checkInTime: string) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const compute = () => {
      if (!checkInTime) {
        setLabel("");
        return;
      }
      const [h, m] = checkInTime.split(":").map(Number);
      const now = new Date();
      const checkin = new Date();
      checkin.setHours(h, m, 0, 0);
      const diff = Math.max(
        0,
        Math.floor((now.getTime() - checkin.getTime()) / 60000),
      );
      if (diff < 60) setLabel(`${diff} min`);
      else setLabel(`${Math.floor(diff / 60)}h ${diff % 60}m`);
    };
    compute();
    const t = setInterval(compute, 60000);
    return () => clearInterval(t);
  }, [checkInTime]);
  return label;
}

interface QueueCardProps {
  patient: any;
  fullPatient: any;
  getStatusColor: (s: string) => string;
  getStatusIcon: (s: string) => JSX.Element;
  onUpdatePatientStatus: (id: string, s: string) => void;
  onSelectPatient: (p: any) => void;
}

export function QueueCard({
  patient,
  fullPatient,
  getStatusColor,
  getStatusIcon,
  onUpdatePatientStatus,
  onSelectPatient,
}: QueueCardProps) {
  const waitingTime = useWaitingTime(patient.checkInTime);
  const age = fullPatient ? calcAge(fullPatient.dateOfBirth) : null;
  const gender = fullPatient?.gender || "";
  const medHistory: string[] = fullPatient?.medicalHistory
    ? Array.isArray(fullPatient.medicalHistory)
      ? fullPatient.medicalHistory
      : fullPatient.medicalHistory.split("\n").filter(Boolean)
    : [];
  const allergies: string[] = fullPatient?.allergies
    ? Array.isArray(fullPatient.allergies)
      ? fullPatient.allergies
      : fullPatient.allergies.split("\n").filter(Boolean)
    : [];

  return (
    <div className="card-hover p-4">
      {/* Patient Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md text-white ${patient.status === "waiting" ? "bg-yellow-500" : patient.status === "in-consultation" ? "bg-primary/100" : "bg-green-500"}`}
            >
              {getStatusIcon(patient.status)}
            </div>
          </div>
          <div className="ml-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-lg">
                {patient.patientName}
              </h3>
              {fullPatient?.category && fullPatient.category !== "regular" && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase border border-amber-200">
                  {fullPatient.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {age !== null && gender && (
                <span className="text-muted-foreground/40"></span>
              )}
              {gender && (
                <span className="text-sm text-muted-foreground">
                  Gender: <span className="capitalize">{gender}</span>
                </span>
              )}
            </div>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border mt-1 ${getStatusColor(patient.status)}`}
            >
              {getStatusIcon(patient.status)}
              <span className="ml-1">
                {patient.status.replace("-", " ").toUpperCase()}
              </span>
            </span>
          </div>
        </div>
        {/* Appointment time */}
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-primary">
            {patient.appointmentTime}
          </div>
          <div className="text-xs text-muted-foreground/60 mt-0.5">
            Check-in: {patient.checkInTime}
          </div>
          {patient.status === "waiting" && waitingTime && (
            <div className="flex items-center justify-end gap-1 mt-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-bold text-amber-600">
                {waitingTime}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contact & Concern */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start text-sm">
          <Phone className="w-4 h-4 text-muted-foreground/60 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-muted-foreground">{patient.patientPhone}</p>
          </div>
        </div>

        <div className="flex items-start text-sm">
          <Stethoscope className="w-4 h-4 text-muted-foreground/60 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Treatment Type</p>
            <p className="font-medium text-foreground">
              {patient.treatmentType || "—"}
            </p>
          </div>
        </div>

        {patient.patientConcern && (
          <div className="flex items-start text-sm">
            <MessageSquare className="w-4 h-4 text-muted-foreground/60 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Patient Concern</p>
              <p className="text-muted-foreground line-clamp-2">
                {patient.patientConcern}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Medical Alerts */}
      {(medHistory.length > 0 || allergies.length > 0) && (
        <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-800">
              Medical Alerts
            </span>
          </div>
          {allergies.length > 0 && (
            <div className="text-xs text-destructive mb-1">
              <strong>Allergies:</strong> {allergies.slice(0, 3).join(", ")}
              {allergies.length > 3 && ` +${allergies.length - 3} more`}
            </div>
          )}
          {medHistory.length > 0 && (
            <div className="text-xs text-orange-700">
              <strong>Conditions:</strong> {medHistory.slice(0, 2).join(", ")}
              {medHistory.length > 2 && ` +${medHistory.length - 2} more`}
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-primary/50 rounded-xl border border-primary/20">
          <div className="text-lg font-bold text-primary">
            {fullPatient?.totalVisits ?? 0}
          </div>
          <div className="text-xs text-primary font-bold uppercase tracking-wider">
            Visits
          </div>
        </div>
        <div className="text-center p-3 bg-green-50/50 rounded-xl border border-green-100">
          <div className="text-lg font-bold text-green-600">{age ?? "N/A"}</div>
          <div className="text-xs text-green-700 font-bold uppercase tracking-wider">
            Age
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-border">
        {patient.status === "waiting" && (
          <button
            onClick={() => {
              onUpdatePatientStatus(patient.id, "in-consultation");
              onSelectPatient(patient);
            }}
            className="btn-primary w-full justify-center"
          >
            <Stethoscope className="w-4 h-4" />
            Start Consultation
          </button>
        )}
        {patient.status === "in-consultation" && (
          <button
            onClick={() => onSelectPatient(patient)}
            className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <FileText className="w-4 h-4" />
            Continue Consultation
          </button>
        )}
        {patient.status === "completed" && (
          <span className="w-full py-2.5 bg-green-100 text-green-800 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Consultation Completed
          </span>
        )}
      </div>
    </div>
  );
}
