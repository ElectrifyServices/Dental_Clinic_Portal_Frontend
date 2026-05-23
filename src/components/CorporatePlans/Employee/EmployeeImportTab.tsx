import React, { useRef, useState } from 'react';
import { X, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { FileUploadZone, DataTable, Badge, PlanBadge } from '../../ui';
import { CorporateEmployee, CorporatePlan } from '../../../types';
import { parseXlsx, downloadTemplate } from './importUtils';
import { useBulkImportEmployeeMutation } from '../../../hooks/corporate/useBulkImportEmployeeMutation';

interface EmployeeImportTabProps {
  plans: CorporatePlan[];
  activePlans: CorporatePlan[];
  setTab: (tab: 'list' | 'import') => void;
  onBulkSave: (emps: CorporateEmployee[]) => void;
}

export function EmployeeImportTab({ plans, activePlans, setTab, onBulkSave }: EmployeeImportTabProps) {
  const [importRows, setImportRows] = useState<Partial<CorporateEmployee>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  
  const bulkImportMutation = useBulkImportEmployeeMutation();

  const handleFile = async (file: File) => {
    setImporting(true);
    const { rows, errors } = await parseXlsx(file, activePlans);
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

  return (
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
          Processing…
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
            <button onClick={handleImportConfirm} className="btn-primary" disabled={importing}>
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
  );
}
