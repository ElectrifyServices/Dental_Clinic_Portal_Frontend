import React from 'react';
import { Building2, Users } from 'lucide-react';

interface PlanBannerProps {
  plan: any;
  savings: number;
  dependentOf?: string;  // primary member name if this patient is a dependent
}

export const PlanBanner: React.FC<PlanBannerProps> = ({ plan, savings, dependentOf }) => {
  if (!plan) return null;

  const isIndividual = plan.planCategory === 'individual';

  return (
    <div className={`border rounded-2xl p-5 flex items-start gap-4 shadow-sm ${isIndividual ? 'bg-teal-50 border-teal-200' : 'bg-primary/10 border-primary/30'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg ${isIndividual ? 'bg-teal-500 shadow-teal-200' : 'bg-primary shadow-blue-200'}`}>
        {isIndividual ? <Users className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-black uppercase tracking-tight ${isIndividual ? 'text-teal-900' : 'text-blue-900'}`}>{plan.name}</p>
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${isIndividual ? 'bg-teal-100 text-teal-700 border-teal-300' : 'bg-primary/10 text-primary border-primary/30'}`}>
            {plan.code || (isIndividual ? 'IND' : 'CORP')}
          </span>
          {isIndividual && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded border bg-teal-100 text-teal-700 border-teal-200 uppercase tracking-widest">Individual</span>
          )}
        </div>
        <p className={`text-xs font-bold mt-0.5 ${isIndividual ? 'text-teal-700' : 'text-primary'}`}>{plan.companyName || 'Corporate Partner'}</p>
        {dependentOf && (
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Covered as dependent of {dependentOf}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {(plan.benefits || []).slice(0, 3).map((b: any) => (
            <span key={b.id} className={`text-[9px] font-bold bg-card border px-2.5 py-1 rounded-full uppercase tracking-tighter ${isIndividual ? 'text-teal-700 border-teal-200' : 'text-primary border-primary/20'}`}>
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
