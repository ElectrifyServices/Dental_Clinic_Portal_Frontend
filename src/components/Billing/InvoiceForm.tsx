import React, { useState } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Invoice, InvoiceItem } from "../../types";

interface InvoiceFormProps {
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => void;
  invoice?: Invoice;
  patients: any[];
}

export function InvoiceForm({
  onClose,
  onSave,
  invoice,
  patients,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    patientName: invoice?.patientName || "",
    doctor: (invoice as any)?.doctor || "",
    date: invoice?.date || new Date().toISOString().split("T")[0],
    dueDate:
      invoice?.dueDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    discount: invoice?.discount || 0,
    tax: invoice?.tax || 18,
    isComplimentary: (invoice as any)?.isComplimentary || false,
    complimentaryNote: (invoice as any)?.complimentaryNote || "",
  });

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || [
      { id: "1", description: "", quantity: 1, rate: 0, amount: 0 },
    ],
  );

  const doctors = [
    "Dr. Rajesh Sharma — General Dentistry",
    "Dr. Priya Patel — Orthodontics",
    "Dr. Amit Singh — Oral Surgery",
  ];

  const commonServices = [
    { name: "Consultation", rate: 500 },
    { name: "Teeth Cleaning", rate: 1500 },
    { name: "Dental Filling", rate: 2000 },
    { name: "Root Canal", rate: 5000 },
    { name: "Crown Fitting", rate: 8000 },
    { name: "Tooth Extraction", rate: 1000 },
    { name: "Orthodontic Treatment", rate: 3000 },
    { name: "Oral Surgery", rate: 10000 },
  ];

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * (updatedItem.rate || 0);
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = formData.isComplimentary ? subtotal : (subtotal * formData.discount) / 100;
  const taxAmount = formData.isComplimentary ? 0 : ((subtotal - discountAmount) * formData.tax) / 100;
  const total = formData.isComplimentary ? 0 : (subtotal - discountAmount + taxAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: invoice?.id || `INV-${Date.now()}`,
      patientId: (formData as any).patientId || invoice?.patientId || Date.now().toString(),
      items,
      subtotal,
      discount: formData.discount,
      tax: formData.tax,
      total: formData.isComplimentary ? 0 : total,
      status: formData.isComplimentary ? "complimentary" : (invoice?.status || "draft"),
      isComplimentary: formData.isComplimentary,
      complimentaryNote: formData.complimentaryNote,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {invoice ? "Edit Invoice" : "Create Invoice"}
              </h2>
              <p className="text-gray-600 mt-1">
                Generate professional invoices for treatments
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Patient Name *
              </label>
              <select
                value={formData.patientName}
                onChange={(e) => {
                  const patient = patients.find(p => p.name === e.target.value);
                  setFormData({ 
                    ...formData, 
                    patientName: e.target.value,
                    patientId: patient?.id || '' 
                  } as any);
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.name}>
                    {patient.name} ({patient.id}) {patient.category === 'family' ? '⭐' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              {formData.patientName && (() => {
                const p = patients.find(p => p.name === formData.patientName);
                if (p?.category === 'family' || p?.category === 'staff' || p?.category === 'complimentary') {
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                      <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-900">
                          {p.category.toUpperCase()} PATIENT DETECTED
                        </p>
                        <p className="text-xs text-amber-700">
                          This patient usually gets a {p.defaultDiscount || 100}% discount.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const discountVal = p.defaultDiscount !== undefined ? p.defaultDiscount : 100;
                          const isComp = discountVal === 100;
                          setFormData(prev => ({ 
                            ...prev, 
                            isComplimentary: isComp, 
                            discount: discountVal,
                            complimentaryNote: isComp ? `Waived - ${p.category.toUpperCase()} Benefit` : prev.complimentaryNote
                          }));
                        }}
                        className="ml-auto bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition-all"
                      >
                        {p.defaultDiscount === 100 || p.defaultDiscount === undefined 
                          ? 'Apply Complimentary Flow' 
                          : `Apply ${p.defaultDiscount}% Discount`}
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Doctor *
            </label>
            <select
              value={formData.doctor || ""}
              onChange={(e) =>
                setFormData({ ...formData, doctor: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center text-sm font-medium transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-xl"
                >
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service/Description
                    </label>
                    <div className="space-y-2">
                      <select
                        value={item.description}
                        onChange={(e) => {
                          const value = e.target.value;
                          const selectedService = commonServices.find(
                            (s) => s.name === value,
                          );
                          const rate = selectedService
                            ? selectedService.rate
                            : item.rate;
                          updateItem(item.id, "description", value);
                          updateItem(item.id, "rate", rate);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Service</option>
                        {commonServices.map((service) => (
                          <option key={service.name} value={service.name}>
                            {service.name}
                          </option>
                        ))}
                        <option value="custom">Custom Service</option>
                      </select>
                      {item.description === "custom" && (
                        <input
                          type="text"
                          placeholder="Enter custom service"
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "rate",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="text"
                      value={item.amount.toLocaleString()}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    />
                  </div>

                  <div className="col-span-1">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>



          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData.isComplimentary ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Complimentary Billing</h3>
                  <p className="text-xs text-blue-700">Mark this invoice as free/waived (₹0 Total)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isComplimentary}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isComplimentary: e.target.checked,
                    discount: e.target.checked ? 100 : prev.discount,
                    tax: e.target.checked ? 0 : prev.tax
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {formData.isComplimentary && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="Complimentary Note (e.g. Doctor's Family, Staff Benefit)"
                  value={formData.complimentaryNote}
                  onChange={(e) => setFormData(prev => ({ ...prev, complimentaryNote: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-blue-100 border-dashed">
                  <span className="text-sm font-medium text-blue-800">Final Amount Payable:</span>
                  <span className="text-xl font-black text-blue-900">₹0</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.isComplimentary ? 100 : formData.discount}
                    disabled={formData.isComplimentary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl ${formData.isComplimentary ? 'bg-gray-100 text-gray-500 cursor-not-allowed font-bold' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.isComplimentary ? 0 : formData.tax}
                    disabled={formData.isComplimentary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tax: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl ${formData.isComplimentary ? 'bg-gray-100 text-gray-500 cursor-not-allowed font-bold' : ''}`}
                  />
                </div>
              </div>

              <div className="space-y-3 text-right">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Discount ({formData.isComplimentary ? 100 : formData.discount}%):</span>
                  <span className="font-semibold text-red-600">
                    -₹{discountAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax ({formData.isComplimentary ? 0 : formData.tax}%):</span>
                  <span className="font-semibold text-gray-900">
                    ₹{taxAmount.toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between text-xl font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-blue-600">
                    ₹{(formData.isComplimentary ? 0 : total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
