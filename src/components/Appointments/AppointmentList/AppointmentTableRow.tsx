import React from 'react';
import { Clock, MoreVertical, Calendar as CalendarIcon, Stethoscope, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface AppointmentTableRowProps {
  appointment: any;
  statusVariants: Record<string, any>;
  formatTime: (t: string) => string;
  onOpenMenu: (e: React.MouseEvent, id: string) => void;
}

export const AppointmentTableRow: React.FC<AppointmentTableRowProps> = ({
  appointment,
  statusVariants,
  formatTime,
  onOpenMenu,
}) => {
  const a = appointment;
  return (
    <tr className="hover:bg-gray-50/50 transition-colors group border-b border-gray-50 last:border-none">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary font-bold shadow-sm">
            {(a.patientName || a.patient || '?').charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-gray-900 leading-tight mb-0.5">{a.patientName || a.patient}</div>
            <div className="text-[10px] text-gray-500 font-medium">{a.patientPhone || a.phone || 'No Phone'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-gray-700 text-xs">
              {a.treatmentType || a.type}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Dr. {a.doctorName || '—'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-700 font-medium text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
            {a.date ? new Date(a.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : '—'}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-300" />
            {formatTime(a.time)} <span className="text-gray-300 mx-1">•</span> {a.duration || 15} min
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="font-semibold text-gray-900 text-sm">
          ₹{(a.fee || 0).toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant={statusVariants[a.status] || 'gray'} className="text-[10px] px-3 py-0.5 font-medium">
          {a.status.replace('-', ' ')}
        </Badge>
      </td>
      <td className="px-6 py-4 text-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
          onClick={e => onOpenMenu(e, a.id)}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
};
