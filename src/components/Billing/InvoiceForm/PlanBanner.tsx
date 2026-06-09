import React from 'react';
import { Building2 } from 'lucide-react';

interface PlanBannerProps {
  plan: any;
  savings: number;
}

export const PlanBanner: React.FC<PlanBannerProps> = ({ plan, savings }) => {
  if (!plan) return null;

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-200">
        <Building2 className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-black text-blue-900 uppercase tracking-tight">{plan.name}</p>
          <span className="font-mono text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/30 font-bold uppercase">
            {plan.code || 'CORP'}
          </span>
        </div>
        <p className="text-xs text-primary font-bold mt-0.5">{plan.companyName || 'Corporate Partner'}</p>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {(plan.benefits || []).slice(0, 3).map((b: any) => (
            <span key={b.id} className="text-[9px] font-bold text-primary bg-card border border-primary/20 px-2.5 py-1 rounded-full uppercase tracking-tighter">
              {b.description}
            </span>
          ))}
          {plan.benefits?.length > 3 && <span className="text-[9px] font-bold text-blue-500 py-1">+{plan.benefits.length - 3} more</span>}
        </div>
      </div>
      {savings > 0 && (
        <div className="text-right flex-shrink-0 bg-card/50 p-2 rounded-xl border border-primary/10">
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Plan Savings</p>
          <p className="text-xl font-black text-primary">₹{savings.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};
