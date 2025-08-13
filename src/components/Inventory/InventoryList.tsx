import React, { useState } from 'react';
import { Search, Plus, Package, AlertTriangle, TrendingUp, Filter, Edit, Trash2 } from 'lucide-react';

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

const inventory: InventoryItem[] = [
  { id: '1', name: 'Dental Syringes', category: 'instruments', currentStock: 25, minStock: 10, unit: 'pieces', supplier: 'DentalCorp', lastRestocked: '2024-01-10', cost: 150 },
  { id: '2', name: 'Composite Filling Material', category: 'materials', currentStock: 5, minStock: 8, unit: 'tubes', supplier: 'MedSupply', lastRestocked: '2024-01-05', cost: 2500 },
  { id: '3', name: 'Dental Gloves (Nitrile)', category: 'consumables', currentStock: 200, minStock: 50, unit: 'boxes', supplier: 'SafetyFirst', lastRestocked: '2024-01-12', cost: 800 },
  { id: '4', name: 'Local Anesthetic', category: 'medicines', currentStock: 3, minStock: 5, unit: 'vials', supplier: 'PharmaCare', lastRestocked: '2023-12-28', cost: 1200 },
  { id: '5', name: 'Dental X-Ray Films', category: 'consumables', currentStock: 50, minStock: 20, unit: 'sheets', supplier: 'ImageTech', lastRestocked: '2024-01-08', cost: 45 },
];

interface InventoryListProps {
  onAddItem: () => void;
}

export function InventoryList({ onAddItem }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Track and manage dental supplies</p>
        </div>
        <button
          onClick={onAddItem}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-medium">
              {lowStockCount} item{lowStockCount > 1 ? 's' : ''} running low on stock
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory by name or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="instruments">Instruments</option>
          <option value="materials">Materials</option>
          <option value="consumables">Consumables</option>
          <option value="medicines">Medicines</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Restocked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {isLowStock(item.currentStock, item.minStock) && (
                          <div className="flex items-center text-xs text-orange-600 mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <span className={`font-medium ${isLowStock(item.currentStock, item.minStock) ? 'text-orange-600' : 'text-gray-900'}`}>
                        {item.currentStock}
                      </span>
                      <span className="text-gray-500"> / {item.minStock} min</span>
                    </div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.supplier}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(item.lastRestocked).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{item.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Restock
                    </button>
                    <div className="flex items-center space-x-2 mt-2">
                      <button className="text-green-600 hover:text-green-700 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
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