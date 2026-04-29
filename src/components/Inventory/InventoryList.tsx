import React, { useState } from 'react';
import { Search, Plus, Package, AlertTriangle, TrendingUp, Filter, Edit, Trash2, MoreVertical } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'instruments' | 'materials' | 'consumables' | 'medicines';
  currentStock: number;
  minStock: number;
  unit: string;
  supplier: string;
  lastRestocked: string;
  cost: number;
}


interface InventoryListProps {
  inventory: InventoryItem[];
  onAddItem: () => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onRestock: (item: InventoryItem) => void;
}

export function InventoryList({ inventory, onAddItem, onEditItem, onDeleteItem, onRestock }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'instruments': return 'bg-blue-100 text-blue-800';
      case 'materials': return 'bg-green-100 text-green-800';
      case 'consumables': return 'bg-yellow-100 text-yellow-800';
      case 'medicines': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isLowStock = (current: number, min: number) => current <= min;

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const lowStockCount = inventory.filter(item => isLowStock(item.currentStock, item.minStock)).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Inventory Management</h2>
          <p className="text-gray-500 mt-1 font-medium">Track and manage dental supplies</p>
        </div>
        <button
          onClick={onAddItem}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 flex items-center transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
            <span className="text-orange-900 font-medium">
              {lowStockCount} item{lowStockCount > 1 ? 's' : ''} running low on stock
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search inventory by name or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
           {['all', 'instruments', 'materials', 'consumables', 'medicines'].map((cat) => (
             <button
               key={cat}
               onClick={() => setFilterCategory(cat)}
               className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                 filterCategory === cat 
                 ? 'bg-blue-600 text-white shadow-md' 
                 : 'text-gray-500 hover:bg-gray-50'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Restocked</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredInventory.map((item, index) => {
                const isLastRows = index >= filteredInventory.length - 2;
                
                return (
                  <tr 
                    key={item.id} 
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="hover:bg-gray-50/50 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                          <Package className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                          {isLowStock(item.currentStock, item.minStock) && (
                            <div className="flex items-center text-[10px] text-orange-600 mt-1 font-bold uppercase tracking-widest">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Low Stock
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${getCategoryColor(item.category)} shadow-sm`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className={`text-base font-semibold ${isLowStock(item.currentStock, item.minStock) ? 'text-orange-600' : 'text-gray-900'}`}>
                          {item.currentStock}
                        </span>
                        <span className="text-gray-400 text-xs font-medium"> / {item.minStock} min</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-tight">{item.unit}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                      {new Date(item.lastRestocked).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right relative overflow-visible">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                        className={`p-2 rounded-xl transition-all duration-300 ${
                          activeMenu === item.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-400'
                        }`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeMenu === item.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-[60]" 
                            onClick={() => setActiveMenu(null)}
                          ></div>
                          <div 
                            className={`absolute right-0 ${isLastRows ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[70] py-2 animate-in fade-in zoom-in-95 duration-200`}
                          >
                            <button
                              onClick={() => {
                                onRestock(item);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 flex items-center font-semibold transition-colors"
                            >
                              <TrendingUp className="w-4 h-4 mr-3" />
                              Restock
                            </button>
                            <button
                              onClick={() => {
                                onEditItem(item.id);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center font-semibold transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-3" />
                              Edit Item
                            </button>
                            <div className="h-px bg-gray-100 my-1.5 mx-2"></div>
                            <button
                              onClick={() => {
                                onDeleteItem(item.id);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center font-semibold transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}