import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { InvoiceItem } from '../../../types';

interface InvoiceItemRowProps {
  item: InvoiceItem;
  commonServices: any[];
  onUpdate: (id: string, field: keyof InvoiceItem, value: any) => void;
  onRemove: (id: string) => void;
}

export const InvoiceItemRow: React.FC<InvoiceItemRowProps> = ({ 
  item, 
  commonServices, 
  onUpdate, 
  onRemove 
}) => {
  const isLinked = !!(item as any).linkedId;

  return (
    <div className={`grid grid-cols-12 gap-3 items-end p-3 rounded-xl border transition-all ${
      isLinked ? 'bg-indigo-50 border-indigo-100' : 'bg-muted/30 border-border/50 hover:border-border'
    }`}>
      <div className="col-span-12 md:col-span-5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Service Description</label>
        {isLinked ? (
          <div className="w-full px-3 py-2 bg-indigo-100 text-indigo-900 rounded-lg font-bold text-sm flex items-center border border-indigo-200">
            <Check className="w-4 h-4 mr-2" />
            {item.description}
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={commonServices.some(s => s.name === item.description) ? item.description : (item.description ? 'custom' : '')}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  onUpdate(item.id, 'description', '');
                } else {
                  const s = commonServices.find(s => s.name === value);
                  onUpdate(item.id, 'description', value);
                  if (s) onUpdate(item.id, 'rate', s.rate);
                }
              }}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Select Service</option>
              {commonServices.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              <option value="custom">Custom Service...</option>
            </select>
            {(!commonServices.some(s => s.name === item.description) && !isLinked) && (
              <input
                type="text"
                placeholder="Enter custom service description"
                value={item.description}
                onChange={e => onUpdate(item.id, 'description', e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            )}
          </div>
        )}
      </div>

      <div className="col-span-3 md:col-span-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Qty</label>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={e => onUpdate(item.id, 'quantity', parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <div className="col-span-4 md:col-span-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Rate (₹)</label>
        <input
          type="number"
          value={item.rate}
          readOnly={isLinked}
          onChange={e => onUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)}
          className={`w-full px-3 py-2 border rounded-lg text-sm font-bold text-right outline-none ${
            isLinked ? 'bg-indigo-100 border-indigo-200 text-indigo-900 cursor-not-allowed' : 'bg-card border-border focus:ring-2 focus:ring-primary/20'
          }`}
        />
      </div>

      <div className="col-span-4 md:col-span-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Total (₹)</label>
        <div className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm font-black text-right text-foreground">
          {(item.amount || 0).toLocaleString()}
        </div>
      </div>

      <div className="col-span-1 text-center pb-1">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="p-2 text-red-500 hover:bg-destructive/10 rounded-lg transition-all"
          title="Remove Item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
