import React, { useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Trash2,
  MoreVertical,
  IndianRupee,
  Send,
  FileText,
  ChevronDown,
  ChevronRight, 
} from "lucide-react";
import { InvoicePaymentModal } from "./InvoicePaymentModal";
import {
  useTotalBilledQuery,
  usePendingInvoicesQuery,
  usePaidInvoicesQuery,
} from "../../hooks/billing/useInvoiceStatsQuery";
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
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
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
  search,
  setSearch,
  status,
  setStatus,
}: InvoiceListProps) {
  // Stats APIs
  const { data: totalBilledData } = useTotalBilledQuery();
  const { data: pendingInvoicesData } = usePendingInvoicesQuery();
  const { data: paidInvoicesData } = usePaidInvoicesQuery();

  const totalBilled = Number(
    totalBilledData?.responseObject?.data?.total_billed ??
    totalBilledData?.responseObject?.data?.totalBilled ??
    totalBilledData?.data?.total_billed ??
    totalBilledData?.data?.totalBilled ??
    totalBilledData?.total_billed ??
    totalBilledData?.totalBilled ??
    totalBilledData?.totalAmount ??
    totalBilledData?.total ??
    totalBilledData?.amount ??
    0
  );

  const pendingPayments = Number(
    pendingInvoicesData?.responseObject?.data?.pending_payments ??
    pendingInvoicesData?.responseObject?.data?.pendingPayments ??
    pendingInvoicesData?.data?.pending_payments ??
    pendingInvoicesData?.data?.pendingPayments ??
    pendingInvoicesData?.pending_payments ??
    pendingInvoicesData?.pendingPayments ??
    pendingInvoicesData?.totalAmount ??
    pendingInvoicesData?.total ??
    pendingInvoicesData?.amount ??
    0
  );

  const pendingCount = Number(
    pendingInvoicesData?.responseObject?.data?.pending_invoices_count ??
    pendingInvoicesData?.responseObject?.data?.pendingInvoicesCount ??
    pendingInvoicesData?.data?.pending_invoices_count ??
    pendingInvoicesData?.data?.pendingInvoicesCount ??
    pendingInvoicesData?.pending_invoices_count ??
    pendingInvoicesData?.pendingInvoicesCount ??
    pendingInvoicesData?.count ??
    0
  );

  const paidCount = Number(
    paidInvoicesData?.responseObject?.data?.paid_invoices_count ??
    paidInvoicesData?.responseObject?.data?.paidInvoicesCount ??
    paidInvoicesData?.data?.paid_invoices_count ??
    paidInvoicesData?.data?.paidInvoicesCount ??
    paidInvoicesData?.paid_invoices_count ??
    paidInvoicesData?.paidInvoicesCount ??
    paidInvoicesData?.count ??
    0
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleRowExpanded = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = invoices;

  const groupedData = useMemo(() => {
    const groups: Record<string, Invoice[]> = {};
    filtered.forEach((inv) => {
      const key = inv.patientId || inv.patientName;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(inv);
    });

    return Object.values(groups).map((groupInvoices) => {
      const sorted = [...groupInvoices].sort((a, b) => {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });
      const latest = sorted[0];
      return {
        ...latest,
        latestInvoice: latest,
        allInvoices: sorted,
      };
    });
  }, [filtered]);

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 200;
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
      render: (inv: any) => (
        <div className="flex items-center gap-1.5">
          {inv.allInvoices && inv.allInvoices.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpanded(inv.id);
              }}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            >
              {expandedRowIds.has(inv.id) ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <span className="font-mono text-xs font-bold text-foreground">
            {inv.invoice_number || inv.id}
          </span>
          {inv.allInvoices && inv.allInvoices.length > 1 && (
            <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100/80 font-bold px-2 py-0.5 rounded-full select-none shadow-sm">
              +{inv.allInvoices.length - 1}
            </span>
          )}
        </div>
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
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onViewInvoice?.(inv.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4 text-primary" /> View Invoice
                      </Button>
                      {inv.status !== "paid" && onUpdateStatus && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setPayInvoice(inv);
                            setOpenMenuId(null);
                          }}
                          className="w-full justify-start text-left px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <IndianRupee className="w-4 h-4" /> Mark as Paid
                        </Button>
                      )}
                      {inv.status === "draft" && onUpdateStatus && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onUpdateStatus(inv.id, "sent");
                            setOpenMenuId(null);
                          }}
                          className="w-full justify-start text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <Send className="w-4 h-4" /> Send to Patient
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onDeleteInvoice?.(inv.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
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

  const subColumns = [
    {
      key: "id",
      header: "Invoice Number",
      render: (inv: any) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {inv.invoice_number || inv.id}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (inv: any) => (
        <span className="text-muted-foreground">
          {inv.date
            ? new Date(inv.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (inv: any) => (
        <span className="text-muted-foreground">
          {inv.dueDate
            ? new Date(inv.dueDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right" as const,
      render: (inv: any) => (
        <span className="font-bold text-foreground">
          ₹{(inv.total || inv.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (inv: any) => {
        const meta = STATUS_META[inv.status] || STATUS_META.draft;
        return (
          <StatusBadge
            variant={meta.variant}
            className="text-[9px] uppercase font-bold px-2 py-0.5"
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
      render: (inv: any) => (
        <div className="flex items-center justify-center gap-1">
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
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onViewInvoice?.(inv.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4 text-primary" /> View Invoice
                      </Button>
                      {inv.status !== "paid" && onUpdateStatus && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setPayInvoice(inv);
                            setOpenMenuId(null);
                          }}
                          className="w-full justify-start text-left px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <IndianRupee className="w-4 h-4" /> Mark as Paid
                        </Button>
                      )}
                      {inv.status === "draft" && onUpdateStatus && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onUpdateStatus(inv.id, "sent");
                            setOpenMenuId(null);
                          }}
                          className="w-full justify-start text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <Send className="w-4 h-4" /> Send to Patient
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onDeleteInvoice?.(inv.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
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
          value={`₹${totalBilled.toLocaleString()}`}
          variant="indigo"
          icon={<IndianRupee className="w-5 h-5" />}
        />
        <MetricCard
          label="Pending Payments"
          value={`₹${pendingPayments.toLocaleString()}`}
          trend={pendingCount > 0 ? `${pendingCount} bills pending` : undefined}
          variant="amber"
          icon={<IndianRupee className="w-5 h-5" />}
        />
        <MetricCard
          label="Paid Invoices"
          value={paidCount}
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
        data={groupedData as any[]}
        rowKey={(inv) => inv.id}
        emptyIcon={<FileText className="w-12 h-12 text-muted-foreground/40" />}
        emptyTitle="No invoices found"
        emptySubtitle="Create your first invoice to get started."
        onRowClick={(row: any) => toggleRowExpanded(row.id)}
        expandedRowIds={expandedRowIds}
        renderExpandedRow={(groupedInv: any) => {
          const olderInvoices = groupedInv.allInvoices.slice(1);
          if (olderInvoices.length === 0) return null;
          return (
            <div className="p-4 pl-12 bg-muted/20 border-t border-b border-border/40 space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Previous Bills
              </div>
              <DataTable
                columns={subColumns}
                data={olderInvoices}
                rowKey={(inv) => inv.id}
                emptyTitle="No previous bills found"
              />
            </div>
          );
        }}
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
