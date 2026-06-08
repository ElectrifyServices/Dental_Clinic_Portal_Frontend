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
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
          >
            <option value="All">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_SIGNATURE">Pending Signature</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={filters.procedure}
            onChange={(e) => onFilterChange("procedure", e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
          >
            <option value="All">All Procedures</option>

            <option value="GENERAL_DENTISTRY">
              General Dentistry
            </option>

            <option value="TOOTH_EXTRACTION_OR_ORAL_SURGERY">
              Tooth Extraction / Oral Surgery
            </option>

            <option value="ROOT_CANAL_TREATMENT_ENDODONTICS">
              Root Canal Treatment (Endodontics)
            </option>

            <option value="DENTAL_IMPLANTS">
              Dental Implants
            </option>

            <option value="ORTHODONTIC_BRACES_OR_CLEAR_ALIGNERS">
              Orthodontic Braces / Clear Aligners
            </option>

            <option value="SCALING_AND_ROOT_PLANING">
              Scaling and Root Planing
            </option>

            <option value="CROWN_AND_BRIDGE">
              Crown and Bridge
            </option>

            <option value="COMPLETE_PARTIAL_DENTURE">
              Complete / Partial Denture
            </option>

            <option value="PEDIATRIC_DENTAL_TREATMENT">
              Pediatric Dental Treatment
            </option>

            <option value="TEETH_WHITENING">
              Teeth Whitening
            </option>

            <option value="COSMETIC_DENTISTRY_OR_VENEERS">
              Cosmetic Dentistry / Veneers
            </option>

            <option value="SEDATION_OR_ANESTHESIA_CONSENT">
              Sedation / Anesthesia Consent
            </option>
          </select>

          <select
            value={filters.doctor}
            onChange={(e) => onFilterChange("doctor", e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
          >
            <option value="All">All Doctors</option>
            {doctorsList.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>

          <select
            value={filters.date}
            onChange={(e) => onFilterChange("date", e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
          >
            <option value="All">All Time</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
          </select>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Consent Type
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Created
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Signed
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {forms.map((form) => (
                  <tr
                    key={form.id}
                    className="hover:bg-muted/50 transition-colors group"
                  >
                    {(() => {
                      const statusUpper = form.status?.toUpperCase() || "";
                      const isSigned = statusUpper === "SIGNED" || statusUpper === "COMPLETED";
                      const isDraft = statusUpper === "DRAFT";

                      return (
                        <>
                          <td className="px-6 py-4">
                            <div className="font-bold text-foreground text-sm">
                              {form.patientName}
                            </div>
                            {form.patientId && (
                              <div className="text-[10px] text-muted-foreground/60 font-mono tracking-tighter uppercase">
                                #{form.patientId.slice(-6)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-foreground text-sm uppercase tracking-tight">
                              {form.treatmentType}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-muted-foreground text-sm">
                              {form.doctorName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-muted-foreground">
                              {form.createdDate
                                ? new Date(form.createdDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm font-medium ${isSigned ? 'text-muted-foreground' : 'text-amber-600 font-semibold'}`}>
                              {isSigned && form.signedDate
                                ? new Date(form.signedDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "Pending"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isSigned ? (
                              <Badge
                                className="gap-1.5 uppercase font-black text-[9px] px-2.5 h-5 shadow-sm shadow-emerald-500/10"
                              >
                                <CheckCircle className="w-3 h-3" /> Signed
                              </Badge>
                            ) : isDraft ? (
                              <Badge
                                className="gap-1.5 uppercase font-black text-[9px] px-2.5 h-5 shadow-sm shadow-blue-500/10 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                              >
                                <Clock className="w-3 h-3" /> Draft
                              </Badge>
                            ) : (
                              <Badge
                                className="gap-1.5 uppercase font-black text-[9px] px-2.5 h-5 shadow-sm shadow-amber-500/10"
                              >
                                <Clock className="w-3 h-3" /> Pending
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
                                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </button>
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
                          </td>
                        </>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      )}
    </div>
  );
}
