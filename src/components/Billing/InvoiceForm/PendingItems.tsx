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
            const isConsultation = pItem.type.toLowerCase().includes('consultation');
            
            // Color styles
            const selectedBg = isConsultation ? 'bg-blue-600 border-blue-700 text-white' : 'bg-emerald-600 border-emerald-700 text-white';
            const defaultBg = isConsultation ? 'bg-blue-50/50 border-blue-200 hover:border-blue-400' : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400';
            
            const badgeSelected = isConsultation ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white';
            const badgeDefault = isConsultation ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800';
            
            const dateSelected = isConsultation ? 'text-blue-100' : 'text-emerald-100';
            const dateDefault = 'text-muted-foreground/60';
            
            const textSelected = 'text-white';
            const textDefault = 'text-foreground';
            
            const docSelected = isConsultation ? 'text-blue-100' : 'text-emerald-100';
            const docDefault = 'text-muted-foreground';
            
            const rateSelected = 'text-white';
            const rateDefault = isConsultation ? 'text-blue-700' : 'text-emerald-700';
            
            const btnSelected = isConsultation ? 'bg-card text-blue-600 hover:bg-blue-50' : 'bg-card text-emerald-600 hover:bg-emerald-50';
            const btnDefault = isConsultation ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';

            return (
              <Card 
                key={pItem.id}
                className={`transition-all duration-200 flex flex-col justify-between overflow-hidden border shadow-sm ${
                  isSelected ? selectedBg : defaultBg
                }`}
              >
                <CardContent className="p-3 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isSelected ? badgeSelected : badgeDefault
                      }`}>
                        {pItem.type.replace('-', ' ')}
                      </span>
                      <span className={`text-[10px] font-mono ${isSelected ? dateSelected : dateDefault}`}>
                        {pItem.date ? new Date(pItem.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
                      </span>
                    </div>
                    <p className={`text-xs font-bold leading-tight mb-2 ${isSelected ? textSelected : textDefault}`}>
                      {pItem.description}
                    </p>
                    {pItem.doctor_name && (
                      <p className={`text-[10px] mb-2 ${isSelected ? docSelected : docDefault}`}>
                        Doctor: {pItem.doctor_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-xs font-bold ${isSelected ? rateSelected : rateDefault}`}>
                      ₹{pItem.rate.toLocaleString()}
                    </span>
                    <Button
                      type="button"
                      onClick={() => isSelected ? onRemove(pItem.id) : onAdd(pItem)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isSelected ? btnSelected : btnDefault
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
