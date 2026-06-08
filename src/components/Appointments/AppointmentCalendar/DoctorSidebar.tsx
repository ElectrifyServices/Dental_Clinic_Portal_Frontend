import React from "react";
import { Search, Stethoscope, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  image: string;
  avatar?: string;
}

interface DoctorSidebarProps {
  doctors: Doctor[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDoctorId: string | null;
  setSelectedDoctorId: (id: string | null) => void;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({
  doctors,
  searchTerm,
  setSearchTerm,
  selectedDoctorId,
  setSelectedDoctorId,
}) => {
  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="xl:col-span-3 bg-card rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden h-[400px] xl:h-full">
      <div className="p-5 border-b border-border bg-muted/30">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary" />
          Select Specialist
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder="Search experts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card rounded-2xl text-xs h-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <button
          onClick={() => setSelectedDoctorId(null)}
          className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center gap-3 text-left
            ${selectedDoctorId === null ? "bg-secondary border-primary shadow-sm" : "bg-card border-transparent hover:border-border"}`}
        >
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/60">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">All Appointments</p>
            <p className="text-[10px] text-muted-foreground/60 font-medium tracking-tight">View combined schedule</p>
          </div>
        </button>

        {filteredDoctors.map((doctor) => (
          <button
            key={doctor.id}
            onClick={() => setSelectedDoctorId(doctor.id)}
            className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center gap-3 text-left
              ${selectedDoctorId === doctor.id ? "bg-secondary border-primary shadow-sm" : "bg-card border-transparent hover:bg-muted"}`}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-gray-50 flex-shrink-0">
              <img
                src={doctor.avatar || doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`}
                alt={doctor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`;
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{doctor.name}</p>
              <p className="text-[10px] text-primary font-bold truncate">{doctor.specialization}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
