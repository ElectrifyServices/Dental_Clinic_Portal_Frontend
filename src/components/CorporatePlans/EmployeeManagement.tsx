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
  FilterTabs, FormField, FileUploadZone, Badge, PlanBadge, ConfirmModal,
  Button, SectionRenderer
} from '../ui';
import { useFormConfig } from '../../hooks/useFormConfig';
import { useCreateEmployeeMutation } from '../../hooks/corporate/useCreateEmployeeMutation';
import { useBulkImportEmployeeMutation } from '../../hooks/corporate/useBulkImportEmployeeMutation';
import type { SelectOption } from '../ui/FormRenderer';

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
  eligible_date: new Date().toISOString().split('T')[0],
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
          const planCode = String(r['PlanCode'] || r['Plan Code'] || r['plan_code'] || '').trim();
          const planCodeUpper = planCode.toUpperCase();
          const companyName = String(r['Company'] || r['CompanyName'] || r['company'] || '').trim();

          if (!name) { errors.push(`Row ${row}: Name is required`); return; }
          if (!phone) { errors.push(`Row ${row}: Phone is required`); return; }

          const plan = plans.find(p => 
            p.id.toUpperCase() === planCodeUpper ||
            p.code.toUpperCase() === planCodeUpper ||
            p.name.toUpperCase() === planCodeUpper
          );

          const isUuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(planCode);

          if (!planCode) {
            errors.push(`Row ${row}: Plan Code is required`);
          } else if (!plan && !isUuid) { 
            errors.push(`Row ${row}: Plan "${planCode}" not found`); 
          }

          const eligibleDate = String(r['EligibleDate'] || r['eligible_date'] || r['Eligible Date'] || '').trim();

          rows.push({
            id: `EMP-${Date.now()}-${i}`,
            employeeId: String(r['EmployeeId'] || r['EmpID'] || r['employee_id'] || '').trim(),
            name, phone, email,
            gender: (['male','female','other'].includes(String(r['Gender'] || '').toLowerCase()) ? String(r['Gender']).toLowerCase() : 'male') as any,
            dateOfBirth: String(r['DOB'] || r['DateOfBirth'] || '').trim(),
            designation: String(r['Designation'] || r['designation'] || '').trim(),
            department: String(r['Department'] || r['department'] || '').trim(),
            companyName: companyName || plan?.companyName || '',
            corporatePlanId: plan?.id || (isUuid ? planCode : ''),
            corporatePlanName: plan?.name || (isUuid ? 'Selected Plan' : ''),
            enrolledAt: new Date().toISOString(),
            eligible_date: eligibleDate || new Date().toISOString().split('T')[0],
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
    ['Name', 'Phone', 'Email', 'Gender', 'EmployeeId', 'Designation', 'Department', 'Company', 'PlanCode', 'DOB', 'EligibleDate'],
    ['Rajesh Kumar', '9876543210', 'rajesh@tcs.com', 'male', 'Electrify001', 'Engineer', 'IT', 'Tata Consultancy Services', 'Electrify-GOLD', '1990-01-15', '2026-05-20'],
    ['Priya Sharma', '8765432109', 'priya@tcs.com', 'female', 'Electrify002', 'Manager', 'HR', 'Tata Consultancy Services', 'Electrify-GOLD', '1988-05-22', '2026-05-20'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  XLSX.writeFile(wb, 'employee_import_template.xlsx');
}

// ─── Component ────────────────────────────────────────────────────────────────
export function EmployeeManagement({ employees, plans, onSave, onDelete, onBulkSave, onChangePlan }: EmployeeManagementProps) {
  const empCfg = useFormConfig('employee');
  const createEmployeeMutation = useCreateEmployeeMutation();
  const bulkImportMutation = useBulkImportEmployeeMutation();
  const empCfgAny = empCfg as any;
  const personalSection   = empCfg.sections?.find(s => s.id === 'personal');
  const employmentSection = empCfg.sections?.find(s => s.id === 'employment');
  const eligibilitySection = empCfg.sections?.find(s => s.id === 'eligibility');
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

  // Unified handler for SectionRenderer
  const handleFormChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Plans as SelectOption for corporatePlanId dynamic options
  const planOptions: SelectOption[] = plans
    .filter(p => p.isActive)
    .map(p => ({ value: p.id, label: `${p.name} (${p.companyName})` }));

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = 'Required';
    if (!form.phone?.trim()) errs.phone = 'Required';
    if (!form.companyName?.trim()) errs.companyName = 'Required';
    if (!form.corporatePlanId) errs.corporatePlanId = 'Assign a corporate plan';
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const plan = plans.find(p => p.id === form.corporatePlanId);
    
    if (!editEmp) {
      try {
        const transformedBody = {
          name: form.name!,
          emp_id: form.employeeId || `EMP${Date.now().toString().slice(-5)}`,
          phone: form.phone!,
          email: form.email || "noemail@example.com",
          gender: (form.gender || "male").toUpperCase(),
          date_of_birth: form.dateOfBirth || "1990-01-01",
          company_name: form.companyName!,
          designation: form.designation || "Employee",
          department: form.department || "General",
          corporate_plan_id: form.corporatePlanId!,
          eligible_date: form.eligible_date ? new Date(form.eligible_date).toISOString() : new Date().toISOString(),
          status: form.isActive !== false ? "ACTIVE" : "INACTIVE",
        };

        const apiResponse = await createEmployeeMutation.mutateAsync(transformedBody);
        
        const emp: CorporateEmployee = {
          id: apiResponse?.id || `EMP-${Date.now()}`,
          employeeId: form.employeeId || apiResponse?.emp_id || '',
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
          eligible_date: form.eligible_date || apiResponse?.eligible_date || '',
          isActive: form.isActive !== false,
          patientId: editEmp?.patientId || undefined,
        };
        onSave(emp);
        setShowForm(false);
      } catch (err: any) {
        console.error("Failed to create employee via API:", err);
        setFormErrors(prev => ({
          ...prev,
          submit: err?.response?.data?.message || err?.message || "Failed to create employee on backend"
        }));
      }
    } else {
      const emp: CorporateEmployee = {
        id: editEmp.id,
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
        eligible_date: form.eligible_date || editEmp?.eligible_date || '',
        isActive: form.isActive !== false,
        patientId: editEmp?.patientId || undefined,
      };
      onSave(emp);
      setShowForm(false);
    }
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

  const handleImportConfirm = async () => {
    const valid = importRows.filter(r => r.name && r.phone && r.corporatePlanId);
    if (!valid.length) return;
    
    setImporting(true);
    try {
      const payload = {
        employees: valid.map((r, i) => ({
          name: r.name!,
          emp_id: r.employeeId || `EMP${Date.now().toString().slice(-4)}${i}`,
          phone: r.phone!,
          email: r.email || "noemail@example.com",
          gender: (r.gender || "male").toUpperCase(),
          company_name: r.companyName || "Unknown Company",
          designation: r.designation || "Employee",
          department: r.department || "General",
          corporate_plan_id: r.corporatePlanId || "",
          date_of_birth: r.dateOfBirth || "1990-01-01",
          eligible_date: r.eligible_date || new Date().toISOString().split('T')[0]
        }))
      };

      await bulkImportMutation.mutateAsync(payload);
      
      onBulkSave(valid as CorporateEmployee[]);
      setImportRows([]);
      setImportErrors([]);
      setTab('list');
    } catch (err: any) {
      console.error("Bulk import failed:", err);
      setImportErrors(prev => [
        err?.response?.data?.message || err?.message || "Failed to bulk import employees on backend",
        ...prev
      ]);
    } finally {
      setImporting(false);
    }
  };

  // ── Table columns ──
  const columns = [
    {
      key: 'employee', header: 'Employee', render: (e: CorporateEmployee) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {e.name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">{e.name}</div>
            {e.employeeId && <div className="text-xs text-muted-foreground/60 font-mono">{e.employeeId}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'contact', header: 'Contact', render: (e: CorporateEmployee) => (
        <div>
          <div className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground/60" />{e.phone}</div>
          {e.email && <div className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{e.email}</div>}
        </div>
      ),
    },
    {
      key: 'company', header: 'Company / Role', render: (e: CorporateEmployee) => (
        <div>
          <div className="text-sm font-medium text-foreground">{e.companyName}</div>
          {e.designation && <div className="text-xs text-muted-foreground/60">{e.designation}{e.department ? ` · ${e.department}` : ''}</div>}
        </div>
      ),
    },
    {
      key: 'plan', header: 'Corporate Plan', render: (e: CorporateEmployee) => {
        const plan = plans.find(p => p.id === e.corporatePlanId);
        return plan
          ? <PlanBadge name={plan.name} code={plan.code} color={plan.color} />
          : <span className="text-xs text-muted-foreground/60">No plan</span>;
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
            <p className="text-xl font-bold text-foreground mt-2">{byPlan[plan.id] || 0}</p>
            <p className="text-xs text-muted-foreground/60">{plan.companyName}</p>
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
              className={`btn-secondary px-3 py-2 whitespace-nowrap ${viewMode === 'companies' ? 'bg-primary/10 text-primary border-primary/50' : ''}`}
              title={viewMode === 'employees' ? 'Switch to companies view' : 'Switch to employees view'}
            >
              <Building2 className="w-4 h-4" /> {viewMode === 'employees' ? 'Companies' : 'Employees'}
            </button>
          </div>

          {/* Employees View */}
          {viewMode === 'employees' ? (
            <>
              {selectedCompany && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg p-3">
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
                emptyIcon={<Users className="w-10 h-10 text-muted-foreground/40" />}
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
                    className="card p-5 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Company</p>
                        <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{company.name}</p>
                      </div>
                      <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Total Employees</p>
                          <p className="text-2xl font-bold text-primary">{company.count}</p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-semibold">
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
            <h2 className="text-sm font-bold text-foreground">Bulk Import Employees</h2>
            <button onClick={() => setTab('list')} className="btn-secondary"><X className="w-4 h-4" /> Cancel</button>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Upload Excel / CSV file</p>
                <p className="text-xs text-muted-foreground">
                  Columns: Name, Phone, Email, Gender, EmployeeId, Designation, Department, Company, PlanCode, DOB, EligibleDate
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
            <div className="flex items-center gap-2 text-primary text-sm">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                <p className="text-sm font-semibold text-foreground">Preview — {importRows.length} row{importRows.length > 1 ? 's' : ''}</p>
                <button onClick={handleImportConfirm} className="btn-primary">
                  <CheckCircle className="w-4 h-4" /> Import {importRows.filter(r => r.name && r.phone && r.corporatePlanId).length} Employees
                </button>
              </div>
              <DataTable
                columns={[
                  { key: 'name', header: 'Name', render: r => <span className="font-medium text-sm">{r.name}</span> },
                  { key: 'phone', header: 'Phone', render: r => <span className="text-sm text-muted-foreground">{r.phone}</span> },
                  { key: 'email', header: 'Email', render: r => <span className="text-xs text-muted-foreground">{r.email}</span> },
                  { key: 'company', header: 'Company', render: r => <span className="text-sm">{r.companyName}</span> },
                  { key: 'plan', header: 'Plan', render: r => {
                    const p = plans.find(pl => pl.id === r.corporatePlanId);
                    return p ? <PlanBadge name={p.name} code={p.code} color={p.color} /> : <Badge variant="amber">No plan</Badge>;
                  }},
                  { key: 'ok', header: '', render: r => r.name && r.phone && r.corporatePlanId
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
          title={editEmp ? (empCfgAny.title?.edit ?? 'Edit Employee') : (empCfgAny.title?.create ?? 'Add Employee')}
          onClose={() => setShowForm(false)}
          size="2xl"
          icon={<User className="w-4 h-4" />}
          footer={
            <div className="flex flex-col gap-3 w-full">
              {formErrors.submit && (
                <p className="text-red-500 text-xs font-bold text-left px-4 py-2.5 bg-red-50 rounded-xl border border-red-200">
                  {formErrors.submit}
                </p>
              )}
              <div className="flex justify-end gap-3 w-full">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSave} className="gap-2 shadow-lg shadow-primary/10" disabled={createEmployeeMutation.isLoading}>
                  {createEmployeeMutation.isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> {editEmp ? (empCfgAny.submitLabel?.edit ?? 'Update Details') : (empCfgAny.submitLabel?.create ?? 'Register Employee')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Personal section from JSON config */}
            {personalSection && (
              <SectionRenderer
                section={personalSection}
                values={form}
                onChange={handleFormChange}
                errors={formErrors}
                cols={2}
              />
            )}

            {/* Employment section from JSON config (corporatePlanId populated at runtime) */}
            {employmentSection && (
              <SectionRenderer
                section={employmentSection}
                values={form}
                onChange={handleFormChange}
                errors={formErrors}
                dynamicOptions={{ corporatePlanId: planOptions }}
                cols={2}
              />
            )}

            {/* Eligibility section from JSON config */}
            {eligibilitySection && (
              <SectionRenderer
                section={eligibilitySection}
                values={form}
                onChange={handleFormChange}
                errors={formErrors}
                cols={2}
              />
            )}
            
            <div className="p-4 bg-muted/30 rounded-2xl border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${form.isActive !== false ? 'bg-emerald-500' : 'bg-muted-foreground animate-pulse'}`} />
                <label htmlFor="empActive" className="text-xs font-black uppercase tracking-widest text-foreground cursor-pointer">Active Status</label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="empActive" checked={form.isActive !== false} className="sr-only peer"
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* Change plan modal */}
      {changePlanEmp && (
        <Modal 
          title="Update Corporate Health Plan" 
          onClose={() => setChangePlanEmp(null)} 
          size="md"
          icon={<RefreshCw className="w-4 h-4" />}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={() => setChangePlanEmp(null)}>Cancel</Button>
              <Button 
                onClick={handleChangePlan} 
                disabled={!newPlanId || newPlanId === changePlanEmp.corporatePlanId}
                className="gap-2 shadow-lg shadow-primary/10"
              >
                <CheckCircle className="w-4 h-4" /> Confirm Plan Update
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                {changePlanEmp.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Employee Information</p>
                <p className="text-sm font-bold text-foreground">{changePlanEmp.name}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{changePlanEmp.phone} · {changePlanEmp.companyName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Current Active Plan</span>
                  <Badge variant="blue" className="text-[8px]">ACTIVE</Badge>
                </div>
                <p className="text-sm font-black text-blue-900">{changePlanEmp.corporatePlanName || 'No Plan Assigned'}</p>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>

              <FormField label="Target Health Plan Selection" required>
                <select 
                  value={newPlanId} 
                  onChange={e => setNewPlanId(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm appearance-none"
                >
                  <option value="">Select a new plan…</option>
                  {plans.filter(p => p.isActive).map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.companyName} ({p.code})</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-900/80 font-bold leading-relaxed">
                This change is immediate. The employee's clinical records and future invoices will automatically reflect the benefits and discounts associated with the new plan.
              </p>
            </div>
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
