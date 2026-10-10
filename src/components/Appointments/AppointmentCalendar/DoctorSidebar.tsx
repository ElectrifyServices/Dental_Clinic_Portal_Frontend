import React, { useEffect } from "react";
import { Search, Stethoscope, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button, Pagination } from "@/components/ui";

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
  page: number;
  onPageChange: (page: number) => void;
  perPage: number;
  onPerPageChange?: (size: number) => void;
  totalItems: number;
  totalPages: number;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({
  doctors,
  searchTerm,
  setSearchTerm,
  selectedDoctorId,
  setSelectedDoctorId,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
  totalItems,
  totalPages,
}) => {
  useEffect(() => {
    // Auto-select if there is only one doctor in the entire list and no doctor is currently selected
    if (doctors.length === 1 && selectedDoctorId === null) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId, setSelectedDoctorId]);

  return (
    <div className="xl:col-span-3 bg-card rounded-2xl border border-border shadow-xs flex flex-col overflow-hidden h-[360px] sm:h-[400px] xl:h-full">
      <div className="p-2.5 sm:p-3 border-b border-border bg-muted/20">
        <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-primary" />
          Select Specialist
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Search experts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-card rounded-xl text-xs h-8 sm:h-8.5"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5 custom-scrollbar">
        <Button
          variant="ghost"
          onClick={() => setSelectedDoctorId(null)}
          className={`w-full p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-start gap-2.5 text-left h-auto active:scale-[0.98]
            ${selectedDoctorId === null 
              ? "bg-primary/10 border-primary text-primary shadow-xs hover:bg-primary/20" 
              : "bg-card border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/60 shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">All Appointments</p>
            <p className="text-[9.5px] text-muted-foreground/70 font-medium tracking-tight">View combined schedule</p>
          </div>
        </Button>

        {doctors.map((doctor) => (
          <Button
            variant="ghost"
            key={doctor.id}
            onClick={() => setSelectedDoctorId(doctor.id)}
            className={`w-full p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-start gap-2.5 text-left h-auto active:scale-[0.98]
              ${selectedDoctorId === doctor.id 
                ? "bg-primary/10 border-primary text-primary shadow-xs hover:bg-primary/20" 
                : "bg-card border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-border shrink-0">
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
              <p className="text-[10px] text-primary font-semibold truncate">{doctor.specialization}</p>
            </div>
          </Button>
        ))}
      </div>

      <div className="border-t border-border bg-muted/10 shrink-0">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          className="px-2.5 py-1.5 text-xs"
        />
      </div>
    </div>
  );
};
