import React from "react";
import { DashboardStats } from "../components/Dashboard/DashboardStats";
import { TodayAppointments } from "../components/Dashboard/TodayAppointments";
import { RecentPatients } from "../components/Dashboard/RecentPatients";
import { UserPlus } from "lucide-react";

interface DashboardPageProps {
  appointments: any[];
  onAddPatient: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  appointments,
  onAddPatient,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening at your clinic today.
          </p>
        </div>
        <button
          onClick={onAddPatient}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <UserPlus className="w-5 h-5" />
          Add New Patient
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
