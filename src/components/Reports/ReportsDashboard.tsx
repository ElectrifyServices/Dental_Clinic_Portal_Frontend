import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  IndianRupee,
  Target,
  UserPlus,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  PageHeader,
  FilterTabs,
  MetricCard,
  DataTable,
  Badge,
  Card,
  CardContent,
  Button,
} from "@/components/ui";

interface ReportsDashboardProps {
  patients: any[];
  appointments: any[];
  treatments: any[];
  invoices: any[];
}

export function ReportsDashboard({
  patients,
  appointments,
  treatments,
  invoices,
}: ReportsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedReport, setSelectedReport] = useState("earnings");

  const reportTypes = [
    {
      id: "earnings",
      title: "Earnings",
      description: "Revenue metrics",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "patients",
      title: "Patients",
      description: "Growth trends",
      icon: Users,
      color: "from-primary/100 to-indigo-600",
    },
    {
      id: "appointments",
      title: "Appointments",
      description: "Efficiency stats",
      icon: Calendar,
      color: "from-violet-500 to-purple-600",
    },
    {
      id: "treatments",
      title: "Treatments",
      description: "Procedure analysis",
      icon: BarChart3,
      color: "from-amber-500 to-orange-600",
    },
  ];

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const currentMonthInvoices = invoices.filter((inv) => {
      const d = new Date(inv.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const lastMonthInvoices = invoices.filter((inv) => {
      const d = new Date(inv.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const currentEarnings = currentMonthInvoices.reduce(
      (sum, inv) => sum + (inv.total || inv.amount || 0),
      0,
    );
    const prevEarnings = lastMonthInvoices.reduce(
      (sum, inv) => sum + (inv.total || inv.amount || 0),
      0,
    );
    const growth =
      prevEarnings === 0
        ? 100
        : Math.round(((currentEarnings - prevEarnings) / prevEarnings) * 100);

    const calculateAge = (dob: string) => {
      if (!dob) return 0;
      const b = new Date(dob);
      let age = now.getFullYear() - b.getFullYear();
      if (
        now.getMonth() < b.getMonth() ||
        (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())
      )
        age--;
      return age;
    };

    const ageGroups = [
      {
        range: "0-18",
        count: patients.filter((p) => calculateAge(p.dateOfBirth) <= 18).length,
      },
      {
        range: "19-35",
        count: patients.filter((p) => {
          const a = calculateAge(p.dateOfBirth);
          return a > 18 && a <= 35;
        }).length,
      },
      {
        range: "36-50",
        count: patients.filter((p) => {
          const a = calculateAge(p.dateOfBirth);
          return a > 35 && a <= 50;
        }).length,
      },
      {
        range: "51+",
        count: patients.filter((p) => calculateAge(p.dateOfBirth) > 50).length,
      },
    ];

    const completed = appointments.filter((a) =>
      ["completed", "checked-in"].includes(a.status),
    ).length;
    const trend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.getDate(),
        isToday: i === 0,
        count: appointments.filter(
          (a) => new Date(a.date).toDateString() === d.toDateString(),
        ).length,
      };
    });

    const treatmentData = Object.entries(
      treatments.reduce((acc: any, t) => {
        const name = t.procedure || "General Service";
        const cost = Number(t.cost) || 0;
        if (cost < 1000000) {
          if (!acc[name]) acc[name] = { revenue: 0, count: 0 };
          acc[name].revenue += cost;
          acc[name].count += 1;
        }
        return acc;
      }, {}),
    )
      .map(([service, data]: any) => ({ service, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      earnings: {
        current: currentEarnings,
        growth,
        avg: Math.round(currentEarnings / 30),
      },
      patients: {
        total: patients.length,
        new: patients.filter(
          (p) => new Date(p.createdAt || Date.now()).getMonth() === thisMonth,
        ).length,
        ageGroups,
      },
      appointments: {
        total: appointments.length,
        completed,
        rate: appointments.length
          ? Math.round((completed / appointments.length) * 100)
          : 0,
        trend,
      },
      treatments: treatmentData,
    };
  }, [patients, appointments, invoices, treatments]);

  const renderContent = () => {
    if (selectedReport === "earnings")
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <MetricCard
            label="Monthly Revenue"
            value={`₹${stats.earnings.current.toLocaleString()}`}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="emerald"
            trend={{
              value: `${stats.earnings.growth}%`,
              isUp: stats.earnings.growth >= 0,
            }}
          />
          <MetricCard
            label="Avg. Daily Revenue"
            value={`₹${stats.earnings.avg.toLocaleString()}`}
            icon={<IndianRupee className="w-5 h-5" />}
            variant="primary"
          />
          <MetricCard
            label="Top Procedure"
            value={stats.treatments[0]?.service || "N/A"}
            icon={<Target className="w-5 h-5" />}
            variant="indigo"
          />
        </div>
      );
    if (selectedReport === "patients")
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider">
                Age Distribution
              </h3>
              <div className="space-y-5">
                {stats.patients.ageGroups.map((g, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{g.range} Years</span>
                      <span className="text-primary">{g.count} Patients</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${(g.count / (stats.patients.total || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-4">
            <MetricCard
              label="Total Registered"
              value={stats.patients.total}
              variant="primary"
              icon={<Users className="w-5 h-5" />}
            />
            <MetricCard
              label="New This Month"
              value={stats.patients.new}
              variant="emerald"
              icon={<UserPlus className="w-5 h-5" />}
            />
          </div>
        </div>
      );
    if (selectedReport === "appointments")
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Bookings"
              value={stats.appointments.total}
              icon={<Calendar className="w-5 h-5" />}
            />
            <MetricCard
              label="Completed"
              value={stats.appointments.completed}
              variant="emerald"
              icon={<CheckCircle className="w-5 h-5" />}
            />
            <MetricCard
              label="Efficiency"
              value={`${stats.appointments.rate}%`}
              variant="primary"
              icon={<Target className="w-5 h-5" />}
            />
            <MetricCard
              label="Upcoming"
              value={stats.appointments.total - stats.appointments.completed}
              variant="amber"
              icon={<Clock className="w-5 h-5" />}
            />
          </div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> 7-Day Forecast
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {stats.appointments.trend.map((d, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-center transition-all ${d.isToday ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card"}`}
                  >
                    <p
                      className={`text-[10px] font-black uppercase ${d.isToday ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {d.day}
                    </p>
                    <p className="text-lg font-black text-foreground my-1">
                      {d.date}
                    </p>
                    <div
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${d.count > 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {d.count}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    return (
      <DataTable
        columns={[
          {
            key: "service",
            header: "Treatment",
            render: (t: any) => (
              <span className="font-bold text-foreground">{t.service}</span>
            ),
          },
          {
            key: "count",
            header: "Volume",
            render: (t: any) => <Badge variant="gray">{t.count} Cases</Badge>,
          },
          {
            key: "revenue",
            header: "Total Revenue",
            align: "right",
            render: (t: any) => (
              <span className="font-black text-emerald-600">
                ₹{t.revenue.toLocaleString()}
              </span>
            ),
          },
          {
            key: "avg",
            header: "Avg. Cost",
            align: "right",
            render: (t: any) => (
              <span className="text-primary font-bold">
                ₹{Math.round(t.revenue / t.count).toLocaleString()}
              </span>
            ),
          },
        ]}
        data={stats.treatments}
        rowKey={(t: any) => t.service}
      />
    );
  };

  return (
    <div className="space-y-3">
      <PageHeader
        title="Clinic Analytics"
        subtitle="Performance insights and patient demographics"
        action={
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex-1 text-sm font-bold text-muted-foreground px-2">
          Select Report Category
        </div>
        <FilterTabs
          tabs={[
            { key: "week", label: "Weekly" },
            { key: "month", label: "Monthly" },
            { key: "year", label: "Annual" },
          ]}
          active={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((r) => {
          const Icon = r.icon;
          const isActive = selectedReport === r.id;
          return (
            <Button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${isActive ? "border-primary bg-card shadow-xl shadow-primary/5" : "border-transparent bg-card hover:border-border hover:shadow-md"}`}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-lg`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-tight">
                {r.title}
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">
                {r.description}
              </p>
              {isActive && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </Button>
          );
        })}
      </div>

      <div className="pt-2">{renderContent()}</div>
    </div>
  );
}
