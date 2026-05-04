import React from 'react';
import { Building2 } from 'lucide-react';

interface PlanBannerProps {
  plan: any;
  savings: number;
}

export const PlanBanner: React.FC<PlanBannerProps> = ({ plan, savings }) => {
  if (!plan) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-200">
        <Building2 className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-black text-blue-900 uppercase tracking-tight">{plan.name}</p>
          <span className="font-mono text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-bold uppercase">
            {plan.code || 'CORP'}
          </span>
        </div>
        <p className="text-xs text-blue-700 font-bold mt-0.5">{plan.companyName || 'Corporate Partner'}</p>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {(plan.benefits || []).slice(0, 3).map((b: any) => (
            <span key={b.id} className="text-[9px] font-bold text-blue-700 bg-white border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-tighter">
              {b.description}
            </span>
          ))}
          {plan.benefits?.length > 3 && <span className="text-[9px] font-bold text-blue-500 py-1">+{plan.benefits.length - 3} more</span>}
        </div>
      </div>
      {savings > 0 && (
        <div className="text-right flex-shrink-0 bg-white/50 p-2 rounded-xl border border-blue-100/50">
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Plan Savings</p>
          <p className="text-xl font-black text-blue-700">₹{savings.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};
