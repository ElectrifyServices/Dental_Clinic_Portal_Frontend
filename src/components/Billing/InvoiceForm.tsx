import React, { useState, useMemo } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  User,
  Calendar,
  DollarSign,
  ClipboardList,
  Check
} from "lucide-react";
import { Invoice, InvoiceItem } from "../../types";

interface InvoiceFormProps {
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => void;
  invoice?: Invoice;
  patients: any[];
  treatments: any[];
  consultations: any[];
  corporatePlans: any[];
}

export function InvoiceForm({
  onClose,
  onSave,
  invoice,
  patients,
  treatments = [],
  consultations = [],
  corporatePlans = []
}: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    patientName: invoice?.patientName || "",
    patientId: (invoice as any)?.patientId || "",
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
    linkedItemIds: (invoice as any)?.linkedItemIds || [] as string[]
  });

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || [
      { id: "1", description: "", quantity: 1, rate: 0, amount: 0 },
    ],
  );

  // Corporate Detection
  const activeCorporatePlan = useMemo(() => {
    if (!formData.patientName) return null;
    const patient = patients.find(p => p.name === formData.patientName || p.id === formData.patientId);
    if (patient?.companyId) {
      return corporatePlans.find(cp => cp.id === patient.companyId);
    }
    return null;
  }, [formData.patientName, formData.patientId, patients, corporatePlans]);

  // Unified Billing: Find pending (unbilled) items for the selected patient
  const pendingItems = useMemo(() => {
    if (!formData.patientName) return [];

    const patientTreatments = treatments.filter(t => 
      t.patientName === formData.patientName && 
      (t.status === 'completed' || t.status === 'in-progress') && 
      !t.isBilled
    );

    const patientConsultations = consultations.filter(c => 
      c.patientName === formData.patientName && 
      !c.isBilled
    );

    const list: any[] = [];

    patientConsultations.forEach(c => {
      const isFree = activeCorporatePlan?.freeConsultation;
      list.push({
        id: c.id,
        type: 'consultation',
        description: `Consultation Fee (${new Date(c.consultationDate || c.date).toLocaleDateString('en-IN')})` + (isFree ? ' [CORPORATE FREE]' : ''),
        rate: isFree ? 0 : 500, // Corporate plan may offer free consultations
        date: c.consultationDate || c.date
      });
    });

    patientTreatments.forEach(t => {
      // Check for unbilled sessions
      if (Array.isArray(t.sessions)) {
        t.sessions.forEach((s: any) => {
          if ((s.status === 'completed' || s.status === 'in-progress') && !s.isBilled) {
            list.push({
              id: `${t.id}-${s.id}`,
              type: 'treatment-session',
              description: `${t.procedure} - Session ${s.sessionNumber}`,
              rate: s.cost || 0,
              date: s.scheduledDate || s.date,
              originalTreatmentId: t.id,
              originalSessionId: s.id
            });
          }
        });
      } else if (!t.isBilled) {
        // Fallback for treatments without sessions
        list.push({
          id: t.id,
          type: 'treatment',
          description: t.procedure,
          rate: t.cost || 0,
          date: t.date
        });
      }
    });

    return list;
  }, [formData.patientName, treatments, consultations]);

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

  const removePendingItem = (itemId: string) => {
     setFormData(prev => ({
       ...prev,
       linkedItemIds: prev.linkedItemIds.filter(id => id !== itemId)
     }));
     // Also remove from items list if it was added
     setItems(prev => prev.filter(item => (item as any).linkedId !== itemId));
  };

  const addPendingItemToInvoice = (pItem: any) => {
    if (formData.linkedItemIds.includes(pItem.id)) return;

    const newItem: InvoiceItem = {
      id: `linked-${Date.now()}-${pItem.id}`,
      description: pItem.description,
      quantity: 1,
      rate: pItem.rate,
      amount: pItem.rate,
      linkedId: pItem.id // Custom field to track linked items
    } as any;

    // Remove first empty item if it exists
    if (items.length === 1 && !items[0].description && items[0].rate === 0) {
      setItems([newItem]);
    } else {
      setItems([...items, newItem]);
    }

    setFormData(prev => ({
      ...prev,
      linkedItemIds: [...prev.linkedItemIds, pItem.id]
    }));
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(i => i.id === id);
    if ((itemToRemove as any)?.linkedId) {
      setFormData(prev => ({
        ...prev,
        linkedItemIds: prev.linkedItemIds.filter(lid => lid !== (itemToRemove as any).linkedId)
      }));
    }
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
      patientId: formData.patientId || Date.now().toString(),
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
                {invoice ? "Edit Invoice" : "Create Unified Invoice"}
              </h2>
              <p className="text-gray-600 mt-1">
                Combine consultations and treatments into one professional bill
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
                  const corpPlan = patient?.companyId ? corporatePlans.find(cp => cp.id === patient.companyId) : null;
                  setFormData({ 
                    ...formData, 
                    patientName: e.target.value,
                    patientId: patient?.id || '',
                    linkedItemIds: [], // Reset linked items when patient changes
                    discount: corpPlan ? corpPlan.discountPercent : (patient?.defaultDiscount || 0)
                  });
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

            {/* CORPORATE DETECTION BANNER */}
            {activeCorporatePlan && (
              <div className="md:col-span-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">Corporate Plan: {activeCorporatePlan.name}</p>
                  <p className="text-xs text-indigo-700 font-medium">
                    {activeCorporatePlan.discountPercent}% Discount & {activeCorporatePlan.freeConsultation ? 'Free Consultation' : 'Standard Billing'} rules applied.
                  </p>
                </div>
              </div>
            )}

            {/* STAFF/FAMILY DETECTION BANNER - KEEPING AS REQUESTED */}
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

            {/* UNBILLED ITEMS SECTION - NEW */}
            {formData.patientName && pendingItems.length > 0 && (
              <div className="col-span-1 md:col-span-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-indigo-900 font-bold flex items-center">
                    <ClipboardList className="w-5 h-5 mr-2 text-indigo-600" />
                    Unbilled Consultations & Treatments
                  </h3>
                  <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {pendingItems.length} PENDING
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pendingItems.map((pItem) => {
                    const isSelected = formData.linkedItemIds.includes(pItem.id);
                    return (
                      <div 
                        key={pItem.id}
                        className={`p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                          isSelected ? 'bg-indigo-600 border-indigo-700 shadow-md' : 'bg-white border-indigo-100 hover:border-indigo-300'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {pItem.type.replace('-', ' ')}
                            </span>
                            <span className={`text-xs font-mono ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                              {new Date(pItem.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className={`text-sm font-bold leading-tight mb-2 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                            {pItem.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-indigo-700'}`}>
                            ₹{pItem.rate.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => isSelected ? removePendingItem(pItem.id) : addPendingItemToInvoice(pItem)}
                            className={`p-1.5 rounded-lg transition-all ${
                              isSelected ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            }`}
                          >
                            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-indigo-600 mt-3 italic">
                  * Click the plus button to add these pending records directly to today's bill.
                </p>
              </div>
            )}

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
                Add Custom Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-4 items-end p-4 rounded-xl border transition-all ${
                    (item as any).linkedId ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service/Description
                    </label>
                    <div className="space-y-2">
                      {(item as any).linkedId ? (
                         <div className="w-full px-3 py-2 bg-indigo-100 text-indigo-900 rounded-lg font-bold text-sm flex items-center">
                            <Check className="w-4 h-4 mr-2" />
                            {item.description}
                         </div>
                      ) : (
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
                      )}
                      {item.description === "custom" && !(item as any).linkedId && (
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
                      readOnly={!!(item as any).linkedId}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "rate",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${(item as any).linkedId ? 'bg-indigo-100 cursor-not-allowed' : ''}`}
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

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
                   Add items from the list above or click "Add Custom Item"
                </div>
              )}
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
                    discount: e.target.checked ? 100 : 0,
                    tax: e.target.checked ? 0 : 18
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
              Save & Finalize Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
