import React, { useState } from "react";
import { Plus, Eye, Edit, Trash2, Shield, CheckCircle, Clock, MoreVertical } from "lucide-react";

interface ConsentFormListProps {
  forms: any[];
  search: string;
  onSearchChange: (val: string) => void;
  onAddForm: () => void;
  onViewForm: (id: string) => void;
  onEditForm: (id: string) => void;
  onDeleteForm: (id: string) => void;
  filters: { status: string; procedure: string; doctor: string; date: string };
  onFilterChange: (key: string, value: string) => void;
  doctorsList: { id: string; name: string }[];
}

import {
  PageHeader,
  Button,
  SearchInput,
  ContentCard,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DataTable,
  Pagination,
} from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";

export function ConsentFormList({
  forms,
  search,
  onSearchChange,
  onAddForm,
  onViewForm,
  onEditForm,
  onDeleteForm,
  filters,
  onFilterChange,
  doctorsList,
}: ConsentFormListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(forms.length / itemsPerPage);
  const paginatedForms = forms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    {
      key: "patient",
      header: "Patient",
      render: (form: any) => (
        <>
          <div className="font-bold text-foreground text-sm">
            {form.patientName}
          </div>
          {form.patientId && (
            <div className="text-[10px] text-muted-foreground/60 font-mono tracking-tighter uppercase">
              #{form.patientId.slice(-6)}
            </div>
          )}
        </>
      ),
      className: "px-6 py-4",
    },
    {
      key: "consentType",
      header: "Consent Type",
      render: (form: any) => {
        const treatments = form.treatmentType?.split(", ").filter(Boolean) || [];
        return (
          <div className="flex flex-wrap gap-1.5 max-w-[280px]">
            {treatments.map((t: string) => {
              const cleanName = t.replace(/\s*\(.*\)\s*/g, '');
              return (
                <Badge key={t} className="whitespace-nowrap uppercase font-bold text-[9px] px-2 h-5 tracking-wide bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  {cleanName}
                </Badge>
              );
            })}
          </div>
        );
      },
      className: "px-6 py-4",
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (form: any) => (
        <div className="font-semibold text-muted-foreground text-sm">
          {form.doctorName}
        </div>
      ),
      className: "px-6 py-4",
    },
    {
      key: "created",
      header: "Created",
      render: (form: any) => (
        <div className="text-sm font-medium text-muted-foreground">
          {form.createdDate
            ? new Date(form.createdDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            : "-"}
        </div>
      ),
      className: "px-6 py-4",
    },
    {
      key: "signed",
      header: "Signed",
      render: (form: any) => {
        const statusUpper = form.status?.toUpperCase() || "";
        const isSigned = statusUpper === "SIGNED" || statusUpper === "COMPLETED";
        return (
          <div className={`text-sm font-medium ${isSigned ? 'text-muted-foreground' : 'text-amber-600 font-semibold'}`}>
            {isSigned
              ? form.signedDate
                ? new Date(form.signedDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "Signed"
              : "Pending"}
          </div>
        );
      },
      className: "px-6 py-4",
    },
    {
      key: "status",
      header: "Status",
      render: (form: any) => {
        const statusUpper = form.status?.toUpperCase() || "";
        const isSigned = statusUpper === "SIGNED" || statusUpper === "COMPLETED";
        const isDraft = statusUpper === "DRAFT";
        return isSigned ? (
          <Badge className="gap-1.5 uppercase font-black text-[9px] px-2.5 h-5 shadow-sm shadow-emerald-500/10">
            <CheckCircle className="w-3 h-3" /> Signed
          </Badge>
        ) : isDraft ? (
          <Badge className="gap-1.5 uppercase font-black text-[9px] px-2.5 h-5 shadow-sm shadow-blue-500/10 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
            <Clock className="w-3 h-3" /> Draft
          </Badge>
        ) : (
          <Badge className="gap-1.5 uppercase font-black text-[9px] px-2.5 h-5 shadow-sm shadow-amber-500/10">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
      },
      className: "px-6 py-4",
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (form: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onViewForm(form.id)} className="cursor-pointer gap-2">
              <Eye className="w-4 h-4 text-primary" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditForm(form.id)} className="cursor-pointer gap-2">
              <Edit className="w-4 h-4 text-blue-600" /> Edit Form
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteForm(form.id)} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4" /> Delete Form
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "px-6 py-4",
    },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="Consent Forms"
        subtitle={`${forms.length} authorized consent documents on record`}
        action={
          <Button onClick={onAddForm} className="gap-2">
            <Plus className="w-4 h-4" /> New Consent Form
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by patient or treatment type…"
            value={search}
            onChange={onSearchChange}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Select
            value={filters.status}
            onValueChange={(val) => onFilterChange("status", val)}
          >
            <SelectTrigger className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 h-9 w-[130px] text-left flex items-center justify-between">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.procedure}
            onValueChange={(val) => onFilterChange("procedure", val)}
          >
            <SelectTrigger className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 h-9 w-[240px] text-left flex items-center justify-between">
              <SelectValue placeholder="All Procedures" />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              <SelectItem value="All">All Procedures</SelectItem>
              <SelectItem value="GENERAL_DENTISTRY">General Dentistry</SelectItem>
              <SelectItem value="TOOTH_EXTRACTION_OR_ORAL_SURGERY">Tooth Extraction / Oral Surgery</SelectItem>
              <SelectItem value="ROOT_CANAL_TREATMENT_ENDODONTICS">Root Canal Treatment (Endodontics)</SelectItem>
              <SelectItem value="DENTAL_IMPLANTS">Dental Implants</SelectItem>
              <SelectItem value="ORTHODONTIC_BRACES_OR_CLEAR_ALIGNERS">Orthodontic Braces / Clear Aligners</SelectItem>
              <SelectItem value="SCALING_AND_ROOT_PLANING">Scaling and Root Planing</SelectItem>
              <SelectItem value="CROWN_AND_BRIDGE">Crown and Bridge</SelectItem>
              <SelectItem value="COMPLETE_PARTIAL_DENTURE">Complete / Partial Denture</SelectItem>
              <SelectItem value="PEDIATRIC_DENTAL_TREATMENT">Pediatric Dental Treatment</SelectItem>
              <SelectItem value="TEETH_WHITENING">Teeth Whitening</SelectItem>
              <SelectItem value="COSMETIC_DENTISTRY_OR_VENEERS">Cosmetic Dentistry / Veneers</SelectItem>
              <SelectItem value="SEDATION_OR_ANESTHESIA_CONSENT">Sedation / Anesthesia Consent</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.doctor}
            onValueChange={(val) => onFilterChange("doctor", val)}
          >
            <SelectTrigger className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 h-9 w-[130px] text-left flex items-center justify-between">
              <SelectValue placeholder="All Doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Doctors</SelectItem>
              {doctorsList.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.date}
            onValueChange={(val) => onFilterChange("date", val)}
          >
            <SelectTrigger className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 h-9 w-[130px] text-left flex items-center justify-between">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Time</SelectItem>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="THIS_WEEK">This Week</SelectItem>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="py-20 bg-card rounded-[2.5rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
          <Shield className="w-16 h-16 text-muted-foreground/10 mb-6" />
          <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">
            No consent forms found
          </h3>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Authorized forms will appear here once created.
          </p>
        </div>
      ) : (
        <ContentCard
          bodyClassName="p-0 overflow-hidden"
          className="rounded-3xl border-border/50"
        >
          <DataTable
            columns={columns}
            data={paginatedForms}
            rowKey={(row) => row.id}
            footer={
              totalPages > 1 ? (
                <div className="py-4 px-6 border-t border-border/50 bg-muted/20">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    totalItems={forms.length}
                    perPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              ) : undefined
            }
          />
        </ContentCard>
      )}
    </div>
  );
}
