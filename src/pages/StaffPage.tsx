import React from 'react';
import { DoctorManagement } from '../components/Staff/DoctorManagement';

interface StaffPageProps {
  staffMembers: any[];
  onAddDoctor: () => void;
  onEditDoctor: (id: string) => void;
  onDeleteDoctor: (id: string) => void;
  onUpdateStaff: (staff: any) => void;
  onManageSchedule: (id: string, name: string) => void;
  onPaySalary: (staffId: string, staffName: string) => void;
}

export const StaffPage: React.FC<StaffPageProps> = (props) => {
  return (
    <div className="space-y-6">
      <DoctorManagement {...props} />
    </div>
  );
};
