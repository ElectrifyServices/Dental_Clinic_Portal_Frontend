import React from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { InventoryList } from "../components/Inventory/InventoryList";

export const InventoryPage: React.FC = () => {
  const { inventory, handleDeleteInventoryItem } = useAppData();
  const { setActiveModal, setSelectedItemId, setSelectedItemForRestock, confirmDelete } = useModal();

  return (
    <div className="space-y-6">
      <InventoryList
        inventory={inventory}
        onAddItem={() => { setSelectedItemId(""); setActiveModal("inventoryForm"); }}
        onEditItem={(id: string) => { setSelectedItemId(id); setActiveModal("inventoryForm"); }}
        onDeleteItem={(id: string) => {
          const item = inventory.find((i: any) => i.id === id);
          confirmDelete("Delete Inventory Item", `Delete ${item?.name} from inventory?`, () => handleDeleteInventoryItem(id));
        }}
        onRestock={(item: any) => { setSelectedItemForRestock(item); setActiveModal("restockForm"); }}
      />
    </div>
  );
};
