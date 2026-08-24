import React, { useState, useEffect } from "react";
import { useInvoiceData } from "../hooks/useInvoiceData";
import { useModal } from "../contexts/ModalContext";
import { InvoiceList } from "../components/Billing/InvoiceList";

export const BillingPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    invoices,
    handleDeleteInvoice,
    handleUpdateInvoiceStatus,
    refetchInvoices,
    isInvoicesLoading,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalItems,
  } = useInvoiceData({
    search: search,
    status: status,
    paymentMethod: paymentMethod,
    startDate: startDate,
    endDate: endDate,
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
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
};
