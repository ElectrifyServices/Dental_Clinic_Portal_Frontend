import { CorporatePlan, PlanBenefit } from '../types';

export const TREATMENT_LABELS: Record<string, string> = {
  consultation: 'Consultation / Check-up',
  'follow-up': 'Follow Up Visit',
  'xray-review': 'X-ray Review',
  cleaning: 'Teeth Cleaning',
  emergency: 'Tooth Pain / Emergency',
  filling: 'Filling',
  'root-canal': 'Root Canal Treatment',
  extraction: 'Extraction / Wisdom Tooth',
  orthodontics: 'Braces / Aligners',
  implants: 'Implants',
  'full-mouth-rehab': 'Full Mouth Rehabilitation',
  'veneers-cosmetic': 'Veneers / Cosmetic Dentistry',
  'child-dentistry': 'Child Dentistry',
  crown: 'Crown',
  denture: 'Denture',
  toothache: 'Toothache',
  'swelling-infection': 'Swelling / Infection',
  'broken-tooth': 'Broken Tooth',
  'trauma-injury': 'Trauma / Injury',
  other: 'Other / Not Sure',
};

export interface AppliedBenefit {
  benefit: PlanBenefit;
  discountAmount: number;
  label: string;
}

export function computePlanDiscount(
  plan: CorporatePlan,
  subtotal: number,
  treatmentTypes: string[],
  consultationsUsed = 0
): { totalDiscount: number; applied: AppliedBenefit[] } {
  if (!plan?.isActive) return { totalDiscount: 0, applied: [] };
  const now = new Date();
  if (now < new Date(plan.validFrom) || now > new Date(plan.validTo)) return { totalDiscount: 0, applied: [] };

  let totalDiscount = 0;
  const applied: AppliedBenefit[] = [];

  for (const b of plan.benefits) {
    switch (b.type) {
      case 'flat_discount': {
        const d = Math.round((subtotal * b.value) / 100);
        totalDiscount += d;
        applied.push({ benefit: b, discountAmount: d, label: `${b.value}% flat discount` });
        break;
      }
      case 'treatment_discount': {
        const matching = treatmentTypes.filter(t => !b.treatmentTypes?.length || b.treatmentTypes.includes(t));
        if (matching.length) {
          const d = Math.round((subtotal * b.value) / 100);
          totalDiscount += d;
          applied.push({
            benefit: b,
            discountAmount: d,
            label: `${b.value}% on ${matching.map(t => {
              if (t === 'other' && b.customTreatmentText) return b.customTreatmentText;
              return TREATMENT_LABELS[t] || t;
            }).join(', ')}`
          });
        }
        break;
      }
      case 'capped_discount': {
        const d = Math.min(Math.round((subtotal * b.value) / 100), b.cap ?? Infinity);
        totalDiscount += d;
        applied.push({ benefit: b, discountAmount: d, label: `${b.value}% discount (max ₹${b.cap?.toLocaleString()})` });
        break;
      }
      case 'free_consultations': {
        if (consultationsUsed < b.value && treatmentTypes.includes('consultation')) {
          const d = Math.min(b.value - consultationsUsed, 1) * 500;
          totalDiscount += d;
          applied.push({ benefit: b, discountAmount: d, label: `Free consultation (${consultationsUsed + 1}/${b.value})` });
        }
        break;
      }
      case 'free_treatments': {
        if (b.treatmentTypes?.length && treatmentTypes.some(t => b.treatmentTypes!.includes(t))) {
          applied.push({ benefit: b, discountAmount: 0, label: b.description });
        }
        break;
      }
      case 'unlimited_consultations': {
        if (treatmentTypes.includes('consultation')) {
          const d = 500;
          totalDiscount += d;
          applied.push({ benefit: b, discountAmount: d, label: 'Free consultation (unlimited)' });
        }
        break;
      }
      case 'complimentary_session': {
        if (b.treatmentTypes?.length && treatmentTypes.some(t => b.treatmentTypes!.includes(t))) {
          applied.push({ benefit: b, discountAmount: 0, label: b.description });
        }
        break;
      }
      // 'priority_scheduling' and 'fluoride_application' are non-billing amenities and intentionally have no discount case.
    }
  }
  return { totalDiscount: Math.min(totalDiscount, subtotal), applied };
}

export function getPlanStatus(plan: CorporatePlan): 'active' | 'expiring' | 'expired' | 'inactive' {
  if (plan.status === 'EXPIRED') return 'expired';
  if (!plan.isActive) return 'inactive';
  const now = new Date();
  const validTo = new Date(plan.validTo);
  if (now > validTo) return 'expired';
  const daysLeft = Math.ceil((validTo.getTime() - now.getTime()) / 86400000);
  if (daysLeft < 30) return 'expiring';
  return 'active';
}

export function getPlanBenefitSummary(plan: CorporatePlan): string {
  return plan.benefits.map(b => b.description).join(' • ');
}

export const PLAN_COLORS = ['blue', 'violet', 'emerald', 'rose', 'amber', 'cyan', 'indigo', 'teal'];

export const COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string; iconBg: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500',    iconBg: 'bg-blue-600' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500',  iconBg: 'bg-violet-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', iconBg: 'bg-emerald-600' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    iconBg: 'bg-rose-600' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   iconBg: 'bg-amber-600' },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    dot: 'bg-cyan-500',    iconBg: 'bg-cyan-600' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-500',  iconBg: 'bg-indigo-600' },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    dot: 'bg-teal-500',    iconBg: 'bg-teal-600' },
};
