import React from 'react';
import { ConsentFormList } from '../components/Consent/ConsentFormList';
import { ConsentForm } from '../types';

interface ConsentPageProps {
  forms: ConsentForm[];
  onAddForm: () => void;
  onViewForm: (id: string) => void;
  onDeleteForm: (id: string) => void;
}

export function ConsentPage({ forms, onAddForm, onViewForm, onDeleteForm }: ConsentPageProps) {
  return (
    <div className="container mx-auto">
      <ConsentFormList 
        forms={forms}
        onAddForm={onAddForm}
        onViewForm={onViewForm}
        onDeleteForm={onDeleteForm}
      />
    </div>
  );
}
