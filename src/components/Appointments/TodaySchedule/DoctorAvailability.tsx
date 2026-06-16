import React from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { Button, Card, StatusBadge } from '@/components/ui';

interface DoctorAvailabilityProps {
  doctors: any[];
  doctorAvailability: { [key: string]: boolean };
  onToggle: (id: string) => void;
}

export const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({
  doctors = [],
  doctorAvailability = {},
  onToggle
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <UserCheck className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Doctor Availability</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {doctors.map(doctor => {
          const available = doctorAvailability[doctor.id] === true;
          return (
            <Card
              key={doctor.id}
              className={`transition-all hover:shadow-sm ${
                available ? 'border-border bg-card' : 'border-border bg-muted/40 opacity-80'
              }`}
            >
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    available ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {doctor.name ? doctor.name.charAt(0).toUpperCase() : "D"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-snug">{doctor.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider mt-0.5">
                      {doctor.specialization || "General Dentistry"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge variant={available ? "green" : "gray"}>
                    {available ? "Active" : "Inactive"}
                  </StatusBadge>
                  <Button
                    variant={available ? "destructive" : "default"}
                    onClick={() => onToggle(doctor.id)}
                    className="h-8 px-3 text-xs flex items-center gap-1"
                  >
                    {available ? (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
