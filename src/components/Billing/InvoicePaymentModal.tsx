import { Label } from "@/components/ui/Label";
import { useState } from "react";
import { CreditCard, Banknote, Landmark, CheckCircle2, ChevronRight } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface InvoicePaymentModalProps {
  invoice: any;
  onClose: () => void;
  onConfirmPayment: (invoiceId: string, method: string) => void;
}

const PAYMENT_METHODS = [
  {
    id: "cash",
    label: "Cash Payment",
    description: "Instant settlement, standard counter cash transaction",
    icon: <Banknote className="w-5 h-5" />,
    color: "emerald",
    bgClass: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30",
    activeClass: "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm shadow-emerald-500/10",
    iconBgActive: "bg-emerald-600 text-white shadow-emerald-500/20",
  },
  {
    id: "card",
    label: "Card / POS Terminal",
    description: "Swipe/Tap credit or debit cards on POS machine",
    icon: <CreditCard className="w-5 h-5" />,
    color: "blue",
    bgClass: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30",
    activeClass: "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm shadow-blue-500/10",
    iconBgActive: "bg-blue-600 text-white shadow-blue-500/20",
  },
  {
    id: "upi",
    label: "UPI / Online Transfer",
    description: "Scan QR code, Net Banking, or direct UPI transfer",
    icon: <Landmark className="w-5 h-5" />,
    color: "indigo",
    bgClass: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30",
    activeClass: "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm shadow-indigo-500/10",
    iconBgActive: "bg-indigo-600 text-white shadow-indigo-500/20",
  },
];

export function InvoicePaymentModal({
  invoice,
  onClose,
  onConfirmPayment,
}: InvoicePaymentModalProps) {
  const [method, setMethod] = useState("cash");

  const totalAmount = invoice.total ?? invoice.amount ?? 0;

  return (
    <Modal
      title="Process Payment"
      onClose={onClose}
      size="md"
      icon={<CreditCard className="w-4 h-4 text-primary" />}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirmPayment(invoice.id, method)}
            className="gap-2 rounded-xl shadow-lg shadow-primary/20"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirm Payment
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Total Amount Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-transparent p-5 rounded-2xl border border-primary/10 text-center">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          
          <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest mb-1.5">
            Total Amount Due
          </p>
          <p className="text-4xl font-black text-foreground tracking-tight">
            ₹{Number(totalAmount).toLocaleString("en-IN")}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-xs font-bold text-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Invoice: <span className="font-mono text-primary font-bold">{invoice.invoice_number || invoice.id}</span>
          </div>
        </div>

        {/* Selection Area */}
        <div className="space-y-3">
          <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest px-1">
            Select Payment Method
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = method === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setMethod(pm.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-200 text-left outline-none cursor-pointer",
                    isSelected
                      ? pm.activeClass
                      : "border-border bg-card hover:bg-muted/30 hover:border-border-hover"
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border",
                      isSelected
                        ? pm.iconBgActive
                        : `${pm.bgClass}`
                    )}
                  >
                    {pm.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">{pm.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate pr-2">
                      {pm.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-6 h-6">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-primary animate-in zoom-in-50 duration-150" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground/35 group-hover:text-muted-foreground transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

