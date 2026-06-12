import React from 'react';
import { Percent, Tag, Gift, Star, CheckCircle, Settings2 } from 'lucide-react';
import { PlanBenefitType, PlanBenefit, PlanCategory } from '../../../types';
import { TREATMENT_LABELS } from '../../../utils/corporatePlan';

export const BENEFIT_ICONS: Record<PlanBenefitType, React.ReactNode> = {
  flat_discount: <Percent className="w-3.5 h-3.5" />,
  treatment_discount: <Tag className="w-3.5 h-3.5" />,
  free_consultations: <Gift className="w-3.5 h-3.5" />,
  free_treatments: <Star className="w-3.5 h-3.5" />,
  capped_discount: <CheckCircle className="w-3.5 h-3.5" />,
  custom: <Settings2 className="w-3.5 h-3.5" />,
};

export const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expiring: 'bg-amber-100 text-amber-700 border-amber-200',
  expired: 'bg-destructive/10 text-destructive border-destructive/20',
  inactive: 'bg-muted text-muted-foreground border-border',
};

export const STATUS_LABEL: Record<string, string> = {
  active: 'Active', expiring: 'Expiring Soon', expired: 'Expired', inactive: 'Inactive',
};

export const mkBenefit = (): PlanBenefit => ({
  id: Date.now().toString(), type: 'flat_discount', value: 20,
  description: '20% discount on all treatments',
});

export const mkForm = () => ({
  name: '', companyName: '', code: '', description: '',
  benefits: [mkBenefit()],
  validFrom: new Date().toISOString().split('T')[0],
  validTo: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
  maxMembers: undefined as number | undefined,
  isActive: true, color: 'blue',
  planCategory: 'corporate' as PlanCategory,
  annualFee: undefined as number | undefined,
  maxDependents: 0,
});

export function autoDesc(b: PlanBenefit): string {
  switch (b.type) {
    case 'flat_discount': return `${b.value}% discount on all treatments`;
    case 'treatment_discount': return `${b.value}% discount on ${(b.treatmentTypes || []).map(t => TREATMENT_LABELS[t] || t).join(', ') || 'selected treatments'}`;
    case 'free_consultations': return `${b.value} free consultation${b.value > 1 ? 's' : ''} per year`;
    case 'free_treatments': return `${b.value} free ${(b.treatmentTypes || []).map(t => TREATMENT_LABELS[t] || t).join(', ') || 'treatment'}`;
    case 'capped_discount': return `${b.value}% discount (max ?${b.cap?.toLocaleString() || '...'} per visit)`;
    case 'custom': return `${b.value}% off on ${b.customName || 'Custom Benefit'}`;
    default: return '';
  }
}
