import React from "react";
import {
  X,
  Download,
  FileText,
  User,
  Calendar,
  DollarSign,
  Stethoscope,
} from "lucide-react";

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
  const [invoice, setInvoice] = React.useState<any>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem("invoices");
    const invoices = stored ? JSON.parse(stored) : [];

    const found = invoices.find((inv: any) => inv.id === invoiceId);

    if (found) {
      setInvoice(found);
    }
  }, [invoiceId]);
  // const handleWhatsApp = () => {
  //   const message = `Invoice ${invoice.id}
  // Patient: ${invoice.patientName}
  // Amount: ₹${invoice.total}`;

  //   const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  //   window.open(url, "_blank");
  // };

  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>Invoice - ${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .clinic-info { text-align: center; margin-bottom: 30px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .patient-info, .invoice-info { width: 45%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { font-weight: bold; font-size: 18px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DentalCare Pro</h1>
            <p>Complete Dental Clinic Management</p>
          </div>
          
          <div class="clinic-info">
            <h2>Dr. Sharma's Dental Clinic</h2>
            <p>123 MG Road, Bangalore, Karnataka 560001</p>
            <p>Phone: +91 80 1234 5678 | Email: info@dentalcarepro.com</p>
          </div>

          <div class="invoice-details">
            <div class="patient-info">
              <h3>Bill To:</h3>
              <p><strong>${invoice.patientName}</strong></p>
              
                       <h3>Doctor</h3>
              <p><strong>Doctor:</strong> ${invoice.doctor || "-"}</p>
            </div>
            <div class="invoice-info">
              <h3>Invoice Details:</h3>
              <p><strong>Invoice #:</strong> ${invoice.id}</p>
              <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate (₹)</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
             ${invoice.items
               .map(
                 (item: any) => `
  <tr>
    <td>${item.description}</td>
    <td>${item.quantity}</td>
    <td>₹${item.rate.toLocaleString()}</td>
    <td>₹${item.amount.toLocaleString()}</td>
  </tr>
`,
               )
               .join("")}
            </tbody>
          </table>

          <div class="totals">
            <p>Subtotal: ₹${invoice.subtotal.toLocaleString()}</p>
            <p>Discount: -₹${invoice.discount.toLocaleString()}</p>
            <p>Tax (${invoice.tax}%): ₹${invoice.taxAmount?.toLocaleString() || (invoice.tax * (invoice.subtotal - invoice.discount) / 100).toLocaleString()}</p>
            <hr>
            <p class="total-row">Total: ₹${invoice.total.toLocaleString()}</p>
            ${invoice.isComplimentary ? `<p style="color: #7c3aed; font-weight: bold; margin-top: 10px;">COMPLIMENTARY - NO CHARGE (${invoice.complimentaryNote || ''})</p>` : ''}
          </div>

          <div class="footer">
            <p>Thank you for choosing our dental services!</p>
            <p>For any queries, please contact us at info@dentalcarepro.com</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([printContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.id}-${invoice.patientName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkAsPaid = () => {
    const stored = localStorage.getItem("invoices");
    const invoices = stored ? JSON.parse(stored) : [];

    const updated = invoices.map((inv: any) =>
      inv.id === invoice.id ? { ...inv, status: "paid" } : inv,
    );

    localStorage.setItem("invoices", JSON.stringify(updated));

    setInvoice((prev: any) => ({ ...prev, status: "paid" }));

    // IMPORTANT
    onUpdateStatus?.(invoice.id, "paid");
  };
  if (!invoice) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-xl">Loading...</div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Invoice {invoice.id}
                </h2>
                <p className="text-gray-600">{invoice.patientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
{/* {invoice.status !== "paid" && (
  <button
    onClick={handleMarkAsPaid}
    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center transition-all duration-200"
  >
    Mark as Paid
  </button>
)} */}
              {/* <button onClick={handleWhatsApp}>
  Send WhatsApp
</button> */}
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Clinic Header */}
          <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              DentalCare Pro
            </h1>
            <p className="text-blue-700">Dr. Sharma's Dental Clinic</p>
            <p className="text-sm text-blue-600 mt-2">
              123 MG Road, Bangalore, Karnataka 560001
            </p>
            <p className="text-sm text-blue-600">
              Phone: +91 80 1234 5678 | Email: info@dentalcarepro.com
            </p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
              {/* Bill To */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Bill To
                </h3>
                <p className="text-base font-semibold text-gray-900">
                  {invoice.patientName}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Doctor */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Doctor
                </h3>
                <p className="text-base font-semibold text-gray-900">
                  {invoice.doctor}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Invoice Details
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Invoice #:</span> {invoice.id}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(invoice.date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Due Date:</span>{" "}
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : invoice.status === "complimentary"
                        ? "bg-violet-100 text-violet-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {invoice.status === "paid" ? "Paid" : invoice.status.toUpperCase()}
                  </span>
                </p>
                {invoice.isComplimentary && invoice.complimentaryNote && (
                  <p className="text-xs text-violet-600 font-medium bg-violet-50 p-2 rounded-lg border border-violet-100 mt-2">
                    Note: {invoice.complimentaryNote}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Rate (₹)
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ₹{item.rate.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      ₹{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="space-y-3 text-right">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  ₹{invoice.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">
                  -₹{invoice.discount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18%):</span>
                <span className="font-medium">
                  ₹{invoice.tax.toLocaleString()}
                </span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between text-xl font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-600 flex items-center">
                  <DollarSign className="w-5 h-5 mr-1" />₹
                  {invoice.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <p className="text-blue-900 font-medium">
              Thank you for choosing our dental services!
            </p>
            <p className="text-sm text-blue-600 mt-1">
              For any queries, please contact us at info@dentalcarepro.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
