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

export const PatientStats: React.FC<PatientStatsProps> = ({ patients }) => {
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const newPatients = patients.filter(p => p.status === 'new').length;
  const totalOutstanding = patients.reduce((sum, p) => sum + (p.outstandingBalance || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Total</p>
            <h4 className="text-2xl font-bold text-foreground">{totalPatients}</h4>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Active</p>
            <h4 className="text-2xl font-bold text-emerald-600">{activePatients}</h4>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">New</p>
            <h4 className="text-2xl font-bold text-primary">{newPatients}</h4>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Outstanding</p>
            <h4 className="text-2xl font-bold text-orange-600">₹{totalOutstanding.toLocaleString()}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};
