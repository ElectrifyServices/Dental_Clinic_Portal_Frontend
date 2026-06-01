import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Search,
  AlertCircle,
  UserPlus,
  Stethoscope,
  Calendar,
} from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { TimeSlotGrid } from "./DirectConsultation/TimeSlotGrid";

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
  doctors,
  appointments,
  doctorAvailability,
}: DirectConsultationPopupProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    doctors[0]?.id || "",
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateLocal(new Date());

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break;
        const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const time12 = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
        slots.push({ time24, time12 });
      }
    }
    return slots;
  };

  const getSlotsWithStatus = () => {
    const selDoctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!selDoctor) return [];

    const dayName = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const daySchedule = selDoctor.workingHours?.[dayName];

    if (
      !daySchedule ||
      !daySchedule.isWorking ||
      !doctorAvailability[selectedDoctorId]
    )
      return [];

    const allPossibleSlots = generateTimeSlots();
    const startHour = parseInt(daySchedule.startTime.split(":")[0]);
    const startMinute = parseInt(daySchedule.startTime.split(":")[1]);
    const endHour = parseInt(daySchedule.endTime.split(":")[0]);
    const endMinute = parseInt(daySchedule.endTime.split(":")[1]);

    const bookedSlots = (appointments || [])
      .filter((a) => a.doctorId === selectedDoctorId && a.date === todayStr)
      .map((a) => a.time);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return allPossibleSlots
      .filter((slot) => {
        const slotHour = parseInt(slot.time24.split(":")[0]);
        const slotMinute = parseInt(slot.time24.split(":")[1]);

        if (
          slotHour < startHour ||
          (slotHour === startHour && slotMinute < startMinute)
        )
          return false;
        if (
          slotHour > endHour ||
          (slotHour === endHour && slotMinute > endMinute)
        )
          return false;

        if (daySchedule.breakStart && daySchedule.breakEnd) {
          const bsH = parseInt(daySchedule.breakStart.split(":")[0]);
          const bsM = parseInt(daySchedule.breakStart.split(":")[1]);
          const beH = parseInt(daySchedule.breakEnd.split(":")[0]);
          const beM = parseInt(daySchedule.breakEnd.split(":")[1]);
          if (
            (slotHour > bsH || (slotHour === bsH && slotMinute >= bsM)) &&
            (slotHour < beH || (slotHour === beH && slotMinute < beM))
          )
            return false;
        }
        return true;
      })
      .map((slot) => {
        const slotHour = parseInt(slot.time24.split(":")[0]);
        const slotMinute = parseInt(slot.time24.split(":")[1]);

        const isPast =
          slotHour < currentHour ||
          (slotHour === currentHour && slotMinute < currentMinute);
        const isBooked =
          bookedSlots.includes(slot.time24) ||
          bookedSlots.includes(slot.time12);

        return {
          ...slot,
          isBooked,
          isPast,
        };
      });
  };

  const allSlots = getSlotsWithStatus();

  useEffect(() => {
    const firstAvailable = allSlots.find((s) => !s.isBooked && !s.isPast);
    if (firstAvailable && !selectedTime) {
      setSelectedTime(firstAvailable.time12);
    }
  }, [allSlots]);

  const handleProceed = () => {
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

    // Simulate search
    setTimeout(() => {
      const foundPatient = patients.find(
        (p) =>
          p.name.toLowerCase() === name.toLowerCase().trim() &&
          p.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""),
      );

      if (foundPatient) {
        const doc = doctors.find((d) => d.id === selectedDoctorId);
        onPatientFound(
          foundPatient,
          selectedDoctorId,
          doc?.name || "",
          selectedTime,
        );
      } else {
        setError("Patient not found in records.");
      }
      setIsSearching(false);
    }, 500);
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
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Patient Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Enter name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Enter phone"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Assigned Doctor
            </label>
            <div className="relative">
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setSelectedTime("");
                }}
                className="w-full pl-4 pr-10 py-2.5 border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-card cursor-pointer"
              >
                <option value="" disabled>
                  Choose a doctor
                </option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialization}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Available Slots
            </label>
            <TimeSlotGrid
              slots={allSlots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-destructive leading-tight">
                  {error}
                </p>
                <p className="text-[11px] text-destructive/70 mt-1">
                  Please verify patient details or register a new record.
                </p>
              </div>
            </div>
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
        )}
      </div>
    </Modal>
  );
}
