import { useMemo, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  FlaskConical,
  PackageCheck,
  IndianRupee,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import {
  Button,
  PageHeader,
  DataTable,
  SearchInput,
  StatusBadge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Loading,
} from "@/components/ui";
import { LabWork, LabWorkStatus } from "../../types";

interface LabWorkListProps {
  labWorks: LabWork[];
  isLoading?: boolean;
  onAdd: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, label?: string) => void;
  onUpdateStatus: (id: string, status: LabWorkStatus) => void;
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
}

const STATUS_META: Record<LabWorkStatus, { label: string; variant: "blue" | "amber" | "green" }> = {
  ordered: { label: "Ordered", variant: "blue" },
  received: { label: "Received", variant: "amber" },
  paid: { label: "Paid", variant: "green" },
};

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "ordered", label: "Ordered" },
  { key: "received", label: "Received" },
  { key: "paid", label: "Paid" },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function LabWorkList({
  labWorks = [],
  isLoading,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
  search,
  setSearch,
  status,
  setStatus,
}: LabWorkListProps) {
  const [groupBy, setGroupBy] = useState<"patient" | "lab">("patient");

  const groups = useMemo(() => {
    const map = new Map<string, LabWork[]>();
    labWorks.forEach((lw) => {
      const key = groupBy === "patient" ? (lw.patientName || "Unknown Patient") : (lw.labName || "Unknown Lab");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(lw);
    });
    return Array.from(map.entries())
      .map(([key, items]) => ({
        key,
        items: [...items].sort(
          (a, b) => new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime(),
        ),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [labWorks, groupBy]);

  const columns = useMemo(
    () => [
      {
        key: "primary",
        header: groupBy === "patient" ? "Lab Name" : "Patient",
        render: (lw: LabWork) => (
          <span className="font-bold text-foreground">
            {groupBy === "patient" ? lw.labName : lw.patientName}
          </span>
        ),
      },
      {
        key: "workType",
        header: "Work / Tooth No.",
        render: (lw: LabWork) => <span className="text-foreground">{lw.workType}</span>,
      },
      {
        key: "units",
        header: "Units",
        align: "center" as const,
        render: (lw: LabWork) => <span className="text-foreground">{lw.unitsCount}</span>,
      },
      {
        key: "warranty",
        header: "Warranty",
        render: (lw: LabWork) =>
          lw.hasWarranty ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Warranty
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-semibold">
              <ShieldOff className="w-3.5 h-3.5" /> No Warranty
            </span>
          ),
      },
      {
        key: "createdDate",
        header: "Created",
        render: (lw: LabWork) => <span className="text-muted-foreground">{formatDate(lw.createdDate)}</span>,
      },
      {
        key: "dueDate",
        header: "Due Date",
        render: (lw: LabWork) => <span className="text-muted-foreground">{formatDate(lw.dueDate)}</span>,
      },
      {
        key: "price",
        header: "Price",
        align: "right" as const,
        render: (lw: LabWork) => (
          <span className="font-bold text-foreground">₹{Number(lw.price || 0).toLocaleString()}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (lw: LabWork) => {
          const meta = STATUS_META[lw.status] || STATUS_META.ordered;
          return (
            <StatusBadge variant={meta.variant} className="text-[10px] uppercase font-bold">
              {meta.label}
            </StatusBadge>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        align: "center" as const,
        render: (lw: LabWork) => (
          <div className="flex items-center justify-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onView(lw.id);
              }}
              title="View"
              className="w-7 h-7 text-primary hover:bg-primary/10 rounded-lg"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(lw.id);
              }}
              title="Edit"
              className="w-7 h-7 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            {lw.status === "ordered" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(lw.id, "received");
                }}
                title="Mark as Received"
                className="w-7 h-7 text-amber-600 hover:bg-amber-50 rounded-lg"
              >
                <PackageCheck className="w-3.5 h-3.5" />
              </Button>
            )}
            {lw.status === "received" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(lw.id, "paid");
                }}
                title="Mark as Paid"
                className="w-7 h-7 text-emerald-600 hover:bg-emerald-50 rounded-lg"
              >
                <IndianRupee className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lw.id, lw.workType);
              }}
              title="Delete"
              className="w-7 h-7 text-destructive hover:bg-destructive/10 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [groupBy, onView, onEdit, onDelete, onUpdateStatus],
  );

  return (
    <div className="space-y-3">
      <PageHeader
        title="Lab Work"
        subtitle={`${labWorks.length} total entries recorded`}
        action={
          <Button onClick={onAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add Lab Work
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-card p-3 rounded-2xl border border-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by patient name or lab name…"
          className="flex-1 min-w-0"
        />
        <div className="flex gap-2 shrink-0">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[130px] text-xs font-semibold rounded-xl border border-border bg-muted">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.key} value={f.key} className="text-xs font-medium">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "patient" | "lab")}>
            <SelectTrigger className="h-9 w-[170px] text-xs font-semibold rounded-xl border border-border bg-muted">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patient" className="text-xs font-medium">Group by Patient</SelectItem>
              <SelectItem value="lab" className="text-xs font-medium">Group by Lab</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Loading type="spinner" text="Loading lab work..." className="py-20" />
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
          <FlaskConical className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="font-bold text-foreground text-sm">No lab work found</p>
          <p className="text-muted-foreground text-xs mt-1">Add your first lab work entry to get started.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.key} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {groupBy === "patient" ? (
                    <span>{group.key}</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-primary" /> {group.key}
                    </span>
                  )}
                </h3>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <DataTable
                columns={columns}
                data={group.items}
                rowKey={(lw) => lw.id}
                onRowClick={(lw) => onView(lw.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
