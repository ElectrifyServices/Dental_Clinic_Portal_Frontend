import { Button } from "@/components/ui/Button";
import React from 'react';
import { ClipboardList, Check, Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui";

interface PendingItemsProps {
  pendingItems: any[];
  linkedItemIds: string[];
  onAdd: (item: any) => void;
  onRemove: (id: string) => void;
}

export const PendingItems: React.FC<PendingItemsProps> = ({ 
  pendingItems, 
  linkedItemIds, 
  onAdd, 
  onRemove 
}) => {
  if (pendingItems.length === 0) return null;

  return (
    <Card className="bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-indigo-900 font-bold flex items-center">
            <ClipboardList className="w-5 h-5 mr-2 text-indigo-600" />
            Unbilled Consultations & Treatments
          </h3>
          <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {pendingItems.length} PENDING
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pendingItems.map((pItem) => {
            const isSelected = linkedItemIds.includes(pItem.id);
            return (
              <Card 
                key={pItem.id}
                className={`transition-all duration-200 flex flex-col justify-between overflow-hidden border ${
                  isSelected ? 'bg-indigo-600 border-indigo-700 shadow-md text-white' : 'bg-card border-indigo-100 hover:border-indigo-300'
                }`}
              >
                <CardContent className="p-3 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {pItem.type.replace('-', ' ')}
                      </span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-100' : 'text-muted-foreground/60'}`}>
                        {pItem.date ? new Date(pItem.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
                      </span>
                    </div>
                    <p className={`text-xs font-bold leading-tight mb-2 ${isSelected ? 'text-white' : 'text-foreground'}`}>
                      {pItem.description}
                    </p>
                    {pItem.doctor_name && (
                      <p className={`text-[10px] mb-2 ${isSelected ? 'text-indigo-100' : 'text-muted-foreground'}`}>
                        Doctor: {pItem.doctor_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-indigo-700'}`}>
                      ₹{pItem.rate.toLocaleString()}
                    </span>
                    <Button
                      type="button"
                      onClick={() => isSelected ? onRemove(pItem.id) : onAdd(pItem)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isSelected ? 'bg-card text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
