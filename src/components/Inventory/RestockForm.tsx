import React, { useState } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { Modal, Button, SectionRenderer } from '@/components/ui';
import { useFormConfig, useFormTitle, useSubmitLabel } from '../../hooks/useFormConfig';

interface RestockFormProps {
  item: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function RestockForm({ item, onClose, onSave }: RestockFormProps) {
  const cfg         = useFormConfig('restock');
  const formTitle   = useFormTitle('restock', 'create');
  const submitLabel = useSubmitLabel('restock', 'create');

  const [formData, setFormData] = useState({
    quantity: 1,
    purchasePrice: item.cost || 0,
    supplier: item.supplier || '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...item,
      currentStock: item.currentStock + Number(formData.quantity),
      lastRestocked: formData.date,
      supplier: formData.supplier,
      cost: Number(formData.purchasePrice),
    });
  };

  const restockSection = cfg.sections?.find(s => s.id === 'restockDetails');

  return (
    <Modal
      title={formTitle}
      onClose={onClose}
      size="md"
      icon={<RefreshCw className="w-4 h-4" />}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <RefreshCw className="w-4 h-4" /> {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Item summary banner */}
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Active Item</p>
            <p className="text-lg font-black text-foreground leading-tight">{item.name}</p>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Current Stock: <span className="font-bold text-foreground">{item.currentStock} {item.unit}</span>
            </p>
          </div>
        </div>

        {/* All restock fields from JSON config */}
        <form onSubmit={handleSubmit}>
          {restockSection && (
            <SectionRenderer
              section={restockSection}
              values={formData}
              onChange={handleChange}
              cols={2}
            />
          )}
        </form>
      </div>
    </Modal>
  );
}
