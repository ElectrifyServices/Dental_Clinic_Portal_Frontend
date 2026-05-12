import React, { useMemo, useState } from 'react';
import { Save, FileText, Camera, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useFormTitle, useSubmitLabel } from '../../hooks/useFormConfig';
import { emrSchema, type EmrFormData } from '@/lib/schemas/emr.schema';
import styles from './emr.module.css';

interface EMRFormProps {
  onClose: () => void;
  onSave: (record: any) => void;
  record?: any;
  patients: any[];
}

const RECORD_TYPE_OPTIONS = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'lab-report', label: 'Lab Report' },
  { value: 'x-ray', label: 'X-Ray' },
  { value: 'treatment-note', label: 'Treatment Note' },
  { value: 'billing-record', label: 'Billing Record' },
  { value: 'appointment-visit', label: 'Appointment Visit' },
] as const;

export function EMRForm({ onClose, onSave, record, patients: allPatients }: EMRFormProps) {
  const formTitle   = useFormTitle('emr', record ? 'edit' : 'create');
  const submitLabel = useSubmitLabel('emr', record ? 'edit' : 'create');
  const [attachments, setAttachments] = useState<string[]>(record?.attachments ?? []);

  const patientNames = useMemo(
    () => allPatients.map(p => (typeof p === 'string' ? p : p.name)),
    [allPatients],
  );

  const form = useForm<EmrFormData>({
    resolver: zodResolver(emrSchema),
    defaultValues: {
      patientName: record?.patientName ?? '',
      type: record?.type ?? 'consultation',
      title: record?.title ?? '',
      content: record?.content ?? '',
      date: record?.date ?? new Date().toISOString().split('T')[0],
      attachments: record?.attachments ?? [],
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const urls = Array.from(e.target.files ?? []).map(f => URL.createObjectURL(f));
    setAttachments(prev => [...prev, ...urls]);
  };

  const onSubmit = (data: EmrFormData) => {
    onSave({
      ...data,
      attachments,
      id: record?.id || Date.now().toString(),
      patientId: Date.now().toString(),
      doctorId: '1',
      doctorName: 'Dr. Sharma',
    });
  };

  const selectCls =
    'form-input w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all';

  return (
    <Modal
      title={formTitle}
      onClose={onClose}
      size="2xl"
      icon={<FileText className="w-4 h-4" />}
      footer={
        <div className="flex justify-end space-x-3 w-full">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
            <Save className="w-4 h-4" />
            {submitLabel}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          <div className="grid grid-cols-2 gap-4">
            {/* Patient */}
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <select {...field} className={selectCls}>
                      <option value="">Select patient...</option>
                      {patientNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Record type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Type <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <select {...field} className={selectCls}>
                      {RECORD_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} placeholder="Record title" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} type="date" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Content <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} placeholder="Enter record details, notes, or observations..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── Attachment uploader ── */}
          <div>
            <p className={styles.fieldLabel}>Attachments</p>
            <div className="border-2 border-dashed border-input rounded-2xl p-8 text-center bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Click or drag to upload files</p>
                <p className="text-xs text-muted-foreground mt-1">Images, reports, or documents (Max 10MB)</p>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className={styles.attachmentGrid}>
                {attachments.map((url: string, idx: number) => (
                  <div key={idx} className="relative aspect-square bg-muted rounded-xl overflow-hidden border border-border flex items-center justify-center">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </form>
      </Form>
    </Modal>
  );
}

