import React, { useState } from 'react';
import { Search, Plus, FileText, Eye, Trash2, Shield, CheckCircle, Clock } from 'lucide-react';

interface ConsentFormListProps {
  forms: any[];
  onAddForm: () => void;
  onViewForm: (id: string) => void;
  onDeleteForm: (id: string) => void;
}

export function ConsentFormList({ forms, onAddForm, onViewForm, onDeleteForm }: ConsentFormListProps) {
  const [search, setSearch] = useState('');

  const filtered = forms.filter(f =>
    f.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    f.treatmentType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Consent Forms</h1>
          <p className="page-subtitle">{forms.length} authorized consent{forms.length !== 1 ? 's' : ''} on record</p>
        </div>
        <button onClick={onAddForm} className="btn-primary">
          <Plus className="w-4 h-4" /> New Consent Form
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        <input type="text" placeholder="Search by patient or treatment type…" value={search}
          onChange={e => setSearch(e.target.value)} className="search-input" />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Shield className="empty-state-icon" />
            <p className="empty-state-title">No consent forms found</p>
            <p className="empty-state-sub">Create a consent form for a patient procedure to get started.</p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Treatment Type</th>
                <th>Date Signed</th>
                <th>Signature</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(form => (
                <tr key={form.id}>
                  <td>
                    <div className="font-semibold text-foreground">{form.patientName}</div>
                    {form.patientId && <div className="text-xs text-muted-foreground/60 font-mono mt-0.5">{form.patientId}</div>}
                  </td>
                  <td>
                    <div className="font-medium text-foreground">{form.treatmentType}</div>
                  </td>
                  <td className="text-muted-foreground whitespace-nowrap">
                    {form.date ? new Date(form.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                  </td>
                  <td>
                    {form.signature ? (
                      <span className="badge badge-green flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" /> Signed
                      </span>
                    ) : (
                      <span className="badge badge-amber flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onViewForm(form.id)} className="btn-icon-blue" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteForm(form.id)}
                        className="btn-icon-red" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
