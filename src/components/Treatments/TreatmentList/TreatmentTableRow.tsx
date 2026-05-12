import React, { useState } from 'react';
import { FileText, MoreVertical, Edit, Clock, Play, CheckCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface TreatmentTableRowProps {
  treatment: any;
  statusMeta: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onManageSessions: (id: string) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
}

export function TreatmentTableRow({
  treatment,
  statusMeta,
  onView,
  onEdit,
  onManageSessions,
  onStart,
  onComplete
}: TreatmentTableRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 200; // Estimated max height of the menu
    const windowHeight = window.innerHeight;
    
    let top = rect.bottom + 4;
    if (rect.bottom + menuHeight > windowHeight) {
      // Open upwards if not enough space below
      top = rect.top - menuHeight;
      // Ensure it doesn't go above the screen either
      if (top < 0) top = 10; 
    }
    
    setMenuPos({ top, left: rect.right - 180 });
    setShowMenu(!showMenu);
  };

  const sm = statusMeta[treatment.status] || statusMeta.planned;
  const cost = Number(treatment.cost) < 100000000 ? Number(treatment.cost) : 0;

  return (
    <tr className="group hover:bg-muted/50 transition-colors">
      <td className="py-4 px-6">
        <div className="font-bold text-foreground">{treatment.patientName}</div>
        <div className="text-[11px] font-bold text-primary mt-0.5 uppercase tracking-wider">{treatment.procedure}</div>
      </td>
      <td className="py-4 px-6">
        <span className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-[10px] font-bold border border-border">
          {treatment.tooth || '—'}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm font-semibold text-muted-foreground">{treatment.doctorName}</div>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm font-medium text-muted-foreground">
          {treatment.date ? new Date(treatment.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
        </div>
      </td>
      <td className="py-4 px-6 text-right">
        <div className="text-sm font-bold text-foreground">₹{cost.toLocaleString()}</div>
      </td>
      <td className="py-4 px-6">
        <span className={`${sm.cls} flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border`}>
          {sm.icon}
          {sm.label}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="text-xs font-bold text-muted-foreground/60">
          {treatment.nextAppointment ? new Date(treatment.nextAppointment).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : '—'}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => onView(treatment.id)} 
            className="p-2 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
            title="View Details"
          >
            <FileText className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button 
              onClick={openMenu} 
              className={`p-2 rounded-xl transition-all ${showMenu ? 'bg-muted text-foreground' : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted'}`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowMenu(false)} />
                <div 
                  className="fixed z-[9999] bg-card rounded-2xl border border-border shadow-2xl w-48 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ top: menuPos.top, left: menuPos.left }}
                >
                  <div className="p-1.5">
                    <button onClick={() => { onEdit(treatment.id); setShowMenu(false); }}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground transition-colors">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <Edit className="w-4 h-4" />
                      </div>
                      Edit Plan
                    </button>
                    <button onClick={() => { onManageSessions(treatment.id); setShowMenu(false); }}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground transition-colors">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      Sessions
                    </button>
                    {treatment.status === 'planned' && (
                      <button onClick={() => { onStart(treatment.id); setShowMenu(false); }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-primary/10 rounded-xl flex items-center gap-3 text-primary transition-colors">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Play className="w-4 h-4" />
                        </div>
                        Start Now
                      </button>
                    )}
                    {treatment.status === 'in-progress' && (
                      <button onClick={() => { onComplete(treatment.id); setShowMenu(false); }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-emerald-50 rounded-xl flex items-center gap-3 text-emerald-700 transition-colors">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              </>,
              document.body
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
