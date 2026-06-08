import React, { useState } from "react";
import {
  Plus,
  Eye,
  Trash2,
  MoreVertical,
  IndianRupee,
  Send,
  FileText,
} from "lucide-react";
import { InvoicePaymentModal } from "./InvoicePaymentModal";
import {
  Button,
  PageHeader,
  DataTable,
  SearchInput,
  FilterTabs,
  StatusBadge,
  MetricCard,
} from "@/components/ui";
import { createPortal } from "react-dom";

interface Invoice {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  total: number;
  amount?: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "complimentary";
  dueDate: string;
  patientId?: string;
}

interface InvoiceListProps {
  onCreateInvoice: () => void;
  onViewInvoice?: (id: string) => void;
  onDeleteInvoice?: (id: string) => void;
  invoices: Invoice[];
  onUpdateStatus?: (id: string, status: string) => void;
}

const STATUS_META: Record<
  string,
  { label: string; variant: "green" | "blue" | "red" | "gray" | "violet" }
> = {
  paid: { label: "Paid", variant: "green" },
  sent: { label: "Sent", variant: "blue" },
  overdue: { label: "Overdue", variant: "red" },
  draft: { label: "Draft", variant: "gray" },
  complimentary: { label: "Complimentary", variant: "violet" },
  cancelled: { label: "Cancelled", variant: "gray" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
  { key: "cancelled", label: "Cancelled" },
];

export function InvoiceList({
  onCreateInvoice,
  onDeleteInvoice,
  onViewInvoice,
  invoices,
  onUpdateStatus,
}: InvoiceListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      (inv.patientName.toLowerCase().includes(q) ||
        inv.id.toLowerCase().includes(q)) &&
      (status === "all" || inv.status === status)
    );
  });

  const totalAmt = filtered.reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const pendingAmt = filtered
    .filter((i) => ["sent", "overdue"].includes(i.status))
    .reduce((s, i) => s + (i.total || i.amount || 0), 0);

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 160;
    const windowHeight = window.innerHeight;

    let top = rect.bottom + 4;
    if (rect.bottom + menuHeight > windowHeight) {
      top = rect.top - menuHeight;
      if (top < 0) top = 10;
    }

    setMenuPos({ top, left: rect.right - 176 });
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const columns = [
    {
      key: "id",
      header: "Invoice",
      render: (inv: Invoice) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {inv.id}
        </span>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (inv: Invoice) => (
        <div>
          <div className="font-bold text-foreground">{inv.patientName}</div>
          {inv.phone && (
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
              {inv.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (inv: Invoice) => (
        <span className="text-muted-foreground">
          {inv.date
            ? new Date(inv.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (inv: Invoice) => (
        <span className="text-muted-foreground">
          {inv.dueDate
            ? new Date(inv.dueDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right" as const,
      render: (inv: Invoice) => (
        <span className="font-bold text-foreground">
          ₹{(inv.total || inv.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (inv: Invoice) => {
        const meta = STATUS_META[inv.status] || STATUS_META.draft;
        return (
          <StatusBadge
            variant={meta.variant}
            className="text-[10px] uppercase font-bold"
          >
            {meta.label}
          </StatusBadge>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "center" as const,
      render: (inv: Invoice) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => onViewInvoice?.(inv.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={(e) => openMenu(e, inv.id)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {openMenuId === inv.id &&
              createPortal(
                <>
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setOpenMenuId(null)}
                  />
                  <div
                    className="fixed z-[9999] bg-card rounded-2xl border border-border shadow-2xl w-44 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    style={{ top: menuPos.top, left: menuPos.left }}
                  >
                    <div className="p-1.5 space-y-0.5">
                      {inv.status !== "paid" && onUpdateStatus && (
                        <button
                          onClick={() => {
                            setPayInvoice(inv);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <IndianRupee className="w-4 h-4" /> Mark as Paid
                        </button>
                      )}
                      {inv.status === "draft" && onUpdateStatus && (
                        <button
                          onClick={() => {
                            onUpdateStatus(inv.id, "sent");
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <Send className="w-4 h-4" /> Send to Patient
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onDeleteInvoice?.(inv.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                </>,
                document.body,
              )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="Billing & Invoices"
        subtitle={`${invoices.length} total invoices recorded`}
        action={
          <Button onClick={onCreateInvoice} className="gap-2">
            <Plus className="w-4 h-4" /> Create Invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Billed"
          value={`₹${totalAmt.toLocaleString()}`}
          variant="indigo"
          icon={<IndianRupee className="w-5 h-5" />}
        />
        <MetricCard
          label="Pending Payments"
          value={`₹${pendingAmt.toLocaleString()}`}
          variant="amber"
          icon={<IndianRupee className="w-5 h-5" />}
        />
        <MetricCard
          label="Paid Invoices"
          value={invoices.filter((i) => i.status === "paid").length}
          variant="emerald"
          icon={<FileText className="w-5 h-5" />}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by patient name or invoice ID…"
          className="flex-1"
        />
        <FilterTabs tabs={FILTERS} active={status} onChange={setStatus} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(inv) => inv.id}
        emptyIcon={<FileText className="w-12 h-12 text-muted-foreground/40" />}
        emptyTitle="No invoices found"
        emptySubtitle="Create your first invoice to get started."
      />

      {payInvoice && (
        <InvoicePaymentModal
          invoice={payInvoice}
          onClose={() => setPayInvoice(null)}
          onConfirmPayment={(id) => {
            onUpdateStatus?.(id, "paid");
            setPayInvoice(null);
          }}
        />
      )}
    </div>
  );
}
