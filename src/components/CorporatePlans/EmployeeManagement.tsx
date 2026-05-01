import React, { useState, useRef, useMemo } from 'react';
import {
  Plus, Trash2, Edit2, Upload, Download, Building2,
  Users, Phone, Mail, User, CheckCircle, AlertTriangle,
  Search, X, FileText, ToggleLeft, ToggleRight, RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CorporateEmployee, CorporatePlan } from '../../types';
import {
  PageHeader, Modal, DataTable, Pagination, SearchInput,
  FilterTabs, FormField, FileUploadZone, Badge, PlanBadge, ConfirmModal
} from '../ui';

interface EmployeeManagementProps {
  employees: CorporateEmployee[];
  plans: CorporatePlan[];
  onSave: (emp: CorporateEmployee) => void;
  onDelete: (id: string) => void;
  onBulkSave: (emps: CorporateEmployee[]) => void;
  onChangePlan: (empId: string, newPlanId: string, newPlanName: string) => void;
}

const EMPTY_EMP = (): Partial<CorporateEmployee> => ({
  employeeId: '', name: '', phone: '', email: '', gender: 'male',
  dateOfBirth: '', designation: '', department: '',
  companyName: '', corporatePlanId: '', corporatePlanName: '',
  isActive: true,
});

const GENDER_OPTIONS = ['male', 'female', 'other'];

// ─── Excel import parser ──────────────────────────────────────────────────────
function parseXlsx(file: File, plans: CorporatePlan[]): Promise<{ rows: Partial<CorporateEmployee>[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const errors: string[] = [];
        const rows: Partial<CorporateEmployee>[] = [];

        raw.forEach((r, i) => {
          const row = i + 2;
          const name = String(r['Name'] || r['name'] || '').trim();
          const phone = String(r['Phone'] || r['Mobile'] || r['phone'] || '').trim();
          const email = String(r['Email'] || r['email'] || '').trim();
          const planCode = String(r['PlanCode'] || r['Plan Code'] || r['plan_code'] || '').trim().toUpperCase();
          const companyName = String(r['Company'] || r['CompanyName'] || r['company'] || '').trim();

          if (!name) { errors.push(`Row ${row}: Name is required`); return; }
          if (!phone) { errors.push(`Row ${row}: Phone is required`); return; }

          const plan = plans.find(p => p.code.toUpperCase() === planCode || p.name === planCode);
          if (planCode && !plan) { errors.push(`Row ${row}: Plan code "${planCode}" not found`); }

          rows.push({
            id: `EMP-${Date.now()}-${i}`,
            employeeId: String(r['EmployeeId'] || r['EmpID'] || r['employee_id'] || '').trim(),
            name, phone, email,
            gender: (['male','female','other'].includes(String(r['Gender'] || '').toLowerCase()) ? String(r['Gender']).toLowerCase() : 'male') as any,
            dateOfBirth: String(r['DOB'] || r['DateOfBirth'] || '').trim(),
            designation: String(r['Designation'] || r['designation'] || '').trim(),
            department: String(r['Department'] || r['department'] || '').trim(),
            companyName: companyName || plan?.companyName || '',
            corporatePlanId: plan?.id || '',
            corporatePlanName: plan?.name || '',
            enrolledAt: new Date().toISOString(),
            isActive: true,
          });
        });
        resolve({ rows, errors });
      } catch {
        resolve({ rows: [], errors: ['Failed to parse file. Ensure it is a valid Excel or CSV file.'] });
      }
    };
    reader.readAsBinaryString(file);
  });
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Name', 'Phone', 'Email', 'Gender', 'EmployeeId', 'Designation', 'Department', 'Company', 'PlanCode', 'DOB'],
    ['Rajesh Kumar', '9876543210', 'rajesh@tcs.com', 'male', 'Electrify001', 'Engineer', 'IT', 'Tata Consultancy Services', 'Electrify-GOLD', '1990-01-15'],
    ['Priya Sharma', '8765432109', 'priya@tcs.com', 'female', 'Electrify002', 'Manager', 'HR', 'Tata Consultancy Services', 'Electrify-GOLD', '1988-05-22'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  XLSX.writeFile(wb, 'employee_import_template.xlsx');
}

