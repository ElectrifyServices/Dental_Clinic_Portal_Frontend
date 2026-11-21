import React from "react";
import { useModal } from "../contexts/ModalContext";
import { InventoryList } from "../components/Inventory/InventoryList";
import { useDeleteInventoryItemMutation } from "../hooks/inventory/useDeleteInventoryItemMutation";

export const InventoryPage: React.FC = () => {
  const { setActiveModal, setSelectedItemId, setSelectedItemForRestock, confirmDelete } = useModal();
  const deleteMutation = useDeleteInventoryItemMutation();

  return (
    <div className="space-y-6">
      <InventoryList
        inventory={[]}
        onAddItem={() => { setSelectedItemId(""); setActiveModal("inventoryForm"); }}
        onEditItem={(id: string) => { setSelectedItemId(id); setActiveModal("inventoryForm"); }}
        onDeleteItem={(id: string) => {
          confirmDelete("Delete Inventory Item", `Delete this item from inventory?`, async () => {
            try {
              await deleteMutation.mutateAsync({ id });
            } catch (error) {
            }
          });
        }}
        onRestock={(item: any) => { setSelectedItemForRestock(item); setActiveModal("restockForm"); }}
        onConsume={(item: any) => { setSelectedItemForRestock(item); setActiveModal("consumeForm"); }}
        onAdjust={(item: any) => { setSelectedItemForRestock(item); setActiveModal("adjustForm"); }}
        onViewHistory={(item: any) => { setSelectedItemForRestock(item); setActiveModal("inventoryHistory"); }}
      />
    </div>
  );
};
