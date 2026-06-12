import React from 'react';
import { Building2, Users, Shield, Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui';
import { useActivePlansQuery } from '../../../hooks/corporate/useActivePlansQuery';
import { getDependentsByMember } from '../../../hooks/corporate/dependentStorage';
import { CorporatePlan, PlanDependent } from '../../../types';

interface PlanCoverageCardProps {
  patient: any;
}

export const PlanCoverageCard: React.FC<PlanCoverageCardProps> = ({ patient }) => {
  const { data: plansData } = useActivePlansQuery();
  const allPlans: CorporatePlan[] = React.useMemo(() => {
    if (Array.isArray(plansData)) return plansData;
    if (plansData && Array.isArray(plansData.data)) return plansData.data;
    return [];
  }, [plansData]);

  const planId = patient?.corporatePlanId || patient?.companyId;
  const primaryMemberId = patient?.primaryMemberId || patient?.corporateMemberId;

  const plan = React.useMemo(
    () => allPlans.find(p => p.id === planId),
    [allPlans, planId]
  );

  // Dependents of this patient (if they are the primary member)
  const dependents: PlanDependent[] = React.useMemo(() => {
    if (!primaryMemberId) return [];
    return getDependentsByMember(primaryMemberId);
  }, [primaryMemberId]);

  // If patient is a dependent: find primary member's plan info
  const [primaryMemberName, setPrimaryMemberName] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!patient?.primaryMemberId) { setPrimaryMemberName(null); return; }
    // Try to find name from dependents storage cross-reference
    // Fallback: just use the memberId label
    setPrimaryMemberName(null);
  }, [patient?.primaryMemberId]);

  if (!plan && !patient?.primaryMemberId) return null;

  const isIndividual = plan?.planCategory === 'individual';
  const isCoveredAsDependent = !!patient?.primaryMemberId && !planId;

  return (
    <Card className="rounded-2xl p-5 border border-border shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        Plan & Coverage
      </h3>

      {isCoveredAsDependent ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700">Covered as Dependent</p>
              <p className="text-[11px] text-amber-600">
                Benefits via primary member's plan
              </p>
            </div>
          </div>
        </div>
      ) : plan ? (
        <div className="space-y-3">
          {/* Plan header */}
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isIndividual ? 'bg-teal-100' : 'bg-blue-100'}`}>
              {isIndividual ? <Users className="w-5 h-5 text-teal-600" /> : <Building2 className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-foreground">{plan.name}</p>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${isIndividual ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                  {isIndividual ? 'Individual' : 'Corporate'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{plan.companyName}</p>
              {isIndividual && plan.annualFee && (
                <p className="text-[11px] text-teal-600 font-semibold mt-0.5">₹{plan.annualFee.toLocaleString()}/year</p>
              )}
            </div>
          </div>

          {/* Validity */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-xl">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{plan.validFrom} — {plan.validTo}</span>
          </div>

          {/* Benefits summary */}
          {plan.benefits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {plan.benefits.slice(0, 3).map(b => (
                <span key={b.id} className="text-[9px] font-black px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                  {b.description}
                </span>
              ))}
              {plan.benefits.length > 3 && (
                <span className="text-[9px] font-medium text-muted-foreground px-2 py-0.5">+{plan.benefits.length - 3} more</span>
              )}
            </div>
          )}

          {/* Dependents */}
          {dependents.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                Covered Family Members ({dependents.length})
              </p>
              <div className="space-y-1.5">
                {dependents.map(dep => (
                  <div key={dep.id} className="flex items-center gap-2.5 bg-muted/30 rounded-xl px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{dep.name}</p>
                      <p className="text-[10px] text-muted-foreground">{dep.relationship}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.maxDependents && plan.maxDependents > 0 && dependents.length === 0 && (
            <p className="text-[11px] text-muted-foreground/60 italic">
              No family members added yet (up to {plan.maxDependents} allowed)
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
};
