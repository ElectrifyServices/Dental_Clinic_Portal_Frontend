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
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Service Description</Label>
        {isLinked ? (
          <div className="w-full px-3 py-2 bg-indigo-100 text-indigo-900 rounded-lg font-bold text-sm flex items-center border border-indigo-200">
            <Check className="w-4 h-4 mr-2" />
            {item.description}
          </div>
        ) : (
          <div className="space-y-2">
            <Select
              value={commonServices.some(s => s.name === item.description) ? item.description : (item.description ? 'custom' : '')}
              onValueChange={(value) => {
                if (value === 'custom') {
                  onUpdate(item.id, 'description', '');
                } else {
                  const s = commonServices.find(s => s.name === value);
                  onUpdate(item.id, 'description', value);
                  if (s) onUpdate(item.id, 'rate', s.rate);
                }
              }}
            >
              <SelectTrigger className="w-full rounded-lg text-sm">
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {commonServices.map(s => (
                  <SelectItem key={s.id || s.name} value={s.name}>{s.name}</SelectItem>
                ))}
                <SelectItem value="custom">Custom Service...</SelectItem>
              </SelectContent>
            </Select>
            {(!commonServices.some(s => s.name === item.description) && !isLinked) && (
              <Input
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
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Qty</Label>
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={e => onUpdate(item.id, 'quantity', parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <div className="col-span-4 md:col-span-2">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Rate (₹)</Label>
        <Input
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
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Total (₹)</Label>
        <div className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm font-black text-right text-foreground">
          {(item.amount || 0).toLocaleString()}
        </div>
      </div>

      <div className="col-span-1 text-center pb-1">
        <Button
          type="button"
          onClick={() => onRemove(item.id)}
          className="p-2 text-red-500 hover:bg-destructive/10 rounded-lg transition-all"
          title="Remove Item"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
