import React, { useState } from 'react';
import { Save, Package, AlertTriangle } from 'lucide-react';
import { Modal, Button, SectionRenderer } from '@/components/ui';
import { useFormConfig, useFormTitle, useSubmitLabel } from '../../hooks/useFormConfig';
import styles from './inventory.module.css';

interface InventoryFormProps {
  onClose: () => void;
  onSave: (item: any) => void;
  item?: any;
}

export function InventoryForm({ onClose, onSave, item }: InventoryFormProps) {
  const cfg         = useFormConfig('inventory');
  const formTitle   = useFormTitle('inventory', item ? 'edit' : 'create');
  const submitLabel = useSubmitLabel('inventory', item ? 'edit' : 'create');
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'instruments',
    description: item?.description || '',
    currentStock: item?.currentStock ?? 0,
    minStock: item?.minStock ?? 0,
    maxStock: item?.maxStock ?? 100,
    unit: item?.unit || 'pieces',
    warranty: item?.warranty || '',
    supplier: item?.supplier || '',
    cost: item?.cost ?? 0,
    expiryDate: item?.expiryDate || '',
    batchNumber: item?.batchNumber || '',
  });

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: item?.id || Date.now().toString(),
      lastRestocked: item?.lastRestocked || new Date().toISOString().split('T')[0],
      currentStock: Number(formData.currentStock),
      minStock: Number(formData.minStock),
      maxStock: Number(formData.maxStock),
      cost: Number(formData.cost),
    });
  };

  const basicSection    = cfg.sections?.find(s => s.id === 'basicInfo');
  const stockSection    = cfg.sections?.find(s => s.id === 'stockInfo');
  const purchaseSection = cfg.sections?.find(s => s.id === 'purchaseInfo');

  return (
    <Modal
      title={formTitle}
      onClose={onClose}
      size="xl"
      icon={<Package className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" /> {submitLabel}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info section — name, category, description */}
        {basicSection && (
          <>
            <p className={styles.sectionHeading}>{basicSection.title}</p>
            <SectionRenderer section={basicSection} values={formData} onChange={handleChange} cols={2} />
          </>
        )}

        {/* Stock Info section */}
        {stockSection && (
          <>
            <p className={styles.sectionHeading}>{stockSection.title}</p>
            <SectionRenderer section={stockSection} values={formData} onChange={handleChange} cols={3} />
          </>
        )}

        {/* Low-stock warning */}
        {Number(formData.currentStock) <= Number(formData.minStock) && Number(formData.currentStock) > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">
              Warning: Item will reach critical level soon
            </p>
          </div>
        )}

        {/* Purchase Info section */}
        {purchaseSection && (
          <>
            <p className={styles.sectionHeading}>{purchaseSection.title}</p>
            <SectionRenderer section={purchaseSection} values={formData} onChange={handleChange} cols={3} />
          </>
        )}

      </form>
    </Modal>
  );
}