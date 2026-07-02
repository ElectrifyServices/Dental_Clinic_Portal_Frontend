import React from "react";
import {
  MoreVertical,
  Eye,
  History,
  IndianRupee,
  Send,
  Trash2,
  FileText,
} from "lucide-react";
import {
  Modal,
  Button,
  StatusBadge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui";

interface Invoice {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  total: number;
  amount?: number;
  status: string;
  dueDate: string;
  invoice_number?: string;
  paidAmount?: number;
  paid_amount?: number;
  pendingAmount?: number;
  pending_amount?: number;
  allInvoices?: Invoice[];
}

interface PreviousBillsModalProps {
  invoice: Invoice; // Grouped invoice record
  onClose: () => void;
  onView: (id: string) => void;
  onHistory: (invoice: Invoice) => void;
  onPay: (invoice: Invoice) => void;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_META: Record<string, { label: string; variant: "green" | "blue" | "amber" | "red" | "gray" | "violet" | "indigo" }> = {
  paid: { label: "Paid", variant: "green" },
  partially_paid: { label: "Partially Paid", variant: "amber" },
  sent: { label: "Sent", variant: "blue" },
  overdue: { label: "Overdue", variant: "red" },
  draft: { label: "Draft", variant: "gray" },
  generated: { label: "Generated", variant: "indigo" },
  complimentary: { label: "Complimentary", variant: "violet" },
  cancelled: { label: "Cancelled", variant: "gray" },
};

function formatLocalDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDisplayAmount(inv: Invoice): number {
  const hasPaid = inv.paidAmount !== undefined && inv.paidAmount > 0 || inv.paid_amount !== undefined && inv.paid_amount > 0;
  return hasPaid
    ? (inv.pendingAmount ?? inv.pending_amount ?? 0)
    : (inv.total || inv.amount || 0);
}

export const PreviousBillsModal: React.FC<PreviousBillsModalProps> = ({
  invoice,
  onClose,
  onView,
  onHistory,
  onPay,
  onSend,
  onDelete,
}) => {
  const olderInvoices = invoice.allInvoices ? invoice.allInvoices.slice(1) : [];

  const ActionMenu = ({ inv }: { inv: Invoice }) => {
    const statusLower = inv.status?.toLowerCase() || "draft";
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => onView(inv.id)}>
            <Eye className="w-4 h-4 mr-2 text-primary" /> View Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onHistory(inv)}>
            <History className="w-4 h-4 mr-2 text-amber-600" /> Payment History
          </DropdownMenuItem>
          {statusLower !== "paid" && (
            <DropdownMenuItem onSelect={() => onPay(inv)}>
              <IndianRupee className="w-4 h-4 mr-2 text-emerald-600" /> Mark as Paid
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => onSend(inv.id)}>
            <Send className="w-4 h-4 mr-2 text-primary" /> Send
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDelete(inv.id)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <Modal
      title={`Previous Bills - ${invoice.patientName}`}
      subtitle={`${olderInvoices.length} historical billing records`}
      onClose={onClose}
      size="lg"
      icon={<FileText className="w-4 h-4 text-indigo-500" />}
    >
      <div className="p-4 md:p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {olderInvoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No previous bills found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {olderInvoices.map((oldInv) => {
              const oldStatus = oldInv.status?.toLowerCase() || "draft";
              const oldMeta = STATUS_META[oldStatus] || { label: oldInv.status, variant: "gray" };
              return (
                <div
                  key={oldInv.id}
                  className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/50 hover:border-slate-300/60 active:bg-slate-100 transition-all select-none"
                  onClick={() => {
                    onView(oldInv.id);
                    onClose();
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {oldInv.invoice_number || oldInv.id}
                      </span>
                      <StatusBadge
                        variant={oldMeta.variant}
                        className="text-[8px] uppercase font-black px-1.5 py-0.5 tracking-wider"
                      >
                        {oldInv.status}
                      </StatusBadge>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium flex items-center gap-3">
                      <span>Date: {formatLocalDate(oldInv.date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Amount
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        ₹{getDisplayAmount(oldInv).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <ActionMenu inv={oldInv} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
