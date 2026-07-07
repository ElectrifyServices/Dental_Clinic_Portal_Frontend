import React from "react";
import { useAppData } from "../hooks/useAppData";
import { ReportsDashboard } from "../components/Reports/ReportsDashboard";

export const ReportsPage: React.FC = () => {
  const { patients, appointments, treatments, invoices } = useAppData();
  return (
    <div className="space-y-6">
      <ReportsDashboard
        patients={patients}
        appointments={appointments}
        treatments={treatments}
        invoices={invoices}
      />
    </div>
  );
};
