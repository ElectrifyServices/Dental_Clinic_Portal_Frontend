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
  IndianRupee,
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { toTitleCase } from "@/utils/stringUtils";
import { getFileUrl } from "@/services/apiClient";

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
  onEditConsultation?: (p: any) => void;
}

export function QueueCard({
  patient,
  fullPatient,
  getStatusColor,
  getStatusIcon,
  onUpdatePatientStatus,
  onSelectPatient,
  onEditConsultation,
}: QueueCardProps) {
  const waitingTime = useWaitingTime(patient.checkInTime);
  const age = fullPatient ? calcAge(fullPatient.dateOfBirth) : null;
  const gender = fullPatient?.gender || "";
  
  const [showAllAllergies, setShowAllAllergies] = useState(false);
  
  const extractNames = (list: any, keyName: string) => {
    if (!list) return [];
    if (typeof list === 'string') return list.split('\n').filter(Boolean);
    if (Array.isArray(list)) {
      return list.map(item => {
        if (typeof item === 'string') {
          // Ignore if it's a UUID
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item)) return null;
          return item;
        }
        return item[keyName]?.name || item.name || item.condition || item[`${keyName}_name`];
      }).filter(Boolean);
    }
    return [];
  };

  const allergies: string[] = extractNames(
    fullPatient?.allergyNames || fullPatient?.allergyList || fullPatient?.patient_allergies || fullPatient?.allergies,
    'allergy'
  );

  const medicalHistories: string[] = extractNames(
    fullPatient?.medicalHistoryNames || fullPatient?.historyList || fullPatient?.patient_histories || fullPatient?.medicalHistories || fullPatient?.medicalHistory,
    'history'
  );

  return (
    <Card className="hover:shadow-md hover:border-gray-200 transition-all duration-300 rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <CardContent className="p-5 flex flex-col h-full space-y-4">
        {/* Patient Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-50 pb-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 bg-blue-50/70 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-500 border border-blue-100/50 overflow-hidden">
              {patient.profile_picture_url || fullPatient?.profile_picture_url || fullPatient?.avatar ? (
                <img
                  src={getFileUrl(patient.profile_picture_url || fullPatient?.profile_picture_url || fullPatient?.avatar)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const icon = parent.querySelector('.placeholder-icon');
                      if (icon) (icon as HTMLElement).style.display = 'block';
                    }
                  }}
                />
              ) : null}
              <User
                className="w-5.5 h-5.5 placeholder-icon"
                style={{
                  display: (patient.profile_picture_url || fullPatient?.profile_picture_url || fullPatient?.avatar) ? 'none' : 'block'
                }}
              />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 truncate" title={toTitleCase(patient.patientName)}>
                {toTitleCase(patient.patientName)}
              </h3>
              {gender && (
                <span className="text-xs text-gray-500 font-semibold block mb-2">
                  Gender: <span className="capitalize">{gender}</span>
                </span>
              )}
              <div className="flex flex-wrap gap-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider border ${getStatusColor(patient.status)}`}
                >
                  {getStatusIcon(patient.status)}
                  {patient.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
          {/* Appointment time */}
          <div className="text-right flex-shrink-0 pt-0.5">
            <div className="text-sm font-black text-blue-600 mb-1">
              {patient.appointmentTime}
            </div>
            <div className="text-[10px] text-gray-400 font-bold">
              Check-in: {patient.checkInTime}
            </div>
          </div>
        </div>

        {/* Contact & Concern */}
        <div className="space-y-2.5 text-sm">
          <div className="flex items-start justify-between py-0.5 gap-2">
            <span className="flex items-center text-gray-500 text-xs font-semibold shrink-0">
              <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" /> Slot Duration
            </span>
            <span className="font-bold text-gray-900 text-right leading-tight">
              {patient.slotDurationMins ? `${patient.slotDurationMins} mins` : "N/A"}
            </span>
          </div>

          <div className="flex flex-col gap-1 py-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center text-gray-500 text-xs font-semibold shrink-0">
                <Stethoscope className="w-3.5 h-3.5 mr-2 text-gray-400" /> Treatment Type
              </span>
              {(!patient.treatmentType || patient.treatmentType.length <= 40) ? (
                <span className="font-bold text-gray-900 text-right break-words max-w-[65%] leading-tight">
                  {patient.treatmentType || "N/A"}
                </span>
              ) : null}
            </div>
            {patient.treatmentType && patient.treatmentType.length > 40 && (
              <div className="text-xs text-gray-700 font-bold leading-normal bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 max-h-24 overflow-y-auto scrollbar-thin pr-1 mt-1 text-left break-words">
                {patient.treatmentType}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 py-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center text-gray-500 text-xs font-semibold shrink-0">
                <FileText className="w-3.5 h-3.5 mr-2 text-gray-400" /> Specific Treatment
              </span>
              {(!patient.specificTreatment || patient.specificTreatment.length <= 40) ? (
                <span className="font-bold text-gray-900 text-right break-words max-w-[65%] leading-tight">
                  {patient.specificTreatment || "N/A"}
                </span>
              ) : null}
            </div>
            {patient.specificTreatment && patient.specificTreatment.length > 40 && (
              <div className="text-xs text-gray-700 font-bold leading-normal bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 max-h-24 overflow-y-auto scrollbar-thin pr-1 mt-1 text-left break-words">
                {patient.specificTreatment}
              </div>
            )}
          </div>

          <div className="flex items-start justify-between py-0.5 gap-2">
            <span className="flex items-center text-gray-500 text-xs font-semibold shrink-0">
              <IndianRupee className="w-3.5 h-3.5 mr-2 text-gray-400" /> Cost
            </span>
            <span className="font-bold text-gray-900 text-right leading-tight">
              {patient.appointmentCost ? `₹${patient.appointmentCost}` : "N/A"}
            </span>
          </div>

          {patient.patientConcern && (
            <div className="border-t border-gray-50 pt-2.5 mt-1">
              <div className="flex items-center text-gray-500 text-xs font-semibold mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 mr-2 text-gray-400" /> Patient Concern
              </div>
              <div className="text-xs text-gray-700 font-semibold leading-relaxed bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 max-h-24 overflow-y-auto scrollbar-thin pr-1 break-words">
                {patient.patientConcern}
              </div>
            </div>
          )}

          {patient.appointmentNotes && (
            <div className="border-t border-gray-50 pt-2.5 mt-1">
              <div className="flex items-center text-gray-500 text-xs font-semibold mb-1.5">
                <FileText className="w-3.5 h-3.5 mr-2 text-gray-400" /> Notes
              </div>
              <div className="text-xs text-gray-700 font-semibold leading-relaxed bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 max-h-24 overflow-y-auto scrollbar-thin pr-1 break-words">
                {patient.appointmentNotes}
              </div>
            </div>
          )}
        </div>

        {/* Medical Alerts */}
        {(allergies.length > 0 || medicalHistories.length > 0) && (
          <div className="p-3 bg-red-50/40 rounded-xl border border-red-100/60">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mr-1.5" />
              <span className="text-[10px] font-black text-red-800 uppercase tracking-widest">
                Medical Alerts
              </span>
            </div>
            <div className="space-y-1">
              {medicalHistories.length > 0 && (
                <div className="text-[11px] text-red-600 font-bold leading-tight">
                  <strong>History:</strong>{" "}
                  {showAllAllergies
                    ? medicalHistories.join(", ")
                    : medicalHistories.slice(0, 3).join(", ")}
                </div>
              )}
              {allergies.length > 0 && (
                <div className="text-[11px] text-red-600 font-bold leading-tight">
                  <strong>Allergies:</strong>{" "}
                  {showAllAllergies
                    ? allergies.join(", ")
                    : allergies.slice(0, 3).join(", ")}
                </div>
              )}
              {(allergies.length > 3 || medicalHistories.length > 3) && (
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAllAllergies(!showAllAllergies)}
                    className="cursor-pointer hover:underline text-red-800 h-auto p-0 text-[11px] font-bold"
                  >
                    {showAllAllergies ? "(show less)" : "(show more)"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          {/* Action Button */}
          <div>
            {patient.status === "PENDING" && (
              <Button
                onClick={() => {
                  onUpdatePatientStatus(patient.id, "IN_PROGRESS");
                  onSelectPatient(patient);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 h-10"
              >
                <Stethoscope className="w-4 h-4" />
                Start Consultation
              </Button>
            )}
            {patient.status === "IN_PROGRESS" && (
              <Button
                onClick={() => {
                  onUpdatePatientStatus(patient.id, "IN_PROGRESS");
                  onSelectPatient(patient);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 h-10"
              >
                <FileText className="w-4 h-4" />
                Continue Consultation
              </Button>
            )}
            {patient.status === "COMPLETED" && (
              <div className="flex gap-2 min-w-0">
                <div 
                  className="flex-1 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100/60 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 h-10 px-2 min-w-0"
                  title="Consultation Completed"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Completed</span>
                </div>
                {onEditConsultation && (
                  <Button
                    onClick={() => onEditConsultation(patient)}
                    variant="outline"
                    className="h-10 px-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm shrink-0"
                  >
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
