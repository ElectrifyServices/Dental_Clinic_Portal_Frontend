import {
  Download,
  Printer,
  Send,
  FileText,
  User,
  Calendar,
  Building2,
  CreditCard,
  Stethoscope,
} from "lucide-react";
import { Modal, Button, Badge, Card, CardContent } from "@/components/ui";
import { generateInvoicePDF } from "../../utils/pdfGenerator";
import { useAppData } from "../../hooks/useAppData";
import { useInvoiceQuery } from "../../hooks/billing/useInvoiceQuery";

interface InvoiceViewerProps {
  invoiceId: string;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

export function InvoiceViewer({
  invoiceId,
  onClose,
  onUpdateStatus,
}: InvoiceViewerProps) {
  const { patients, corporatePlans } = useAppData();
  const { data: invoice, isLoading, error } = useInvoiceQuery(invoiceId);

  if (isLoading) {
    return (
      <Modal
        title={`Invoice ${invoiceId}`}
        onClose={onClose}
        size="2xl"
        icon={<FileText className="w-4 h-4" />}
      >
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Modal>
    );
  }

  if (error || !invoice) {
    return (
      <Modal
        title={`Invoice ${invoiceId}`}
        onClose={onClose}
        size="2xl"
        icon={<FileText className="w-4 h-4" />}
      >
        <div className="p-6 text-center text-destructive">
          Failed to load invoice details. Please try again.
        </div>
      </Modal>
    );
  }

  const patient = patients.find(
    (p) => p.id === invoice.patientId || p.name === invoice.patientName,
  );
  const corporatePlan = invoice.corporatePlanId
    ? corporatePlans.find((cp) => cp.id === invoice.corporatePlanId)
    : null;

  const handleDownload = () => {
    generateInvoicePDF(invoice, patient);
  };

  const handlePrint = () => {
    window.print();
  };

  const statusColors: Record<
    string,
    "green" | "blue" | "red" | "gray" | "violet"
  > = {
    paid: "green",
    sent: "blue",
    overdue: "red",
    draft: "gray",
    complimentary: "violet",
    cancelled: "gray",
  };

  return (
    <Modal
      title={`Invoice ${invoice.invoice_number || invoice.id}`}
      onClose={onClose}
      size="2xl"
      icon={<FileText className="w-4 h-4" />}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex gap-2">
            {invoice.status === "draft" && onUpdateStatus && (
              <Button
                onClick={() => onUpdateStatus(invoice.id, "sent")}
                variant="outline"
                className="gap-2"
              >
                <Send className="w-4 h-4" /> Send to Patient
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status Banner */}
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            invoice.status === "paid"
              ? "bg-emerald-50 border-emerald-100"
              : invoice.status === "overdue"
                ? "bg-destructive/10 border-destructive/20"
                : "bg-primary/10 border-primary/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                invoice.status === "paid"
                  ? "bg-emerald-500 text-white"
                  : invoice.status === "overdue"
                    ? "bg-destructive/100 text-white"
                    : "bg-primary/100 text-white"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  invoice.status === "paid"
                    ? "text-emerald-700"
                    : invoice.status === "overdue"
                      ? "text-destructive"
                      : "text-primary"
                }`}
              >
                Invoice Status
              </p>
              <p className="text-sm font-bold text-foreground capitalize">
                {invoice.status.replace("-", " ")}
              </p>
            </div>
          </div>
          <Badge
            variant={statusColors[invoice.status] || "gray"}
            className="text-[10px] uppercase px-4 py-1"
          >
            {invoice.status}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-none bg-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border shadow-sm">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Bill To
                  </p>
                  <p className="text-base font-bold text-foreground">
                    {invoice.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {invoice.phone || "No phone recorded"}
                  </p>
                </div>
              </div>
              {corporatePlan && (
                <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      Corporate Plan
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {corporatePlan.name}
                    </p>
                    <p className="text-[10px] text-blue-500 font-medium">
                      Benefits Applied
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-none bg-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border shadow-sm">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Date & Doctor
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(invoice.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Stethoscope className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">
                      {invoice.doctor || "General Dentist"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                    Due Date
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-center">
                  Qty
                </th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-right">
                  Rate
                </th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.items.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    ₹{item.rate.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    ₹{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/30 font-medium">
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2 text-right text-muted-foreground"
                >
                  Subtotal
                </td>
                <td className="px-4 py-2 text-right text-foreground">
                  ₹{invoice.subtotal.toLocaleString()}
                </td>
              </tr>
              {invoice.discount > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-right text-destructive"
                  >
                    Total Discount
                  </td>
                  <td className="px-4 py-2 text-right text-destructive">
                    -₹{invoice.discount.toLocaleString()}
                  </td>
                </tr>
              )}
              {invoice.tax > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-right text-muted-foreground"
                  >
                    GST (18%)
                  </td>
                  <td className="px-4 py-2 text-right text-foreground">
                    ₹{invoice.tax.toLocaleString()}
                  </td>
                </tr>
              )}
              <tr className="bg-primary/5 text-lg font-black">
                <td
                  colSpan={3}
                  className="px-4 py-4 text-right text-primary uppercase tracking-wider"
                >
                  Grand Total
                </td>
                <td className="px-4 py-4 text-right text-primary">
                  ₹{invoice.total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {invoice.isComplimentary && invoice.complimentaryNote && (
          <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl flex items-start gap-3">
            <FileText className="w-5 h-5 text-violet-600 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                Complimentary Billing Note
              </p>
              <p className="text-sm text-violet-800 font-medium mt-1 italic">
                "{invoice.complimentaryNote}"
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
