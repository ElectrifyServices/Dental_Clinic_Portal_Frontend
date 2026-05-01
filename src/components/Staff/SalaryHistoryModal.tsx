import React from 'react';
import { X, Calendar, IndianRupee, CreditCard, Clock } from 'lucide-react';

interface SalaryHistoryModalProps {
  staffName: string;
  history: any[];
  onClose: () => void;
}

export function SalaryHistoryModal({ staffName, history, onClose }: SalaryHistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-xl overflow-hidden border border-gray-200">
        {/* Brand Gradient Header */}
        <div className="modal-header bg-blue-600 rounded-t-2xl">
          <div>
            <h2 className="font-bold text-white tracking-tight">Salary History</h2>
            <p className="text-xs text-white/80 font-medium">{staffName}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm italic">
              No transactions found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((payment, index) => (
                <div key={index} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <IndianRupee className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">₹{payment.amount.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                          <Calendar className="w-3 h-3" />
                          {new Date(payment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-widest">
                        {payment.mode}
                      </div>
                    </div>
                  </div>
                  {payment.note && (
                    <div className="ml-11 text-xs text-gray-500 italic mt-1">
                      {payment.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 font-bold text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
