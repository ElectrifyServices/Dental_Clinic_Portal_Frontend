import React, { useState } from 'react';
import {
  Building2, Users, Calendar, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, Edit2, Trash2, MoreHorizontal
} from 'lucide-react';
import { CorporatePlan } from '../../../types';
import { COLOR_MAP, getPlanStatus, TREATMENT_LABELS } from '../../../utils/corporatePlan';
import { BENEFIT_ICONS, STATUS_BADGE, STATUS_LABEL } from './constants';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui';
import { Card, CardContent } from '../../ui/Card';

interface CorporatePlanCardProps {
  plan: CorporatePlan;
  BENEFIT_LABELS: Record<string, string>;
  isUpdatingStatus: boolean;
  onEdit: (plan: CorporatePlan) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function CorporatePlanCard({ plan, BENEFIT_LABELS, isUpdatingStatus, onEdit, onDelete, onToggle }: CorporatePlanCardProps) {
  const [expanded, setExpanded] = useState(false);

  const c = COLOR_MAP[plan.color] ?? COLOR_MAP.blue;
  const status = getPlanStatus(plan);

  return (
    <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden rounded-xl group h-fit flex flex-col justify-between">
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Top Header Row: Icon & Status Toggle/Actions */}
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (status === 'expired') return;
                onToggle(plan.id);
              }}
              disabled={status === 'expired' || isUpdatingStatus}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors border ${
                status === 'expired'
                  ? 'bg-rose-100 text-rose-700 border-rose-200 cursor-not-allowed'
                  : plan.isActive
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                    : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
              }`}
              title={status === 'expired' ? "Expired! Please update the validity dates to activate." : ""}
            >
              {status === 'expired' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              ) : plan.isActive ? (
                <ToggleRight className="w-3.5 h-3.5" />
              ) : (
                <ToggleLeft className="w-3.5 h-3.5" />
              )}
              {status === 'expired' ? 'Expired' : plan.isActive ? 'Active' : 'Inactive'}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 hover:bg-muted rounded-full transition-all text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(plan)} className="cursor-pointer">
                  <Edit2 className="w-4 h-4 mr-2 text-primary" />
                  <span>Edit Plan</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(plan.id)} className="cursor-pointer text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span>Delete Plan</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Plan Identity Block */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-foreground tracking-tight leading-tight truncate">{plan.name}</h3>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${c.bg} ${c.text} ${c.border}`}>{plan.code}</span>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>
          </div>
          <p className="text-xs text-muted-foreground font-bold leading-tight">{plan.companyName}</p>
          {plan.description && <p className="text-xs text-muted-foreground/60 mt-1 font-medium leading-relaxed line-clamp-2">{plan.description}</p>}
        </div>

        {/* Plan Metrics / Stats */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-xl text-xs text-muted-foreground font-bold">
            <Users className="w-4 h-4 text-muted-foreground/60 shrink-0" />
            <span>{plan.currentMembers}{plan.maxMembers ? ` / ${plan.maxMembers}` : ''} Enrollments</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-xl text-xs text-muted-foreground font-bold">
            <Calendar className="w-4 h-4 text-muted-foreground/60 shrink-0" />
            <span className="truncate">{plan.validFrom} — {plan.validTo}</span>
          </div>
        </div>

        {/* Benefit Highlight Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {plan.benefits.map(b => (
            <span key={b.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${c.bg} ${c.text} ${c.border} shadow-sm`}>
              {BENEFIT_ICONS[b.type]}
              {b.description}
            </span>
          ))}
        </div>

        {/* View Details Trigger */}
        <button onClick={() => setExpanded(!expanded)}
          className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-all">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Collapse Details' : 'View Full Configuration'}
        </button>
      </CardContent>

      {expanded && (
        <div className={`px-5 pb-5 pt-3 border-t border-border bg-muted/10`}>
          <div className="grid grid-cols-1 gap-3">
            {plan.benefits.map(b => (
              <div key={b.id} className="flex items-start gap-3.5 bg-card rounded-xl p-4 border border-border shadow-sm group-hover:shadow-md transition-all">
                <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                  {BENEFIT_ICONS[b.type]}
                </div>
                <div className="pt-0.5 min-w-0 flex-1">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-0.5">{BENEFIT_LABELS[b.type]}</p>
                  <p className="text-xs font-bold text-muted-foreground leading-snug">{b.description}</p>
                  {b.treatmentTypes?.length ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {b.treatmentTypes.map(t => (
                        <span key={t} className="text-[8px] font-black bg-muted px-1.5 py-0.5 rounded uppercase tracking-tight text-muted-foreground">{TREATMENT_LABELS[t] || t}</span>
                      ))}
                    </div>
                  ) : null}
                  {b.cap ? <p className="text-[9px] font-black text-primary mt-2 uppercase tracking-widest">Cap: ₹{b.cap.toLocaleString()} Per Visit</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
