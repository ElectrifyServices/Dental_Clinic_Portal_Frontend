import React, { useState, useEffect } from "react";
import { CreditCard, Zap, Users, Shield } from "lucide-react";
import { CorporatePlanManagement } from "../components/CorporatePlans/CorporatePlanManagement";
import { EmployeeManagement } from "../components/CorporatePlans/EmployeeManagement";
import { QuickRegistrationFlow } from "../components/CorporatePlans/QuickRegistration/QuickRegistrationFlow";
import { useCorporateData } from "../hooks/useCorporateData";
import { PageHeader } from "../components/ui";
import { useSidebar } from "../contexts/SidebarContext";

export type MembershipTab = "plans" | "members";

const TABS: {
  key: MembershipTab;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "members",
    label: "Members",
    sub: "View enrolled members",
    icon: Users,
  },
  {
    key: "plans",
    label: "Membership Plans",
    sub: "Create & manage plans",
    icon: CreditCard,
  },
];

const TAB_ACCENT: Record<MembershipTab, string> = {
  plans: "border-blue-500 text-blue-600",
  members: "border-violet-500 text-violet-600",
};
const TAB_ICON_ACTIVE: Record<MembershipTab, string> = {
  plans: "bg-blue-50 text-blue-600 border-blue-100",
  members: "bg-violet-50 text-violet-600 border-violet-100",
};
const STAT_COLORS = [
  "bg-blue-50   text-blue-700   border-blue-100",
  "bg-emerald-50 text-emerald-700 border-emerald-100",
  "bg-violet-50 text-violet-700 border-violet-100",
  "bg-amber-50  text-amber-700  border-amber-100",
];

import { useMembershipStatsQuery } from "../hooks/corporate/useMembershipStatsQuery";

export const CorporatePlansPage: React.FC = () => {
  const { collapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState<MembershipTab>("members");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [category, setCategory] = useState<"all" | string>("all");

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(h);
  }, [search]);

  const {
    corporatePlans,
    corporateEmployees,
    handleSaveCorporatePlan,
    handleDeleteCorporatePlan,
    handleToggleCorporatePlan,
    handleSaveEmployee,
    handleDeleteEmployee,
    handleBulkSaveEmployees,
    handleChangeEmployeePlan,
    isPlansLoading,
    refetchCorporate,
  } = useCorporateData({
    search: debouncedSearch,
    status: filter === "all" ? undefined : filter.toUpperCase(),
    planType:
      category === "all"
        ? undefined
        : category === "corporate"
          ? "COMPANY"
          : "INDIVIDUAL",
  });

  const { data: statsData } = useMembershipStatsQuery();

  useEffect(() => {
    if (refetchCorporate) refetchCorporate();
  }, [refetchCorporate]);

  const stats = [
    {
      label: "Total Plans",
      value:
        statsData?.totalPlans ??
        corporatePlans.filter((p) => p.isActive).length,
    },
    {
      label: "Total Members",
      value:
        statsData?.totalMembers ??
        corporatePlans.reduce((s, p) => s + p.currentMembers, 0),
    },
    {
      label: "Company Plans",
      value:
        statsData?.companyPlans ??
        corporatePlans.filter((p) => p.planCategory !== "individual").length,
    },
    {
      label: "Individual Plans",
      value:
        statsData?.individualPlans ??
        corporatePlans.filter((p) => p.planCategory === "individual").length,
    },
  ];

  return (
    <div className="space-y-2">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="Opal Smiles Memberships"
        subtitle="Configure membership plans, manage team onboarding, and track family coverage benefits."
      />

      {/* ── Stats Grid ────────────────────────────────────────────────── */}
      <div
        className={
          collapsed
            ? "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
            : "grid grid-cols-2 xl:grid-cols-4 lg:grid-cols-2 gap-3 mb-6"
        }
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-sm ${STAT_COLORS[i]} justify-center sm:justify-start`}
          >
            <span className="text-xl sm:text-2xl font-black leading-none">
              {s.value}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide opacity-80 leading-tight text-left">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {/* ── Tab bar ────────────────────────────────────────────────── */}
        <div className="bg-white border border-border/60 rounded-xl shadow-sm overflow-hidden flex flex-wrap sm:flex-nowrap">
          {TABS.map(({ key, label, sub, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 border-b-2 transition-all group
                  ${active ? TAB_ACCENT[key] : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                    active
                      ? TAB_ICON_ACTIVE[key]
                      : "bg-muted/50 border-border/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                  }`}
                >
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

        {/* ── Tab content ────────────────────────────────────────────────── */}
        {activeTab === "plans" && (
          <CorporatePlanManagement
            plans={corporatePlans}
            onSave={handleSaveCorporatePlan}
            onDelete={handleDeleteCorporatePlan}
            onToggle={handleToggleCorporatePlan}
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            category={category}
            onCategoryChange={setCategory}
            isLoading={isPlansLoading}
          />
        )}

        {activeTab === "members" && (
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
    </div>
  );
};
