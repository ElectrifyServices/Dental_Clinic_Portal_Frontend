import React, { useState, useRef } from 'react';
import {
  Building2,
  Users,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
  Search,
  X,
  CreditCard,
  Gift
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CorporatePlan {
  id: string;
  name: string;
  discountPercent: number;
  freeConsultation: boolean;
  creditLimit: number;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

interface BulkPatient {
  name: string;
  phone: string;
  email: string;
  gender: string;
  companyId: string;
}

interface CorporateManagementProps {
  corporatePlans: CorporatePlan[];
  onSavePlan: (plan: CorporatePlan) => void;
  onDeletePlan: (id: string) => void;
  onBulkAddPatients: (patients: BulkPatient[]) => void;
  corporateEmployees: any[];
  onDeleteEmployee: (name: string, email: string) => void;
  onUpdateEmployee: (oldName: string, oldEmail: string, updatedEmp: any) => void;
  onClose: () => void;
}

export function CorporateManagement({
  corporatePlans,
  onSavePlan,
  onDeletePlan,
  onBulkAddPatients,
  corporateEmployees,
  onDeleteEmployee,
  onUpdateEmployee,
  onClose
}: CorporateManagementProps) {
  const [activeTab, setActiveTab] = useState<'plans' | 'bulk'>('plans');
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CorporatePlan | null>(null);
  const [viewingEmployeesPlanId, setViewingEmployeesPlanId] = useState<string | null>(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<{name: string, email: string} | null>(null);
  const [tempEmpData, setTempEmpData] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Outside click for search suggestions
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bulk Import State
  const [bulkPatients, setBulkPatients] = useState<BulkPatient[]>([
    { name: '', phone: '', email: '', gender: 'male', companyId: '' }
  ]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const plan: CorporatePlan = {
      id: editingPlan?.id || `CORP-${Date.now()}`,
      name: formData.get('name') as string,
      discountPercent: parseInt(formData.get('discount') as string),
      freeConsultation: formData.get('freeConsultation') === 'on',
      creditLimit: parseInt(formData.get('creditLimit') as string) || 0,
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      status: 'active'
    };
    onSavePlan(plan);
    setShowPlanForm(false);
    setEditingPlan(null);
  };

  const handleBulkAddRow = () => {
    setBulkPatients([...bulkPatients, { name: '', phone: '', email: '', gender: 'male', companyId: selectedCompanyId }]);
  };

  const handleRemoveBulkRow = (index: number) => {
    const updated = [...bulkPatients];
    updated.splice(index, 1);
    setBulkPatients(updated);
  };

  const handleBulkChange = (index: number, field: keyof BulkPatient, value: string) => {
    const updated = [...bulkPatients];
    updated[index] = { ...updated[index], [field]: value };
    setBulkPatients(updated);
  };

  const checkDuplicate = (emp: BulkPatient) => {
    if (!emp.name || !emp.email) return false;
    const targetCompanyId = emp.companyId || selectedCompanyId;
    return corporateEmployees.some(existing => 
      existing.name.toLowerCase() === emp.name.toLowerCase() && 
      existing.email?.toLowerCase() === emp.email?.toLowerCase() &&
      existing.companyId === targetCompanyId
    );
  };

  const fuzzySearch = (text: string, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    if (t.includes(q)) return true;
    
    // Simple fuzzy: check if characters are present in order
    let i = 0;
    let j = 0;
    while (i < q.length && j < t.length) {
      if (q[i] === t[j]) i++;
      j++;
    }
    return i === q.length;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeSearchQuery && !recentSearches.includes(employeeSearchQuery)) {
      setRecentSearches(prev => [employeeSearchQuery, ...prev].slice(0, 5));
    }
    setShowSearchSuggestions(false);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      const rows = jsonData.slice(1); // Skip header row
      const importedPatients: BulkPatient[] = rows
        .map(cols => {
          if (!cols[0]) return null;
          return {
            name: String(cols[0] || '').trim(),
            phone: String(cols[1] || '').trim(),
            email: String(cols[2] || '').trim().toLowerCase(),
            gender: (String(cols[3] || 'male').toLowerCase().trim()) as any,
            companyId: selectedCompanyId
          };
        })
        .filter(p => p !== null && p.name !== '') as BulkPatient[];

      const newUniqueList = [...bulkPatients.filter(p => p.name !== '')];
      importedPatients.forEach(imp => {
        // We add everything now, let the table highlight duplicates
        newUniqueList.push(imp);
      });

      setBulkPatients(newUniqueList.length > 0 ? newUniqueList : [{ name: '', phone: '', email: '', gender: 'male', companyId: selectedCompanyId }]);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFinalBulkSubmit = () => {
    const validPatients = bulkPatients.filter(p => p.name && (p.phone || p.email));
    if (validPatients.length === 0) {
      alert("Please enter at least one employee with name and contact info.");
      return;
    }

    // Duplicate Check: Check if Name + Email combination already exists in master list
    const duplicates = validPatients.filter(newEmp => 
      corporateEmployees.some(existing => 
        existing.name.toLowerCase() === newEmp.name.toLowerCase() && 
        existing.email?.toLowerCase() === newEmp.email?.toLowerCase()
      )
    );

    if (duplicates.length > 0) {
      alert(`Duplicate entries detected for: ${duplicates.map(d => d.name).join(', ')}. These will be skipped.`);
    }

    const uniqueNewPatients = validPatients.filter(newEmp => 
      !corporateEmployees.some(existing => 
        existing.name.toLowerCase() === newEmp.name.toLowerCase() && 
        existing.email?.toLowerCase() === newEmp.email?.toLowerCase()
      )
    );

    if (uniqueNewPatients.length === 0) {
      alert("All entered employees already exist in the master list.");
      return;
    }

    // Assign company ID to all if not set individually
    const finalPatients = uniqueNewPatients.map(p => ({ ...p, companyId: p.companyId || selectedCompanyId }));
    onBulkAddPatients(finalPatients);
    onClose();
  };

  const downloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Phone,Email,Gender(male/female)\nJohn Doe,9876543210,john@example.com,male\nJane Smith,8765432109,jane@example.com,female";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bulk_patient_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-card rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Corporate Management</h2>
              <p className="text-sm text-muted-foreground font-medium">Manage company plans and bulk employee registration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-card rounded-xl transition-all text-muted-foreground/60 hover:text-muted-foreground shadow-sm border border-transparent hover:border-border">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 bg-card">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 relative ${activeTab === 'plans' ? 'text-indigo-600 border-indigo-600' : 'text-muted-foreground/60 border-transparent hover:text-muted-foreground'
              }`}
          >
            Corporate Plans
            {activeTab === 'plans' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 relative ${activeTab === 'bulk' ? 'text-indigo-600 border-indigo-600' : 'text-muted-foreground/60 border-transparent hover:text-muted-foreground'
              }`}
          >
            Bulk Employee Registration
            {activeTab === 'bulk' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/50">
          {activeTab === 'plans' ? (
            <div className="space-y-6">
              {!showPlanForm ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-foreground">Active Corporate Plans</h3>
                    <button
                      onClick={() => { setEditingPlan(null); setShowPlanForm(true); }}
                      className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-100"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Plan
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {corporatePlans.map(plan => (
                      <div key={plan.id} className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingPlan(plan); setShowPlanForm(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Plus className="w-4 h-4" /></button>
                            <button onClick={() => onDeletePlan(plan.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <h4 className="font-bold text-foreground text-lg mb-1">{plan.name}</h4>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">{plan.status}</span>
                          <span className="text-xs text-muted-foreground/60 font-medium">{plan.contactPerson}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-muted p-2 rounded-xl border border-border">
                            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase">Discount</p>
                            <p className="text-lg font-bold text-indigo-600">{plan.discountPercent}%</p>
                          </div>
                          <div className="bg-muted p-2 rounded-xl border border-border">
                            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase">Consultation</p>
                            <p className="text-lg font-bold text-emerald-600">{plan.freeConsultation ? 'FREE' : 'Paid'}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-4 mb-4">
                          <span className="flex items-center"><CreditCard className="w-3 h-3 mr-1" /> ₹{plan.creditLimit.toLocaleString()} Limit</span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" /> 
                            {corporateEmployees.filter(e => e.companyId === plan.id).length} Employees
                          </span>
                        </div>
                        <button 
                          onClick={() => setViewingEmployeesPlanId(plan.id)}
                          className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                        >
                          View Employee List
                        </button>
                      </div>
                    ))}
                    {corporatePlans.length === 0 && (
                      <div className="col-span-full py-12 text-center bg-card rounded-2xl border-2 border-dashed border-border">
                        <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No corporate plans created yet.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-8 shadow-sm max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-foreground">{editingPlan ? 'Edit Plan' : 'New Corporate Plan'}</h3>
                    <button onClick={() => setShowPlanForm(false)} className="text-muted-foreground/60 hover:text-muted-foreground"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleAddPlan} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Company Name</label>
                        <input name="name" defaultValue={editingPlan?.name} required className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. Google India" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Discount Percent (%)</label>
                        <input name="discount" type="number" defaultValue={editingPlan?.discountPercent} required className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 20" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Credit Limit (₹)</label>
                        <input name="creditLimit" type="number" defaultValue={editingPlan?.creditLimit} className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="0 for no credit" />
                      </div>
                      <div className="md:col-span-2 flex items-center p-4 bg-indigo-50 rounded-xl">
                        <input name="freeConsultation" type="checkbox" defaultChecked={editingPlan?.freeConsultation} className="w-5 h-5 rounded border-border text-indigo-600 focus:ring-indigo-500" />
                        <label className="ml-3 text-sm font-bold text-indigo-900">Enable Free Consultation for all employees</label>
                        <Gift className="w-5 h-5 ml-auto text-indigo-400" />
                      </div>
                    </div>
                    <div className="border-t border-border pt-6">
                      <h4 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4">Contact Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input name="contactPerson" defaultValue={editingPlan?.contactPerson} placeholder="Contact Person" className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" />
                        <input name="phone" defaultValue={editingPlan?.phone} placeholder="Phone Number" className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" />
                        <input name="email" type="email" defaultValue={editingPlan?.email} placeholder="Email Address" className="w-full md:col-span-2 px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-6">
                      <button type="button" onClick={() => setShowPlanForm(false)} className="flex-1 py-3 border border-border rounded-xl font-bold hover:bg-muted">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">Save Plan</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Bulk Employee Upload</h3>
                    <p className="text-sm text-muted-foreground">Quickly add multiple employees to a corporate plan</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadSampleCsv}
                      className="px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-muted flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2 text-indigo-600" />
                      Sample CSV
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center shadow-lg shadow-emerald-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleCsvUpload} accept=".csv, .xlsx, .xls" className="hidden" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">Target Corporate Plan</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    <option value="">Select Company</option>
                    {corporatePlans.map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                  </select>
                </div>

                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-muted text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border-b border-border">
                      <tr>
                        <th className="px-6 py-4">Full Name</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Gender</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bulkPatients.map((p, idx) => {
                        const isDup = checkDuplicate(p);
                        return (
                          <tr key={idx} className={`group transition-colors ${isDup ? 'bg-destructive/10' : 'hover:bg-muted'}`}>
                            <td className="px-6 py-3">
                              <div className="relative">
                                <input
                                  value={p.name}
                                  onChange={(e) => handleBulkChange(idx, 'name', e.target.value)}
                                  placeholder="Name"
                                  className={`w-full bg-transparent outline-none text-sm font-bold border-b border-transparent focus:border-indigo-600 pb-1 ${isDup ? 'text-destructive' : 'text-foreground'}`}
                                />
                                {isDup && (
                                  <div className="absolute -top-8 left-0 bg-destructive text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap animate-bounce">
                                    Already Registered!
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <input
                                value={p.phone}
                                onChange={(e) => handleBulkChange(idx, 'phone', e.target.value)}
                                placeholder="Phone"
                                className={`w-full bg-transparent outline-none text-sm font-bold border-b border-transparent focus:border-indigo-600 pb-1 ${isDup ? 'text-destructive' : 'text-foreground'}`}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <input
                                value={p.email}
                                onChange={(e) => handleBulkChange(idx, 'email', e.target.value)}
                                placeholder="Email"
                                className={`w-full bg-transparent outline-none text-sm font-bold border-b border-transparent focus:border-indigo-600 pb-1 ${isDup ? 'text-destructive' : 'text-foreground'}`}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <select
                                value={p.gender}
                                onChange={(e) => handleBulkChange(idx, 'gender', e.target.value)}
                                className="bg-transparent text-sm font-bold text-foreground outline-none"
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </td>
                            <td className="px-6 py-3">
                              <button onClick={() => handleRemoveBulkRow(idx)} className="p-2 text-red-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleBulkAddRow}
                  className="mt-6 w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground/60 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Row
                </button>
              </div>

              <div className="flex justify-end gap-4">
                <button onClick={onClose} className="px-8 py-3 bg-card border border-border rounded-xl font-bold hover:bg-muted transition-all">Cancel</button>
                <button
                  onClick={handleFinalBulkSubmit}
                  disabled={!selectedCompanyId}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm & Import Patients
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Employee List View Modal Overlay */}
        {viewingEmployeesPlanId && (
          <div className="absolute inset-0 bg-card z-[60] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-4">
                <button onClick={() => setViewingEmployeesPlanId(null)} className="p-2 hover:bg-card rounded-lg transition-all text-indigo-600">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {corporatePlans.find(p => p.id === viewingEmployeesPlanId)?.name} Employees
                  </h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                    Total {corporateEmployees.filter(e => e.companyId === viewingEmployeesPlanId).length} Employees Registered
                  </p>
                </div>
              </div>
              <div className="relative group" ref={searchRef}>
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <form onSubmit={handleSearchSubmit}>
                  <input 
                    placeholder="Search name, phone, or email..." 
                    value={employeeSearchQuery}
                    onChange={(e) => {
                      setEmployeeSearchQuery(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onFocus={() => setShowSearchSuggestions(true)}
                    className="pl-12 pr-6 py-3 bg-card border-2 border-indigo-50 rounded-2xl text-base font-medium outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 min-w-[450px] shadow-sm transition-all" 
                  />
                </form>

                {showSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-2xl border border-border z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {recentSearches.length > 0 && (
                      <div className="p-4 border-b border-border">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">Recent Searches</p>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((s, i) => (
                            <button 
                              key={i} 
                              onClick={() => { setEmployeeSearchQuery(s); setShowSearchSuggestions(false); }}
                              className="px-3 py-1 bg-muted hover:bg-indigo-50 text-muted-foreground hover:text-indigo-600 rounded-lg text-xs font-bold transition-all"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">Quick Suggestions</p>
                      <div className="flex flex-wrap gap-2">
                        {['Male', 'Female', 'Manager', '@gmail.com', 'Dev'].map((s, i) => (
                          <button 
                            key={i} 
                            onClick={() => { setEmployeeSearchQuery(s); setShowSearchSuggestions(false); }}
                            className="px-3 py-1 bg-indigo-50/50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border-b border-border">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Gender</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {corporateEmployees
                    .filter(e => e.companyId === viewingEmployeesPlanId)
                    .filter(e => 
                      fuzzySearch(e.name, employeeSearchQuery) ||
                      fuzzySearch(e.email || '', employeeSearchQuery) ||
                      fuzzySearch(e.phone, employeeSearchQuery)
                    )
                    .map((emp, i) => {
                      const isEditing = editingEmployee?.name === emp.name && editingEmployee?.email === emp.email;
                      
                      return (
                        <tr key={i} className={`hover:bg-muted transition-colors group ${isEditing ? 'bg-indigo-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-sm font-bold shadow-sm">
                                {emp.name[0]}
                              </div>
                              {isEditing ? (
                                <input 
                                  value={tempEmpData.name}
                                  onChange={(e) => setTempEmpData({...tempEmpData, name: e.target.value})}
                                  className="px-3 py-1 border border-indigo-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                                />
                              ) : (
                                <div>
                                  <div className="font-bold text-foreground">{emp.name}</div>
                                  <div className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">ID: CORP-{i+100}</div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-foreground">
                            {isEditing ? (
                              <input 
                                value={tempEmpData.phone}
                                onChange={(e) => setTempEmpData({...tempEmpData, phone: e.target.value})}
                                className="w-full px-3 py-1 border border-indigo-200 rounded-lg text-xs font-bold outline-none"
                                placeholder="Phone"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                {emp.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {isEditing ? (
                                <input 
                                  value={tempEmpData.email}
                                  onChange={(e) => setTempEmpData({...tempEmpData, email: e.target.value})}
                                  className="w-full px-3 py-1 border border-indigo-200 rounded-lg text-xs font-bold outline-none"
                                  placeholder="Email"
                                />
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[11px] font-bold w-fit border border-primary/20">
                                  <FileText className="w-3.5 h-3.5" />
                                  {emp.email}
                                </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <select 
                                value={tempEmpData.gender}
                                onChange={(e) => setTempEmpData({...tempEmpData, gender: e.target.value})}
                                className="px-3 py-1 border border-indigo-200 rounded-lg text-xs font-bold"
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            ) : (
                              <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-bold rounded-lg uppercase tracking-wider border border-border">
                                {emp.gender}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button 
                                    onClick={() => {
                                      onUpdateEmployee(editingEmployee!.name, editingEmployee!.email, tempEmpData);
                                      setEditingEmployee(null);
                                    }}
                                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setEditingEmployee(null)}
                                    className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      setEditingEmployee({name: emp.name, email: emp.email});
                                      setTempEmpData({...emp});
                                    }}
                                    className="p-2 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all bg-indigo-50 border border-indigo-100"
                                    title="Edit Employee"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => onDeleteEmployee(emp.name, emp.email)}
                                    className="p-2 text-red-500 hover:bg-destructive hover:text-white rounded-lg transition-all bg-destructive/10 border border-destructive/20"
                                    title="Delete Employee"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {corporateEmployees.filter(e => e.companyId === viewingEmployeesPlanId).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground/60 font-bold">No employees registered yet.</p>
                      </td>
                    </tr>
                  )}
                  {corporateEmployees.filter(e => e.companyId === viewingEmployeesPlanId).length > 0 && 
                   corporateEmployees.filter(e => e.companyId === viewingEmployeesPlanId && 
                    (e.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
                     e.email?.toLowerCase().includes(employeeSearchQuery.toLowerCase()))
                   ).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-muted-foreground/60 font-medium">
                        No employees matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
