import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, Users, Shield } from 'lucide-react';
import { CorporatePlanManagement } from '../components/CorporatePlans/CorporatePlanManagement';
import { EmployeeManagement } from '../components/CorporatePlans/EmployeeManagement';
import { QuickRegistrationFlow } from '../components/CorporatePlans/QuickRegistration/QuickRegistrationFlow';
import { useAppData } from '../hooks/useAppData';

export type MembershipTab = 'plans' | 'members';

const TABS: {
  key: MembershipTab;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
    { key: 'plans', label: 'Membership Plans', sub: 'Create & manage plans', icon: CreditCard },
    { key: 'members', label: 'Members', sub: 'View enrolled members', icon: Users },
  ];

const TAB_ACCENT: Record<MembershipTab, string> = {
  plans: 'border-blue-500 text-blue-600',
  members: 'border-violet-500 text-violet-600',
};
const TAB_ICON_ACTIVE: Record<MembershipTab, string> = {
  plans: 'bg-blue-50 text-blue-600 border-blue-100',
  members: 'bg-violet-50 text-violet-600 border-violet-100',
};
const STAT_COLORS = [
  'bg-blue-50   text-blue-700   border-blue-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-violet-50 text-violet-700 border-violet-100',
  'bg-amber-50  text-amber-700  border-amber-100',
];

export const CorporatePlansPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MembershipTab>('plans');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(h);
  }, [search]);

  const {
    corporatePlans, corporateEmployees,
    handleSaveCorporatePlan, handleDeleteCorporatePlan, handleToggleCorporatePlan,
    handleSaveEmployee, handleDeleteEmployee, handleBulkSaveEmployees, handleChangeEmployeePlan,
    isPlansLoading, refetchCorporate,
  } = useAppData({
    corporateSearch: debouncedSearch,
    corporateStatus: filter === 'all' ? undefined : filter.toUpperCase(),
  });

  useEffect(() => { if (refetchCorporate) refetchCorporate(); }, [refetchCorporate]);

  const stats = [
    { label: 'Active Plans', value: corporatePlans.filter(p => p.isActive).length },
    { label: 'Total Members', value: corporatePlans.reduce((s, p) => s + p.currentMembers, 0) },
    { label: 'Company Plans', value: corporatePlans.filter(p => p.planCategory !== 'individual').length },
    { label: 'Personal Plans', value: corporatePlans.filter(p => p.planCategory === 'individual').length },
  ];

  return (
    <div className="space-y-5">

      {/* ── Light module header ─────────────────────────────────────────── */}
      <div className="bg-white border border-border/60 rounded-2xl shadow-sm overflow-hidden">

        {/* Top section: title + stats */}
        <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icon + title */}
          <div className="flex items-center gap-3.5 flex-1">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Opal Smiles Memberships</h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Configure membership plans, manage team onboarding, and track family coverage benefits.
              </p>
            </div>
          </div>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-2">
            {stats.map((s, i) => (
              <div key={s.label} className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-sm ${STAT_COLORS[i]}`}>
                <span className="text-base font-black leading-none">{s.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-70 whitespace-nowrap">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 mx-0" />

        {/* Tab bar */}
        <div className="flex">
          {TABS.map(({ key, label, sub, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 border-b-2 transition-all group
                  ${active ? TAB_ACCENT[key] : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${active
                  ? TAB_ICON_ACTIVE[key]
                  : 'bg-muted/50 border-border/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                  }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold leading-tight">{label}</p>
                  <p className="text-[10px] leading-tight opacity-60">{sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────────────── */}
      {activeTab === 'plans' && (
        <CorporatePlanManagement
          plans={corporatePlans}
          onSave={handleSaveCorporatePlan}
          onDelete={handleDeleteCorporatePlan}
          onToggle={handleToggleCorporatePlan}
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          isLoading={isPlansLoading}
        />
      )}

      {activeTab === 'members' && (
        <EmployeeManagement
          employees={corporateEmployees}
          plans={corporatePlans}
          onSave={handleSaveEmployee}
          onDelete={handleDeleteEmployee}
          onBulkSave={handleBulkSaveEmployees}
          onChangePlan={handleChangeEmployeePlan}
        />
      )}
    </div>
  );
};
