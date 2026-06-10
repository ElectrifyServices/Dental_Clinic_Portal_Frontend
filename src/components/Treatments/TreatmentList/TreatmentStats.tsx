import { Users, Clock, CheckCircle, Calendar } from "lucide-react";
import { MetricCard } from "@/components/ui";

interface TreatmentStatsProps {
  totals: {
    all: number;
    active: number;
    completed: number;
    planned: number;
    revenue: number;
  };
  isLoading?: boolean;
}

export function TreatmentStats({ totals, isLoading }: TreatmentStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted/60 animate-pulse border border-border/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard label="Total Plans"  value={totals.all}       icon={<Users       className="w-5 h-5" />} variant="gray"    />
      <MetricCard label="In Progress"  value={totals.active}    icon={<Clock       className="w-5 h-5" />} variant="primary" />
      <MetricCard label="Completed"    value={totals.completed} icon={<CheckCircle className="w-5 h-5" />} variant="emerald" />
      <MetricCard label="Planned"      value={totals.planned}   icon={<Calendar    className="w-5 h-5" />} variant="amber"   />
    </div>
  );
}
