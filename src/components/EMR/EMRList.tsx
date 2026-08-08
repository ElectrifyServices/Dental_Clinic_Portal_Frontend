import React, { useState } from 'react';
import { Plus, Stethoscope, Pill, Camera, CreditCard, Calendar, Eye, Download, FileText } from 'lucide-react';
import { PageHeader, SearchInput, DataTable, StatusBadge, Button, Pagination, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

interface EMRRecord {
  id: string;
  patientId: string;
  patientName: string;
  latestRecordTitle?: string;
  totalRecords?: number;
  lastDoctorName?: string;
  lastVisitDate?: string;
  date: string;
  type: string;
  title: string;
  content: string;
  attachments?: string[];
  doctorId?: string;
  doctorName: string;
  timeline?: any[];
}

interface EMRListProps {
  records: EMRRecord[];
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  onAddRecord: () => void;
  onViewRecord: (record: EMRRecord) => void;
  onExportRecord: (record: EMRRecord) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  totalPages?: number;
  totalItems?: number;
}

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; variant: 'blue' | 'green' | 'violet' | 'amber' | 'indigo' | 'gray' }> = {
  consultation: { label: 'Consultation', icon: <Stethoscope className="w-3.5 h-3.5" />, variant: 'blue' },
  prescription: { label: 'Prescription', icon: <Pill className="w-3.5 h-3.5" />, variant: 'green' },
  'treatment-plan': { label: 'Treatment Plan', icon: <FileText className="w-3.5 h-3.5" />, variant: 'violet' },
  'treatment-note': { label: 'Treatment Note', icon: <FileText className="w-3.5 h-3.5" />, variant: 'indigo' },
  'clinical-observation': { label: 'Clinical Obs.', icon: <FileText className="w-3.5 h-3.5" />, variant: 'blue' },
  'dental-chart-record': { label: 'Dental Chart', icon: <FileText className="w-3.5 h-3.5" />, variant: 'amber' },
  'x-ray': { label: 'X-Ray', icon: <Camera className="w-3.5 h-3.5" />, variant: 'amber' },
  'cbct-scan': { label: 'CBCT Scan', icon: <Camera className="w-3.5 h-3.5" />, variant: 'amber' },
  'intraoral-photo': { label: 'Intraoral Photo', icon: <Camera className="w-3.5 h-3.5" />, variant: 'amber' },
  'lab-report': { label: 'Lab Report', icon: <FileText className="w-3.5 h-3.5" />, variant: 'violet' },
  'procedure-record': { label: 'Procedure', icon: <FileText className="w-3.5 h-3.5" />, variant: 'indigo' },
  'surgery-record': { label: 'Surgery', icon: <FileText className="w-3.5 h-3.5" />, variant: 'indigo' },
  'implant-record': { label: 'Implant', icon: <FileText className="w-3.5 h-3.5" />, variant: 'indigo' },
  'follow-up-note': { label: 'Follow-up', icon: <FileText className="w-3.5 h-3.5" />, variant: 'blue' },
  'medical-history-update': { label: 'Medical History', icon: <FileText className="w-3.5 h-3.5" />, variant: 'violet' },
  'billing-record': { label: 'Billing Record', icon: <CreditCard className="w-3.5 h-3.5" />, variant: 'gray' },
  'insurance-document': { label: 'Insurance Doc', icon: <CreditCard className="w-3.5 h-3.5" />, variant: 'gray' },
  'appointment-visit': { label: 'Visit', icon: <Calendar className="w-3.5 h-3.5" />, variant: 'blue' },
  'referral-letter': { label: 'Referral Letter', icon: <FileText className="w-3.5 h-3.5" />, variant: 'violet' },
  'discharge-summary': { label: 'Discharge Sum.', icon: <FileText className="w-3.5 h-3.5" />, variant: 'gray' },
  'other-document': { label: 'Other Doc', icon: <FileText className="w-3.5 h-3.5" />, variant: 'gray' },
};

const TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'CONSULTATION', label: 'Consultation' },
  { key: 'PRESCRIPTION', label: 'Prescription' },
  { key: 'LAB_REPORT', label: 'Lab Report' },
  { key: 'X_RAY', label: 'X-Ray' },
  { key: 'TREATMENT_NOTE', label: 'Treatment Note' },
  { key: 'BILLING_RECORD', label: 'Billing Record' },
  { key: 'APPOINTMENT_VISIT', label: 'Appointment Visit' }
];

export function EMRList({
  records,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onAddRecord,
  onViewRecord,
  onExportRecord,
  page,
  onPageChange,
  limit,
  onLimitChange,
  totalPages,
  totalItems,
}: EMRListProps) {
  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (r: EMRRecord) => (
        <div className="font-semibold text-foreground">{r.patientName || '-'}</div>
      )
    },
    {
      key: 'latestRecord',
      header: 'Latest Record',
      render: (r: EMRRecord) => (
        <span className="text-muted-foreground font-medium">{r.latestRecordTitle || '-'}</span>
      )
    },
    {
      key: 'totalRecords',
      header: 'Total Records',
      render: (r: EMRRecord) => (
        <span className="text-muted-foreground font-medium">{r.totalRecords ?? '-'}</span>
      )
    },
    // {
    //   key: 'lastDoctor',
    //   header: 'Last Doctor',
    //   render: (r: EMRRecord) => (
    //     <span className="text-muted-foreground font-medium">{r.lastDoctorName || '-'}</span>
    //   )
    // },
    {
      key: 'lastVisit',
      header: 'Last Visit',
      render: (r: EMRRecord) => (
        <span className="text-muted-foreground whitespace-nowrap font-medium">
          {r.lastVisitDate || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center' as const,
      render: (r: EMRRecord) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => onViewRecord(r)} title="View Record">
            <Eye className="w-4 h-4 text-primary" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onExportRecord(r)} title="Download Medical History PDF">
            <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </Button>
        </div>
      )
    }
  ];

  const totalRecordsCount = records.reduce((sum, r) => sum + (r.totalRecords || 1), 0);

  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const itemsPerPage = limit ?? 10;
  
  const currentPage = page !== undefined ? page : localCurrentPage;
  const setCurrentPage = onPageChange || setLocalCurrentPage;

  const displayTotalPages = totalPages !== undefined ? totalPages : Math.ceil(records.length / itemsPerPage);
  const displayTotalItems = totalItems !== undefined ? totalItems : records.length;

  const paginatedRecords = (page !== undefined && limit !== undefined)
    ? records
    : records.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-3">
      <PageHeader
        title="Medical Records"
        subtitle={`${totalRecordsCount} records across all patients`}
        action={
          <Button onClick={onAddRecord} className="gap-2">
            <Plus className="w-4 h-4" /> Add Record
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by patient, title or content…"
          className="w-full md:flex-1"
        />
        <div className="w-full md:w-[240px] shrink-0">
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="w-full h-11 bg-card border-border rounded-xl font-medium">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((f) => (
                <SelectItem key={f.key} value={f.key} className="font-medium">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedRecords}
        rowKey={(r) => r.id}
        emptyIcon={<FileText className="w-12 h-12 text-muted-foreground/40" />}
        emptyTitle="No records found"
        emptySubtitle="Add a new EMR record to get started."
        footer={
          (displayTotalPages > 1 || onLimitChange !== undefined) ? (
            <div className="py-4 px-6 border-t border-border/50 bg-muted/20">
              <Pagination
                page={currentPage}
                totalPages={displayTotalPages}
                totalItems={displayTotalItems}
                perPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onPerPageChange={onLimitChange}
              />
            </div>
          ) : undefined
        }
      />
    </div>
  );
}

