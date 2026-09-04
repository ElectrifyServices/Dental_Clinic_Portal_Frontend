import React, { useRef, useState } from 'react';
import { X, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { FileUploadZone, DataTable, Badge, PlanBadge, Button } from '../../ui';
import { CorporateEmployee, CorporatePlan } from '../../../types';
import { parseXlsx, downloadTemplate } from './importUtils';
import { useBulkImportEmployeeMutation } from '../../../hooks/corporate/useBulkImportEmployeeMutation';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
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
        members: valid.map((r, i) => {
          const matchedPlan = activePlans.find(p => p.id === r.corporatePlanId);
          const planCodeToUse = matchedPlan ? matchedPlan.code : r.corporatePlanId;
          
          return {
            name: r.name!,
            country_code: (r as any).country_code || "+91",
            phone: r.phone!,
            email: r.email || "",
            gender: (r.gender || "male").toUpperCase(),
            date_of_birth: r.dateOfBirth || "",
            plan_code: planCodeToUse || "",
            expiry_date: r.eligible_date || ""
          };
        })
      };

      const res: any = await bulkImportMutation.mutateAsync(payload);

      const responseData = res?.responseObject?.data || res?.data;
      const failed = responseData?.failed || [];

      if (failed.length > 0) {
        const backendErrors = failed.map((f: any) => `Row ${f.index + 2}: ${f.error}`);
        setImportErrors(backendErrors);
        setImporting(false);
        return; // Do not redirect to list
      }

      queryClient.invalidateQueries({ queryKey: ["corporatePlans"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });

      onBulkSave(valid as CorporateEmployee[]);
      setImportRows([]);
      setImportErrors([]);
      setTab('list');
    } catch (err: any) {
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
        <Button onClick={() => setTab('list')} variant="outline" className="gap-2"><X className="w-4 h-4" /> Cancel</Button>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Upload Excel / CSV file</p>
            <p className="text-xs text-muted-foreground">
              Columns: name, country_code, phone, email, gender, plan_code, date_of_birth
            </p>
          </div>
          <Button onClick={() => downloadTemplate(activePlans)} variant="outline" className="flex-shrink-0 gap-2">
            <Download className="w-4 h-4" /> Template
          </Button>
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
            <Button onClick={handleImportConfirm} variant="default" className="gap-2" disabled={importing}>
              <CheckCircle className="w-4 h-4" /> Import {importRows.filter(r => r.name && r.phone && r.corporatePlanId).length} Employees
            </Button>
          </div>
          <DataTable
            columns={[
              { key: 'name', header: 'Name', render: r => <span className="font-medium text-sm">{r.name}</span> },
              { key: 'country_code', header: 'Code', render: r => <span className="text-sm font-bold text-foreground">{(r as any).country_code || '+91'}</span> },
              { key: 'phone', header: 'Phone', render: r => <span className="text-sm text-muted-foreground">{r.phone}</span> },
              { key: 'email', header: 'Email', render: r => <span className="text-xs text-muted-foreground">{r.email}</span> },
              {
                key: 'plan', header: 'Plan', render: r => {
                  const p = plans.find(pl => pl.id === r.corporatePlanId);
                  return p ? <PlanBadge name={p.name} code={p.code} color={p.color} /> : <Badge variant="amber">No plan</Badge>;
                }
              },
              {
                key: 'ok', header: 'Status', render: r => r.name && r.phone && r.corporatePlanId
                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                  : <AlertTriangle className="w-4 h-4 text-red-500" />
              },
            ]}
            data={importRows as CorporateEmployee[]}
            rowKey={(_, i) => String(i)}
          />
        </div>
      )}
    </div>
  );
}
