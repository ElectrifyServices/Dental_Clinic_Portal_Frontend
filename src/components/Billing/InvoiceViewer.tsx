import { useState, useEffect } from "react";
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
import { Modal, Button, Badge, Card, CardContent, DataTable, Loading } from "@/components/ui";
import { generateInvoicePDF } from "../../utils/pdfGenerator";
import { useAppData } from "../../hooks/useAppData";
import { useInvoiceQuery, normalizeInvoice, fetchInvoiceHistory } from "../../hooks/billing/useInvoiceQuery";

interface InvoiceViewerProps {
  invoiceId: string;
  patientId?: string;
  isMember?: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

export function InvoiceViewer({
  invoiceId,
  patientId,
  isMember,
  onClose,
  onUpdateStatus,
}: InvoiceViewerProps) {
  const { patients, corporatePlans } = useAppData();
  const [activeId, setActiveId] = useState(invoiceId);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setActiveId(invoiceId);
  }, [invoiceId]);

  const { data: invoice, allInvoices, isLoading, error } = useInvoiceQuery(activeId, patientId, isMember);

  if (isLoading) {
    return (
      <Modal
        title={`Invoice ${invoiceId}`}
        onClose={onClose}
        size="2xl"
        icon={<FileText className="w-4 h-4" />}
      >
        <Loading type="spinner" text="Loading invoice details..." />
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



  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // Yield to the event loop so the loading spinner appears before heavy processing
      await new Promise(resolve => setTimeout(resolve, 50));

      const idToUse = patientId || invoice.patientId || invoice.memberId || invoice.member_id || patient?.id;
      const isMemberCheck = isMember || invoice.isMemberInvoice || (idToUse && (idToUse.startsWith('EMP-') || idToUse.startsWith('IND-') || idToUse.startsWith('MEM-')));
      const queryParams: any = { invoice_id: invoice.id };
      if (idToUse) {
        if (isMemberCheck) queryParams.member_id = idToUse;
        else queryParams.patient_id = idToUse;
      }

      const data = await fetchInvoiceHistory(queryParams);
      let rawData = data?.responseObject?.data || data?.data || data?.invoices || data;
      if (rawData && rawData.invoices && Array.isArray(rawData.invoices)) {
        rawData = rawData.invoices;
      }
      const fetchedInvoices = Array.isArray(rawData) ? rawData.map((i: any) => normalizeInvoice(i)) : [normalizeInvoice(rawData, invoice.id)];

      if (fetchedInvoices.length > 0) {
        let consolidatedItems: any[] = [];
        let totalSub = 0, totalTax = 0, totalDiscount = 0, grandTotal = 0, totalPaid = 0, totalPending = 0;

        fetchedInvoices.forEach((inv: any) => {
          if (inv && inv.items) {
            const itemsWithContext = inv.items.map((item: any) => ({
              ...item,
              invoice_number: inv.invoice_number || inv.id,
              description: `${item.description} (${new Date(inv.date).toLocaleDateString('en-GB')})`
            }));
            consolidatedItems = [...consolidatedItems, ...itemsWithContext];
            totalSub += inv.subtotal || 0;
            totalTax += inv.taxAmount || 0;
            totalDiscount += inv.discountAmount || 0;
            grandTotal += inv.total || 0;
            totalPaid += inv.paidAmount || 0;
            totalPending += inv.pendingAmount || 0;
          }
        });

        const freshData = {
          ...fetchedInvoices[0],
          items: consolidatedItems,
          subtotal: totalSub,
          taxAmount: totalTax,
          discountAmount: totalDiscount,
          total: grandTotal,
          paidAmount: totalPaid,
          pendingAmount: totalPending,
          invoice_number: "STATEMENT",
          date: new Date().toISOString(),
        };
        await generateInvoicePDF(freshData, patient);
      } else {
        await generateInvoicePDF(invoice, patient);
      }
    } catch (err) {
      console.error("Failed to fetch fresh invoice, generating from cache", err);
      await generateInvoicePDF(invoice, patient);
    } finally {
      setIsDownloading(false);
    }
  };

  const statusColors: Record<
    string,
    string
  > = {
    paid: "green",
    sent: "blue",
    overdue: "red",
    draft: "gray",
    generated: "indigo",
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
            <Button onClick={handleDownload} className="gap-2" disabled={isDownloading}>
              <Download className="w-4 h-4" /> {isDownloading ? "Preparing..." : "Download PDF"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 relative">
        {isDownloading && (
          <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <Loading type="spinner" text="Generating PDF..." />
          </div>
        )}
        {/* Status Banner */}
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${invoice.status === "paid"
            ? "bg-emerald-50 border-emerald-100"
            : invoice.status === "overdue"
              ? "bg-destructive/10 border-destructive/20"
              : "bg-primary/10 border-primary/20"
            }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${invoice.status === "paid"
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
                className={`text-xs font-bold uppercase tracking-wider ${invoice.status === "paid"
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
                {/* <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div> */}
                {/* <div>
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
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <DataTable
          columns={[
            {
              key: "description",
              header: "Description",
              render: (item: any) => <span className="font-medium text-foreground">{item.description}</span>,
            },
            {
              key: "quantity",
              header: "Qty",
              align: "center",
              render: (item: any) => <span className="text-muted-foreground">{item.quantity}</span>,
            },
            {
              key: "rate",
              header: "Rate",
              align: "right",
              render: (item: any) => <span className="text-muted-foreground">₹{(item.rate ?? 0).toLocaleString()}</span>,
            },
            {
              key: "amount",
              header: "Amount",
              align: "right",
              render: (item: any) => <span className="font-bold text-foreground">₹{(item.amount ?? 0).toLocaleString()}</span>,
            },
          ]}
          data={invoice.items || []}
          rowKey={(item: any, idx: number) => item.id || `item-${idx}`}
          footer={
            <div className="bg-muted/30 font-medium text-sm divide-y divide-border/60">
              <div className="flex justify-between px-6 py-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between px-6 py-2">
                  <span className="text-destructive">Total Discount ({invoice.discount}%)</span>
                  <span className="text-destructive">-₹{(invoice.discountAmount ?? 0).toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between px-6 py-3.5 bg-primary/5 text-base font-black text-primary uppercase tracking-wider">
                <span>Grand Total</span>
                <span>₹{((invoice as any).grand_total || (invoice as any).grandTotal || invoice.total || 0).toLocaleString()}</span>
              </div>
              {/* <div className="flex justify-between px-6 py-2.5 bg-emerald-50/40 text-emerald-700 font-bold uppercase tracking-wider">
                <span>Paid Amount</span>
                <span>₹{invoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-6 py-2.5 bg-amber-50/40 text-amber-700 font-bold uppercase tracking-wider">
                <span>Pending Amount</span>
                <span>₹{invoice.pendingAmount.toLocaleString()}</span>
              </div> */}
            </div>
          }
        />

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

        {/* {allInvoices && allInvoices.length > 1 && (
          <div className="space-y-3 pt-4 border-t border-border/80">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> All Bills for this Patient ({allInvoices.length})
            </h3>
            <DataTable
              columns={[
                {
                  key: "invoice_number",
                  header: "Invoice No",
                  render: (inv: any) => (
                    <span className="font-mono text-primary font-bold">
                      {inv.invoice_number}
                      {inv.id === invoice.id && (
                        <span className="ml-1.5 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                          Current
                        </span>
                      )}
                    </span>
                  ),
                },
                {
                  key: "date",
                  header: "Date",
                  render: (inv: any) => (
                    <span className="text-muted-foreground">
                      {new Date(inv.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ),
                },
                {
                  key: "total",
                  header: "Total",
                  align: "right",
                  render: (inv: any) => <span>₹{(inv.total || 0).toLocaleString()}</span>,
                },
                {
                  key: "paidAmount",
                  header: "Paid",
                  align: "right",
                  render: (inv: any) => <span className="text-emerald-700">₹{(inv.paidAmount || 0).toLocaleString()}</span>,
                },
                {
                  key: "status",
                  header: "Status",
                  align: "center",
                  render: (inv: any) => (
                    <Badge
                      variant={statusColors[inv.status] || "gray"}
                      className="text-[8px] uppercase px-2 py-0.5 font-bold"
                    >
                      {inv.status}
                    </Badge>
                  ),
                },
              ]}
              data={allInvoices}
              rowKey={(inv: any) => inv.id}
              onRowClick={(inv: any) => setActiveId(inv.id)}
            />
          </div>
        )} */}
      </div>
    </Modal>
  );
}
