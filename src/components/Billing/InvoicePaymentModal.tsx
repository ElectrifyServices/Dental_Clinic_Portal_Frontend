import React, { useState } from 'react';
import { CreditCard, Banknote, Landmark, CheckCircle2 } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface InvoicePaymentModalProps {
  invoice: any;
  onClose: () => void;
  onConfirmPayment: (invoiceId: string, method: string) => void;
}

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: <Banknote className="w-5 h-5" />, color: 'emerald' },
  { id: 'card', label: 'Card', icon: <CreditCard className="w-5 h-5" />, color: 'blue' },
  { id: 'upi', label: 'UPI / Online', icon: <Landmark className="w-5 h-5" />, color: 'indigo' },
];

export function InvoicePaymentModal({ invoice, onClose, onConfirmPayment }: InvoicePaymentModalProps) {
  const [method, setMethod] = useState('cash');

  return (
    <Modal
      title="Process Payment"
      onClose={onClose}
      size="md"
      icon={<CreditCard className="w-4 h-4" />}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirmPayment(invoice.id, method)} className="gap-2">
            <CheckCircle2 className="w-4 h-4" /> Confirm Payment
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-2xl border border-border text-center">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Total Amount Due</p>
          <p className="text-3xl font-black text-foreground">₹{(invoice.total || invoice.amount || 0).toLocaleString()}</p>
          <div className="mt-2 text-xs font-bold text-primary flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Invoice {invoice.id}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Select Payment Method</label>
          <div className="grid grid-cols-1 gap-3">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setMethod(pm.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  method === pm.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:border-primary/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  method === pm.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'
                }`}>
                  {pm.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{pm.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {pm.id === 'cash' ? 'Instant settlement, no extra fees' : 'Digital confirmation required'}
                  </p>
                </div>
                {method === pm.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
