import React from 'react';
import { Users, UserCheck, UserPlus, CreditCard } from 'lucide-react';

interface Patient {
  id: string;
  status: string;
  outstandingBalance: number;
}

interface PatientStatsProps {
  patients: Patient[];
}

import { MetricCard } from '@/components/ui';
import { usePatientTotalQuery } from '@/hooks/patients/usePatientTotalQuery';
import { usePatientActiveQuery } from '@/hooks/patients/usePatientActiveQuery';
import { usePatientNewQuery } from '@/hooks/patients/usePatientNewQuery';
import { usePatientOutstandingQuery } from '@/hooks/patients/usePatientOutstandingQuery';

export const PatientStats: React.FC<PatientStatsProps> = ({ patients }) => {
  const { data: totalData } = usePatientTotalQuery();
  const { data: activeData } = usePatientActiveQuery();
  const { data: newData } = usePatientNewQuery();
  const { data: outstandingData } = usePatientOutstandingQuery();

  const parseData = (d: any) => {
    if (!d) return undefined;
    return d.count ?? d.total ?? d.amount ?? d.data?.count ?? d.data?.total ?? d.data?.amount;
  };

  const totalPatients = parseData(totalData) ?? patients.length;
  const activePatients = parseData(activeData) ?? patients.filter(p => p.status === 'active').length;
  const newPatients = parseData(newData) ?? patients.filter(p => p.status === 'new').length;
  const totalOutstanding = parseData(outstandingData) ?? patients.reduce((sum, p) => sum + (p.outstandingBalance || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard 
        label="Total Patients"
        value={totalPatients}
        icon={<Users className="w-6 h-6" />}
        variant="gray"
      />
      <MetricCard 
        label="Active"
        value={activePatients}
        icon={<UserCheck className="w-6 h-6" />}
        variant="emerald"
      />
      <MetricCard 
        label="New Registered"
        value={newPatients}
        icon={<UserPlus className="w-6 h-6" />}
        variant="primary"
      />
      <MetricCard 
        label="Outstanding"
        value={`₹${totalOutstanding.toLocaleString()}`}
        icon={<CreditCard className="w-6 h-6" />}
        variant="amber"
      />
    </div>
  );
};
