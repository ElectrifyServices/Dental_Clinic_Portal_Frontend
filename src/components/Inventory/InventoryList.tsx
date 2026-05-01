import React, { useState } from 'react';
import { Search, Plus, Package, AlertTriangle, Edit, Trash2, RefreshCw, MoreVertical } from 'lucide-react';
import { createPortal } from 'react-dom';

interface InventoryItem {
  id: string;
  name: string;
  category: 'instruments' | 'materials' | 'consumables' | 'medicines';
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  supplier: string;
  lastRestocked: string;
  cost: number;
  expiryDate?: string;
}

interface InventoryListProps {
  inventory: InventoryItem[];
  onAddItem: () => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onRestock: (item: InventoryItem) => void;
}

const CAT_META: Record<string, { label: string; cls: string }> = {
  instruments:  { label: 'Instruments',  cls: 'badge badge-blue' },
  materials:    { label: 'Materials',    cls: 'badge badge-green' },
  consumables:  { label: 'Consumables',  cls: 'badge badge-amber' },
  medicines:    { label: 'Medicines',    cls: 'badge badge-violet' },
};

const CATEGORIES = ['all', 'instruments', 'materials', 'consumables', 'medicines'];

export function InventoryList({ inventory, onAddItem, onEditItem, onDeleteItem, onRestock }: InventoryListProps) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const filtered = inventory.filter(item => {
    const q = search.toLowerCase();
    return (item.name.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q))
      && (cat === 'all' || item.category === cat);
  });

  const lowCount = inventory.filter(i => i.currentStock <= i.minStock).length;

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 160 });
    setOpenMenuId(prev => prev === id ? null : id);
  };

  const stockPct = (item: InventoryItem) => {
    const max = item.maxStock || item.minStock * 3;
    return Math.min(100, Math.round((item.currentStock / max) * 100));
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{inventory.length} items · {lowCount > 0 ? `${lowCount} low stock` : 'All levels OK'}</p>
        </div>
        <button onClick={onAddItem} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {lowCount > 0 && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {lowCount} item{lowCount > 1 ? 's are' : ' is'} below minimum stock level — reorder needed.
        </div>
      )}

      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or supplier…" value={search}
            onChange={e => setSearch(e.target.value)} className="search-input" />
        </div>
        <div className="filter-tabs">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={cat === c ? 'filter-tab-active' : 'filter-tab'}>
              {c === 'all' ? 'All' : CAT_META[c]?.label || c}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Unit Cost</th>
              <th>Supplier</th>
              <th>Last Restocked</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><Package className="empty-state-icon" /><p className="empty-state-title">No items found</p></div></td></tr>
            ) : filtered.map(item => {
              const isLow = item.currentStock <= item.minStock;
              const pct = stockPct(item);
              return (
                <tr key={item.id}>
                  <td>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {item.name}
                      {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    </div>
                    {item.expiryDate && <div className="text-xs text-gray-400 mt-0.5">Exp: {item.expiryDate}</div>}
                  </td>
                  <td><span className={CAT_META[item.category]?.cls || 'badge badge-gray'}>{CAT_META[item.category]?.label || item.category}</span></td>
                  <td>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${pct > 50 ? 'bg-emerald-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-semibold whitespace-nowrap ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                        {item.currentStock}/{item.minStock} {item.unit}
                      </span>
                    </div>
                  </td>
                  <td className="font-medium text-gray-800">₹{item.cost.toLocaleString()}</td>
                  <td className="text-gray-600">{item.supplier}</td>
                  <td className="text-gray-500 whitespace-nowrap">
                    {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : '—'}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onRestock(item)} className="btn-icon-blue" title="Restock"><RefreshCw className="w-4 h-4" /></button>
                      <div className="relative">
                        <button onClick={e => openMenu(e, item.id)} className="btn-icon" title="More"><MoreVertical className="w-4 h-4" /></button>
                        {openMenuId === item.id && createPortal(
                          <>
                            <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
                            <div className="fixed z-[9999] bg-white rounded-xl border border-gray-200 shadow-xl w-40 overflow-hidden"
                              style={{ top: menuPos.top, left: menuPos.left }}>
                              <button onClick={() => { onEditItem(item.id); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
                                <Edit className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => { onDeleteItem(item.id); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2.5 text-red-600">
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
  );
}
