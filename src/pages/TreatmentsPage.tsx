import React from 'react';
import { TreatmentList } from '../components/Treatments/TreatmentList';

interface TreatmentsPageProps {
  treatments: any[];
  onAddTreatment: () => void;
  onViewTreatment: (id: string) => void;
  onEditTreatment: (id: string) => void;
  onManageSessions: (id: string) => void;
  onMarkCompleted: (id: string) => void;
}

export const TreatmentsPage: React.FC<TreatmentsPageProps> = (props) => {
  return (
    <div className="space-y-6">
      <TreatmentList {...props} />
    </div>
  );
};
