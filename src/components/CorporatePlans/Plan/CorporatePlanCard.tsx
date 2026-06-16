import React, { useState } from 'react';
import {
  Users, Calendar, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, Edit2, Trash2,
  MoreHorizontal, Building2, User, Shield,
  Star, Award, Sparkles, CheckCircle2, Clock,
} from 'lucide-react';
import { CorporatePlan } from '../../../types';
import { getPlanStatus, TREATMENT_LABELS } from '../../../utils/corporatePlan';
import { BENEFIT_ICONS } from './constants';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Button, Card,
} from '../../ui';

interface CorporatePlanCardProps {
  plan: CorporatePlan;
  BENEFIT_LABELS: Record<string, string>;
  isUpdatingStatus: boolean;
  onEdit: (plan: CorporatePlan) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

// ── Gradient map for card headers ────────────────────────────────────────────
const GRADIENT_MAP: Record<string, string> = {
  blue:    'from-blue-500 to-blue-700',
  violet:  'from-violet-500 to-purple-700',
  emerald: 'from-emerald-500 to-teal-700',
  rose:    'from-rose-500 to-pink-700',
  amber:   'from-amber-400 to-orange-600',
  cyan:    'from-cyan-500 to-blue-600',
  indigo:  'from-indigo-500 to-violet-700',
  teal:    'from-teal-500 to-emerald-600',
};

// ── Subtle tint for card body (matches card header color) ────────────────────
const TINT_MAP: Record<string, string> = {
  blue:    'bg-blue-50/60',
  violet:  'bg-violet-50/60',
  emerald: 'bg-emerald-50/60',
  rose:    'bg-rose-50/60',
  amber:   'bg-amber-50/60',
  cyan:    'bg-cyan-50/60',
  indigo:  'bg-indigo-50/60',
  teal:    'bg-teal-50/60',
};

const CHIP_MAP: Record<string, string> = {
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  violet:  'bg-violet-100 text-violet-700 border-violet-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rose:    'bg-rose-100 text-rose-700 border-rose-200',
  amber:   'bg-amber-100 text-amber-700 border-amber-200',
  cyan:    'bg-cyan-100 text-cyan-700 border-cyan-200',
  indigo:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  teal:    'bg-teal-100 text-teal-700 border-teal-200',
};

// ── Tier configuration ────────────────────────────────────────────────────────
const TIER_CONFIG: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  platinum: { label: 'Platinum', Icon: Sparkles },
  gold:     { label: 'Gold',     Icon: Star },
  silver:   { label: 'Silver',   Icon: Shield },
  premium:  { label: 'Premium',  Icon: Award },
  standard: { label: 'Standard', Icon: Shield },
  basic:    { label: 'Basic',    Icon: CheckCircle2 },
};

