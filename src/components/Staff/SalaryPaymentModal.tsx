import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface SalaryPaymentModalProps {
  staffId: string;
  staffName: string;
  pendingAmount: number;
  onClose: () => void;
  onSave: (paymentData: any) => void;
}

export function SalaryPaymentModal({ staffId, staffName, pendingAmount, onClose, onSave }: SalaryPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: pendingAmount.toString(),
    date: new Date().toISOString().split('T')[0],
    mode: 'Cash',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      staffId,
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Pay Salary</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 font-medium mb-1">Disbursement For</p>
              <h3 className="text-xl font-bold text-gray-900">{staffName}</h3>
              <p className="text-xs text-gray-500 mt-1">Pending: ₹{pendingAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <select
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                  >
                    <option value="">Select Amount</option>
                    {pendingAmount > 0 && <option value={pendingAmount}>Full Pending (₹{pendingAmount.toLocaleString('en-IN')})</option>}
                    {[5000, 10000, 15000, 20000, 25000, 30000, 50000].map(amt => (
                      <option key={amt} value={amt}>₹{amt.toLocaleString('en-IN')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {['Cash', 'UPI', 'Bank'].map((m) => (
                  <label 
                    key={m}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.mode === m 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      className="hidden" 
                      name="paymentMethod" 
                      value={m}
                      checked={formData.mode === m}
                      onChange={() => setFormData({ ...formData, mode: m })}
                    />
                    <span className={`text-sm font-bold ${formData.mode === m ? 'text-blue-600' : 'text-gray-600'}`}>{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Note (Optional)</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Disbursement details..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
