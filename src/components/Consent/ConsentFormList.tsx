import { useState } from "react";
import { Plus, Eye, Trash2, Shield, CheckCircle, Clock } from "lucide-react";

interface ConsentFormListProps {
  forms: any[];
  onAddForm: () => void;
  onViewForm: (id: string) => void;
  onDeleteForm: (id: string) => void;
}

import {
  PageHeader,
  Button,
  SearchInput,
  ContentCard,
  Badge,
} from "@/components/ui";

export function ConsentFormList({
  forms,
  onAddForm,
  onViewForm,
  onDeleteForm,
}: ConsentFormListProps) {
  const [search, setSearch] = useState("");

  const filtered = forms.filter(
    (f) =>
      f.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      f.treatmentType?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent Forms"
        subtitle={`${forms.length} authorized consent documents on record`}
        action={
          <Button onClick={onAddForm} className="gap-2">
            <Plus className="w-4 h-4" /> New Consent Form
          </Button>
        }
      />

      <SearchInput
        placeholder="Search by patient or treatment type…"
        value={search}
        onChange={setSearch}
      />

      {filtered.length === 0 ? (
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
                    Treatment Type
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Date Signed
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
                {filtered.map((form) => (
                  <tr
                    key={form.id}
                    className="hover:bg-muted/50 transition-colors group"
                  >
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
                      <div className="text-sm font-medium text-muted-foreground">
                        {form.date
                          ? new Date(form.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Pending"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {form.signature ? (
                        <Badge
                          // variant="green"
                          className="gap-1.5 uppercase font-black text-[9px] px-2.5 h-5 shadow-sm shadow-emerald-500/10"
                        >
                          <CheckCircle className="w-3 h-3" /> Signed
                        </Badge>
                      ) : (
                        <Badge
                          // variant="amber"
                          className="gap-1.5 uppercase font-black text-[9px] px-2.5 h-5 shadow-sm shadow-amber-500/10"
                        >
                          <Clock className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => onViewForm(form.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteForm(form.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
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
