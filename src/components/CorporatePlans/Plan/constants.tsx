import React from 'react';
import { Percent, Tag, Gift, Star, CheckCircle, Settings2, Infinity as InfinityIcon, Sparkles, Zap, Baby } from 'lucide-react';
import { PlanBenefitType, PlanBenefit, PlanCategory, CorporatePlanTier } from '../../../types';
import { TREATMENT_LABELS } from '../../../utils/corporatePlan';

export const BENEFIT_ICONS: Record<PlanBenefitType, React.ReactNode> = {
  flat_discount: <Percent className="w-3.5 h-3.5" />,
  treatment_discount: <Tag className="w-3.5 h-3.5" />,
  free_consultations: <Gift className="w-3.5 h-3.5" />,
  free_treatments: <Star className="w-3.5 h-3.5" />,
  capped_discount: <CheckCircle className="w-3.5 h-3.5" />,
  unlimited_consultations: <InfinityIcon className="w-3.5 h-3.5" />,
  complimentary_session: <Sparkles className="w-3.5 h-3.5" />,
  priority_scheduling: <Zap className="w-3.5 h-3.5" />,
  fluoride_application: <Baby className="w-3.5 h-3.5" />,
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

export const mkForm = () => {
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const localNextYear = `${nextYear.getFullYear()}-${String(nextYear.getMonth() + 1).padStart(2, '0')}-${String(nextYear.getDate()).padStart(2, '0')}`;

  return {
    name: '', companyName: '', code: '', description: '',
    benefits: [mkBenefit()],
    validFrom: localToday,
    validTo: localNextYear,
    maxMembers: undefined as number | undefined,
    isActive: true, color: 'blue',
    planCategory: '' as any,
    annualFee: undefined as number | undefined,
    maxDependents: 0,
    planTier: undefined as CorporatePlanTier | undefined,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactCountryCode: '+91',
  };
};

export function autoDesc(b: PlanBenefit): string {
  switch (b.type) {
    case 'flat_discount': return `${b.value}% discount on all treatments`;
    case 'treatment_discount': {
      const list = (b.treatmentTypes || []).map(t => {
        if (t === 'other' && b.customTreatmentText) return b.customTreatmentText;
        return TREATMENT_LABELS[t] || t;
      });
      return `${b.value}% discount on ${list.join(', ') || 'selected treatments'}`;
    }
    case 'free_consultations': return `${b.value} free consultation${b.value > 1 ? 's' : ''} per year`;
    case 'free_treatments': {
      const list = (b.treatmentTypes || []).map(t => {
        if (t === 'other' && b.customTreatmentText) return b.customTreatmentText;
        return TREATMENT_LABELS[t] || t;
      });
      return `${b.value} free ${list.join(', ') || 'treatment'}`;
    }
    case 'capped_discount': return `${b.value}% discount (max ₹${b.cap?.toLocaleString() || '...'} per visit)`;
    case 'unlimited_consultations': return 'Unlimited diagnostic check-ups and consultations for one year';
    case 'complimentary_session': {
      const list = (b.treatmentTypes || []).map(t => {
        if (t === 'other' && b.customTreatmentText) return b.customTreatmentText;
        return TREATMENT_LABELS[t] || t;
      });
      return `One complimentary ${list.join(', ') || 'teeth cleaning and whitening'} session`;
    }
    case 'priority_scheduling': return 'Priority appointment scheduling';
    case 'fluoride_application': return 'Fluoride application for kids, as needed';
    case 'custom': return `${b.value}% off on ${b.customName || 'Custom Benefit'}`;
    default: return '';
  }
}
