import React, { useState, useEffect } from "react";
import { CreditCard, Users, Building2, User } from "lucide-react";
import { CorporatePlanManagement } from "../components/CorporatePlans/CorporatePlanManagement";
import { EmployeeManagement } from "../components/CorporatePlans/EmployeeManagement";
import { useCorporateData } from "../hooks/useCorporateData";
import { PageHeader, MetricCard } from "../components/ui";
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

  const stats = [
    {
      label: "Total Plans",
      value:
        statsData?.totalPlans ??
        corporatePlans.filter((p) => p.isActive).length,
      icon: <CreditCard className="w-4.5 h-4.5 md:w-6 md:h-6" />,
      variant: "gray" as const,
    },
    {
      label: "Total Members",
      value:
        statsData?.totalMembers ??
        corporatePlans.reduce((s, p) => s + p.currentMembers, 0),
      icon: <Users className="w-4.5 h-4.5 md:w-6 md:h-6" />,
      variant: "emerald" as const,
    },
    {
      label: "Company Plans",
      value:
        statsData?.companyPlans ??
        corporatePlans.filter((p) => p.planCategory !== "individual").length,
      icon: <Building2 className="w-4.5 h-4.5 md:w-6 md:h-6" />,
      variant: "indigo" as const,
    },
    {
      label: "Individual Plans",
      value:
        statsData?.individualPlans ??
        corporatePlans.filter((p) => p.planCategory === "individual").length,
      icon: <User className="w-4.5 h-4.5 md:w-6 md:h-6" />,
      variant: "amber" as const,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="shrink-0">
        <PageHeader
          title="Opal Smiles Memberships"
          subtitle="Configure membership plans, manage team onboarding, and track family coverage benefits."
        />
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────── */}
      <div
        className={
          collapsed
            ? "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 shrink-0"
            : "grid grid-cols-2 xl:grid-cols-4 lg:grid-cols-2 gap-3 md:gap-6 shrink-0"
        }
      >
        {stats.map((s) => (
          <MetricCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            variant={s.variant}
          />
        ))}
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-hidden">
        {/* ── Tab bar ────────────────────────────────────────────────── */}
        <div className="bg-white border border-border/60 rounded-xl shadow-sm overflow-hidden flex flex-wrap sm:flex-nowrap shrink-0">
          {TABS.map(({ key, label, sub, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-3 px-4 py-2.5 border-b-2 transition-all group
                  ${active ? TAB_ACCENT[key] : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
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
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
    </div>
  );
};
