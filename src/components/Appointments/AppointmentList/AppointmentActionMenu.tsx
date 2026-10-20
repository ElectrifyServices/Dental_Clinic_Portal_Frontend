import type { ApiAny } from "../../../types/api";
import React from 'react';
import { Edit, UserX, CheckCircle, Trash2, UserCheck, MessageCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface AppointmentActionMenuProps {
  appointment: ApiAny;
  onEdit?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string, cancelledReason?: string) => void;
  onDelete?: (id: string) => void;
  onCheckIn?: (appointment: ApiAny) => void;
  onDirectCheckIn?: (appointment: ApiAny) => void;
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
  onDirectCheckIn: _onDirectCheckIn,
  onClose,
  pos,
  checkingInApptId: _checkingInApptId,
  onWhatsappHistory
}) => {
  const statusLower = String(appointment?.status || "").toLowerCase().replace(/[_\s]/g, "-");
  const isNoShow = statusLower === "no-show";
  const isCancelled = statusLower === "cancelled" || statusLower === "canceled";
  const isCompleted = statusLower === "completed";
  const isCheckedIn = statusLower === "checked-in";

  const canCheckIn = onCheckIn && !isNoShow && !isCancelled && !isCompleted && !isCheckedIn;
  const canModifyStatus = !isNoShow && !isCheckedIn && !isCompleted && !isCancelled;

  return (
    <>
      <div className="fixed inset-0 z-9998" onClick={onClose} />
      <div 
        className="fixed z-9999 bg-card rounded-2xl border border-border/80 shadow-xl w-48 sm:w-52 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-0.5"
        style={{ top: pos.top, left: pos.left }}
      >
        {canCheckIn && (
          <Button 
            variant="ghost"
            onClick={() => { onCheckIn?.(appointment); onClose(); }}
            className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 flex items-center gap-3 text-emerald-700 dark:text-emerald-400 rounded-xl transition-colors h-auto"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 
            </div>
            <span>Check-in Patient</span>
          </Button>
        )}

        <Button 
          variant="ghost"
          onClick={() => { onEdit?.(appointment.id); onClose(); }}
          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-muted flex items-center gap-3 text-slate-700 dark:text-slate-200 rounded-xl transition-colors font-medium h-auto"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Edit className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> 
          </div>
          <span>Edit Appointment</span>
        </Button>

        {onWhatsappHistory && (
          <Button 
            variant="ghost"
            onClick={() => { 
              onWhatsappHistory(appointment.patientPhone || appointment.phone || "", appointment.patientName || ""); 
              onClose(); 
            }}
            className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 flex items-center gap-3 text-emerald-700 dark:text-emerald-400 rounded-xl transition-colors h-auto"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 
            </div>
            <span>WhatsApp History</span>
          </Button>
        )}

        {(canModifyStatus || isNoShow) && (
          <div className="h-px bg-border/60 my-1 mx-1.5" />
        )}

        {canModifyStatus && (
          <>
            <Button 
              variant="ghost"
              onClick={() => { onUpdateStatus?.(appointment.id, 'no-show'); onClose(); }}
              className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-600 flex items-center gap-3 text-amber-700 dark:text-amber-400 rounded-xl transition-colors h-auto"
            >
              <div className="w-7 h-7 rounded-full bg-amber-100/70 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                <UserX className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> 
              </div>
              <span>Mark No-Show</span>
            </Button>

            <Button 
              variant="ghost"
              onClick={() => { onUpdateStatus?.(appointment.id, 'cancelled'); onClose(); }}
              className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-rose-500/10 hover:text-rose-600 flex items-center gap-3 text-rose-700 dark:text-rose-400 rounded-xl transition-colors font-medium h-auto"
            >
              <div className="w-7 h-7 rounded-full bg-rose-100/70 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" /> 
              </div>
              <span>Cancel Appointment</span>
            </Button>
          </>
        )}

        {isNoShow && (
          <Button 
            variant="ghost"
            onClick={() => { onUpdateStatus?.(appointment.id, 'scheduled'); onClose(); }}
            className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-primary/10 flex items-center gap-3 text-primary rounded-xl transition-colors h-auto"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" /> 
            </div>
            <span>Restore Status</span>
          </Button>
        )}

        <div className="h-px bg-border/60 my-1 mx-1.5" />

        <Button 
          variant="ghost"
          onClick={() => { 
            onDelete?.(appointment.id);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-destructive/10 flex items-center gap-3 text-rose-600 dark:text-rose-400 rounded-xl transition-colors h-auto"
        >
          <div className="w-7 h-7 rounded-full bg-rose-100/70 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
            <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" /> 
          </div>
          <span>Delete Record</span>
        </Button>
      </div>
    </>
  );
};
