import React from "react";
import { Modal, Card, CardContent } from "@/components/ui";
import { Clock, PlusCircle, MinusCircle, SlidersHorizontal } from "lucide-react";
import { useInventoryMovementsQuery, type InventoryMovement } from "../../hooks/inventory/useInventoryMovementsQuery";

interface InventoryHistoryViewerProps {
  itemId: string;
  itemName: string;
  onClose: () => void;
}

export function InventoryHistoryViewer({ itemId, itemName, onClose }: InventoryHistoryViewerProps) {
  const { data: movementsResponse, isLoading } = useInventoryMovementsQuery(itemId);

  let movements: InventoryMovement[] = [];
  if (Array.isArray(movementsResponse)) {
    movements = movementsResponse;
  } else if (movementsResponse && Array.isArray((movementsResponse as any).data)) {
    movements = (movementsResponse as any).data;
  }

  const getMovementDetails = (type: string) => {
    switch (type?.toUpperCase()) {
      case "RESTOCK":
        return { icon: <PlusCircle className="w-4 h-4 text-emerald-600" />, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", label: "Restocked" };
      case "USAGE":
      case "CONSUME":
        return { icon: <MinusCircle className="w-4 h-4 text-amber-600" />, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", label: "Consumed" };
      case "ADJUSTMENT":
      default:
        return { icon: <SlidersHorizontal className="w-4 h-4 text-blue-600" />, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", label: "Adjusted" };
    }
  };

  return (
    <Modal
      title={`Movement History`}
      onClose={onClose}
      size="lg"
      icon={<Clock className="w-4 h-4" />}
    >
      <div className="space-y-6">
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">
              Inventory Item
            </p>
            <p className="text-lg font-black text-foreground leading-tight">
              {itemName}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading history...</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No movement history found for this item.
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {movements.map((movement) => {
              const meta = getMovementDetails(movement.movement_type);
              const qtyDisplay = movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity;
              
              return (
                <Card key={movement.id} className={`overflow-hidden border ${meta.border}`}>
                  <CardContent className={`p-4 ${meta.bg}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1.5 rounded-full bg-white shadow-sm ${meta.color}`}>
                          {meta.icon}
                        </div>
                        <div>
                          <p className={`font-bold ${meta.color} uppercase text-xs tracking-wider mb-1`}>
                            {meta.label}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {movement.reason || "No reason provided"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              {new Date(movement.created_at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                            {movement.reference_id && (
                              <span className="px-2 py-0.5 bg-white rounded-md border font-mono">
                                Ref: {movement.reference_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-black ${movement.quantity > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                          {qtyDisplay}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          Stock: {movement.before_stock} → <span className="font-bold text-foreground">{movement.after_stock}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
