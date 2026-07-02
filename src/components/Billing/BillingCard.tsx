import React, { useState } from "react";
import { PreviousBillsModal } from "./PreviousBillsModal";
import {
  Phone,
  MoreVertical,
  ChevronDown,
  Eye,
  History,
  IndianRupee,
  Send,
  Trash2,
} from "lucide-react";
import {
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

interface BillingCardProps {
  invoice: Invoice; // Grouped invoice record
  onView: (id: string) => void;
  onHistory: (invoice: Invoice) => void;
  onPay: (invoice: Invoice) => void;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
}

const AVATAR_COLORS = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-700",
  "from-amber-400 to-orange-600",
  "from-indigo-500 to-violet-700",
  "from-teal-500 to-emerald-600",
  "from-cyan-500 to-blue-600",
];

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

export const BillingCard: React.FC<BillingCardProps> = ({
  invoice,
  onView,
  onHistory,
  onPay,
  onSend,
  onDelete,
}) => {
  const [showPrevious, setShowPrevious] = useState(false);

  const avatarGrad = (name: string) => {
    const safeName = name || "P";
    return AVATAR_COLORS[safeName.charCodeAt(0) % AVATAR_COLORS.length];
  };

  const mainStatus = invoice.status?.toLowerCase() || "draft";
  const mainMeta = STATUS_META[mainStatus] || { label: invoice.status, variant: "gray" };
  const hasMultiple = invoice.allInvoices && invoice.allInvoices.length > 1;

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
    <div className="bg-white border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Patient Header */}
      <div 
        className="flex items-start justify-between gap-2 cursor-pointer hover:opacity-90 active:opacity-85 transition-opacity"
        onClick={() => onView(invoice.id)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGrad(
              invoice.patientName
            )} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}
          >
            {invoice.patientName ? invoice.patientName[0]?.toUpperCase() : "P"}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground text-sm truncate">
              {invoice.patientName}
            </h3>
            {invoice.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                <span>{invoice.phone}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusBadge
            variant={mainMeta.variant}
            className="text-[9px] uppercase font-bold px-2 py-0.5 tracking-wider"
          >
            {invoice.status}
          </StatusBadge>
          <ActionMenu inv={invoice} />
        </div>
      </div>

      {/* Invoice Key Details Grid */}
      <div 
        className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1 text-xs border-t border-slate-50 cursor-pointer hover:opacity-90 active:opacity-85 transition-opacity"
        onClick={() => onView(invoice.id)}
      >
        <div className="flex flex-col gap-1">
          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">
            Invoice No.
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-foreground">
              {invoice.invoice_number || invoice.id}
            </span>
            {hasMultiple && (
              <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100/80 font-bold px-1.5 py-0.5 rounded-full select-none">
                +{invoice.allInvoices.length - 1}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">
            Amount
          </span>
          <span className="font-bold text-foreground text-sm">
            ₹{getDisplayAmount(invoice).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wide font-sans">
            Date
          </span>
          <span className="text-muted-foreground font-medium">
            {formatLocalDate(invoice.date)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">
            Due Date
          </span>
          <span className="text-muted-foreground font-medium">
            {formatLocalDate(invoice.dueDate)}
          </span>
        </div>
      </div>

      {/* Previous Bills Trigger */}
      {hasMultiple && (
        <div className="pt-2">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 py-1.5 px-3 rounded-xl transition-all"
            onClick={() => setShowPrevious(true)}
          >
            <span>Previous Bills ({invoice.allInvoices.length - 1})</span>
            <ChevronDown className="w-4 h-4 -rotate-90 text-indigo-500" />
          </Button>

          {showPrevious && (
            <PreviousBillsModal
              invoice={invoice}
              onClose={() => setShowPrevious(false)}
              onView={onView}
              onHistory={onHistory}
              onPay={onPay}
              onSend={onSend}
              onDelete={onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
};
