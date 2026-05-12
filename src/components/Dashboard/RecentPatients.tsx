import React from "react";
import { Phone, Calendar, TrendingUp, User } from "lucide-react";

import { StatusBadge, ContentCard } from "@/components/ui";

export function RecentPatients() {
  const [patients, setPatients] = React.useState<any[]>([]);

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("patients") || "[]");
      const sorted = [...stored].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
      setPatients(sorted.slice(0, 6));
    } catch {}
  }, []);

  type PatientStatus = "active" | "new" | "inactive";
  const STATUS_VARIANT: Record<PatientStatus, "green" | "blue" | "gray"> = {
    active: "green",
    new: "blue",
    inactive: "gray",
  };

  return (
    <ContentCard
      title="Recent Patients"
      subtitle="Recently registered"
      icon={<TrendingUp className="w-4 h-4" />}
      bodyClassName="p-0"
    >
      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-primary/5">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-[15px] font-bold text-foreground mb-1 uppercase tracking-tight">
            Begin your practice
          </h3>
          <p className="text-xs text-muted-foreground text-center max-w-[220px] leading-relaxed">
            Your patient directory is currently empty. Start by registering your
            first patient.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <TrendingUp className="w-3 h-3" />
            Ready for Growth
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {patients.map((p, i) => (
            <div
              key={p.id || i}
              className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                {p.name?.[0]?.toUpperCase() ?? "P"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground truncate">
                    {p.name}
                  </span>
                  <StatusBadge
                    variant={
                      STATUS_VARIANT[p.status as PatientStatus] ?? "gray"
                    }
                  >
                    {p.status || "new"}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" />
                    {p.phone}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {p.totalVisits || 0} visit{p.totalVisits !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </ContentCard>
  );
}
