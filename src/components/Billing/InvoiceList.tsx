import React, { useState } from 'react';
import { Search, Plus, Filter, Download, Eye, MoreVertical, Trash2, Send } from 'lucide-react';

interface Invoice {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  total: number;
  amount?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
}

interface InvoiceListProps {
  onCreateInvoice: () => void;
  onViewInvoice?: (invoiceId: string) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  invoices: Invoice[];
  onUpdateStatus?: (id: string, status: string) => void;
}

export function InvoiceList({ onCreateInvoice, onDeleteInvoice, onViewInvoice, invoices , onUpdateStatus}: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600 mt-1">Manage billing and payments</p>
        </div>
        <button
          onClick={onCreateInvoice}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices by patient or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{invoice.patientName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{(invoice.total ?? invoice.amount ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
<td className="px-6 py-4 relative">
  <div>
    {/* 3 dots button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX - 120, // Adjusts menu to align right
        });
        setOpenMenuId(openMenuId === invoice.id ? null : invoice.id);
      }}
      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
    >
      <MoreVertical className="w-4 h-4" />
    </button>

    {/* Dropdown Menu */}
    {openMenuId === invoice.id && (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setOpenMenuId(null)}
        />

        {/* Dropdown */}
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 w-44 z-[9999] overflow-hidden"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
          }}
        >
          {/* View */}
          <button
            onClick={() => {
              onViewInvoice?.(invoice.id);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
          >
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700">View Details</span>
          </button>

          <button
onClick={() => {
  const amountStr = (invoice.total ?? invoice.amount ?? 0).toLocaleString();
  const message = `Hello ${invoice.patientName},
Your invoice (${invoice.id}) of ₹${amountStr} is ready.
Please complete your payment.
Thank you!`;
  const phone = invoice.phone || ''; // make sure number exists
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  onUpdateStatus?.(invoice.id, 'sent');
  setOpenMenuId(null);
}}
  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-3 text-blue-600"
>
  <Send className='w-4 h-4'/>
  Send Invoices
</button>

          <div className="border-t border-gray-100" />

          {/* Delete */}
          <button
            onClick={() => {
              onDeleteInvoice?.(invoice.id);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-3 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-red-600">Delete</span>
          </button>
        </div>
      </>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
