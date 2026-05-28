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
    <Card className="rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all overflow-hidden group">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0 pt-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h3 className="text-xl font-bold text-foreground tracking-tight">{plan.name}</h3>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${c.bg} ${c.text} ${c.border}`}>{plan.code}</span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>
              </div>
              <p className="text-sm text-muted-foreground font-bold leading-tight">{plan.companyName}</p>
              {plan.description && <p className="text-xs text-muted-foreground/60 mt-1.5 font-medium leading-relaxed max-w-2xl">{plan.description}</p>}
              <div className="flex gap-6 mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl"><Users className="w-3.5 h-3.5" />{plan.currentMembers}{plan.maxMembers ? ` / ${plan.maxMembers}` : ''} Enrollments</span>
                <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl"><Calendar className="w-3.5 h-3.5" />{plan.validFrom} — {plan.validTo}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                if (status === 'expired') return;
                onToggle(plan.id);
              }}
              disabled={status === 'expired' || isUpdatingStatus}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
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
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              )}
              {status === 'expired' ? 'Expired' : plan.isActive ? 'Active' : 'Inactive'}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-full transition-all text-muted-foreground">
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

        {/* Benefit chips */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {plan.benefits.map(b => (
            <span key={b.id} className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${c.bg} ${c.text} ${c.border} shadow-sm`}>
              {BENEFIT_ICONS[b.type]}
              {b.description}
            </span>
          ))}
        </div>

        <button onClick={() => setExpanded(!expanded)}
          className="mt-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-all">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Collapse Details' : 'View Full Configuration'}
        </button>
      </CardContent>

      {expanded && (
        <div className={`px-8 pb-8 pt-2 border-t border-border bg-muted/10`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.benefits.map(b => (
              <div key={b.id} className="flex items-start gap-4 bg-card rounded-2xl p-5 border border-border shadow-sm group-hover:shadow-md transition-all">
                <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                  {BENEFIT_ICONS[b.type]}
                </div>
                <div className="pt-0.5">
                  <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1">{BENEFIT_LABELS[b.type]}</p>
                  <p className="text-sm font-bold text-muted-foreground leading-tight">{b.description}</p>
                  {b.treatmentTypes?.length ? (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {b.treatmentTypes.map(t => (
                        <span key={t} className="text-[9px] font-black bg-muted px-2 py-0.5 rounded-lg uppercase tracking-tight text-muted-foreground">{TREATMENT_LABELS[t] || t}</span>
                      ))}
                    </div>
                  ) : null}
                  {b.cap ? <p className="text-[10px] font-black text-primary mt-3 uppercase tracking-widest">Cap: ₹{b.cap.toLocaleString()} Per Visit</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
