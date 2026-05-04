import React, { useState } from 'react';
import { Save, FileText, Camera, Upload } from 'lucide-react';
import { Modal, FormField, Input, Button } from '@/components/ui';

interface EMRFormProps {
  onClose: () => void;
  onSave: (record: any) => void;
  record?: any;
  patients: any[];
}

export function EMRForm({ onClose, onSave, record, patients: allPatients }: EMRFormProps) {
  const [formData, setFormData] = useState({
    patientName: record?.patientName || '',
    type: record?.type || 'consultation',
    title: record?.title || '',
    content: record?.content || '',
    date: record?.date || new Date().toISOString().split('T')[0],
    attachments: record?.attachments || []
  });

  const recordTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'lab-report', label: 'Lab Report' },
    { value: 'x-ray', label: 'X-Ray' },
    { value: 'treatment-note', label: 'Treatment Note' }
  ];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fileUrls = files.map(file => URL.createObjectURL(file));
    setFormData({ ...formData, attachments: [...formData.attachments, ...fileUrls] });
  };

  return (
    <Modal
      title={record ? 'Edit EMR Record' : 'Add EMR Record'}
      onClose={onClose}
      size="2xl"
      icon={<FileText className="w-4 h-4" />}
      footer={
        <div className="flex justify-end space-x-3 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            {record ? 'Update Record' : 'Save Record'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Patient Name" required>
            <select
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all outline-none"
            >
              <option value="">Select Patient</option>
              {allPatients.map((patient, i) => {
                const patientName = typeof patient === 'string' ? patient : patient.name;
                const patientId = typeof patient === 'object' ? patient.id : patientName;
                return (
                  <option key={`${patientId}-${i}`} value={patientName}>
                    {patientName}
                  </option>
                );
              })}
            </select>
          </FormField>

          <FormField label="Record Type" required>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all outline-none"
            >
              {recordTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Title" required>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="rounded-xl"
              placeholder="Enter record title"
            />
          </FormField>

          <FormField label="Date" required>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="rounded-xl"
            />
          </FormField>
        </div>

        <FormField label="Content" required>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all outline-none resize-none"
            placeholder="Enter detailed record content..."
          />
        </FormField>

        <div>
          <label className="form-label">Attachments</label>
          <div className="border-2 border-dashed border-input rounded-2xl p-8 text-center bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              id="file-upload"
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Click or drag to upload files</p>
              <p className="text-xs text-muted-foreground mt-1">Images, reports, or documents (Max 10MB)</p>
            </div>
          </div>
          
          {formData.attachments.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {formData.attachments.map((url: string, idx: number) => (
                <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden border border-border">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}