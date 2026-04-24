import React, { useState } from "react";
import { X, Smartphone, Wallet, Landmark, CheckCircle2 } from "lucide-react";

interface InvoicePaymentModalProps {
  invoice: any;
  onClose: () => void;
  onConfirm: (method: string) => void;
}

export function InvoicePaymentModal({
  invoice,
  onClose,
  onConfirm,
}: InvoicePaymentModalProps) {
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  const amount = invoice.total ?? invoice.amount ?? 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Pay Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 font-medium mb-1">Total Amount</p>
              <h3 className="text-3xl font-bold text-gray-900">
                ₹{amount.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {invoice.id} - {invoice.patientName}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Cash", "UPI", "Bank"].map((m) => (
                  <label
                    key={m}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      method === m
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      name="paymentMethod"
                      value={m}
                      checked={method === m}
                      onChange={() => setMethod(m)}
                    />
                    <span
                      className={`text-sm font-bold ${
                        method === m ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {m}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a payment note..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(method)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-all"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
