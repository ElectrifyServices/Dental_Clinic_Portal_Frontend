import { Modal, Button, Card, CardContent, DataTable, StatusBadge } from "@/components/ui";
import { Printer, Download, FileText, CheckCircle2, History, CreditCard, Banknote } from "lucide-react";
import { useAppData } from "../../hooks/useAppData";
import { generateInvoicePDF } from "../../utils/pdfGenerator";
import { usePaymentHistoryQuery } from "../../hooks/billing/usePaymentHistoryQuery";

interface PaymentHistoryModalProps {
  invoice: any;
  onClose: () => void;
}

export function PaymentHistoryModal({ invoice, onClose }: PaymentHistoryModalProps) {
  const { patients } = useAppData();
  const { data: fetchedPayments, isLoading } = usePaymentHistoryQuery(invoice.id);

  if (isLoading) {
    return (
      <Modal title="Payment History" onClose={onClose} size="lg" icon={<History className="w-4 h-4" />}>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Modal>
    );
  }

  const patient = patients.find(
    (p) => p.id === invoice.patientId || p.name === invoice.patientName
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (invoice) {
      generateInvoicePDF(invoice, patient);
    }
  };

  const apiInvoice = fetchedPayments?.data?.invoice || fetchedPayments?.invoice;
  const apiSummary = fetchedPayments?.data?.summary || fetchedPayments?.summary;
  const rawPayments = fetchedPayments?.data?.payments || fetchedPayments?.payments || [];

  const totalAmount = apiInvoice?.grand_total ?? invoice.total ?? invoice.amount ?? 0;
  const isPaid = (apiInvoice?.status || invoice.status)?.toLowerCase() === "paid";
  const paidAmount = apiSummary?.paid_amount ?? invoice.paidAmount ?? (isPaid ? totalAmount : 0);
  const dueAmount = apiSummary?.pending_amount ?? invoice.pendingAmount ?? Math.max(0, totalAmount - paidAmount);

  const payments = Array.isArray(rawPayments)
    ? rawPayments.map((p: any) => ({
        id: p.id || p.payment_id || p.transaction_id || `PAY-${p.invoice_id || invoice.id}-${Date.now()}`,
        date: p.payment_date || p.date || p.created_at || invoice.date,
        amount: Number(p.amount ?? p.amount_paid ?? 0),
        method: p.payment_method || p.method || "Cash",
        status: p.status || p.payment_status || "Success",
      }))
    : (isPaid
        ? [
            {
              id: `PAY-${invoice.id}-1`,
              date: invoice.date,
              amount: totalAmount,
              method: "Cash",
              status: "Success",
            },
          ]
        : []);

  return (
    <Modal
      title="Payment History"
      onClose={onClose}
      size="xl"
      icon={<History className="w-4 h-4 text-primary" />}
      footer={
        <div className="flex justify-between w-full">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" /> Print Invoice
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/50 shadow-sm bg-muted/10">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Total Billed
              </p>
              <p className="text-xl font-black text-foreground">
                ₹{totalAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-emerald-50/50">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                Total Paid
              </p>
              <p className="text-xl font-black text-emerald-700">
                ₹{paidAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-amber-50/50">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                Balance Due
              </p>
              <p className="text-xl font-black text-amber-700">
                ₹{dueAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-primary" /> Transaction History
          </h3>
          
          {payments.length > 0 ? (
            <DataTable
              columns={[
                {
                  key: "id",
                  header: "Transaction ID",
                  render: (pay: any) => (
                    <span className="font-mono text-xs font-bold text-foreground">
                      {pay.id}
                    </span>
                  ),
                },
                {
                  key: "date",
                  header: "Date",
                  render: (pay: any) => (
                    <span className="text-muted-foreground">
                      {new Date(pay.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ),
                },
                {
                  key: "method",
                  header: "Method",
                  render: (pay: any) => (
                    <span className="text-muted-foreground font-medium">
                      {pay.method}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  header: "Amount",
                  align: "right" as const,
                  render: (pay: any) => (
                    <span className="font-bold text-foreground">
                      ₹{pay.amount.toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  align: "center" as const,
                  render: (pay: any) => (
                    <StatusBadge variant="green" className="text-[9px] uppercase font-bold">
                      {pay.status}
                    </StatusBadge>
                  ),
                },
              ]}
              data={payments}
              rowKey={(pay) => pay.id}
            />
          ) : (
            <div className="text-center p-8 border border-dashed border-border rounded-xl bg-muted/10">
              <History className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">No payments recorded</p>
              <p className="text-xs text-muted-foreground mt-1">
                This invoice has not received any payments yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
