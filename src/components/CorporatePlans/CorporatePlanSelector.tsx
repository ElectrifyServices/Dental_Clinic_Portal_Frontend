import React, { useState } from 'react';
import { Building2, Check, ChevronDown, X, Info, Tag } from 'lucide-react';
import { CorporatePlan } from '../../types';
import { COLOR_MAP, getPlanBenefitSummary } from '../../utils/corporatePlan';

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
        <button type="button" onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {selected ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-gray-900 truncate">{selected.name}</span>
                <span className={`flex-shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded border ${cc?.bg} ${cc?.text} ${cc?.border}`}>{selected.code}</span>
              </div>
            ) : (
              <span className="text-gray-400">Select a corporate plan (optional)</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {selected && (
              <button type="button" onClick={e => { e.stopPropagation(); onChange('', '', ''); }}
                className="p-0.5 hover:bg-gray-100 rounded"><X className="w-3.5 h-3.5 text-gray-400" /></button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {open && (
          <div className="absolute z-50 top-full mt-1.5 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="max-h-56 overflow-y-auto">
              {activePlans.map(plan => {
                const c = COLOR_MAP[plan.color] ?? COLOR_MAP.blue;
                const isSel = plan.id === selectedPlanId;
                return (
                  <button key={plan.id} type="button"
                    onClick={() => { onChange(plan.id, plan.name, memberId); setOpen(false); }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex items-start justify-between gap-3 ${isSel ? 'bg-blue-50' : ''}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>{plan.code}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{plan.companyName}</p>
                      <p className="text-xs text-blue-600 mt-0.5 truncate">{getPlanBenefitSummary(plan)}</p>
                    </div>
                    {isSel && <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                  </button>
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">Employee/Member ID <span className="font-normal text-gray-400">(optional)</span></label>
            <input type="text" value={memberId} onChange={e => onChange(selectedPlanId, selected.name, e.target.value)}
              placeholder="e.g. EMP-12345"
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className={`${cc.bg} border ${cc.border} rounded-xl p-3`}>
            <p className={`text-xs font-bold ${cc.text} mb-2 flex items-center gap-1.5`}>
              <Tag className="w-3.5 h-3.5" /> Plan Benefits
            </p>
            <div className="space-y-1">
              {selected.benefits.map(b => (
                <div key={b.id} className="flex items-start gap-1.5 text-xs text-gray-700">
                  <div className={`w-1.5 h-1.5 rounded-full ${cc.dot} flex-shrink-0 mt-1`} />
                  {b.description}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 border-t border-gray-200 pt-2">
              Valid: {selected.validFrom} → {selected.validTo}
              {selected.maxMembers && ` · ${selected.currentMembers}/${selected.maxMembers} enrolled`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