// ─── Component ────────────────────────────────────────────────────────────────
export function EmployeeManagement({ employees, plans, onSave, onDelete, onBulkSave, onChangePlan }: EmployeeManagementProps) {
  const [tab, setTab] = useState<'list' | 'import'>('list');
  const [viewMode, setViewMode] = useState<'employees' | 'companies'>('employees');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  // Add/Edit modal
  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState<CorporateEmployee | null>(null);
  const [form, setForm] = useState<Partial<CorporateEmployee>>(EMPTY_EMP());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Change plan modal
  const [changePlanEmp, setChangePlanEmp] = useState<CorporateEmployee | null>(null);
  const [newPlanId, setNewPlanId] = useState('');

  // Delete confirm
  const [deleteEmp, setDeleteEmp] = useState<CorporateEmployee | null>(null);

  // Import state
  const [importRows, setImportRows] = useState<Partial<CorporateEmployee>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Filters
  const planFilterTabs = [
    { key: 'all', label: 'All Plans' },
    ...plans.filter(p => p.isActive).map(p => ({ key: p.id, label: p.code })),
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(e => {
      const matchQ = e.name.toLowerCase().includes(q) || e.phone.includes(q) || e.email.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) || e.companyName.toLowerCase().includes(q);
      const matchPlan = planFilter === 'all' || e.corporatePlanId === planFilter;
      const matchCompany = !selectedCompany || e.companyName === selectedCompany;
      return matchQ && matchPlan && matchCompany;
    });
  }, [employees, search, planFilter, selectedCompany]);

  // Group by company
  const companiesList = useMemo(() => {
    const companies = new Map<string, { name: string; count: number; employees: CorporateEmployee[] }>();
    employees.forEach(e => {
      const company = e.companyName || 'Unassigned';
      if (!companies.has(company)) {
        companies.set(company, { name: company, count: 0, employees: [] });
      }
      const entry = companies.get(company)!;
      entry.count++;
      entry.employees.push(e);
    });
    return Array.from(companies.values()).sort((a, b) => b.count - a.count);
  }, [employees]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stats
  const byPlan = useMemo(() => {
    const m: Record<string, number> = {};
    employees.forEach(e => { m[e.corporatePlanId] = (m[e.corporatePlanId] || 0) + 1; });
    return m;
  }, [employees]);

  // ── Form ──
  const openNew = () => { setEditEmp(null); setForm(EMPTY_EMP()); setFormErrors({}); setShowForm(true); };
  const openEdit = (e: CorporateEmployee) => { setEditEmp(e); setForm({ ...e }); setFormErrors({}); setShowForm(true); };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = 'Required';
    if (!form.phone?.trim()) errs.phone = 'Required';
    if (!form.companyName?.trim()) errs.companyName = 'Required';
    if (!form.corporatePlanId) errs.corporatePlanId = 'Assign a corporate plan';
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const plan = plans.find(p => p.id === form.corporatePlanId);
    const emp: CorporateEmployee = {
      id: editEmp?.id || `EMP-${Date.now()}`,
      employeeId: form.employeeId || '',
      name: form.name!,
      phone: form.phone!,
      email: form.email || '',
      gender: form.gender || 'male',
      dateOfBirth: form.dateOfBirth || '',
      designation: form.designation || '',
      department: form.department || '',
      companyName: form.companyName!,
      corporatePlanId: form.corporatePlanId!,
      corporatePlanName: plan?.name || '',
      enrolledAt: editEmp?.enrolledAt || new Date().toISOString(),
      isActive: form.isActive !== false,
      patientId: editEmp?.patientId,
    };
    onSave(emp);
    setShowForm(false);
  };

  // ── Plan change ──
  const openChangePlan = (e: CorporateEmployee) => { setChangePlanEmp(e); setNewPlanId(e.corporatePlanId); };
  const handleChangePlan = () => {
    if (!changePlanEmp || !newPlanId) return;
    const plan = plans.find(p => p.id === newPlanId);
    if (plan) onChangePlan(changePlanEmp.id, plan.id, plan.name);
    setChangePlanEmp(null);
  };

  // ── Import ──
  const handleFile = async (file: File) => {
    setImporting(true);
    const { rows, errors } = await parseXlsx(file, plans);
    setImportRows(rows);
    setImportErrors(errors);
    setImporting(false);
  };

  const handleImportConfirm = () => {
    const valid = importRows.filter(r => r.name && r.phone);
    if (!valid.length) return;
    onBulkSave(valid as CorporateEmployee[]);
    setImportRows([]);
    setImportErrors([]);
    setTab('list');
  };

  // ── Table columns ──
  const columns = [
    {
      key: 'employee', header: 'Employee', render: (e: CorporateEmployee) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
            {e.name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{e.name}</div>
            {e.employeeId && <div className="text-xs text-gray-400 font-mono">{e.employeeId}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'contact', header: 'Contact', render: (e: CorporateEmployee) => (
        <div>
          <div className="text-sm text-gray-700 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{e.phone}</div>
          {e.email && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{e.email}</div>}
        </div>
      ),
    },
    {
      key: 'company', header: 'Company / Role', render: (e: CorporateEmployee) => (
        <div>
          <div className="text-sm font-medium text-gray-800">{e.companyName}</div>
          {e.designation && <div className="text-xs text-gray-400">{e.designation}{e.department ? ` · ${e.department}` : ''}</div>}
        </div>
      ),
    },
    {
      key: 'plan', header: 'Corporate Plan', render: (e: CorporateEmployee) => {
        const plan = plans.find(p => p.id === e.corporatePlanId);
        return plan
          ? <PlanBadge name={plan.name} code={plan.code} color={plan.color} />
          : <span className="text-xs text-gray-400">No plan</span>;
      },
    },
    {
      key: 'patient', header: 'Patient Link', render: (e: CorporateEmployee) => (
        e.patientId
          ? <Badge variant="green">Registered</Badge>
          : <Badge variant="gray">Not yet</Badge>
      ),
    },
    {
      key: 'status', header: 'Status', render: (e: CorporateEmployee) => (
        <Badge variant={e.isActive ? 'green' : 'gray'}>{e.isActive ? 'Active' : 'Inactive'}</Badge>
      ),
    },
    {
      key: 'actions', header: '', align: 'right' as const, render: (e: CorporateEmployee) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openChangePlan(e)} className="btn-icon" title="Change plan">
            <RefreshCw className="w-4 h-4 text-blue-500" />
          </button>
          <button onClick={() => openEdit(e)} className="btn-icon-blue" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteEmp(e)} className="btn-icon-red" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employee Management"
        subtitle={`${employees.length} employees across ${plans.filter(p => p.isActive).length} active plans`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => { setTab('import'); setImportRows([]); setImportErrors([]); }} className="btn-secondary">
              <Upload className="w-4 h-4" /> Bulk Import
            </button>
            <button onClick={openNew} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          </div>
        }
      />

      {/* Plan summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {plans.filter(p => p.isActive).slice(0, 4).map(plan => (
          <div key={plan.id} className="kpi-card">
            <PlanBadge name={plan.name} code={plan.code} color={plan.color} />
            <p className="text-xl font-bold text-gray-900 mt-2">{byPlan[plan.id] || 0}</p>
            <p className="text-xs text-gray-400">{plan.companyName}</p>
          </div>
        ))}
      </div>

      {/* Tab: List / Import */}
      {tab === 'list' ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }}
              placeholder={viewMode === 'employees' ? "Search by name, phone, employee ID…" : "Search companies…"} className="flex-1" />
            {viewMode === 'employees' && (
              <FilterTabs tabs={planFilterTabs} active={planFilter} onChange={v => { setPlanFilter(v); setPage(1); }} />
            )}
            <button 
              onClick={() => { setViewMode(viewMode === 'employees' ? 'companies' : 'employees'); setSelectedCompany(null); setPage(1); }}
              className={`btn-secondary px-3 py-2 whitespace-nowrap ${viewMode === 'companies' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}`}
              title={viewMode === 'employees' ? 'Switch to companies view' : 'Switch to employees view'}
            >
              <Building2 className="w-4 h-4" /> {viewMode === 'employees' ? 'Companies' : 'Employees'}
            </button>
          </div>

          {/* Employees View */}
          {viewMode === 'employees' ? (
            <>
              {selectedCompany && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-sm font-semibold text-blue-900">Showing: {selectedCompany}</span>
                  <button onClick={() => setSelectedCompany(null)} className="btn-secondary text-xs ml-auto">
                    <X className="w-3 h-3" /> Clear Filter
                  </button>
                </div>
              )}
              <DataTable
                columns={columns}
                data={paginated}
                rowKey={e => e.id}
                emptyIcon={<Users className="w-10 h-10 text-gray-300" />}
                emptyTitle="No employees found"
                emptySubtitle="Add employees individually or import from Excel"
                footer={
                  <Pagination page={page} totalPages={totalPages} totalItems={filtered.length}
                    perPage={PER_PAGE} onPageChange={setPage} />
                }
              />
            </>
          ) : (
            /* Companies View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companiesList
                .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
                .map(company => (
                  <div key={company.name} 
                    onClick={() => { setSelectedCompany(company.name); setViewMode('employees'); setPage(1); }}
                    className="card p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Company</p>
                        <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{company.name}</p>
                      </div>
                      <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Total Employees</p>
                          <p className="text-2xl font-bold text-blue-600">{company.count}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      ) : (
        /* Import tab */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Bulk Import Employees</h2>
            <button onClick={() => setTab('list')} className="btn-secondary"><X className="w-4 h-4" /> Cancel</button>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Upload Excel / CSV file</p>
                <p className="text-xs text-gray-500">
                  Columns: Name, Phone, Email, Gender, EmployeeId, Designation, Department, Company, PlanCode, DOB
                </p>
              </div>
              <button onClick={downloadTemplate} className="btn-secondary flex-shrink-0">
                <Download className="w-4 h-4" /> Template
              </button>
            </div>
            <FileUploadZone onFile={handleFile} inputRef={fileRef}
              hint="Supports .xlsx, .xls, .csv" />
          </div>

          {importing && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Parsing file…
            </div>
          )}

          {importErrors.length > 0 && (
            <div className="card border-amber-200 bg-amber-50 p-4 space-y-1">
              <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {importErrors.length} warning{importErrors.length > 1 ? 's' : ''}
              </p>
              {importErrors.map((e, i) => <p key={i} className="text-xs text-amber-700">{e}</p>)}
            </div>
          )}

          {importRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Preview — {importRows.length} row{importRows.length > 1 ? 's' : ''}</p>
                <button onClick={handleImportConfirm} className="btn-primary">
                  <CheckCircle className="w-4 h-4" /> Import {importRows.filter(r => r.name && r.phone).length} Employees
                </button>
              </div>
              <DataTable
                columns={[
                  { key: 'name', header: 'Name', render: r => <span className="font-medium text-sm">{r.name}</span> },
                  { key: 'phone', header: 'Phone', render: r => <span className="text-sm text-gray-600">{r.phone}</span> },
                  { key: 'email', header: 'Email', render: r => <span className="text-xs text-gray-500">{r.email}</span> },
                  { key: 'company', header: 'Company', render: r => <span className="text-sm">{r.companyName}</span> },
                  { key: 'plan', header: 'Plan', render: r => {
                    const p = plans.find(pl => pl.id === r.corporatePlanId);
                    return p ? <PlanBadge name={p.name} code={p.code} color={p.color} /> : <Badge variant="amber">No plan</Badge>;
                  }},
                  { key: 'ok', header: '', render: r => r.name && r.phone
                    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                    : <AlertTriangle className="w-4 h-4 text-red-500" /> },
                ]}
                data={importRows as CorporateEmployee[]}
                rowKey={(_, i) => String(i)}
              />
            </div>
          )}
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <Modal
          title={editEmp ? 'Edit Employee' : 'Add Employee'}
          onClose={() => setShowForm(false)}
          size="2xl"
          icon={<User className="w-4 h-4" />}
          footer={
            <>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">
                <CheckCircle className="w-4 h-4" /> {editEmp ? 'Update' : 'Add Employee'}
              </button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required error={formErrors.name}>
              <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="form-input" placeholder="e.g. Rajesh Kumar" />
            </FormField>
            <FormField label="Employee ID">
              <input type="text" value={form.employeeId || ''} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                className="form-input" placeholder="Company EMP ID" />
            </FormField>
            <FormField label="Phone" required error={formErrors.phone}>
              <input type="tel" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="form-input" placeholder="+91 98765 43210" />
            </FormField>
            <FormField label="Email">
              <input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="form-input" placeholder="employee@company.com" />
            </FormField>
            <FormField label="Gender">
              <select value={form.gender || 'male'} onChange={e => setForm(f => ({ ...f, gender: e.target.value as any }))}
                className="form-select">
                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </FormField>
            <FormField label="Date of Birth">
              <input type="date" value={form.dateOfBirth || ''} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                className="form-input" />
            </FormField>
            <FormField label="Company Name" required error={formErrors.companyName}>
              <input type="text" value={form.companyName || ''} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="form-input" placeholder="e.g. Electrify, Infosys" />
            </FormField>
            <FormField label="Designation">
              <input type="text" value={form.designation || ''} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                className="form-input" placeholder="e.g. Software Engineer" />
            </FormField>
            <FormField label="Department">
              <input type="text" value={form.department || ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="form-input" placeholder="e.g. IT, HR, Finance" />
            </FormField>
            <FormField label="Corporate Plan" required error={formErrors.corporatePlanId}>
              <select value={form.corporatePlanId || ''} onChange={e => setForm(f => ({ ...f, corporatePlanId: e.target.value }))}
                className="form-select">
                <option value="">Select a plan…</option>
                {plans.filter(p => p.isActive).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.companyName})</option>
                ))}
              </select>
            </FormField>
            <div className="col-span-2 flex items-center gap-2 pt-1">
              <input type="checkbox" id="empActive" checked={form.isActive !== false}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-blue-600" />
              <label htmlFor="empActive" className="text-sm font-medium text-gray-700">Active employee</label>
            </div>
          </div>
        </Modal>
      )}

      {/* Change plan modal */}
      {changePlanEmp && (
        <Modal title="Change Corporate Plan" onClose={() => setChangePlanEmp(null)} size="md"
          icon={<RefreshCw className="w-4 h-4" />}
          footer={
            <>
              <button onClick={() => setChangePlanEmp(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleChangePlan} className="btn-primary" disabled={!newPlanId || newPlanId === changePlanEmp.corporatePlanId}>
                Update Plan
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">Employee</p>
              <p className="font-semibold text-gray-900">{changePlanEmp.name}</p>
              <p className="text-xs text-gray-500">{changePlanEmp.phone} · {changePlanEmp.companyName}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-600 mb-0.5">Current Plan</p>
              <p className="font-semibold text-blue-900">{changePlanEmp.corporatePlanName || '—'}</p>
            </div>
            <FormField label="New Plan" required>
              <select value={newPlanId} onChange={e => setNewPlanId(e.target.value)} className="form-select">
                <option value="">Select…</option>
                {plans.filter(p => p.isActive).map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.companyName} ({p.code})</option>
                ))}
              </select>
            </FormField>
            <p className="text-xs text-gray-500">
              This will update the plan for this employee only. Their patient record will automatically reflect the new plan on next visit.
            </p>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteEmp && (
        <ConfirmModal
          title="Remove Employee"
          message={`Remove ${deleteEmp.name} from the corporate employee list? Their patient record will remain but plan association will be cleared.`}
          confirmLabel="Remove"
          variant="danger"
          onConfirm={() => { onDelete(deleteEmp.id); setDeleteEmp(null); }}
          onCancel={() => setDeleteEmp(null)}
        />
      )}
    </div>
  );
}
