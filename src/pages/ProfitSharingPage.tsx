import React, { useState, useMemo } from 'react';
import { DollarSign, User, TrendingUp, Wallet, Award, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useAppData } from '../hooks/useAppData';

type DateFilter = 'thisMonth' | 'lastMonth' | 'custom';

export const ProfitSharingPage: React.FC = () => {
  const { treatments, staffMembers } = useAppData();
  const doctorsWithSchedules = useMemo(
    () => staffMembers.filter((s: any) => s.role === 'doctor' || s.role === 'admin'),
    [staffMembers]
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>('thisMonth');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);

  // Filtering Logic
  const filteredTreatments = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    return treatments.filter(t => {
      const treatmentDate = new Date(t.date || t.createdAt);
      if (dateFilter === 'thisMonth') return treatmentDate >= startOfMonth;
      if (dateFilter === 'lastMonth') return treatmentDate >= startOfLastMonth && treatmentDate <= endOfLastMonth;
      if (dateFilter === 'custom') {
        if (!customRange.start || !customRange.end) return true;
        return treatmentDate >= new Date(customRange.start) && treatmentDate <= new Date(customRange.end);
      }
      return true;
    });
  }, [treatments, dateFilter, customRange]);

  // Calculations
  const stats = useMemo(() => {
    let totalRev = 0;
    let totalPayout = 0;
    const doctorStats: Record<string, { name: string; revenue: number; payout: number }> = {};

    filteredTreatments.forEach(t => {
      const cost = Number(t.cost) || 0;
      totalRev += cost;

      const doctor = doctorsWithSchedules.find(d => d.id === t.doctorId) || 
                     doctorsWithSchedules.find(d => d.name === t.doctorName);
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
    
    let topDoc = { name: 'N/A', amount: 0 };
    Object.values(doctorStats).forEach(ds => {
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Minimalist Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title">Profit Sharing</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Doctor earnings and revenue distribution</p>
        </div>

        <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border shadow-sm">
          {[
            { id: 'thisMonth', label: 'This Month' },
            { id: 'lastMonth', label: 'Last Month' },
            { id: 'custom', label: 'Custom' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === f.id 
                ? 'bg-primary text-white' 
                : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {dateFilter === 'custom' && (
        <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-sm animate-in slide-in-from-top-2">
          <input
            type="date"
            value={customRange.start}
            onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-muted-foreground/60 font-medium text-sm">to</span>
          <input
            type="date"
            value={customRange.end}
            onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Simplified Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: stats.totalRev, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Doctor Payout', value: stats.totalPayout, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Clinic Profit', value: stats.netProfit, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Top Doctor', value: stats.topDoc.name, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', isPrice: false }
        ].map((card, i) => (
          <div key={i} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{card.label}</p>
              <p className="text-lg font-bold text-foreground">
                {card.isPrice === false ? card.value : `₹${card.value.toLocaleString()}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor List with Accordion */}
      <div className="space-y-4">
        {doctorsWithSchedules.map((doctor) => {
          const doctorTreatments = filteredTreatments.filter((t) => t.doctorId === doctor.id);
          const docProfitPercent = Number(doctor.profitPercentage) || 40;
          const totalEarnings = doctorTreatments.reduce((sum, t) => sum + (Number(t.cost) || 0), 0);
          const profitShare = (totalEarnings * docProfitPercent) / 100;
          const isExpanded = expandedDoctor === doctor.id;

          return (
            <div key={doctor.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300">
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
                      {doctor.specialization} · {Number(doctor.profitPercentage) || 40}% Share 
                      {!doctor.profitPercentage && <span className="text-[10px] text-amber-600 ml-1">(Default)</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Estimated Share</p>
                    <p className="text-lg font-bold text-green-600">₹{profitShare.toLocaleString()}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-muted text-muted-foreground/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border animate-in slide-in-from-top-2">
                  {doctorTreatments.length > 0 ? (
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider border-b border-border">
                            <th className="pb-3">Patient</th>
                            <th className="pb-3">Procedure</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3 text-right">Cost</th>
                            <th className="pb-3 text-right">Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {doctorTreatments.map(t => (
                            <tr key={t.id} className="text-sm">
                              <td className="py-4 font-semibold text-foreground">{t.patientName}</td>
                              <td className="py-4 text-muted-foreground">{t.procedure}</td>
                              <td className="py-4 text-muted-foreground/60 text-xs">
                                {new Date(t.date || t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </td>
                              <td className="py-4 font-bold text-foreground text-right">₹{Number(t.cost).toLocaleString()}</td>
                              <td className="py-4 font-bold text-green-600 text-right">
                                ₹{((Number(t.cost) * (Number(doctor.profitPercentage) || 40)) / 100).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-muted rounded-xl mt-4">
                      <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground/60 font-medium">No procedures found for this period</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
