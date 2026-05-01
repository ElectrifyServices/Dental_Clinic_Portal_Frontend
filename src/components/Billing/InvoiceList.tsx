import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, MoreVertical, Download, IndianRupee, Send } from 'lucide-react';
import { InvoicePaymentModal } from './InvoicePaymentModal';
import { createPortal } from 'react-dom';

interface Invoice {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  total: number;
  amount?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'complimentary';
  dueDate: string;
  patientId?: string;
}

interface InvoiceListProps {
  onCreateInvoice: () => void;
  onViewInvoice?: (id: string) => void;
  onDeleteInvoice?: (id: string) => void;
  invoices: Invoice[];
  onUpdateStatus?: (id: string, status: string) => void;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  paid:          { label: 'Paid',          cls: 'badge badge-green' },
  sent:          { label: 'Sent',          cls: 'badge badge-blue' },
  overdue:       { label: 'Overdue',       cls: 'badge badge-red' },
  draft:         { label: 'Draft',         cls: 'badge badge-gray' },
  complimentary: { label: 'Complimentary', cls: 'badge badge-violet' },
  cancelled:     { label: 'Cancelled',     cls: 'badge badge-gray' },
};

const FILTERS = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'];

export function InvoiceList({ onCreateInvoice, onDeleteInvoice, onViewInvoice, invoices, onUpdateStatus }: InvoiceListProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    return (inv.patientName.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q))
      && (status === 'all' || inv.status === status);
  });

  const totalAmt = filtered.reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const pendingAmt = filtered.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.total || i.amount || 0), 0);

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 176 });
    setOpenMenuId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="page-subtitle">{invoices.length} invoices · ₹{totalAmt.toLocaleString()} total · ₹{pendingAmt.toLocaleString()} pending</p>
        </div>
        <button onClick={onCreateInvoice} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by patient name or invoice ID…" value={search}
            onChange={e => setSearch(e.target.value)} className="search-input" />
        </div>
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setStatus(f)}
              className={status === f ? 'filter-tab-active' : 'filter-tab'}>
              {f === 'all' ? 'All' : STATUS_META[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Due Date</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><p className="empty-state-title">No invoices found</p><p className="empty-state-sub">Create your first invoice to get started.</p></div></td></tr>
              ) : filtered.map(inv => {
                const sm = STATUS_META[inv.status] || STATUS_META.draft;
                const amt = inv.total || inv.amount || 0;
                return (
                  <tr key={inv.id}>
                    <td><span className="font-mono text-xs font-semibold text-gray-800">{inv.id}</span></td>
                    <td>
                      <div className="font-semibold text-gray-900">{inv.patientName}</div>
                      {inv.phone && <div className="text-xs text-gray-400 mt-0.5">{inv.phone}</div>}
                    </td>
                    <td className="text-gray-600">{inv.date ? new Date(inv.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</td>
                    <td className="text-gray-600">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</td>
                    <td className="text-right"><span className="font-semibold text-gray-900">₹{amt.toLocaleString()}</span></td>
                    <td><span className={sm.cls}>{sm.label}</span></td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => onViewInvoice?.(inv.id)} className="btn-icon-blue" title="View"><Eye className="w-4 h-4" /></button>
                        <div className="relative">
                          <button onClick={e => openMenu(e, inv.id)} className="btn-icon" title="More"><MoreVertical className="w-4 h-4" /></button>
                          {openMenuId === inv.id && createPortal(
                            <>
                              <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
                              <div className="fixed z-[9999] bg-white rounded-xl border border-gray-200 shadow-xl w-44 overflow-hidden"
                                style={{ top: menuPos.top, left: menuPos.left }}>
                                {inv.status !== 'paid' && onUpdateStatus && (
                                  <button onClick={() => { setPayInvoice(inv); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2.5">
                                    <IndianRupee className="w-4 h-4" /> Mark as Paid
                                  </button>
                                )}
                                {inv.status === 'draft' && onUpdateStatus && (
                                  <button onClick={() => { onUpdateStatus(inv.id, 'sent'); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2.5">
                                    <Send className="w-4 h-4" /> Send to Patient
                                  </button>
                                )}
                                <button onClick={() => { onDeleteInvoice?.(inv.id); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5">
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            </>,
                            document.body
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {payInvoice && (
        <InvoicePaymentModal
          invoice={payInvoice}
          onClose={() => setPayInvoice(null)}
          onConfirmPayment={(id, method) => { onUpdateStatus?.(id, 'paid'); setPayInvoice(null); }}
        />
      )}
    </div>
  );
}
