import React from 'react';
import { InvoiceList } from '../components/Billing/InvoiceList';

interface BillingPageProps {
  invoices: any[];
  onCreateInvoice: () => void;
  onViewInvoice: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const BillingPage: React.FC<BillingPageProps> = (props) => {
  return (
    <div className="space-y-6">
      <InvoiceList {...props} />
    </div>
  );
};
