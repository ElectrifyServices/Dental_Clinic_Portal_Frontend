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
                    <p className={`text-xs font-bold leading-tight mb-1.5 ${isSelected ? textSelected : textDefault}`}>
                      {pItem.description}
                    </p>
                    {pItem.doctor_name && (
                      <p className={`text-[10px] mb-1.5 ${isSelected ? docSelected : docDefault}`}>
                        Doctor: {pItem.doctor_name}
                      </p>
                    )}

                    {/* Benefit Details Breakdown */}
                    {pItem.rawItem && (
                      <div className={`mt-2 pt-2 border-t text-[10px] space-y-1 ${
                        isSelected ? 'border-white/10 text-indigo-100' : 'border-border/50 text-muted-foreground'
                      }`}>
                        {/* Original amount */}
                        {pItem.rawItem.original_amount !== undefined && pItem.rawItem.original_amount !== pItem.rate && (
                          <div className="flex justify-between items-center">
                            <span>Original Cost:</span>
                            <span className={`font-semibold line-through font-mono ${isSelected ? 'text-white' : 'text-foreground/70'}`}>
                              ₹{pItem.rawItem.original_amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        
                        {/* Discount */}
                        {pItem.rawItem.plan_discount_amount > 0 && (
                          <div className="flex justify-between items-center">
                            <span>Discount ({pItem.rawItem.plan_discount_value}{pItem.rawItem.plan_discount_type === 'PERCENTAGE' ? '%' : '₹'}):</span>
                            <span className={`font-mono font-semibold ${isSelected ? 'text-white' : 'text-rose-600'}`}>
                              -₹{pItem.rawItem.plan_discount_amount.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Already Paid amount */}
                        {pItem.rawItem.already_paid > 0 && (
                          <div className="flex justify-between items-center">
                            <span>Already Paid:</span>
                            <span className={`font-mono font-semibold ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                              -₹{pItem.rawItem.already_paid.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Pending amount */}
                        {pItem.rawItem.pending_amount > 0 && pItem.rawItem.pending_amount !== pItem.rate && (
                          <div className="flex justify-between items-center">
                            <span>Pending Amount:</span>
                            <span className={`font-mono font-semibold ${isSelected ? 'text-white' : 'text-foreground/85'}`}>
                              ₹{pItem.rawItem.pending_amount.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Membership Benefit applied */}
                        {pItem.rawItem.benefit_applied && (
                          <div className={`p-1.5 rounded flex flex-col gap-0.5 mt-1 ${
                            isSelected 
                              ? 'bg-white/10 text-white border border-white/5' 
                              : 'bg-amber-50/80 text-amber-900 border border-amber-100/60'
                          }`}>
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="truncate max-w-[150px]" title={pItem.rawItem.benefit_name || pItem.rawItem.benefit_applied}>
                                🌟 {pItem.rawItem.benefit_name || pItem.rawItem.benefit_applied}
                              </span>
                              {pItem.rawItem.membership_discount_amount > 0 && (
                                <span className="font-mono text-amber-700 dark:text-amber-200">-₹{pItem.rawItem.membership_discount_amount.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-indigo-200/20">
                    <div className="flex flex-col">
                      <span className={`text-[8px] uppercase tracking-wider font-bold ${isSelected ? 'text-emerald-100/70' : 'text-muted-foreground/70'}`}>
                        Net Payable
                      </span>
                      <span className={`text-sm font-extrabold ${isSelected ? rateSelected : rateDefault}`}>
                        ₹{(pItem.rate ?? 0).toLocaleString()}
                      </span>
                    </div>
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
