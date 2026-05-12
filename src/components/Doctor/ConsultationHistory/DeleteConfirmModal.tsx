import React from "react";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ onCancel, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
      <div className="bg-card rounded-xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex items-center gap-3 text-destructive mb-4">
          <Trash2 className="w-5 h-5" />
          <h3 className="text-base font-semibold">Confirm Deletion</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Are you sure you want to delete this consultation record? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition text-sm font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-destructive text-white hover:bg-destructive transition text-sm font-medium">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
