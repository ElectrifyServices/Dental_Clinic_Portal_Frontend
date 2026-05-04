import React, { useState } from 'react';
import { Package, DollarSign, User, FileText, Calendar, RefreshCw } from 'lucide-react';
import { Modal, Button, FormField } from '@/components/ui';

interface RestockFormProps {
  item: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function RestockForm({ item, onClose, onSave }: RestockFormProps) {
  const [formData, setFormData] = useState({
    quantity: 1,
    purchasePrice: item.cost || 0,
    supplier: item.supplier || '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...item,
      currentStock: item.currentStock + Number(formData.quantity),
      lastRestocked: formData.date,
      supplier: formData.supplier,
      cost: Number(formData.purchasePrice)
    });
  };

  return (
    <Modal
      title="Restock Inventory"
      onClose={onClose}
      size="md"
      icon={<RefreshCw className="w-4 h-4" />}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Update Stock
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Active Item</p>
            <p className="text-lg font-black text-foreground leading-tight">{item.name}</p>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Current Stock: <span className="font-bold text-foreground">{item.currentStock} {item.unit}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Restock Qty *">
              <div className="relative">
                <Package className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="number" required min="1" value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </FormField>
            <FormField label="Purchase Rate (₹) *">
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="number" required min="0" value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none text-right" />
              </div>
            </FormField>
          </div>

          <FormField label="Supplier *">
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" required value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Invoice No. *">
              <div className="relative">
                <FileText className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" required value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none" placeholder="INV-00X" />
              </div>
            </FormField>
            <FormField label="Restock Date *">
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="date" required value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </FormField>
          </div>
        </form>
      </div>
    </Modal>
  );
}
