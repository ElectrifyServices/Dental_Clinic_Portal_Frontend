import React from 'react';
import { ReportsDashboard } from '../components/Reports/ReportsDashboard';

interface ReportsPageProps {
  patients: any[];
  appointments: any[];
  treatments: any[];
  invoices: any[];
}

export const ReportsPage: React.FC<ReportsPageProps> = (props) => {
  return (
    <div className="space-y-6">
      <ReportsDashboard {...props} />
    </div>
  );
};
