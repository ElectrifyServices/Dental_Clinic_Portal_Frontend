import React, { useState, useEffect } from "react";
import { useInvoiceData } from "../hooks/useInvoiceData";
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

  const { invoices, handleDeleteInvoice, handleUpdateInvoiceStatus, refetchInvoices, isInvoicesLoading } = useInvoiceData({
    search: search,
    status: status,
  });
  const { setActiveModal, setSelectedItemId, confirmDelete } = useModal();

  useEffect(() => {
    refetchInvoices();
  }, [refetchInvoices]);

  return (
    <div className="space-y-6">
      <InvoiceList
        invoices={invoices}
        isLoading={isInvoicesLoading}
        onCreateInvoice={() => setActiveModal("invoiceForm")}
        onViewInvoice={(id: string) => {
          setSelectedItemId(id);
          setActiveModal("invoiceViewer");
        }}
        onDeleteInvoice={(id: string, num?: string) =>
          confirmDelete("Delete Invoice", `Delete invoice ${num || id}?`, () => handleDeleteInvoice(id))
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
