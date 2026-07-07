import React, { useState, useMemo } from "react";
import {
  DollarSign,
  User,
  TrendingUp,
  Wallet,
  Activity,
  ChevronDown,
  FileText,
  PieChart,
} from "lucide-react";
import { useTreatmentData } from "../hooks/useTreatmentData";
import { useStaffData } from "../hooks/useStaffData";
import { MetricCard, PageHeader, Card, Button, Input, DataTable } from "../components/ui";

type DateFilter = "thisMonth" | "lastMonth" | "custom";

export const ProfitSharingPage: React.FC = () => {
  const { treatments } = useTreatmentData();
  const { staffMembers } = useStaffData();
  const doctorsWithSchedules = useMemo(
    () =>
      staffMembers.filter(
        (s: any) => s.role === "doctor" || s.role === "admin",
      ),
    [staffMembers],
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>("thisMonth");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);

  // Filtering Logic
  const filteredTreatments = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    return treatments.filter((t) => {
      const treatmentDate = new Date(t.date || t.createdAt);
      if (dateFilter === "thisMonth") return treatmentDate >= startOfMonth;
      if (dateFilter === "lastMonth")
        return (
          treatmentDate >= startOfLastMonth && treatmentDate <= endOfLastMonth
        );
      if (dateFilter === "custom") {
        if (!customRange.start || !customRange.end) return true;
        return (
          treatmentDate >= new Date(customRange.start) &&
          treatmentDate <= new Date(customRange.end)
        );
      }
      return true;
    });
  }, [treatments, dateFilter, customRange]);

  // Calculations with Mocked Expenses (X-Ray, Lab)
  const stats = useMemo(() => {
    let totalRev = 0;
    let totalExpenses = 0;
    let totalPayout = 0;
    const doctorStats: Record<
      string,
      { name: string; specialization: string; profitPercent: number; revenue: number; expenses: number; payout: number; clinicProfit: number; treatments: any[] }
    > = {};

    filteredTreatments.forEach((t) => {
      const cost = Number(t.cost) || 0;
      
      // MOCK: Assuming a random 15% - 20% expense for X-Rays/Materials per treatment for UI purposes
      const mockExpense = cost > 0 ? Math.round(cost * 0.15) : 0; 
      const distributableProfit = cost - mockExpense;
      
      totalRev += cost;
      totalExpenses += mockExpense;

      const doctor =
        doctorsWithSchedules.find((d) => d.id === t.doctorId) ||
        doctorsWithSchedules.find((d) => d.name === t.doctorName);
      const docProfitPercent = Number(doctor?.profitPercentage) || 40;
      
      // Logic: Doctor share is calculated on the distributable profit (After deducting XRay/Materials)
      const share = (distributableProfit * docProfitPercent) / 100;
      const clinicProfit = distributableProfit - share;
      
      totalPayout += share;

      if (doctor) {
        if (!doctorStats[doctor.id]) {
          doctorStats[doctor.id] = { 
            name: doctor.name, 
            specialization: doctor.specialization || "General",
            profitPercent: docProfitPercent,
            revenue: 0, 
            expenses: 0,
            payout: 0,
            clinicProfit: 0,
            treatments: []
          };
        }
        doctorStats[doctor.id].revenue += cost;
        doctorStats[doctor.id].expenses += mockExpense;
        doctorStats[doctor.id].payout += share;
        doctorStats[doctor.id].clinicProfit += clinicProfit;
        
        doctorStats[doctor.id].treatments.push({
          ...t,
          mockExpense,
          distributableProfit,
          doctorShare: share,
          clinicProfit
        });
      }
    });

    const netClinicProfit = totalRev - totalExpenses - totalPayout;

    let topDoc = { name: "N/A", amount: 0 };
    Object.values(doctorStats).forEach((ds) => {
      if (ds.payout > topDoc.amount) {
        topDoc = { name: ds.name, amount: ds.payout };
      }
    });

    return { totalRev, totalExpenses, totalPayout, netClinicProfit, topDoc, doctorStats: Object.values(doctorStats) };
  }, [filteredTreatments, doctorsWithSchedules]);

  const toggleDoctor = (id: string) => {
    setExpandedDoctor(expandedDoctor === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <PageHeader
        title="Profit Sharing Dashboard"
        subtitle="Transparent view of revenue, expenses, and doctor payouts"
      >
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
          {[
            { id: "thisMonth", label: "This Month" },
            { id: "lastMonth", label: "Last Month" },
            { id: "custom", label: "Custom" },
          ].map((f) => (
            <Button
              key={f.id}
              variant={dateFilter === f.id ? "default" : "ghost"}
              onClick={() => setDateFilter(f.id as any)}
              className={dateFilter === f.id ? "bg-white text-primary shadow-sm hover:bg-white" : "text-muted-foreground hover:text-foreground"}
              size="sm"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </PageHeader>

      {dateFilter === "custom" && (
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-border/60 shadow-sm animate-in slide-in-from-top-2 max-w-md">
          <Input
            type="date"
            value={customRange.start}
            onChange={(e) =>
              setCustomRange({ ...customRange, start: e.target.value })
            }
            className="w-full bg-slate-50/50"
          />
          <span className="text-muted-foreground/60 font-medium text-sm">
            to
          </span>
          <Input
            type="date"
            value={customRange.end}
            onChange={(e) =>
              setCustomRange({ ...customRange, end: e.target.value })
            }
            className="w-full bg-slate-50/50"
          />
        </div>
      )}

      {/* Overview Cards (4 Blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue Generated"
          value={`₹${stats.totalRev.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="primary"
          trend="+12% from last period"
        />
        <MetricCard
          label="Direct Expenses (X-Ray/Lab)"
          value={`₹${stats.totalExpenses.toLocaleString()}`}
          icon={<Activity className="w-5 h-5 text-rose-600" />}
          variant="amber"
          className="border-amber-100 bg-amber-50/30"
        />
        <MetricCard
          label="Total Doctor Payable"
          value={`₹${stats.totalPayout.toLocaleString()}`}
          icon={<Wallet className="w-5 h-5 text-blue-600" />}
          variant="indigo"
          className="border-blue-100 bg-blue-50/30"
        />
        <MetricCard
          label="Net Clinic Profit"
          value={`₹${stats.netClinicProfit.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          variant="emerald"
          className="border-emerald-100 bg-emerald-50/50 ring-1 ring-emerald-500/20"
        />
      </div>

      {/* Visual Summary Hint */}
      {stats.totalRev > 0 && (
        <div className="bg-white rounded-2xl border border-border/50 p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <PieChart className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-bold text-foreground">Revenue Split Distribution</h3>
            <div className="w-full h-3 flex rounded-full overflow-hidden">
              <div style={{ width: `${(stats.netClinicProfit / stats.totalRev) * 100}%` }} className="bg-emerald-500 hover:opacity-90 transition-opacity" title={`Clinic Profit: ₹${stats.netClinicProfit}`} />
              <div style={{ width: `${(stats.totalPayout / stats.totalRev) * 100}%` }} className="bg-blue-500 hover:opacity-90 transition-opacity" title={`Doctor Share: ₹${stats.totalPayout}`} />
              <div style={{ width: `${(stats.totalExpenses / stats.totalRev) * 100}%` }} className="bg-amber-500 hover:opacity-90 transition-opacity" title={`Expenses: ₹${stats.totalExpenses}`} />
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Clinic Profit ({Math.round((stats.netClinicProfit / stats.totalRev) * 100)}%)</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Doctor Share ({Math.round((stats.totalPayout / stats.totalRev) * 100)}%)</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Expenses ({Math.round((stats.totalExpenses / stats.totalRev) * 100)}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Doctor-Wise Settlement Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground px-1">Doctor-Wise Settlement</h3>
        {stats.doctorStats.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground font-medium text-sm">No data available for the selected period.</p>
          </div>
        )}

        {stats.doctorStats.map((ds) => {
          const doctorId = doctorsWithSchedules.find(d => d.name === ds.name)?.id || ds.name;
          const isExpanded = expandedDoctor === doctorId;

          return (
            <Card
              key={doctorId}
              className={`overflow-hidden transition-all duration-300 border-border/50 shadow-sm ${isExpanded ? 'ring-1 ring-primary/20 shadow-md' : 'hover:border-border'}`}
            >
              {/* Doctor Row Header */}
              <div
                onClick={() => toggleDoctor(doctorId)}
                className={`p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center cursor-pointer ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'}`}
              >
                <div className="md:col-span-3 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${isExpanded ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-primary/10 text-primary'}`}>
                    {ds.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{ds.name}</h3>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {ds.specialization}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Revenue</p>
                    <p className="text-sm font-bold text-foreground">₹{ds.revenue.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider">X-Ray / Lab Cost</p>
                    <p className="text-sm font-bold text-amber-600">- ₹{ds.expenses.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider">Doctor Pay ({ds.profitPercent}%)</p>
                    <p className="text-sm font-bold text-blue-600">₹{ds.payout.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">Clinic Net Profit</p>
                    <p className="text-sm font-bold text-emerald-600">₹{ds.clinicProfit.toLocaleString()}</p>
                  </div>
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <div className={`p-2 rounded-xl transition-transform duration-300 ${isExpanded ? "bg-primary/10 text-primary rotate-180" : "bg-muted text-muted-foreground/60"}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Treatment Breakdown */}
              {isExpanded && (
                <div className="border-t border-border/50 bg-white animate-in slide-in-from-top-2">
                  <div className="p-4 border-b border-border/40 bg-slate-50/50 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      Detailed Breakdown for {ds.name}
                    </h4>
                    <Button size="sm" className="h-8 text-xs font-bold">
                      Settle Payment
                    </Button>
                  </div>
                  
                  {ds.treatments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <DataTable
                        data={ds.treatments}
                        rowKey={(row: any) => row.id || Math.random().toString()}
                        emptyTitle="No procedures found for this period"
                        columns={[
                          { 
                            header: 'Date & Patient', 
                            key: 'patientName', 
                            render: (t: any) => (
                              <div className="py-1">
                                <span className="block font-semibold text-foreground text-[13px]">{t.patientName}</span>
                                <span className="block text-[11px] text-muted-foreground mt-0.5">{new Date(t.date || t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                              </div>
                            ) 
                          },
                          { 
                            header: 'Procedure', 
                            key: 'procedure', 
                            render: (t: any) => <span className="text-xs font-medium text-muted-foreground">{t.procedure}</span> 
                          },
                          { 
                            header: 'Total Bill', 
                            key: 'cost', 
                            align: 'right', 
                            render: (t: any) => <span className="font-bold text-[13px] text-foreground">₹{Number(t.cost).toLocaleString()}</span> 
                          },
                          { 
                            header: 'X-Ray/Lab', 
                            key: 'expense', 
                            align: 'right', 
                            render: (t: any) => <span className="font-bold text-[13px] text-amber-600">-₹{t.mockExpense.toLocaleString()}</span> 
                          },
                          { 
                            header: 'Distributable', 
                            key: 'base', 
                            align: 'right', 
                            render: (t: any) => <span className="font-bold text-[13px] text-slate-600">₹{t.distributableProfit.toLocaleString()}</span> 
                          },
                          { 
                            header: 'Doctor Share', 
                            key: 'share', 
                            align: 'right', 
                            render: (t: any) => <span className="font-bold text-[13px] text-blue-600">₹{t.doctorShare.toLocaleString()}</span> 
                          },
                          { 
                            header: 'Clinic Profit', 
                            key: 'clinic', 
                            align: 'right', 
                            render: (t: any) => <span className="font-bold text-[13px] text-emerald-600">₹{t.clinicProfit.toLocaleString()}</span> 
                          },
                        ]}
                      />
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-sm text-muted-foreground/60 font-medium">No procedures found.</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
