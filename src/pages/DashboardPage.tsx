import React from "react";
import { DashboardStats } from "../components/Dashboard/DashboardStats";
import { TodayAppointments } from "../components/Dashboard/TodayAppointments";
import { RecentPatients } from "../components/Dashboard/RecentPatients";
import { UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface DashboardPageProps {
  appointments: any[];
  onAddPatient: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ appointments, onAddPatient }) => {
  const { state } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Welcome back, {state.user?.name}. Here's your clinic overview for today.
          </p>
        </div>
        <button onClick={onAddPatient}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
          <UserPlus className="w-4 h-4" /> Add New Patient
        </button>
      </div>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayAppointments appointments={appointments} />
        <RecentPatients />
      </div>
    </div>
  );
};
