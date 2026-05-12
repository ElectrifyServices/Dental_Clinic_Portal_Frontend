import React, { useState, useMemo } from 'react';
import { Save, FileText, Camera, Upload } from 'lucide-react';
import { Modal, Button, SectionRenderer } from '@/components/ui';
import { useFormConfig, useFormTitle, useSubmitLabel } from '../../hooks/useFormConfig';
import type { SelectOption } from '../../config/forms/schema';
import styles from './emr.module.css';

interface EMRFormProps {
  onClose: () => void;
  onSave: (record: any) => void;
  record?: any;
  patients: any[];
}

export function EMRForm({ onClose, onSave, record, patients: allPatients }: EMRFormProps) {
  const cfg        = useFormConfig('emr');
  const formTitle  = useFormTitle('emr', record ? 'edit' : 'create');
  const submitLabel = useSubmitLabel('emr', record ? 'edit' : 'create');

  // Dynamic patient options — derived from the patients prop at runtime
  const patientOptions = useMemo<SelectOption[]>(
    () => allPatients.map(p => {
      const name = typeof p === 'string' ? p : p.name;
      return { value: name, label: name };
    }),
    [allPatients]
  );

  const [formData, setFormData] = useState({
    patientName: record?.patientName || '',
    type: record?.type || 'consultation',
    title: record?.title || '',
    content: record?.content || '',
    date: record?.date || new Date().toISOString().split('T')[0],
    attachments: record?.attachments || []
  });

  // Unified change handler for SectionRenderer
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fileUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...fileUrls] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: record?.id || Date.now().toString(),
      patientId: Date.now().toString(),
      doctorId: '1',
      doctorName: 'Dr. Sharma'
    });
  };

  // Sections from JSON config
  const recordInfoSection    = cfg.sections?.find(s => s.id === 'recordInfo');
  const attachmentsSection   = cfg.sections?.find(s => s.id === 'attachments');

  return (
    <Modal
      title={formTitle}
      onClose={onClose}
      size="2xl"
      icon={<FileText className="w-4 h-4" />}
      footer={
        <div className="flex justify-end space-x-3 w-full">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── All record info fields from JSON config ── */}
        {recordInfoSection && (
          <SectionRenderer
            section={recordInfoSection}
            values={formData}
            onChange={handleChange}
            dynamicOptions={{ patientName: patientOptions }}
            cols={2}
          />
        )}

        {/* ── Attachment uploader (custom UI, driven by JSON hint text) ── */}
        <div>
          <p className={styles.fieldLabel}>
            {attachmentsSection?.fields[0]?.label ?? 'Attachments'}
          </p>
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
              <p className="text-xs text-muted-foreground mt-1">
                {attachmentsSection?.fields[0]?.hint ?? 'Images, reports, or documents (Max 10MB)'}
              </p>
            </div>
          </div>
          {formData.attachments.length > 0 && (
            <div className={styles.attachmentGrid}>
              {formData.attachments.map((url: string, idx: number) => (
                <div key={idx} className="relative aspect-square bg-muted rounded-xl overflow-hidden border border-border flex items-center justify-center">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
