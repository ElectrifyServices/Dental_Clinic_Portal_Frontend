import React from 'react';
import { Edit, UserX, Trash2, UserCheck, MessageCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface AppointmentActionMenuProps {
  appointment: any;
  onEdit?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string, cancelledReason?: string) => void;
  onDelete?: (id: string) => void;
  onCheckIn?: (appointment: any) => void;
  onDirectCheckIn?: (appointment: any) => void;
  onClose: () => void;
  pos: { top: number; left: number };
  checkingInApptId?: string | null;
  onWhatsappHistory?: (phone: string, name: string) => void;
}

export const AppointmentActionMenu: React.FC<AppointmentActionMenuProps> = ({
  appointment,
  onEdit,
  onUpdateStatus,
  onDelete,
  onCheckIn,
  onClose,
  pos,
  onWhatsappHistory
}) => {
  const statusLower = (appointment?.status || '').toLowerCase();
  const isCancelled = statusLower === 'cancelled';
  const isNoShow = statusLower === 'no-show';
  const isCheckedIn = statusLower === 'checked-in';
  const isCompleted = statusLower === 'completed';

  const canCheckIn = onCheckIn && !isCompleted && !isCancelled && !isCheckedIn && !isNoShow;
  const canEdit = onEdit && !isCancelled;
  const canModifyStatus = !isNoShow && !isCheckedIn && !isCompleted && !isCancelled;

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <Card 
        className="fixed z-[9999] rounded-2xl border-border/80 shadow-2xl w-56 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        style={{ top: pos.top, left: pos.left }}
      >
        <div className="p-1.5 space-y-0.5">
          {/* Check-in Patient */}
          {canCheckIn && (
            <Button 
              variant="ghost"
              onClick={() => { onCheckIn?.(appointment); onClose(); }}
              className="w-full !justify-start gap-3 px-2.5 py-2 h-auto text-xs font-semibold rounded-xl text-left hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 
              </div>
              <span className="truncate">Check-in Patient</span>
            </Button>
          )}

          {/* Edit Appointment (Hidden when cancelled) */}
          {canEdit && (
            <Button 
              variant="ghost"
              onClick={() => { onEdit?.(appointment.id); onClose(); }}
              className="w-full !justify-start gap-3 px-2.5 py-2 h-auto text-xs font-semibold rounded-xl text-left hover:bg-muted text-slate-700 dark:text-slate-200"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Edit className="w-4 h-4 text-muted-foreground" /> 
              </div>
              <span className="truncate">Edit Appointment</span>
            </Button>
          )}

          {/* WhatsApp History */}
          {onWhatsappHistory && (
            <Button 
              variant="ghost"
              onClick={() => { 
                onWhatsappHistory(appointment.patientPhone || appointment.phone || "", appointment.patientName || ""); 
                onClose(); 
              }}
              className="w-full !justify-start gap-3 px-2.5 py-2 h-auto text-xs font-semibold rounded-xl text-left hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 
              </div>
              <span className="truncate">WhatsApp History</span>
            </Button>
          )}

          {(canModifyStatus || isNoShow) && (
            <div className="h-px bg-border/60 my-1 mx-1.5" />
          )}

          {/* Status Actions: Mark No-Show & Cancel Appointment */}
          {canModifyStatus && (
            <>
              <Button 
                variant="ghost"
                onClick={() => { onUpdateStatus?.(appointment.id, 'no-show'); onClose(); }}
                className="w-full !justify-start gap-3 px-2.5 py-2 h-auto text-xs font-semibold rounded-xl text-left hover:bg-amber-500/10 text-amber-700 dark:text-amber-400"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                  <UserX className="w-4 h-4 text-amber-500" /> 
                </div>
                <span className="truncate">Mark No-Show</span>
              </Button>
              <Button 
                variant="ghost"
                onClick={() => { onUpdateStatus?.(appointment.id, 'cancelled'); onClose(); }}
                className="w-full !justify-start gap-3 px-2.5 py-2 h-auto text-xs font-semibold rounded-xl text-left hover:bg-rose-500/10 text-rose-700 dark:text-rose-400"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100/60 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4 text-rose-500" /> 
                </div>
                <span className="truncate">Cancel Appointment</span>
              </Button>
            </>
          )}

          {/* No-Show Screen / Status Action: Restore Status */}
          {isNoShow && (
            <Button 
              variant="ghost"
              onClick={() => { onUpdateStatus?.(appointment.id, 'scheduled'); onClose(); }}
              className="w-full !justify-start gap-3 px-2.5 py-2 h-auto text-xs font-semibold rounded-xl text-left hover:bg-primary/10 text-primary"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4 text-primary" /> 
              </div>
              <span className="truncate">Restore Status</span>
            </Button>
          )}

          <div className="h-px bg-border/60 my-1 mx-1.5" />

          {/* Delete Record */}
          <Button 
            variant="ghost"
            onClick={() => { 
              onDelete?.(appointment.id);
              onClose();
            }}
            className="w-full !justify-start gap-3 px-2.5 py-2 h-auto text-xs font-semibold rounded-xl text-left hover:bg-destructive/10 text-destructive"
          >
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-red-500" /> 
            </div>
            <span className="truncate">Delete Record</span>
          </Button>
        </div>
      </Card>
    </>
  );
};
