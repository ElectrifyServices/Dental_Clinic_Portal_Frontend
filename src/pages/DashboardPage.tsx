import React from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { DashboardStats } from "../components/Dashboard/DashboardStats";
import { TodayAppointments } from "../components/Dashboard/TodayAppointments";
import { RecentPatients } from "../components/Dashboard/RecentPatients";
import { Button } from "@/components/ui";

export const DashboardPage: React.FC = () => {
  const { appointments } = useAppData();
  const { state } = useAuth();
  const { setActiveModal, setSelectedPatientId, setPreFilledPatientData, setPatientFormType } = useModal();

  const handleAddPatient = () => {
    setSelectedPatientId("");
    setPreFilledPatientData(null);
    setPatientFormType("normal");
    setActiveModal("patientForm");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 shadow-sm -mt-3 md:-mt-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground font-medium">
            Welcome back, {state.user?.name}. Here's your clinic overview for today.
          </p>
        </div>
        <Button onClick={handleAddPatient} className="gap-2">
          <UserPlus className="w-4 h-4" /> Add New Patient
        </Button>
      </div>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayAppointments appointments={appointments} />
        <RecentPatients />
      </div>
    </div>
  );
};
