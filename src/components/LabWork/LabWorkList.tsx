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
  Paperclip,
  StickyNote,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  MoreVertical,
  XCircle,
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
  groupBy: "patient" | "lab";
  setGroupBy: (val: "patient" | "lab") => void;
}

const STATUS_META: Record<LabWorkStatus, { label: string; variant: "blue" | "amber" | "green" | "red" }> = {
  ordered: { label: "Ordered", variant: "blue" },
  received: { label: "Received", variant: "amber" },
  paid: { label: "Paid", variant: "green" },
  cancelled: { label: "Cancelled", variant: "red" },
};

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "ordered", label: "Ordered" },
  { key: "received", label: "Received" },
  { key: "paid", label: "Paid" },
  { key: "cancelled", label: "Cancelled" },
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
  groupBy,
  setGroupBy,
}: LabWorkListProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

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
        totalValue: items.reduce((sum, lw) => sum + Number(lw.price || 0), 0),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [labWorks, groupBy]);

  const toggleGroup = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allExpanded = groups.length > 0 && groups.every((g) => expandedKeys.has(g.key));
  const toggleAll = () => {
    setExpandedKeys(allExpanded ? new Set() : new Set(groups.map((g) => g.key)));
  };

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
        key: "treatment",
        header: "Treatment",
        render: (lw: LabWork) => (
          <span className="text-foreground">{lw.treatmentName || "—"}</span>
        ),
      },
      {
        key: "workType",
        header: "Work / Tooth No.",
        render: (lw: LabWork) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground">{lw.workType}</span>
            {((lw.attachments && lw.attachments.length > 0) || lw.notes) && (
              <div className="flex items-center gap-2">
                {lw.attachments && lw.attachments.length > 0 && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                    title={`${lw.attachments.length} attachment(s)`}
                  >
                    <Paperclip className="w-3 h-3" /> {lw.attachments.length}
                  </span>
                )}
                {lw.notes && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground" title={lw.notes}>
                    <StickyNote className="w-3 h-3" />
                  </span>
                )}
              </div>
            )}
          </div>
        ),
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
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {lw.warrantyYears ? `${lw.warrantyYears} yr${lw.warrantyYears > 1 ? "s" : ""}` : "Warranty"}
              </span>
              {lw.warrantyEndDate && (
                <span className="text-[10px] text-muted-foreground">Till {formatDate(lw.warrantyEndDate)}</span>
              )}
            </div>
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
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl bg-card border border-border shadow-lg">
                <DropdownMenuItem
                  onClick={() => onView(lw.id)}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-primary" /> View Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onEdit(lw.id)}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-slate-500" /> Edit Lab Work
                </DropdownMenuItem>

                {lw.status === "ordered" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(lw.id, "received")}
                      className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-amber-600 cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4" /> Mark as Received
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(lw.id, "cancelled")}
                      className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-destructive cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Lab Work
                    </DropdownMenuItem>
                  </>
                )}

                {lw.status === "received" && (
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus(lw.id, "paid")}
                    className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-emerald-600 cursor-pointer"
                  >
                    <IndianRupee className="w-4 h-4" /> Mark as Paid
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => onDelete(lw.id, lw.workType)}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-destructive/10 rounded-xl flex items-center gap-3 text-destructive cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Entry
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          {groups.length > 0 && (
            <Button
              variant="outline"
              onClick={toggleAll}
              className="h-9 text-xs font-semibold rounded-xl gap-1.5"
            >
              {allExpanded ? (
                <>
                  <ChevronsDownUp className="w-3.5 h-3.5" /> Collapse All
                </>
              ) : (
                <>
                  <ChevronsUpDown className="w-3.5 h-3.5" /> Expand All
                </>
              )}
            </Button>
          )}
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
        <div className="space-y-3">
          {groups.map((group) => {
            const isExpanded = expandedKeys.has(group.key);
            return (
              <div
                key={group.key}
                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronRight
                      className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                    {groupBy === "patient" ? (
                      <span className="text-sm font-bold text-foreground truncate">{group.key}</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-foreground truncate">
                        <FlaskConical className="w-3.5 h-3.5 text-primary shrink-0" /> {group.key}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-foreground">
                      ₹{group.totalValue.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {group.items.length} {group.items.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-border">
                    <DataTable
                      columns={columns}
                      data={group.items}
                      rowKey={(lw) => lw.id}
                      onRowClick={(lw) => onView(lw.id)}
                      className="rounded-none border-none shadow-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
