import React from 'react';
import {
  Phone, Users, User, Building2, MoreHorizontal,
  Edit2, ArrowRightLeft, Trash2, ChevronDown, ChevronUp, Send, MessageCircle, Activity
} from 'lucide-react';
import { CorporateEmployee, CorporatePlan } from '../../../types';
import {
  Button, PlanBadge,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '../../ui';

interface MemberCardProps {
  employee: CorporateEmployee;
  plans: CorporatePlan[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onChangePlan: () => void;
  onDelete: () => void;
  onToggleStatus: () => Promise<void>;
  isStatusPending: boolean;
  onEditDependent: (dep: any) => void;
  onDeleteDependent: (dep: any) => void;
  onResendInvoice: () => void;
  onWhatsAppHistory: () => void;
  onBenefitUsage: () => void;
}

// Avatar color cycling logic matching EmployeeManagement
const AVATAR_COLORS = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-700',
  'from-amber-400 to-orange-600',
  'from-indigo-500 to-violet-700',
  'from-teal-500 to-emerald-600',
  'from-cyan-500 to-blue-600',
];

export const MemberCard: React.FC<MemberCardProps> = ({
  employee,
  plans,
  isExpanded,
  onToggleExpand,
  onEdit,
  onChangePlan,
  onDelete,
  onToggleStatus,
  isStatusPending,
  onEditDependent,
  onDeleteDependent,
  onResendInvoice,
  onWhatsAppHistory,
  onBenefitUsage,
}) => {
  const avatarGrad = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const plan = plans.find(p => p.id === employee.corporatePlanId);
  const isInd = plan?.planCategory === 'individual' || employee.companyName === 'Individual';
  const isExpired = employee.status === 'EXPIRED';

  return (
    <div className="bg-white border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Header: Profile, Name, Contact, Dropdown and Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGrad(employee.name)} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}>
            {employee.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground text-sm truncate">{employee.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
              <span>{employee.phone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Status Toggle Button */}
          <Button
            onClick={async (ev) => {
              ev.stopPropagation();
              if (isExpired) return;
              await onToggleStatus();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border h-auto uppercase tracking-wide transition-all ${
              isExpired
                ? 'bg-rose-50 text-rose-600 border-rose-200 cursor-not-allowed'
                : employee.isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            }`}
            disabled={isExpired || isStatusPending}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              isExpired ? 'bg-rose-500' : employee.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'
            }`} />
            <span>{isExpired ? 'Expired' : employee.isActive ? 'Active' : 'Inactive'}</span>
          </Button>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={onEdit}>
                <Edit2 className="w-4 h-4 mr-2 text-primary" /> Edit Member
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onChangePlan}>
                <ArrowRightLeft className="w-4 h-4 mr-2" /> Change Plan
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onResendInvoice}>
                <Send className="w-4 h-4 mr-2 text-violet-600" /> Resend Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onWhatsAppHistory}>
                <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" /> WhatsApp History
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onBenefitUsage}>
                <Activity className="w-4 h-4 mr-2 text-blue-600" /> Uses benefits
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Details Stack */}
      <div className="space-y-3 pt-1 text-xs">
        {/* Plan Row: Full width to prevent narrow wrapping */}
        <div className="flex flex-col gap-1.5 pb-2.5 border-b border-slate-100/80">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Plan</span>
          <div className="min-w-0">
            {plan ? (
              <PlanBadge name={plan.name} code={plan.code} color={plan.color} />
            ) : employee.corporatePlanName ? (
              <span className="font-semibold text-foreground text-sm">{employee.corporatePlanName}</span>
            ) : (
              <span className="text-muted-foreground/60 italic">No plan</span>
            )}
          </div>
        </div>

        {/* Type & Coverage Grid: Safe from wrapping overflow */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Type</span>
            <div>
              <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                isInd
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {isInd ? <User className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                <span>{isInd ? 'INDIVIDUAL' : 'COMPANY'}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Coverage Limit</span>
            <div>
              {employee.dependents?.length > 0 || employee.familyCoverageLimit > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/8 border border-primary/20 px-2.5 py-1 rounded-full">
                  <Users className="w-3.5 h-3.5" />
                  <span>{(employee.dependents?.length ?? 0) + 1}/{employee.familyCoverageLimit ?? 0}</span>
                </span>
              ) : (
                <span className="text-muted-foreground font-semibold italic inline-block py-0.5">Self</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Family Dependents Section if exists */}
      {employee.dependents && employee.dependents.length > 0 && (
        <div className="border-t border-slate-100/80 pt-3">
          <Button
            variant="ghost"
            onClick={onToggleExpand}
            className="w-full justify-between hover:bg-slate-50 hover:border-slate-200 text-xs font-bold text-primary h-9 px-3 rounded-xl bg-slate-50/40 border border-slate-100/60 transition-all"
          >
            <span>Family Members ({employee.dependents.length})</span>
            <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              View List
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};
