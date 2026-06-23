import { useState, useEffect, useMemo } from "react";
import {
  User,
  Phone,
  Search,
  AlertCircle,
  UserPlus,
  Stethoscope,
  Calendar,
} from "lucide-react";
import {
  Modal,
  Button,
  Label,
  Input,
  ErrorState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { TimeSlotGrid } from "./DirectConsultation/TimeSlotGrid";
import { useAvailableSlotsQuery } from "../../hooks/appointments/useAvailableSlotsQuery";
import { useDoctorsListQuery } from "../../hooks/staff/useDoctorsListQuery";
import { checkPatientPhoneExists } from "../../hooks/patients/usePatientPhoneExistsQuery";

interface DirectConsultationPopupProps {
  onClose: () => void;
  onPatientFound: (
    patient: any,
    doctorId: string,
    doctorName: string,
    time: string,
  ) => void;
  onRegisterNew: (name: string, phone: string) => void;
  patients: any[];
  doctors: any[];
  appointments: any[];
  doctorAvailability: { [key: string]: boolean };
}

export function DirectConsultationPopup({
  onClose,
  onPatientFound,
  onRegisterNew,
  patients,
  doctors: dummyDoctors, // alias to avoid confusion
  appointments,
  doctorAvailability,
}: DirectConsultationPopupProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Dynamic doctor fetching using the system's role-based staff query
  const { doctors: apiDoctors } = useDoctorsListQuery();

  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  useEffect(() => {
    if (apiDoctors && apiDoctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(apiDoctors[0].id);
    }
  }, [apiDoctors, selectedDoctorId]);
  
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateLocal(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Integrate live available slots API query
  const { data: slotsData, isLoading: isLoadingSlots } = useAvailableSlotsQuery(
    selectedDoctorId || null,
    selectedDate || null
  );

  const allSlots = useMemo(() => {
    const rawSlots = slotsData?.data?.slots || [];
    return rawSlots.map((slot: any) => {
      const time24 = slot.time;
      const [h, m] = time24.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const time12 = `${hour12}:${m} ${ampm}`;

      let isPast = false;

      return {
        time24,
        time12,
        appointmentCount: slot.appointment_count || 0,
        isPast,
      };
    });
  }, [slotsData, selectedDate, todayStr]);

  useEffect(() => {
    const firstAvailable = allSlots.find((s) => !s.isPast);
    if (firstAvailable) {
      setSelectedTime(firstAvailable.time12);
    } else {
      setSelectedTime("");
    }
  }, [allSlots]);

  const handleProceed = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Please enter both name and phone number");
      return;
    }

    if (!selectedDoctorId) {
      setError("Please select a doctor");
      return;
    }

    if (!selectedTime) {
      setError("Please select an available slot");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const existsData = await checkPatientPhoneExists(phone.trim());

      const exists = existsData?.data?.exists ?? existsData?.exists;
      const patient = existsData?.data?.patient ?? existsData?.patient;

      if (exists && patient) {
        const doc = apiDoctors.find((d) => d.id === selectedDoctorId);
        onPatientFound(
          patient,
          selectedDoctorId,
          doc?.name || "",
          selectedTime,
        );
      } else {
        setError("Patient not found in records.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc ||
        err.message ||
        "Error verifying patient. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Modal
      title="Direct Consultation"
      subtitle="Verify patient records and assign available slot"
      onClose={onClose}
      size="lg"
      icon={<Stethoscope className="w-4 h-4" />}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={isSearching || !selectedTime}
            className="gap-2"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" /> Proceed
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Patient Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
                placeholder="Enter name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9"
                placeholder="Enter phone"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Assigned Doctor
              </Label>
              <Select
                value={selectedDoctorId}
                onValueChange={(val) => {
                  setSelectedDoctorId(val);
                  setSelectedTime("");
                }}
              >
                <SelectTrigger className="w-full rounded-xl text-sm font-bold">
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {!apiDoctors || apiDoctors.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      {!apiDoctors ? "Loading doctors..." : "No doctors found"}
                    </SelectItem>
                  ) : (
                    apiDoctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialization}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Consultation Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
                <Input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                  }}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Available Slots
            </Label>
            {isLoadingSlots ? (
              <div className="bg-muted/50 p-8 rounded-2xl border border-border flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground font-bold">Fetching doctor available slots...</span>
              </div>
            ) : (
              <TimeSlotGrid
                slots={allSlots}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
            )}
          </div>
        </div>

        {error && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
            <ErrorState 
              title={error}
              message="Please verify patient details or register a new record."
            />
            <div className="mt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRegisterNew(name, phone)}
              className="w-full gap-2 font-bold uppercase tracking-widest text-[10px] h-10 shadow-lg shadow-destructive/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register New Patient
            </Button>
          </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
