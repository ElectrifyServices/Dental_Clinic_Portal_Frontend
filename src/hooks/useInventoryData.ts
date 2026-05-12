import { useLocalStorage } from './useLocalStorage';
import { demoInventory } from '../data/demoData';

export function useInventoryData() {
  const [inventory, setInventory] = useLocalStorage<any[]>('inventory', demoInventory);

  const handleSaveInventoryItem = (item: any) => {
    setInventory(prev => {
      const existing = prev.find(i => i.id === item.id);
      const withId = { ...item, id: item.id || `INV-${Date.now()}` };
      return existing ? prev.map(i => i.id === item.id ? withId : i) : [...prev, withId];
    });
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  return { inventory, setInventory, handleSaveInventoryItem, handleDeleteInventoryItem };
}
