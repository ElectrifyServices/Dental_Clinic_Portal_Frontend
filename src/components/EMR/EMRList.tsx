import React, { useState } from 'react';
import { Plus, Stethoscope, Pill, Camera, CreditCard, Calendar, Eye, Download, FileText } from 'lucide-react';
import { PageHeader, SearchInput, FilterTabs, DataTable, StatusBadge, Button } from '@/components/ui';

interface EMRRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'consultation' | 'prescription' | 'lab-report' | 'x-ray' | 'treatment-note' | 'billing-record' | 'appointment-visit';
  title: string;
  content: string;
  attachments?: string[];
  doctorId: string;
  doctorName: string;
  timeline?: any[];
}

interface EMRListProps {
  records: EMRRecord[];
  onAddRecord: () => void;
  onViewRecord: (record: EMRRecord) => void;
  onExportRecord: (record: EMRRecord) => void;
}

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; variant: 'blue' | 'green' | 'violet' | 'amber' | 'indigo' | 'gray' }> = {
  consultation: { label: 'Consultation', icon: <Stethoscope className="w-3.5 h-3.5" />, variant: 'blue' },
  prescription: { label: 'Prescription', icon: <Pill className="w-3.5 h-3.5" />, variant: 'green' },
  'lab-report': { label: 'Lab Report', icon: <FileText className="w-3.5 h-3.5" />, variant: 'violet' },
  'x-ray': { label: 'X-Ray', icon: <Camera className="w-3.5 h-3.5" />, variant: 'amber' },
  'treatment-note': { label: 'Treatment Note', icon: <FileText className="w-3.5 h-3.5" />, variant: 'indigo' },
  'billing-record': { label: 'Billing Record', icon: <CreditCard className="w-3.5 h-3.5" />, variant: 'gray' },
  'appointment-visit': { label: 'Visit', icon: <Calendar className="w-3.5 h-3.5" />, variant: 'blue' },
};

const TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'consultation', label: 'Consultation' },
  { key: 'prescription', label: 'Prescription' },
  { key: 'lab-report', label: 'Lab Report' },
  { key: 'x-ray', label: 'X-Ray' },
  { key: 'treatment-note', label: 'Treatment Note' }
];

export function EMRList({ records, onAddRecord, onViewRecord, onExportRecord }: EMRListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.patientName.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (r: EMRRecord) => (
        <div className="font-semibold text-foreground">{r.patientName}</div>
      )
    },
    {
      key: 'title',
      header: 'Title',
      render: (r: EMRRecord) => (
        <div className="max-w-xs">
          <div className="font-medium text-foreground truncate">{r.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{r.content}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (r: EMRRecord) => {
        const tm = TYPE_META[r.type] || TYPE_META.consultation;
        return (
          <StatusBadge variant={tm.variant} className="flex items-center gap-1 w-fit">
            {tm.icon}
            {tm.label}
          </StatusBadge>
        );
      }
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (r: EMRRecord) => <span className="text-muted-foreground">{r.doctorName}</span>
    },
    {
      key: 'date',
      header: 'Date',
      render: (r: EMRRecord) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center' as const,
      render: (r: EMRRecord) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => onViewRecord(r)} title="View">
            <Eye className="w-4 h-4 text-primary" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onExportRecord(r)} title="Export">
            <Download className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Records"
        subtitle={`${records.length} records across all patients`}
        action={
          <Button onClick={onAddRecord} className="gap-2">
            <Plus className="w-4 h-4" /> Add Record
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by patient, title or content…"
          className="flex-1"
        />
        <FilterTabs
          tabs={TYPE_FILTERS}
          active={typeFilter}
          onChange={setTypeFilter}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        emptyIcon={<FileText className="w-12 h-12 text-muted-foreground/40" />}
        emptyTitle="No records found"
        emptySubtitle="Add a new EMR record to get started."
      />
    </div>
  );
}

