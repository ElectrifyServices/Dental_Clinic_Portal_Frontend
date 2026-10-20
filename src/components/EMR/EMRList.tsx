import type { ApiAny } from "../../types/api";
import React, { useState } from 'react';
import { Plus, Stethoscope, Pill, Camera, CreditCard, Calendar, Eye, Download, FileText, Filter, X } from 'lucide-react';
import { PageHeader, SearchInput, DataTable, Button, Pagination, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, FilterContainer } from '@/components/ui';
import { cn } from '@/lib/utils';

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
  timeline?: ApiAny[];
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

const _TYPE_META: Record<string, { label: string; icon: React.ReactNode; variant: 'blue' | 'green' | 'violet' | 'amber' | 'indigo' | 'gray' }> = {
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

  const itemsPerPage = limit ?? 10;
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const currentPage = page !== undefined ? page : localCurrentPage;
  const setCurrentPage = onPageChange || setLocalCurrentPage;

  const displayTotalItems = totalItems !== undefined ? totalItems : records.length;
  const displayTotalPages = totalPages !== undefined ? totalPages : Math.ceil(records.length / itemsPerPage);
  const totalRecordsCount = displayTotalItems;

  const paginatedRecords = (page !== undefined && limit !== undefined)
    ? records
    : records.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div>
        <PageHeader
          title="Medical Records"
          subtitle={`${totalRecordsCount} records across all patients`}
          action={
            <Button onClick={onAddRecord} className="gap-2">
              <Plus className="w-4 h-4" /> Add Record
            </Button>
          }
        />
      </div>

      <FilterContainer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 bg-card p-3 sm:p-3.5 rounded-2xl border border-border shadow-xs">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search by patient, title or content…"
            className="flex-1 min-w-0"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterOpen((v) => !v)}
            className={cn("gap-2 shrink-0", typeFilter !== "all" && "border-primary bg-primary/10 text-primary hover:bg-primary/15")}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {typeFilter !== "all" && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px]">1</span>
            )}
          </Button>

          {typeFilter !== "all" && (
            <Button variant="ghost" onClick={() => onTypeFilterChange("all")} className="gap-1 text-muted-foreground shrink-0">
              <X className="w-3 h-3" /> <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        {isFilterOpen && (
          <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Type</Label>
                <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                  <SelectTrigger className="w-full h-10 bg-muted/50 border-border rounded-xl font-medium text-xs">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_FILTERS.map((f) => (
                      <SelectItem key={f.key} value={f.key} className="font-medium text-xs">
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </FilterContainer>

      <DataTable
        compact
        columns={columns}
        data={paginatedRecords}
        rowKey={(r) => r.id}
        emptyIcon={<FileText className="w-10 h-10 text-muted-foreground/40" />}
        emptyTitle="No records found"
        emptySubtitle="Add a new EMR record to get started."
        footer={
          (displayTotalPages > 1 || onLimitChange !== undefined) ? (
            <div className="py-3 px-6 border-t border-border/50 bg-muted/20">
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

