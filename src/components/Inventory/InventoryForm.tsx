import React, { useState } from 'react';
import { Save, Package, DollarSign, Calendar, AlertTriangle, Hash, ClipboardList } from 'lucide-react';
import { Modal, Button, FormField } from '@/components/ui';

interface InventoryFormProps {
  onClose: () => void;
  onSave: (item: any) => void;
  item?: any;
}

const CATEGORIES = [
  { value: 'instruments', label: 'Instruments' },
  { value: 'materials', label: 'Materials' },
  { value: 'consumables', label: 'Consumables' },
  { value: 'medicines', label: 'Medicines' }
];

const UNITS = ['pieces', 'boxes', 'tubes', 'vials', 'bottles', 'packets', 'kg', 'grams', 'liters', 'ml'];

const SUPPLIERS = [
  'DentalCorp India', 'MedSupply Solutions', 'SafetyFirst Medical', 
  'PharmaCare Dental', 'ImageTech Supplies', 'Precision Instruments', 'BioMed Supplies'
];

export function InventoryForm({ onClose, onSave, item }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'instruments',
    currentStock: item?.currentStock || 0,
    minStock: item?.minStock || 0,
    maxStock: item?.maxStock || 100,
    unit: item?.unit || 'pieces',
    supplier: item?.supplier || '',
    cost: item?.cost || 0,
    expiryDate: item?.expiryDate || '',
    batchNumber: item?.batchNumber || '',
    description: item?.description || '',
    warranty: item?.warranty || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: item?.id || Date.now().toString(),
      lastRestocked: item?.lastRestocked || new Date().toISOString().split('T')[0],
      currentStock: Number(formData.currentStock),
      minStock: Number(formData.minStock),
      maxStock: Number(formData.maxStock),
      cost: Number(formData.cost)
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      title={item ? 'Edit Inventory Item' : 'Add New Item'}
      onClose={onClose}
      size="xl"
      icon={<Package className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" /> {item ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Item Name *" required>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. Dental Mirror No. 4" />
          </FormField>

          <FormField label="Category *">
            <select name="category" value={formData.category} onChange={handleChange} required
              className="w-full px-4 py-2 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>

          <FormField label="Current Stock *">
            <div className="relative">
              <input type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} required min="0"
                className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">{formData.unit}</div>
            </div>
          </FormField>

          <FormField label="Min Stock Alert *">
            <div className="relative">
              <AlertTriangle className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
              <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} required min="0"
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none border-amber-100 bg-amber-50/30" />
            </div>
          </FormField>

          <FormField label="Maximum Capacity">
            <input type="number" name="maxStock" value={formData.maxStock} onChange={handleChange} min="0"
              className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
          </FormField>

          <FormField label="Unit Type *">
            <select name="unit" value={formData.unit} onChange={handleChange} required
              className="w-full px-4 py-2 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </FormField>

          <FormField label="Supplier">
            <select name="supplier" value={formData.supplier} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="">Select Supplier</option>
              {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>

          <FormField label="Unit Cost (₹)">
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="number" name="cost" value={formData.cost} onChange={handleChange} min="0" step="0.01"
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </FormField>

          <FormField label="Expiry Date">
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </FormField>

          <FormField label="Batch / Lot Number">
            <div className="relative">
              <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none" placeholder="BT-00X" />
            </div>
          </FormField>
        </div>

        <FormField label="Item Description">
          <textarea name="description" value={formData.description} onChange={handleChange} rows={2}
            className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            placeholder="Technical details, usage notes, or storage instructions..." />
        </FormField>

        {formData.currentStock <= formData.minStock && formData.currentStock > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Warning: Item will reach critical level soon</p>
          </div>
        )}

        <FormField label="Warranty / Guarantee">
          <div className="relative">
            <ClipboardList className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" name="warranty" value={formData.warranty} onChange={handleChange}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. 1 Year Manufacturer Warranty" />
          </div>
        </FormField>
      </form>
    </Modal>
  );
}