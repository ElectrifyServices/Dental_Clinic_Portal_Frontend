import React, { useRef, useState } from 'react';
import { X, Download, AlertTriangle, CheckCircle, PartyPopper } from 'lucide-react';
import { FileUploadZone, DataTable, Badge, PlanBadge, Button } from '../../ui';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../ui/Dialog';
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
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const pendingSavedRef = useRef<CorporateEmployee[] | null>(null);
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

  const hasWarnings = importErrors.length > 0 || importRows.some(r => !r.name || !r.phone || !r.corporatePlanId);

  const handleImportClick = () => {
    if (hasWarnings) return;
    const valid = importRows.filter(r => r.name && r.phone && r.corporatePlanId);
    if (!valid.length || valid.length !== importRows.length) return;
    setShowConfirm(true);
  };

  const handleImportConfirm = async () => {
    if (hasWarnings) return;
    const valid = importRows.filter(r => r.name && r.phone && r.corporatePlanId);
    if (!valid.length || valid.length !== importRows.length) return;

    setShowConfirm(false);
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

      pendingSavedRef.current = valid as CorporateEmployee[];
      setImportRows([]);
      setImportErrors([]);
      setSuccessCount(valid.length);
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
        <Button
          onClick={() => {
            if (importRows.length > 0) {
              setShowCancelConfirm(true);
            } else {
              setTab('list');
            }
          }}
          variant="outline"
          className="gap-2"
        >
          <X className="w-4 h-4" /> Cancel
        </Button>
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
        <div className="card border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {importErrors.length} warning{importErrors.length > 1 ? 's' : ''} found
            </p>
            <span className="text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
              Import blocked: Fix all warnings to proceed
            </span>
          </div>
          <p className="text-xs text-amber-700">
            Please resolve the following issues in the Excel/CSV file and re-upload. No records will be imported while warnings exist:
          </p>
          <div className="space-y-1">
            {importErrors.map((e, i) => <p key={i} className="text-xs text-amber-800">• {e}</p>)}
          </div>
        </div>
      )}

      {importRows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Preview — {importRows.length} row{importRows.length > 1 ? 's' : ''}</p>
            <Button
              onClick={handleImportClick}
              variant="default"
              className="gap-2"
              disabled={importing || hasWarnings}
              title={hasWarnings ? "Please resolve all warnings in the file before importing" : undefined}
            >
              {hasWarnings ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-300" /> Fix Warnings to Import
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Import {importRows.length} Employees
                </>
              )}
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

      <Dialog open={showCancelConfirm} onOpenChange={(open) => { if (!open) setShowCancelConfirm(false); }}>
        <DialogContent className="max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-9 h-9 text-amber-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold text-foreground">Discard Import?</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                You have an unsaved preview of {importRows.length} employee{importRows.length > 1 ? 's' : ''}. Leaving now will discard this data and nothing will be imported.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 w-full">
              <Button onClick={() => setShowCancelConfirm(false)} variant="outline" className="flex-1">
                Keep Editing
              </Button>
              <Button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setImportRows([]);
                  setImportErrors([]);
                  setTab('list');
                }}
                variant="destructive"
                className="flex-1"
              >
                Discard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirm} onOpenChange={(open) => { if (!open) setShowConfirm(false); }}>
        <DialogContent className="max-w-lg">
          <div className="space-y-4">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold text-foreground">Confirm Import</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                You are about to import {importRows.length} employee{importRows.length > 1 ? 's' : ''}. Please review the details below before proceeding.
              </DialogDescription>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="card p-3">
                <p className="text-xs text-muted-foreground">Total Employees</p>
                <p className="text-xl font-bold text-foreground">{importRows.length}</p>
              </div>
              <div className="card p-3">
                <p className="text-xs text-muted-foreground">Plans Involved</p>
                <p className="text-xl font-bold text-foreground">
                  {new Set(importRows.map(r => r.corporatePlanId)).size}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">Plan-wise breakdown</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Array.from(new Set(importRows.map(r => r.corporatePlanId))).map(planId => {
                  const p = plans.find(pl => pl.id === planId);
                  const count = importRows.filter(r => r.corporatePlanId === planId).length;
                  return (
                    <div key={String(planId)} className="flex items-center justify-between text-sm">
                      {p ? <PlanBadge name={p.name} code={p.code} color={p.color} /> : <Badge variant="amber">Unknown plan</Badge>}
                      <span className="text-muted-foreground">{count} employee{count > 1 ? 's' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">Employees</p>
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {importRows.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 text-sm">
                    <span className="font-medium text-foreground">{r.name}</span>
                    <span className="text-muted-foreground">{(r as Partial<CorporateEmployee> & { country_code?: string }).country_code || '+91'} {r.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button onClick={() => setShowConfirm(false)} variant="outline" disabled={importing}>
                Cancel
              </Button>
              <Button onClick={handleImportConfirm} variant="default" className="gap-2" disabled={importing}>
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Importing…
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Confirm & Import {importRows.length} Employees
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successCount !== null} onOpenChange={(open) => {
        if (!open) {
          setSuccessCount(null);
          const saved = pendingSavedRef.current;
          pendingSavedRef.current = null;
          if (saved) onBulkSave(saved);
        }
      }}>
        <DialogContent className="max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
                Import Successful <PartyPopper className="w-5 h-5 text-amber-500" />
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {successCount} employee{successCount === 1 ? '' : 's'} {successCount === 1 ? 'has' : 'have'} been successfully imported and added to the membership.
              </DialogDescription>
            </div>
            <Button
              onClick={() => {
                setSuccessCount(null);
                const saved = pendingSavedRef.current;
                pendingSavedRef.current = null;
                if (saved) onBulkSave(saved);
              }}
              variant="default"
              className="w-full gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
