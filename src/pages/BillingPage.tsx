import React, { useState, useEffect } from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { InvoiceList } from "../components/Billing/InvoiceList";

export const BillingPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { invoices, handleDeleteInvoice, handleUpdateInvoiceStatus, refetchInvoices } = useAppData({
    invoiceSearch: search,
    invoiceStatus: status,
  });
  const { setActiveModal, setSelectedItemId, confirmDelete } = useModal();

  useEffect(() => {
    refetchInvoices();
  }, [refetchInvoices]);

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
        search={searchInput}
        setSearch={setSearchInput}
        status={status}
        setStatus={setStatus}
      />
    </div>
  );
};
