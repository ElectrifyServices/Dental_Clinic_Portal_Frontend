import type { ApiAny } from "../types/api";
import { useSessionState } from './useSessionState';
import { demoInventory } from '../data/demoData';

export function useInventoryData() {
  const [inventory, setInventory] = useSessionState<ApiAny[]>('inventory', import.meta.env.DEV ? demoInventory : []);

  const handleSaveInventoryItem = (item: ApiAny) => {
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
