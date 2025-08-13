import React from 'react';
import { Calendar, DollarSign, Users, AlertTriangle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
}

function StatsCard({ title, value, icon, color, change }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Today's Appointments"
        value={12}
        icon={<Calendar className="w-6 h-6 text-white" />}
        color="bg-blue-500"
        change="+2 from yesterday"
      />
      <StatsCard
        title="Today's Earnings"
        value="₹15,240"
        icon={<DollarSign className="w-6 h-6 text-white" />}
        color="bg-green-500"
        change="+12% from yesterday"
      />
      <StatsCard
        title="Total Patients"
        value={1,234}
        icon={<Users className="w-6 h-6 text-white" />}
        color="bg-purple-500"
        change="+15 this month"
      />
      <StatsCard
        title="Low Stock Items"
        value={3}
        icon={<AlertTriangle className="w-6 h-6 text-white" />}
        color="bg-orange-500"
      />
    </div>
  );
}