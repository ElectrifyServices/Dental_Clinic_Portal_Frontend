import React from 'react';
import { ClipboardList, Check, Plus } from 'lucide-react';

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
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
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
            <div 
              key={pItem.id}
              className={`p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected ? 'bg-indigo-600 border-indigo-700 shadow-md' : 'bg-white border-indigo-100 hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {pItem.type.replace('-', ' ')}
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                    {new Date(pItem.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <p className={`text-xs font-bold leading-tight mb-2 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                  {pItem.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-indigo-700'}`}>
                  ₹{pItem.rate.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => isSelected ? onRemove(pItem.id) : onAdd(pItem)}
                  className={`p-1.5 rounded-lg transition-all ${
                    isSelected ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
