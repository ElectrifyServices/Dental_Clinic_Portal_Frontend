import React from 'react';
import {
  Users, Calendar, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, Edit2, Trash2,
  MoreHorizontal, Building2, User, Shield,
  Star, Award, Sparkles, CheckCircle2, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CorporatePlan } from '../../../types';
import { getPlanStatus, TREATMENT_LABELS } from '../../../utils/corporatePlan';
import { BENEFIT_ICONS } from './constants';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Button,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from '../../ui';

interface CorporatePlanCardProps {
  plan: CorporatePlan;
  BENEFIT_LABELS: Record<string, string>;
  isUpdatingStatus: boolean;
  onEdit: (plan: CorporatePlan) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

// ── Color Theme Map ─────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { border: string; bg: string; text: string; primary: string }> = {
  blue: { border: 'border-t-blue-500', bg: 'bg-blue-50/70 text-blue-700 border-blue-100', text: 'text-blue-600', primary: 'bg-blue-500' },
  violet: { border: 'border-t-violet-500', bg: 'bg-violet-50/70 text-violet-700 border-violet-100', text: 'text-violet-600', primary: 'bg-violet-500' },
  emerald: { border: 'border-t-emerald-500', bg: 'bg-emerald-50/70 text-emerald-700 border-emerald-100', text: 'text-emerald-600', primary: 'bg-emerald-500' },
  rose: { border: 'border-t-rose-500', bg: 'bg-rose-50/70 text-rose-700 border-rose-100', text: 'text-rose-600', primary: 'bg-rose-500' },
  amber: { border: 'border-t-amber-500', bg: 'bg-amber-50/70 text-amber-700 border-amber-100', text: 'text-amber-600', primary: 'bg-amber-500' },
  cyan: { border: 'border-t-cyan-500', bg: 'bg-cyan-50/70 text-cyan-700 border-cyan-100', text: 'text-cyan-600', primary: 'bg-cyan-500' },
  indigo: { border: 'border-t-indigo-500', bg: 'bg-indigo-50/70 text-indigo-700 border-indigo-100', text: 'text-indigo-600', primary: 'bg-indigo-500' },
  teal: { border: 'border-t-teal-500', bg: 'bg-teal-50/70 text-teal-700 border-teal-100', text: 'text-teal-600', primary: 'bg-teal-500' },
};

// ── Tier configuration ────────────────────────────────────────────────────────
const TIER_CONFIG: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  platinum: { label: 'Platinum', Icon: Sparkles },
  gold: { label: 'Gold', Icon: Star },
  silver: { label: 'Silver', Icon: Shield },
  premium: { label: 'Premium', Icon: Award },
  standard: { label: 'Standard', Icon: Shield },
  basic: { label: 'Basic', Icon: CheckCircle2 },
};

