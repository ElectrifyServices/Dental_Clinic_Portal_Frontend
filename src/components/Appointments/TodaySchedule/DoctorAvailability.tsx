import React from 'react';
import { UserCheck, UserX } from 'lucide-react';

interface DoctorAvailabilityProps {
  doctors: any[];
  doctorAvailability: { [key: string]: boolean };
  onToggle: (id: string) => void;
}

export const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({
  doctors,
  doctorAvailability,
  onToggle
}) => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <UserCheck className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">Doctor Availability</h4>
        <div className="flex-1 h-px bg-muted ml-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map(doctor => {
          const available = doctorAvailability[doctor.id];
          return (
            <div
              key={doctor.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${available ? 'bg-card border-border' : 'bg-muted border-border opacity-75'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${available ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                  {doctor.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">{doctor.name}</p>
                  <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-tighter mt-0.5">{doctor.specialization}</p>
                </div>
              </div>
              <button
                onClick={() => onToggle(doctor.id)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${available
                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                    : 'bg-destructive/10 text-destructive hover:bg-destructive/10 border border-destructive/20'
                  }`}
              >
                {available ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
