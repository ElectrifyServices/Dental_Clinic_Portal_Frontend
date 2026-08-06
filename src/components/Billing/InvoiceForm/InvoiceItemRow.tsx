import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { InvoiceItem } from '../../../types';
import {
  Button,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { ServiceDescriptionSelect } from './ServiceDescriptionSelect';
import { sanitizeNumericString } from '@/utils/inputUtils';

interface InvoiceItemRowProps {
  item: InvoiceItem;
  onUpdate: (id: string, field: keyof InvoiceItem, value: any) => void;
  onRemove: (id: string) => void;
}

export const InvoiceItemRow: React.FC<InvoiceItemRowProps> = ({ 
  item, 
  onUpdate, 
  onRemove 
}) => {
  const isLinked = !!(item as any).linkedId;

  return (
    <div className={`grid grid-cols-12 gap-3 items-end p-3 rounded-xl border transition-all ${
      isLinked ? 'bg-indigo-50 border-indigo-100' : 'bg-muted/30 border-border/50 hover:border-border'
    }`}>
      <div className="col-span-12 md:col-span-6">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Service Description</Label>
        {isLinked ? (
          <div className="w-full px-3 h-10 bg-indigo-100 text-indigo-900 rounded-lg font-bold text-sm flex items-center border border-indigo-200">
            <Check className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{item.description}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <ServiceDescriptionSelect
              value={item.description || ''}
              onChange={(name, rate, billingDescriptionId) => {
                onUpdate(item.id, 'description', name);
                if (billingDescriptionId) {
                  onUpdate(item.id, 'billing_description_id' as any, billingDescriptionId);
                }
                if (rate !== undefined && rate > 0) {
                  onUpdate(item.id, 'rate', rate);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Qty field hidden as per request
      <div className="col-span-3 md:col-span-2">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Qty</Label>
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={e => onUpdate(item.id, 'quantity', parseInt(e.target.value) || 1)}
          className="w-full px-3 h-10 bg-card border border-border rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>
      */}

      <div className="col-span-4 md:col-span-3">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Paid (₹)</Label>
        <Input
          type="number"
          value={item.rate}
          onFocus={e => e.target.select()}
          onChange={e => {
            const valStr = sanitizeNumericString(e.target.value);
            e.target.value = valStr;
            const val = parseFloat(valStr);
            onUpdate(item.id, 'rate', isNaN(val) ? 0 : Math.max(0, val));
          }}
          className="w-full px-3 h-10 border rounded-lg text-sm font-bold text-right outline-none bg-card border-border focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="col-span-4 md:col-span-2">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Total (₹)</Label>
        <div className="w-full px-3 h-10 flex items-center justify-end bg-muted/50 border border-border/50 rounded-lg text-sm font-black text-foreground">
          {(item.amount || 0).toLocaleString()}
        </div>
      </div>

      <div className="col-span-1 flex items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onRemove(item.id)}
          className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all"
          title="Remove Item"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
