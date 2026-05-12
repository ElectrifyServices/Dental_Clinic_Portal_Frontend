import React, { useState } from 'react';
import { Save, FileText, Stethoscope } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button } from '@/components/ui';
import { BasicInfoSection } from './TreatmentForm/BasicInfoSection';
import { SessionPlannerSection } from './TreatmentForm/SessionPlannerSection';
import { PrescriptionSection } from './TreatmentForm/PrescriptionSection';
import { ImageUploadSection } from './TreatmentForm/ImageUploadSection';
import { treatmentSchema, type TreatmentFormData } from '@/lib/schemas/treatment.schema';

interface TreatmentFormProps {
  onClose: () => void;
  onSave: (treatment: any) => void;
  treatment?: any;
  patients: any[];
  doctors: any[];
  treatments?: any[];
}

export function TreatmentForm({ onClose, onSave, treatment, patients: allPatients, doctors, treatments: allTreatments }: TreatmentFormProps) {
  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      patientName: treatment?.patientName ?? '',
      patientId: treatment?.patientId ?? '',
      procedure: treatment?.procedure ?? '',
      tooth: treatment?.tooth ?? '',
      date: treatment?.date ?? new Date().toISOString().split('T')[0],
      notes: treatment?.notes ?? '',
      cost: treatment?.cost ?? 0,
      status: treatment?.status ?? 'planned',
      nextAppointment: treatment?.nextAppointment ?? '',
      images: treatment?.images ?? [],
      doctorId: treatment?.doctorId ?? '1',
      doctorName: treatment?.doctorName ?? 'Dr. Rajesh Sharma',
      prescriptions: [],
      sessions: [],
    },
  });

  const formData = form.watch();

  const [prescriptions, setPrescriptions] = useState(treatment?.prescriptions || [
    { id: '1', medicine: '', dosage: '', timing: '', frequency: '', duration: '', qty: '' }
  ]);

  const [treatmentSessions, setTreatmentSessions] = useState(
    Array.isArray(treatment?.sessions) ? treatment.sessions : [],
  );

  const procedures = [
    'Regular Checkup', 'Teeth Cleaning & Scaling', 'Dental Filling', 'Root Canal Treatment',
    'Crown Placement', 'Tooth Extraction', 'Dental Implant', 'Orthodontic Treatment',
    'Periodontal Treatment', 'Oral Surgery', 'Cosmetic Dentistry', 'Denture Fitting'
  ];

  const treatmentTemplates = {
    'Root Canal Treatment': {
      sessions: [
        { name: 'Initial Consultation & X-Ray', duration: 30, gap: 0, description: 'Diagnosis and treatment planning', isRequired: true },
        { name: 'Pulp Removal & Cleaning', duration: 60, gap: 1, description: 'Access cavity, pulp removal, canal cleaning', isRequired: true },
        { name: 'Canal Filling & Sealing', duration: 45, gap: 7, description: 'Root canal filling and temporary crown', isRequired: true },
        { name: 'Crown Preparation', duration: 60, gap: 14, description: 'Permanent crown fitting', isRequired: true }
      ],
      totalCost: 8000
    },
    'Regular Checkup': {
      sessions: [{ name: 'Oral Examination', duration: 30, gap: 0, description: 'Complete oral health assessment', isRequired: true }],
      totalCost: 500
    },
    'Teeth Cleaning & Scaling': {
      sessions: [
        { name: 'Initial Assessment', duration: 15, gap: 0, description: 'Oral health evaluation', isRequired: true },
        { name: 'Scaling & Cleaning', duration: 45, gap: 0, description: 'Professional teeth cleaning', isRequired: true },
        { name: 'Fluoride Treatment', duration: 15, gap: 0, description: 'Fluoride application', isRequired: false }
      ],
      totalCost: 1500
    },
    'Dental Filling': {
      sessions: [
        { name: 'Cavity Assessment', duration: 20, gap: 0, description: 'Examine and prepare cavity', isRequired: true },
        { name: 'Filling Procedure', duration: 45, gap: 0, description: 'Remove decay and place filling', isRequired: true }
      ],
      totalCost: 2000
    },
    'Orthodontic Treatment': {
      sessions: [
        { name: 'Initial Consultation', duration: 45, gap: 0, description: 'Assessment and treatment planning', isRequired: true },
        { name: 'Braces Installation', duration: 90, gap: 7, description: 'Bracket placement and wire installation', isRequired: true },
        { name: 'Monthly Adjustment 1', duration: 30, gap: 30, description: 'Wire tightening and progress check', isRequired: true },
        { name: 'Monthly Adjustment 2', duration: 30, gap: 60, description: 'Continued adjustment and monitoring', isRequired: true },
        { name: 'Monthly Adjustment 3', duration: 30, gap: 90, description: 'Progress evaluation and adjustment', isRequired: true }
      ],
      totalCost: 25000
    },
    'Dental Implant': {
      sessions: [
        { name: 'Pre-surgical Consultation', duration: 45, gap: 0, description: 'CT scan and surgical planning', isRequired: true },
        { name: 'Implant Placement Surgery', duration: 120, gap: 7, description: 'Surgical implant placement', isRequired: true },
        { name: 'Healing Check (2 weeks)', duration: 30, gap: 14, description: 'Post-surgical healing assessment', isRequired: true },
        { name: 'Healing Check (6 weeks)', duration: 30, gap: 42, description: 'Osseointegration progress check', isRequired: true },
        { name: 'Crown Placement', duration: 60, gap: 90, description: 'Final crown attachment', isRequired: true }
      ],
      totalCost: 35000
    },
    'Crown Placement': {
      sessions: [
        { name: 'Tooth Preparation', duration: 60, gap: 0, description: 'Prepare tooth and take impressions', isRequired: true },
        { name: 'Temporary Crown Fitting', duration: 30, gap: 0, description: 'Place temporary crown', isRequired: true },
        { name: 'Permanent Crown Placement', duration: 45, gap: 14, description: 'Fit and cement permanent crown', isRequired: true }
      ],
      totalCost: 8000
    },
    'Tooth Extraction': {
      sessions: [
        { name: 'Pre-extraction Assessment', duration: 20, gap: 0, description: 'X-ray and extraction planning', isRequired: true },
        { name: 'Extraction Procedure', duration: 45, gap: 0, description: 'Tooth extraction and suturing', isRequired: true },
        { name: 'Follow-up Check', duration: 15, gap: 7, description: 'Healing assessment and suture removal', isRequired: false }
      ],
      totalCost: 1000
    }
  };

  const teeth = [
    '11 (Upper Right Central)', '12 (Upper Right Lateral)', '13 (Upper Right Canine)',
    '14 (Upper Right 1st Premolar)', '15 (Upper Right 2nd Premolar)', '16 (Upper Right 1st Molar)',
    '17 (Upper Right 2nd Molar)', '18 (Upper Right 3rd Molar)',
    '21 (Upper Left Central)', '22 (Upper Left Lateral)', '23 (Upper Left Canine)',
    '24 (Upper Left 1st Premolar)', '25 (Upper Left 2nd Premolar)', '26 (Upper Left 1st Molar)',
    '27 (Upper Left 2nd Molar)', '28 (Upper Left 3rd Molar)',
    '31 (Lower Left Central)', '32 (Lower Left Lateral)', '33 (Lower Left Canine)',
    '34 (Lower Left 1st Premolar)', '35 (Lower Left 2nd Premolar)', '36 (Lower Left 1st Molar)',
    '37 (Lower Left 2nd Molar)', '38 (Lower Left 3rd Molar)',
    '41 (Lower Right Central)', '42 (Lower Right Lateral)', '43 (Lower Right Canine)',
    '44 (Lower Right 1st Premolar)', '45 (Lower Right 2nd Premolar)', '46 (Lower Right 1st Molar)',
    '47 (Lower Right 2nd Molar)', '48 (Lower Right 3rd Molar)',
    'Full mouth', 'Multiple teeth'
  ];

  const pendingPlans = React.useMemo(() => {
    if (!formData.patientName || !allTreatments || treatment) return [];
    return allTreatments.filter((t: any) => t.patientName === formData.patientName && t.status === 'planned');
  }, [formData.patientName, allTreatments, treatment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    form.setValue(name as keyof TreatmentFormData, value as any, { shouldValidate: true });
    if (name === 'patientName') {
      const patient = allPatients.find(p => (typeof p === 'string' ? p : p.name) === value);
      form.setValue('patientId', typeof patient === 'object' ? patient.id : (form.getValues('patientId') || ''));
    }
    if (name === 'procedure') {
      const template = treatmentTemplates[value as keyof typeof treatmentTemplates];
      if (template) {
        form.setValue('cost', template.totalCost);
        const baseDate = new Date(form.getValues('date') || new Date());
        setTreatmentSessions(template.sessions.map((session, index) => {
          const sessionDate = new Date(baseDate);
          sessionDate.setDate(baseDate.getDate() + session.gap);
          return {
            id: `session-${Date.now()}-${index}`,
            sessionNumber: index + 1,
            name: session.name,
            description: session.description,
            suggestedDate: sessionDate.toISOString().split('T')[0],
            scheduledDate: sessionDate.toISOString().split('T')[0],
            duration: session.duration,
            status: 'planned',
            isFlexible: !session.isRequired,
            isRequired: session.isRequired,
            isOptional: !session.isRequired,
            cost: Math.round(template.totalCost / template.sessions.length),
            isModified: false,
            notes: ''
          };
        }));
      } else {
        setTreatmentSessions([{
          id: `session-${Date.now()}-1`,
          sessionNumber: 1,
          name: value || 'Treatment Session',
          description: 'Single session treatment',
          suggestedDate: form.getValues('date'),
          scheduledDate: form.getValues('date'),
          duration: 45,
          status: 'scheduled',
          isFlexible: true,
          isRequired: true,
          isOptional: false,
          cost: form.getValues('cost') || 0,
          isModified: false,
          notes: ''
        }]);
      }
    }
  };

  const handleLoadPlan = (plan: any) => {
    form.setValue('procedure', plan.procedure);
    form.setValue('tooth', plan.tooth);
    form.setValue('cost', plan.cost);
    form.setValue('notes', plan.notes);
    form.setValue('status', 'in-progress');
    if (plan.patientId) form.setValue('patientId', plan.patientId);
    if (plan.prescriptions) setPrescriptions(plan.prescriptions);
    const template = treatmentTemplates[plan.procedure as keyof typeof treatmentTemplates];
    if (template) {
      const baseDate = new Date(form.getValues('date'));
      setTreatmentSessions(template.sessions.map((session, index) => {
        const sessionDate = new Date(baseDate);
        sessionDate.setDate(baseDate.getDate() + session.gap);
        return {
          id: `session-${Date.now()}-${index}`,
          sessionNumber: index + 1,
          name: session.name,
          description: session.description,
          suggestedDate: sessionDate.toISOString().split('T')[0],
          scheduledDate: sessionDate.toISOString().split('T')[0],
          duration: session.duration,
          status: 'planned',
          isRequired: session.isRequired,
          isOptional: !session.isRequired,
          isFlexible: !session.isRequired,
          cost: Math.round(template.totalCost / template.sessions.length),
          isModified: false,
          notes: ''
        };
      }));
    }
  };

  const updateSession = (id: string, updates: any) => {
    setTreatmentSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const updatePrescription = (id: string, field: string, value: string) => {
    const dosageMappings: Record<string, { timing: string; frequency: string }> = {
      "1-0-0": { timing: "Before Food", frequency: "Once daily" },
      "0-1-0": { timing: "After Food", frequency: "Once daily" },
      "0-0-1": { timing: "After Food", frequency: "Once daily" },
      "1-1-0": { timing: "After Food", frequency: "Twice daily" },
      "1-0-1": { timing: "After Food", frequency: "Twice daily" },
      "0-1-1": { timing: "After Food", frequency: "Twice daily" },
      "1-1-1": { timing: "After Food", frequency: "Thrice daily" },
    };
    setPrescriptions(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        if (field === 'dosage' && dosageMappings[value]) {
          updated.timing = dosageMappings[value].timing;
          updated.frequency = dosageMappings[value].frequency;
        }
        return updated;
      }
      return p;
    }));
  };

  const handleSubmit = (data: TreatmentFormData) => {
    onSave({
      ...data,
      id: treatment?.id || Date.now().toString(),
      prescriptions: prescriptions.filter((p: any) => p.medicine?.trim() !== ''),
      sessions: treatmentSessions,
      cost: parseFloat(String(data.cost)),
    });
  };

  return (
    <Modal
      title={treatment ? 'Edit Treatment Plan' : 'Create Treatment Plan'}
      onClose={onClose}
      size="5xl"
      icon={<Stethoscope className="w-4 h-4" />}
      footer={
        <div className="flex justify-between items-center w-full px-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={form.handleSubmit(handleSubmit)} className="gap-2 shadow-lg shadow-primary/10">
            <Save className="w-4 h-4" /> Save Treatment Plan
          </Button>
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 py-2">
        <BasicInfoSection
          formData={formData}
          handleChange={handleChange}
          allPatients={allPatients}
          doctors={doctors}
          procedures={procedures}
          teeth={teeth}
          pendingPlans={pendingPlans}
          onLoadPlan={handleLoadPlan}
          isEdit={!!treatment}
        />

        <div className="h-px bg-border/50" />

        <SessionPlannerSection
          sessions={treatmentSessions}
          onAddSession={() => setTreatmentSessions([...treatmentSessions, {
            id: `session-${Date.now()}`,
            sessionNumber: treatmentSessions.length + 1,
            name: 'Additional Session',
            description: 'Custom session',
            suggestedDate: formData.date,
            scheduledDate: formData.date,
            duration: 45,
            status: 'planned',
            isFlexible: true,
            isRequired: false,
            isOptional: true,
            cost: 0,
            isModified: false,
            notes: ''
          }])}
          onRemoveSession={(id) => setTreatmentSessions(prev => prev.filter(s => s.id !== id))}
          onUpdateSession={updateSession}
          baseDate={formData.date}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-6">
            <PrescriptionSection
              prescriptions={prescriptions}
              onAddPrescription={() => setPrescriptions([...prescriptions, {
                id: Date.now().toString(),
                medicine: '', dosage: '', timing: '', frequency: '', duration: '', qty: ''
              }])}
              onRemovePrescription={(id) => setPrescriptions(prev => prev.filter(p => p.id !== id))}
              onUpdatePrescription={updatePrescription}
            />
          </div>
          <div className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-2xl border border-border h-full">
              <label className="text-xs font-black text-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Clinical Case Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium resize-none"
                placeholder="Enter detailed treatment observations, history, and special instructions..."
              />
            </div>
          </div>
        </div>

        <ImageUploadSection
          images={formData.images}
          onUpload={(e) => {
            const files = Array.from(e.target.files || []);
            const urls = files.map(f => URL.createObjectURL(f));
            setFormData({ ...formData, images: [...formData.images, ...urls] });
          }}
          onRemove={(index) => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })}
        />
      </form>
    </Modal>
  );
}