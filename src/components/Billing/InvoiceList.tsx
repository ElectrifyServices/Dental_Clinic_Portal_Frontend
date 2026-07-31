import React, { useState, useMemo, useEffect } from "react";
import { BillingCard } from "./BillingCard";
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
  History,
} from "lucide-react";
import { PaymentHistoryModal } from "./PaymentHistoryModal";
import { InvoicePaymentModal } from "./InvoicePaymentModal";
import {
  useTotalBilledQuery,
  usePendingInvoicesQuery,
  usePaidInvoicesQuery,
} from "../../hooks/billing/useInvoiceStatsQuery";
import { usePayInvoiceMutation } from "../../hooks/billing/usePayInvoiceMutation";
import { useSendInvoiceMutation } from "../../hooks/billing/useSendInvoiceMutation";
import {
  Button,
  PageHeader,
  DataTable,
  SearchInput,
  StatusBadge,
  MetricCard,
  toast,
  Pagination,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Loading,
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
  onDeleteInvoice?: (id: string, invoiceNumber?: string) => void;
  invoices: Invoice[];
  onUpdateStatus?: (id: string, status: string) => void;
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  isLoading?: boolean;
}

const STATUS_META: Record<
  string,
  { label: string; variant: string }
> = {
  paid: { label: "Paid", variant: "green" },
  partially_paid: { label: "Partially Paid", variant: "amber" },
  sent: { label: "Sent", variant: "blue" },
  overdue: { label: "Overdue", variant: "red" },
  draft: { label: "Draft", variant: "gray" },
  generated: { label: "Generated", variant: "indigo" },
  complimentary: { label: "Complimentary", variant: "violet" },
  cancelled: { label: "Cancelled", variant: "gray" },
};

export function formatIndianCurrency(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(Number(num))) return "0";
  const n = Number(num);
  if (n >= 10000000) { // 1 Crore
    const val = n / 10000000;
    return val % 1 === 0 ? val.toFixed(0) + "Cr" : val.toFixed(1) + "Cr";
  }
  if (n >= 100000) { // 1 Lakh
    const val = n / 100000;
    return val % 1 === 0 ? val.toFixed(0) + "L" : val.toFixed(1) + "L";
  }
  if (n >= 1000) { // 1 Thousand
    const val = n / 1000;
    return val % 1 === 0 ? val.toFixed(0) + "k" : val.toFixed(1) + "k";
  }
  return n.toLocaleString("en-IN");
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "partially_paid", label: "Partially Paid" },
  { key: "generated", label: "Generated" },
  { key: "sent", label: "Sent" },
  { key: "paid", label: "Paid" },
];