export function CorporatePlanCard({
  plan, BENEFIT_LABELS, isUpdatingStatus, onEdit, onDelete, onToggle,
}: CorporatePlanCardProps) {
  const [expanded, setExpanded] = useState(false);

  const gradient = GRADIENT_MAP[plan.color] ?? GRADIENT_MAP.blue;
  const tint = TINT_MAP[plan.color] ?? TINT_MAP.blue;
  const chip = CHIP_MAP[plan.color] ?? CHIP_MAP.blue;
  const status = getPlanStatus(plan);
  const isIndividual = plan.planCategory === 'individual';
  const tier = plan.planTier ? TIER_CONFIG[plan.planTier] : null;

  const familyLabel =
    !plan.maxDependents || plan.maxDependents === 0
      ? 'Self Only'
      : plan.maxDependents <= 2
        ? `+${plan.maxDependents} Family`
        : `Up to ${plan.maxDependents} Family`;

  const daysLeft = Math.ceil(
    (new Date(plan.validTo).getTime() - Date.now()) / 86400000
  );
  const isExpiringSoon = daysLeft > 0 && daysLeft < 30;

  return (
    <Card className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-card border border-border/50 flex flex-col">

      {/* ── Gradient header ──────────────────────────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${gradient} px-5 pt-5 pb-7`}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-black/10 translate-y-6 -translate-x-4" />

        {/* Top row: type icon + status + menu */}
        <div className="relative flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/25">
            {isIndividual
              ? <User className="w-5 h-5 text-white" />
              : <Building2 className="w-5 h-5 text-white" />
            }
          </div>

          <div className="flex items-center gap-1.5">
            {/* Status pill */}
            <Button
              variant="ghost"
              onClick={() => { if (status !== 'expired') onToggle(plan.id); }}
              disabled={status === 'expired' || isUpdatingStatus}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border backdrop-blur-sm transition-all h-auto active:scale-100 ${
                status === 'expired'
                  ? 'bg-white/10 border-white/20 text-white/60 cursor-not-allowed'
                  : plan.isActive
                    ? 'bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white'
                    : 'bg-black/20 border-white/10 text-white/50 hover:bg-black/30 hover:text-white/50'
              }`}
            >
              {status === 'expired'
                ? <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                : plan.isActive
                  ? <ToggleRight className="w-3.5 h-3.5" />
                  : <ToggleLeft className="w-3.5 h-3.5" />
              }
              {status === 'expired' ? 'Expired' : plan.isActive ? 'Active' : 'Inactive'}
            </Button>

            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-1.5 h-auto w-auto bg-white/10 hover:bg-white/25 rounded-lg border border-white/20 text-white"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(plan)} className="cursor-pointer">
                  <Edit2 className="w-3.5 h-3.5 mr-2 text-primary" /> Edit Plan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(plan.id)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Plan name & company */}
        <div className="relative">
          <h3 className="text-white font-black text-lg leading-tight tracking-tight">{plan.name}</h3>
          <p className="text-white/70 text-xs mt-0.5 font-medium">
            {isIndividual ? 'Personal Membership' : plan.companyName}
          </p>
        </div>

        {/* Badges row */}
        <div className="relative flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[10px] font-black px-2.5 py-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white uppercase tracking-wider">
            {plan.code}
          </span>
          {tier && (
            <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white uppercase tracking-wider">
              <tier.Icon className="w-3 h-3" />
              {tier.label}
            </span>
          )}
          {plan.annualFee != null && isIndividual && (
            <span className="text-[10px] font-black px-2.5 py-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white">
              ₹{plan.annualFee.toLocaleString()}/yr
            </span>
          )}
        </div>
      </div>

      {/* ── Curved connector ─────────────────────────────────────────────── */}
      <div className={`h-3 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-card rounded-t-2xl" />
      </div>

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col ${tint} px-5 pb-0 -mt-0`}>

        {/* Benefits */}
        <div className="py-4 flex flex-wrap gap-1.5">
          {plan.benefits.slice(0, 3).map(b => (
            <span
              key={b.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${chip}`}
            >
              <span className="opacity-70">{BENEFIT_ICONS[b.type]}</span>
              <span className="max-w-[120px] truncate">{b.description}</span>
            </span>
          ))}
          {plan.benefits.length > 3 && (
            <span className={`flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${chip} opacity-70`}>
              +{plan.benefits.length - 3} more
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40" />

        {/* Stats row */}
        <div className="grid grid-cols-3 py-3.5 gap-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
              <Users className="w-3 h-3" />
            </div>
            <span className="text-sm font-black text-foreground">
              {plan.currentMembers}{plan.maxMembers ? `/${plan.maxMembers}` : ''}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold mt-0.5">Members</span>
          </div>
          <div className="flex flex-col items-center border-x border-border/40">
            <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
              <Users className="w-3 h-3" />
            </div>
            <span className="text-sm font-black text-foreground">{familyLabel}</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold mt-0.5">Coverage</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`flex items-center gap-1 mb-0.5 ${isExpiringSoon ? 'text-amber-500' : 'text-muted-foreground'}`}>
              <Clock className="w-3 h-3" />
            </div>
            <span className={`text-sm font-black ${isExpiringSoon ? 'text-amber-600' : 'text-foreground'}`}>
              {daysLeft > 0 ? `${daysLeft}d` : 'Expired'}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold mt-0.5">Remaining</span>
          </div>
        </div>
      </div>

      {/* ── Expand toggle ─────────────────────────────────────────────────── */}
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all border-t border-border/40 rounded-none h-auto active:scale-100 ${
          expanded
            ? 'text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary'
            : 'text-muted-foreground/50 hover:text-primary hover:bg-muted/40'
        } ${tint}`}
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? 'Show Less' : 'View All Benefits'}
      </Button>

      {/* ── Expanded benefit detail ──────────────────────────────────────── */}
      {expanded && (
        <div className="px-5 pb-5 pt-3 border-t border-border/40 bg-muted/10 space-y-2">
          {plan.benefits.map(b => (
            <div
              key={b.id}
              className="flex items-start gap-3 bg-card rounded-xl p-3.5 border border-border/60 shadow-xs"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient} text-white`}>
                {BENEFIT_ICONS[b.type]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-foreground uppercase tracking-wide">
                  {BENEFIT_LABELS[b.type] ?? b.type}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{b.description}</p>
                {b.treatmentTypes?.length ? (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {b.treatmentTypes.map(t => (
                      <span key={t} className="text-[8px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">
                        {TREATMENT_LABELS[t] || t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
