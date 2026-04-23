import React from 'react';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { TodayAppointments } from '../components/Dashboard/TodayAppointments';
import { RecentPatients } from '../components/Dashboard/RecentPatients';

interface DashboardPageProps {
  appointments: any[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ appointments }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening at your clinic today.
        </p>
      </div>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayAppointments appointments={appointments} />
        <RecentPatients />
      </div>
    </div>
  );
};
