import React from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { InvoiceList } from "../components/Billing/InvoiceList";

export const BillingPage: React.FC = () => {
  const { invoices, handleDeleteInvoice, handleUpdateInvoiceStatus } = useAppData();
  const { setActiveModal, setSelectedItemId, confirmDelete } = useModal();

  return (
    <div className="space-y-6">
      <InvoiceList
        invoices={invoices}
        onCreateInvoice={() => setActiveModal("invoiceForm")}
        onViewInvoice={(id: string) => setSelectedItemId(id)}
        onDeleteInvoice={(id: string) =>
          confirmDelete("Delete Invoice", `Delete invoice ${id}?`, () => handleDeleteInvoice(id))
        }
        onUpdateStatus={handleUpdateInvoiceStatus}
      />
    </div>
  );
};
