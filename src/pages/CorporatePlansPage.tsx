import React from 'react';
import { CorporatePlanManagement } from '../components/CorporatePlans/CorporatePlanManagement';
import { CorporatePlan } from '../types';

interface Props {
  plans: CorporatePlan[];
  onSave: (plan: CorporatePlan) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const CorporatePlansPage: React.FC<Props> = ({ plans, onSave, onDelete, onToggle }) => (
  <CorporatePlanManagement plans={plans} onSave={onSave} onDelete={onDelete} onToggle={onToggle} />
);
