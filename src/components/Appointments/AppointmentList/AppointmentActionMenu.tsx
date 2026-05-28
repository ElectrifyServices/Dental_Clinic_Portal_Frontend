import React from 'react';
import { Edit, UserX, CheckCircle, Trash2, UserCheck } from 'lucide-react';

interface AppointmentActionMenuProps {
  appointment: any;
  onEdit?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
  onCheckIn?: (appointment: any) => void;
  onClose: () => void;
  pos: { top: number; left: number };
}

export const AppointmentActionMenu: React.FC<AppointmentActionMenuProps> = ({
  appointment,
  onEdit,
  onUpdateStatus,
  onDelete,
  onCheckIn,
  onClose,
  pos
}) => {
  const canCheckIn = onCheckIn && !['completed', 'cancelled', 'checked-in', 'no-show'].includes(appointment.status);

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div 
        className="fixed z-[9999] bg-card rounded-2xl border border-border shadow-xl w-52 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ top: pos.top, left: pos.left }}
      >
        <div className="p-1.5 space-y-0.5">
          {canCheckIn && (
            <button 
              onClick={() => { onCheckIn?.(appointment); onClose(); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 flex items-center gap-3 text-emerald-700 rounded-xl transition-colors font-medium"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100/50 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-emerald-600" /> 
              </div>
              Check-in Patient
            </button>
          )}

          <button 
            onClick={() => { onEdit?.(appointment.id); onClose(); }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-3 text-muted-foreground rounded-xl transition-colors font-medium"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Edit className="w-4 h-4 text-muted-foreground/60" /> 
            </div>
            Edit Appointment
          </button>

          {appointment.status !== 'no-show' && appointment.status !== 'checked-in' ? (
            <button 
              onClick={() => { onUpdateStatus?.(appointment.id, 'no-show'); onClose(); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 flex items-center gap-3 text-amber-700 rounded-xl transition-colors font-medium"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <UserX className="w-4 h-4 text-amber-400" /> 
              </div>
              Mark No-Show
            </button>
          ) : appointment.status === 'no-show' ? (
            <button 
              onClick={() => { onUpdateStatus?.(appointment.id, 'scheduled'); onClose(); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 flex items-center gap-3 text-primary rounded-xl transition-colors font-medium"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-400" /> 
              </div>
              Restore Status
            </button>
          ) : null}

          <div className="h-px bg-muted my-1 mx-2" />

          <button 
            onClick={() => { 
              onDelete?.(appointment.id);
              onClose();
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 flex items-center gap-3 text-destructive rounded-xl transition-colors font-medium"
          >
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" /> 
            </div>
            Delete Record
          </button>
        </div>
      </div>
    </>
  );
};
