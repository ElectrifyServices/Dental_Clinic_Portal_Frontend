import React, { useState, useMemo } from "react";
import {
  DollarSign,
  User,
  TrendingUp,
  Wallet,
  Award,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useAppData } from "../hooks/useAppData";
import { MetricCard, PageHeader, Card, Button, Input, DataTable } from "../components/ui";

type DateFilter = "thisMonth" | "lastMonth" | "custom";

export const ProfitSharingPage: React.FC = () => {
  const { treatments, staffMembers } = useAppData();
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

  // Calculations
  const stats = useMemo(() => {
    let totalRev = 0;
    let totalPayout = 0;
    const doctorStats: Record<
      string,
      { name: string; revenue: number; payout: number }
    > = {};

    filteredTreatments.forEach((t) => {
      const cost = Number(t.cost) || 0;
      totalRev += cost;

      const doctor =
        doctorsWithSchedules.find((d) => d.id === t.doctorId) ||
        doctorsWithSchedules.find((d) => d.name === t.doctorName);
      const docProfitPercent = Number(doctor?.profitPercentage) || 40;
      const share = (cost * docProfitPercent) / 100;
      totalPayout += share;

      if (doctor) {
        if (!doctorStats[doctor.id]) {
          doctorStats[doctor.id] = { name: doctor.name, revenue: 0, payout: 0 };
        }
        doctorStats[doctor.id].revenue += cost;
        doctorStats[doctor.id].payout += share;
      }
    });

    const netProfit = totalRev - totalPayout;

    let topDoc = { name: "N/A", amount: 0 };
    Object.values(doctorStats).forEach((ds) => {
      if (ds.payout > topDoc.amount) {
        topDoc = { name: ds.name, amount: ds.payout };
      }
    });

    return { totalRev, totalPayout, netProfit, topDoc };
  }, [filteredTreatments, doctorsWithSchedules]);

  const toggleDoctor = (id: string) => {
    setExpandedDoctor(expandedDoctor === id ? null : id);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <PageHeader
        title="Profit Sharing"
        subtitle="Doctor earnings and revenue distribution"
      >
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl">
          {[
            { id: "thisMonth", label: "This Month" },
            { id: "lastMonth", label: "Last Month" },
            { id: "custom", label: "Custom" },
          ].map((f) => (
            <Button
              key={f.id}
              variant={dateFilter === f.id ? "default" : "ghost"}
              onClick={() => setDateFilter(f.id as any)}
              className={dateFilter === f.id ? "bg-card text-primary shadow-sm hover:bg-card/90" : "text-muted-foreground hover:text-foreground"}
              size="sm"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </PageHeader>

      {dateFilter === "custom" && (
        <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-sm animate-in slide-in-from-top-2">
          <Input
            type="date"
            value={customRange.start}
            onChange={(e) =>
              setCustomRange({ ...customRange, start: e.target.value })
            }
            className="w-auto"
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
            className="w-auto"
          />
        </div>
      )}

      {/* Simplified Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={`₹${stats.totalRev.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="primary"
        />
        <MetricCard
          label="Doctor Payout"
          value={`₹${stats.totalPayout.toLocaleString()}`}
          icon={<Wallet className="w-5 h-5" />}
          variant="emerald"
        />
        <MetricCard
          label="Clinic Profit"
          value={`₹${stats.netProfit.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="indigo"
        />
        <MetricCard
          label="Top Doctor"
          value={stats.topDoc.name}
          icon={<Award className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Doctor List with Accordion */}
      <div className="space-y-4">
        {doctorsWithSchedules.map((doctor) => {
          const doctorTreatments = filteredTreatments.filter(
            (t) => t.doctorId === doctor.id,
          );
          const docProfitPercent = Number(doctor.profitPercentage) || 40;
          const totalEarnings = doctorTreatments.reduce(
            (sum, t) => sum + (Number(t.cost) || 0),
            0,
          );
          const profitShare = (totalEarnings * docProfitPercent) / 100;
          const isExpanded = expandedDoctor === doctor.id;

          return (
            <Card
              key={doctor.id}
              className="overflow-hidden transition-all duration-300"
            >
              <div
                onClick={() => toggleDoctor(doctor.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground/60">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{doctor.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {doctor.specialization} ·{" "}
                      {Number(doctor.profitPercentage) || 40}% Share
                      {!doctor.profitPercentage && (
                        <span className="text-[10px] text-amber-600 ml-1">
                          (Default)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                      Estimated Share
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{profitShare.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg bg-muted text-muted-foreground/60 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border animate-in slide-in-from-top-2">
                  {doctorTreatments.length > 0 ? (
                    <div className="overflow-x-auto mt-4">
                      <DataTable
                        data={doctorTreatments}
                        columns={[
                          { header: 'Patient', key: 'patientName', render: (t: any) => <span className="font-semibold text-foreground">{t.patientName}</span> },
                          { header: 'Procedure', key: 'procedure', render: (t: any) => <span className="text-muted-foreground">{t.procedure}</span> },
                          { header: 'Date', key: 'date', render: (t: any) => <span className="text-muted-foreground/60 text-xs">{new Date(t.date || t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span> },
                          { header: 'Cost', key: 'cost', align: 'right', render: (t: any) => <span className="font-bold text-foreground">₹{Number(t.cost).toLocaleString()}</span> },
                          { header: 'Share', key: 'share', align: 'right', render: (t: any) => <span className="font-bold text-green-600">₹{((Number(t.cost) * docProfitPercent) / 100).toLocaleString()}</span> },
                        ]}
                        emptyMessage="No procedures found for this period"
                      />
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-muted rounded-xl mt-4">
                      <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground/60 font-medium">
                        No procedures found for this period
                      </p>
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
