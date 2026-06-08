import React, { useState } from 'react';
import { Save, IndianRupee, Calendar, ClipboardList } from 'lucide-react';
import { Modal, Button, LabeledField } from '@/components/ui';

interface SalaryPaymentModalProps {
  staffId: string;
  staffName: string;
  pendingAmount: number;
  onClose: () => void;
  onSave: (paymentData: any) => void;
}

import { usePaySalaryMutation } from '../../hooks/staff/usePaySalaryMutation';

import { useModal } from '@/contexts/ModalContext';

export function SalaryPaymentModal({ staffId, staffName, pendingAmount, onClose, onSave }: SalaryPaymentModalProps) {
  const { showToast } = useModal();
  const [formData, setFormData] = useState({
    amount: pendingAmount.toString(),
    date: new Date().toISOString().split('T')[0],
    mode: 'Cash',
    note: ''
  });

  const paySalaryMutation = usePaySalaryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await paySalaryMutation.mutateAsync({
        staff_id: staffId,
        payment_amount: parseFloat(formData.amount),
        payment_date: formData.date,
        payment_mode: formData.mode.toUpperCase(),
        disbursement_note: formData.note
      });

      const backendData = res?.responseObject?.data || res?.data || {};

      onSave({
        staffId,
        ...formData,
        amount: parseFloat(formData.amount),
        pending_dues: backendData.pending_dues,
        base_salary: backendData.base_salary,
      });
    } catch (err: any) {
      console.error("Failed to pay salary", err);
      let errMsg = "Failed to record salary payment.";
      const resData = err.response?.data || err;

      if (resData?.responseStatusList?.statusList?.[0]?.statusDesc) {
        errMsg = resData.responseStatusList.statusList[0].statusDesc;
      } else if (resData?.status?.statusDesc) {
        errMsg = resData.status.statusDesc;
      } else if (resData?.message) {
        errMsg = resData.message;
      } else if (typeof resData === 'string') {
        errMsg = resData;
      }

      showToast(errMsg, 'error');
    }
  };

  return (
    <Modal
      title="Pay Salary"
      onClose={onClose}
      size="md"
      icon={<IndianRupee className="w-4 h-4" />}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" /> Save Payment
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Disbursement For</p>
            <p className="text-lg font-black text-foreground leading-tight">{staffName}</p>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Pending Dues: ₹{pendingAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <LabeledField label="Payment Amount (₹)" required>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                  <option value="">Select Amount</option>
                  {pendingAmount > 0 && <option value={pendingAmount}>Full Due (₹{pendingAmount.toLocaleString('en-IN')})</option>}
                  {[5000, 10000, 15000, 20000, 25000, 30000, 50000].map(amt => (
                    <option key={amt} value={amt}>₹{amt.toLocaleString('en-IN')}</option>
                  ))}
                </select>
              </div>
            </LabeledField>
            <LabeledField label="Payment Date" required>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </LabeledField>
          </div>

          <LabeledField label="Payment Mode">
            <div className="grid grid-cols-3 gap-3">
              {['Cash', 'UPI', 'Bank'].map((m) => (
                <label key={m} className={`flex items-center justify-center p-2.5 rounded-xl border-2 cursor-pointer transition-all ${formData.mode === m ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'}`}>
                  <input type="radio" className="hidden" name="paymentMethod" value={m} checked={formData.mode === m} onChange={() => setFormData({ ...formData, mode: m })} />
                  <span className="text-xs font-black uppercase tracking-wider">{m}</span>
                </label>
              ))}
            </div>
          </LabeledField>

          <LabeledField label="Disbursement Note (Optional)">
            <div className="relative">
              <ClipboardList className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
              <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Add transaction reference or specific notes..." rows={2}
                className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
            </div>
          </LabeledField>
        </form>
      </div>
    </Modal>
  );
}