export function InvoiceList({
  onCreateInvoice,
  onDeleteInvoice,
  onViewInvoice,
  invoices = [],
  onUpdateStatus,
  search,
  setSearch,
  status,
  setStatus,
  isLoading,
}: InvoiceListProps) {
  // Stats APIs
  const { data: totalBilledData } = useTotalBilledQuery();
  const { data: pendingInvoicesData } = usePendingInvoicesQuery();
  const { data: paidInvoicesData } = usePaidInvoicesQuery();
  const { mutateAsync: payInvoiceMutation, isPending: isPaying } = usePayInvoiceMutation();
  const { mutateAsync: sendInvoiceMutation } = useSendInvoiceMutation();

  const handleSendInvoice = async (id: string) => {
    try {
      await sendInvoiceMutation({ id });
      onUpdateStatus?.(id, "sent");
      toast.success("Invoice queued for sending");
    } catch (err: any) {
      console.error("Failed to send invoice:", err);
      const serverResponse = err.response?.data;
      let errMsg = "";
      if (serverResponse) {
        const parsed = serverResponse.responseStatusList?.statusList?.[0];
        if (parsed?.statusDesc) {
          errMsg = parsed.statusDesc;
        }
      }
      if (!errMsg) {
        errMsg = err.status?.statusDesc || err.message || "Failed to send invoice";
      }
      toast.error(errMsg);
    }
  };

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
  const [historyInvoice, setHistoryInvoice] = useState<Invoice | null>(null);
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

  const filtered = invoices || [];

  const flatSortedInvoices = useMemo(() => {
    return [...filtered].sort((a, b) => {
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
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
        <div className="flex items-center gap-1.5 min-w-[140px]">
          {/* Chevron expand/collapse button removed as per request */}
          {/* +N count badge removed as per request */}
          <span className="font-mono text-xs font-bold text-foreground">
            {inv.invoice_number || inv.id}
          </span>
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
              year: "numeric",
            })
            : "—"}
        </span>
      ),
    },

    {
      key: "amount",
      header: "Grand Total",
      render: (inv: Invoice) => {
        const displayAmount = (inv as any).grand_total || (inv as any).grandTotal || inv.total || inv.amount || 0;
        return (
          <span className="font-bold text-foreground">
            ₹{displayAmount.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (inv: Invoice) => {
        const meta = STATUS_META[inv.status?.toLowerCase()] || { variant: "gray", label: inv.status };
        return (
          <StatusBadge
            variant={meta.variant as any}
            className="text-[10px] uppercase font-bold"
          >
            {inv.status}
          </StatusBadge>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "center" as const,
      render: (inv: Invoice) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onViewInvoice?.(inv.id);
            }}
            title="View Invoice"
            className="w-7 h-7 text-primary hover:bg-primary/10 rounded-lg"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setHistoryInvoice(inv);
            }}
            title="Payment History"
            className="w-7 h-7 text-amber-600 hover:bg-amber-50 rounded-lg"
          >
            <History className="w-3.5 h-3.5" />
          </Button>
          {inv.status !== "paid" && onUpdateStatus && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setPayInvoice(inv);
              }}
              title="Mark as Paid"
              className="w-7 h-7 text-emerald-600 hover:bg-emerald-50 rounded-lg"
            >
              <IndianRupee className="w-3.5 h-3.5" />
            </Button>
          )}
          {inv.status === "draft" && onUpdateStatus && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(inv.id, "sent");
              }}
              title="Send to Patient"
              className="w-7 h-7 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteInvoice?.(inv.id, (inv as any).invoice_number || inv.id);
            }}
            title="Delete"
            className="w-7 h-7 text-destructive hover:bg-destructive/10 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
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
      key: "amount",
      header: "Amount",
      align: "right" as const,
      render: (inv: any) => {
        const hasPaid = inv.paidAmount > 0 || inv.paid_amount > 0;
        const displayAmount = hasPaid ? (inv.pendingAmount ?? inv.pending_amount ?? 0) : (inv.total || inv.amount || 0);
        return (
          <span className="font-bold text-foreground">
            ₹{displayAmount.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (inv: any) => {
        const meta = STATUS_META[inv.status?.toLowerCase()] || { variant: "gray", label: inv.status };
        return (
          <StatusBadge
            variant={meta.variant as any}
            className="text-[9px] uppercase font-bold px-2 py-0.5"
          >
            {inv.status}
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
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setHistoryInvoice(inv);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <FileText className="w-4 h-4 text-amber-600" /> Payment History
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
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleSendInvoice(inv.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Send className="w-4 h-4" /> Send
                      </Button>
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(flatSortedInvoices.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    return flatSortedInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [flatSortedInvoices, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

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
          value={`₹${formatIndianCurrency(totalBilled)}`}
          variant="indigo"
          icon={<IndianRupee className="w-5 h-5" />}
        />
        <MetricCard
          label="Pending Payments"
          value={`₹${formatIndianCurrency(pendingPayments)}`}
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

      <div className="flex flex-row gap-2 items-center bg-card p-3 rounded-2xl border border-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by patient name or invoice ID…"
          className="flex-1 min-w-0"
        />
        <div className="shrink-0">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[130px] text-xs font-semibold rounded-xl border border-border bg-muted">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((f) => (
                <SelectItem key={f.key} value={f.key} className="text-xs font-medium">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Loading type="spinner" text="Loading invoices..." className="py-20" />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <DataTable
          columns={columns}
          data={paginatedData as any[]}
          rowKey={(inv) => inv.id}
          emptyIcon={<FileText className="w-12 h-12 text-muted-foreground/40" />}
          emptyTitle="No invoices found"
          emptySubtitle="Create your first invoice to get started."
          footer={
            totalPages > 1 ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-border/50 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page:</span>
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(val) => {
                      setItemsPerPage(Number(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5" className="text-xs">5</SelectItem>
                      <SelectItem value="10" className="text-xs">10</SelectItem>
                      <SelectItem value="20" className="text-xs">20</SelectItem>
                      <SelectItem value="50" className="text-xs">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={flatSortedInvoices.length}
                  perPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : undefined
          }
        />
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="block lg:hidden space-y-4">
        {paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
            <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="font-bold text-foreground text-sm">No invoices found</p>
            <p className="text-muted-foreground text-xs mt-1">Create your first invoice to get started.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedData.map((inv) => (
                <BillingCard
                  key={inv.id}
                  invoice={inv}
                  onView={(id) => onViewInvoice?.(id)}
                  onHistory={setHistoryInvoice}
                  onPay={setPayInvoice}
                  onSend={(id) => onUpdateStatus?.(id, "sent")}
                  onDelete={(id, num) => onDeleteInvoice?.(id, num)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="py-4 px-4 border border-border/50 bg-card rounded-2xl shadow-sm mt-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page:</span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(val) => {
                        setItemsPerPage(Number(val));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20 h-8 text-xs">
                        <SelectValue placeholder="10" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5" className="text-xs">5</SelectItem>
                        <SelectItem value="10" className="text-xs">10</SelectItem>
                        <SelectItem value="20" className="text-xs">20</SelectItem>
                        <SelectItem value="50" className="text-xs">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    totalItems={flatSortedInvoices.length}
                    perPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </>
      )}

      {payInvoice && (
        <InvoicePaymentModal
          invoice={payInvoice}
          isProcessing={isPaying}
          onClose={() => setPayInvoice(null)}
          onConfirmPayment={async (id, method, amount) => {
            try {
              await payInvoiceMutation({
                id,
                payment_method: method,
                amount,
              });
              onUpdateStatus?.(id, "paid");
              setPayInvoice(null);
              toast.success("Payment completed successfully!");
            } catch (err: any) {
              console.error("Failed to confirm payment:", err);

              const serverResponse = err.response?.data;
              let errMsg = "";
              if (serverResponse) {
                const parsed = serverResponse.responseStatusList?.statusList?.[0];
                if (parsed?.statusDesc) {
                  errMsg = parsed.statusDesc;
                }
              }
              if (!errMsg) {
                errMsg = err.status?.statusDesc || err.message || "Failed to confirm payment";
              }
              toast.error(errMsg);
            }
          }}
        />
      )}

      {historyInvoice && (
        <PaymentHistoryModal
          invoice={historyInvoice}
          onClose={() => setHistoryInvoice(null)}
        />
      )}
    </div>
  );
}
