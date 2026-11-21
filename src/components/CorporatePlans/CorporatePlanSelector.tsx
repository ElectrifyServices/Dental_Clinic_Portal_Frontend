import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
﻿import React, { useState } from 'react';
import { Building2, Check, ChevronDown, X, Info, Tag } from 'lucide-react';
import { CorporatePlan } from '../../types';
import { COLOR_MAP, getPlanBenefitSummary } from '../../utils/corporatePlan';
import { Button } from '../ui';

interface Props {
  plans: CorporatePlan[];
  selectedPlanId: string;
  memberId: string;
  onChange: (planId: string, planName: string, memberId: string) => void;
}

export function CorporatePlanSelector({ plans, selectedPlanId, memberId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const activePlans = plans.filter(p => p.isActive);
  const selected = activePlans.find(p => p.id === selectedPlanId);

  if (activePlans.length === 0) {
    return (
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">No active corporate plans. A Super Admin must create plans first from the Corporate Plans section.</p>
      </div>
    );
  }

  const cc = selected ? (COLOR_MAP[selected.color] ?? COLOR_MAP.blue) : null;

  return (
    <div className="space-y-3">
      {/* Selector */}
      <div className="relative">
        <Button type="button" onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
            {selected ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-foreground truncate">{selected.name}</span>
                <span className={`flex-shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded border ${cc?.bg} ${cc?.text} ${cc?.border}`}>{selected.code}</span>
              </div>
            ) : (
              <span className="text-muted-foreground/60">Select a corporate plan (optional)</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {selected && (
              <Button type="button" onClick={e => { e.stopPropagation(); onChange('', '', ''); }}
                className="p-0.5 hover:bg-muted rounded"><X className="w-3.5 h-3.5 text-muted-foreground/60" /></Button>
            )}
            <ChevronDown className={`w-4 h-4 text-muted-foreground/60 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </Button>

        {open && (
          <div className="absolute z-50 top-full mt-1.5 w-full bg-card rounded-xl border border-border shadow-xl overflow-hidden">
            <div className="max-h-56 overflow-y-auto">
              {activePlans.map(plan => {
                const c = COLOR_MAP[plan.color] ?? COLOR_MAP.blue;
                const isSel = plan.id === selectedPlanId;
                return (
                  <Button key={plan.id} type="button"
                    onClick={() => { onChange(plan.id, plan.name, memberId); setOpen(false); }}
                    className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted flex items-start justify-between gap-3 ${isSel ? 'bg-primary/10' : ''}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>{plan.code}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.companyName}</p>
                      <p className="text-xs text-primary mt-0.5 truncate">{getPlanBenefitSummary(plan)}</p>
                    </div>
                    {isSel && <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Member ID + benefits preview */}
      {selected && cc && (
        <div className="space-y-2">
          <div>
            <Label className="block text-xs font-semibold text-muted-foreground mb-1">Employee/Member ID <span className="font-normal text-muted-foreground/60">(optional)</span></Label>
            <Input type="text" value={memberId} onChange={e => onChange(selectedPlanId, selected.name, e.target.value)}
              placeholder="e.g. EMP-12345"
              className="w-full px-3.5 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className={`${cc.bg} border ${cc.border} rounded-xl p-3`}>
            <p className={`text-xs font-bold ${cc.text} mb-2 flex items-center gap-1.5`}>
              <Tag className="w-3.5 h-3.5" /> Plan Benefits
            </p>
            <div className="space-y-1">
              {selected.benefits.map(b => (
                <div key={b.id} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <div className={`w-1.5 h-1.5 rounded-full ${cc.dot} flex-shrink-0 mt-1`} />
                  {b.description}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2 border-t border-border pt-2">
              Valid: {selected.validFrom} → {selected.validTo}
              {selected.maxMembers && ` · ${selected.currentMembers}/${selected.maxMembers} enrolled`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