export function CorporatePlanCard({
  plan, BENEFIT_LABELS, isUpdatingStatus, onEdit, onDelete, onToggle,
  expanded, onToggleExpand,
}: CorporatePlanCardProps) {

  const theme = COLOR_MAP[plan.color] ?? COLOR_MAP.blue;
  const status = getPlanStatus(plan);
  const isIndividual = plan.planCategory === 'individual';
  const tier = plan.planTier ? TIER_CONFIG[plan.planTier] : null;

  const familyLabel =
    !plan.maxDependents || plan.maxDependents === 0
      ? 'Self Only'
      : plan.maxDependents <= 2
        ? `+${plan.maxDependents} Fam`
        : `Up to ${plan.maxDependents} Fam`;

  const daysLeft = Math.ceil(
    (new Date(plan.validTo).getTime() - Date.now()) / 86400000
  );
  const isExpiringSoon = daysLeft > 0 && daysLeft < 30;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, boxShadow: "0 12px 20px -8px rgba(15,23,42,0.08), 0 4px 6px -2px rgba(15,23,42,0.03)" }}
        className={`group relative border border-slate-200 flex flex-col transition-all duration-300 border-t-4 ${theme.border} ${expanded ? 'z-20 shadow-lg rounded-t-3xl rounded-b-none' : 'z-10 rounded-3xl'
          }`}
      >
        <div className="p-5 flex-1 flex flex-col">
          {/* Top row: type icon + status + menu */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-9 h-9 rounded-xl ${theme.bg} flex items-center justify-center border border-current/10`}>
              {isIndividual
                ? <User className="w-4.5 h-4.5" />
                : <Building2 className="w-4.5 h-4.5" />
              }
            </div>

            <div className="flex items-center gap-1.5">
              {/* Status pill */}
              <Button
                variant="ghost"
                onClick={() => { if (status !== 'expired') onToggle(plan.id); }}
                disabled={status === 'expired' || isUpdatingStatus}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all h-auto active:scale-100 ${status === 'expired'
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : plan.isActive
                      ? 'bg-emerald-50/70 border-emerald-100 text-emerald-700 hover:bg-emerald-100/80'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
              >
                {status === 'expired'
                  ? <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  : plan.isActive
                    ? <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                    : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />
                }
                {status === 'expired' ? 'Expired' : plan.isActive ? 'Active' : 'Inactive'}
              </Button>

              {/* Dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-1.5 h-8 w-8 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-500 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-2xl border border-slate-200 shadow-xl">
                  <DropdownMenuItem onClick={() => onEdit(plan)} className="cursor-pointer font-bold text-xs p-2.5 rounded-xl">
                    <Edit2 className="w-3.5 h-3.5 mr-2 text-primary" /> Edit Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(plan.id)}
                    className="cursor-pointer text-destructive focus:text-destructive font-bold text-xs p-2.5 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Plan name & company */}
          <div className="min-w-0 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-slate-800 font-extrabold text-[15px] leading-snug tracking-tight truncate cursor-help">
                  {plan.name}
                </h3>
              </TooltipTrigger>
              <TooltipContent className="text-xs py-1 px-2 font-semibold">
                {plan.name}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-slate-400 text-[11px] mt-0.5 font-bold flex items-center gap-1 truncate cursor-help">
                  {!isIndividual && <Building2 className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />}
                  <span className="truncate">{isIndividual ? 'Personal Membership' : plan.companyName}</span>
                </p>
              </TooltipTrigger>
              <TooltipContent className="text-xs py-1 px-2 font-semibold">
                {isIndividual ? 'Personal Membership' : plan.companyName}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <span className="text-[9px] font-black px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-lg text-primary uppercase tracking-wider" title="Plan Type">
              {isIndividual ? 'INDIVIDUAL' : 'COMPANY'}
            </span>
            <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-500 uppercase tracking-wider" title="Plan Tier">
              {tier ? <tier.Icon className="w-2.5 h-2.5 text-amber-500" /> : <Award className="w-2.5 h-2.5 text-slate-400" />}
              {tier ? tier.label : 'NO TIER'}
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 uppercase tracking-wider" title="Annual Fee">
              ₹{(plan.annualFee || 0).toLocaleString()}/yr
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-500 uppercase tracking-wider flex items-center gap-1" title="Validity">
              <Calendar className="w-2.5 h-2.5" />
              {plan.validFrom ? new Date(plan.validFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit'}) : 'N/A'} - {plan.validTo ? new Date(plan.validTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit'}) : 'N/A'}
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-500 uppercase tracking-wider" title="Max Members">
              MAX: {plan.maxMembers || '∞'}
            </span>
          </div>



          {/* Stats Section */}
          <div className="grid grid-cols-3 py-3 px-1 mt-auto gap-2 bg-slate-50/50 rounded-2xl border border-slate-200/60 text-center">
            <div>
              <span className="block text-xs font-black text-slate-700 leading-none">
                {plan.currentMembers}{plan.maxMembers ? `/${plan.maxMembers}` : ''}
              </span>
              <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold mt-1 block">Members</span>
            </div>

            <div className="border-x border-slate-200/60 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block text-xs font-black text-slate-700 leading-none truncate px-0.5 cursor-help">
                    {familyLabel}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="text-xs py-1 px-2 font-semibold">
                  {familyLabel}
                </TooltipContent>
              </Tooltip>
              <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold mt-1 block">Coverage</span>
            </div>

            <div>
              <span className={`block text-xs font-black leading-none ${isExpiringSoon ? 'text-amber-600' : 'text-slate-700'}`}>
                {daysLeft > 0 ? `${daysLeft}d` : 'Expired'}
              </span>
              <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold mt-1 block">Remaining</span>
            </div>
          </div>
        </div>

        {/* ── Expand toggle ─────────────────────────────────────────────────── */}
        <Button
          variant="ghost"
          onClick={onToggleExpand}
          className={`w-full flex items-center justify-center gap-1 py-2.5 text-[9px] font-extrabold uppercase tracking-widest border-t border-slate-200 h-auto transition-colors active:scale-100 ${expanded
              ? 'text-primary bg-primary/5 hover:bg-primary/10 rounded-none'
              : 'text-slate-400 hover:text-primary hover:bg-slate-50/80 rounded-b-[22px]'
            }`}
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Show Less' : 'View Benefits'}
        </Button>

        {/* ── Expanded benefit detail (inline flow, no absolute positioning) ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key={`benefits-${plan.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-20 pt-2 bg-white border-t border-slate-200 rounded-b-[22px] space-y-2">
                {plan.benefits.map(b => (
                  <div
                    key={b.id}
                    className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-slate-200 shadow-xs hover:border-slate-200 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.bg} border border-current/10 text-xs`}>
                      {BENEFIT_ICONS[b.type]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-slate-800 uppercase tracking-wider">
                        {BENEFIT_LABELS[b.type] ?? b.type}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug font-medium">{b.description}</p>
                      {b.treatmentTypes?.length ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {b.treatmentTypes.map(t => (
                            <span key={t} className="text-[7.5px] font-extrabold bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-400 uppercase tracking-wide">
                              {TREATMENT_LABELS[t] || t}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
}
