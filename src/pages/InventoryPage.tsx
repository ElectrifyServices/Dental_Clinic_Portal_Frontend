import React from 'react';
import { InventoryList } from '../components/Inventory/InventoryList';

interface InventoryPageProps {
  inventory: any[];
  onAddItem: () => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onRestock: (item: any) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = (props) => {
  return (
    <div className="space-y-6">
      <InventoryList {...props} />
    </div>
  );
};
