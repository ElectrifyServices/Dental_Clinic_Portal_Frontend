import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, IndianRupee, Activity } from 'lucide-react';

interface ReportsDashboardProps {
  patients: any[];
  appointments: any[];
  treatments: any[];
  invoices: any[];
}

export function ReportsDashboard({ patients, appointments, treatments, invoices }: ReportsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('earnings');

  const reportTypes = [
    { id: 'earnings', title: 'Earnings Report', description: 'Revenue and growth metrics', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { id: 'patients', title: 'Patient Analytics', description: 'Demographics and trends', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { id: 'appointments', title: 'Appointment Stats', description: 'Booking efficiency and flow', icon: Calendar, color: 'from-purple-500 to-violet-500' },
    { id: 'treatments', title: 'Treatment Analysis', description: 'Procedure performance', icon: BarChart3, color: 'from-orange-500 to-amber-500' },
  ];

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const calculateAge = (dob: string) => {
      if (!dob) return 0;
      const birthDate = new Date(dob);
      let age = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
      return age;
    };

    const currentMonthInvoices = invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const lastMonthInvoices = invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const currentEarnings = currentMonthInvoices.reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0);
    const prevEarnings = lastMonthInvoices.reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0);
    const growth = prevEarnings === 0 ? 100 : Math.round(((currentEarnings - prevEarnings) / prevEarnings) * 100);

    const newPatients = patients.filter(p => {
      const d = new Date(p.createdAt || Date.now());
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const ageGroups = [
      { range: '0-18', count: patients.filter(p => calculateAge(p.dateOfBirth) <= 18).length },
      { range: '19-35', count: patients.filter(p => { const a = calculateAge(p.dateOfBirth); return a > 18 && a <= 35; }).length },
      { range: '36-50', count: patients.filter(p => { const a = calculateAge(p.dateOfBirth); return a > 35 && a <= 50; }).length },
      { range: '51-65', count: patients.filter(p => { const a = calculateAge(p.dateOfBirth); return a > 50 && a <= 65; }).length },
      { range: '65+', count: patients.filter(p => calculateAge(p.dateOfBirth) > 65).length },
    ];

    const totalAppts = appointments.length;
    const completedAppts = appointments.filter(a => a.status === 'completed' || a.status === 'checked-in').length;
    const pendingAppts = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed' || a.status === 'scheduled').length;
    const noShowAppts = appointments.filter(a => a.status === 'no-show').length;
    const completionRate = totalAppts ? Math.round((completedAppts / totalAppts) * 100) : 0;

    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const count = appointments.filter(a => new Date(a.date).toDateString() === d.toDateString()).length;
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        isToday: i === 0,
        count
      };
    });

    const treatmentCounts: Record<string, { revenue: number, count: number }> = {};
    treatments.forEach(t => {
      const name = t.procedure || 'General Service';
      const cost = Number(t.cost) || 0;
      // Skip astronomical numbers in analytics too
      if (cost < 100000000) {
        if (!treatmentCounts[name]) treatmentCounts[name] = { revenue: 0, count: 0 };
        treatmentCounts[name].revenue += cost;
        treatmentCounts[name].count += 1;
      }
    });

    const allTreatments = Object.entries(treatmentCounts)
      .map(([service, data]) => ({ service, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    const topServices = allTreatments.slice(0, 5);

    return {
      earnings: { current: currentEarnings, last: prevEarnings, growth, avg: Math.round(currentEarnings / 30) },
      patients: { total: patients.length, new: newPatients, returning: patients.length - newPatients, ageGroups },
      appointments: { total: totalAppts, completed: completedAppts, pending: pendingAppts, noShow: noShowAppts, rate: completionRate, trend: next7Days },
      topServices,
      allTreatments
    };
  }, [patients, appointments, invoices]);

  const renderEarningsReport = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.earnings.current.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stats.earnings.growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {stats.earnings.growth >= 0 ? '+' : ''}{stats.earnings.growth}%
            </span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg. Daily Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.earnings.avg.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Top Procedure</p>
              <p className="text-xl font-semibold text-gray-900">{stats.topServices[0]?.service || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatientsReport = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Age Distribution</h3>
          <div className="space-y-4">
             {stats.patients.ageGroups.map((group, i) => (
               <div key={i} className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600 font-medium">{group.range} years</span>
                   <span className="text-gray-900 font-semibold">{group.count} patients</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2">
                   <div 
                     className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                     style={{ width: `${(group.count / (stats.patients.total || 1)) * 100}%` }}
                   ></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Growth Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl transition-transform hover:scale-105">
               <p className="text-sm text-blue-600 font-medium">New Patients</p>
               <p className="text-3xl font-semibold text-blue-700 mt-1">{stats.patients.new}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl transition-transform hover:scale-105">
               <p className="text-sm text-purple-600 font-medium">Returning</p>
               <p className="text-3xl font-semibold text-purple-700 mt-1">{stats.patients.returning}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointmentsReport = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-600 rounded-xl p-5 text-white shadow-sm transition-all hover:scale-105">
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-semibold mt-1">{stats.appointments.total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm transition-all hover:scale-105">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">{stats.appointments.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm transition-all hover:scale-105">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.appointments.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm transition-all hover:scale-105">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">No-Show</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{stats.appointments.noShow}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm transition-all hover:scale-105">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Efficiency</p>
          <p className="text-2xl font-semibold text-purple-600 mt-1">{stats.appointments.rate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Daily Forecast (Next 7 Days)
          </h3>
          <p className="text-sm text-gray-500 mt-1">Number of appointments scheduled per day</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
           {stats.appointments.trend.map((data, i) => {
             const maxCount = Math.max(...stats.appointments.trend.map(d => d.count)) || 1;
             const percentage = (data.count / maxCount) * 100;
             
             return (
               <div 
                key={i} 
                style={{ animationDelay: `${i * 50}ms` }}
                className={`p-4 rounded-xl border transition-all duration-500 animate-in fade-in slide-in-from-right-4 fill-mode-both hover:shadow-md hover:-translate-y-1 ${data.isToday ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white'}`}
               >
                 <div className="flex flex-col h-full">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <p className={`text-xs font-semibold ${data.isToday ? 'text-blue-600' : 'text-gray-500'}`}>{data.day.toUpperCase()}</p>
                       <p className="text-xl font-semibold text-gray-900">{data.date}</p>
                     </div>
                     {data.isToday && (
                       <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold animate-pulse">TODAY</span>
                     )}
                   </div>
                   
                   <div className="mt-auto">
                     <div className="flex items-baseline gap-1 mb-2">
                       <span className="text-2xl font-semibold text-gray-900">{data.count}</span>
                       <span className="text-[10px] text-gray-400 font-medium">Appts</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ${data.isToday ? 'bg-blue-600' : 'bg-blue-400'}`}
                         style={{ width: `${Math.max(percentage, 5)}%` }}
                       ></div>
                     </div>
                   </div>
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );

  const renderTreatmentReport = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Treatment Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Treatment Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {stats.allTreatments.length > 0 ? stats.allTreatments.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{t.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{t.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">₹{Math.round(t.revenue / t.count).toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No treatment data found in invoices</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case 'earnings': return renderEarningsReport();
      case 'patients': return renderPatientsReport();
      case 'appointments': return renderAppointmentsReport();
      case 'treatments': return renderTreatmentReport();
      default: return renderEarningsReport();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Analytics</h2>
          <p className="text-gray-500 mt-1 font-medium">Clinic performance and patient insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {['week', 'month', 'year'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${selectedPeriod === period
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-black flex items-center shadow-sm transition-all active:scale-95">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          const isActive = selectedReport === report.id;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`p-6 rounded-2xl border-2 transition-all duration-500 text-left relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${isActive
                  ? 'border-blue-600 bg-white shadow-xl shadow-blue-50'
                  : 'border-transparent bg-white hover:border-gray-200 hover:shadow-md'
                } hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              {isActive && (
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
        {renderReport()}
      </div>
    </div>
  );
}