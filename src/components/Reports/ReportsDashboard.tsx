import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Calendar, Download,
  Package, Building2, Loader2,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Button, FilterTabs, toast } from '@/components/ui';
import { downloadExcelFromBlob } from '@/utils/export/exportHandler';

// Import decoupled sections
import { getFilterPayload } from './sections/Shared';
import { RevenueSection } from './sections/RevenueSection';
import { PatientsSection } from './sections/PatientsSection';
import { AppointmentsSection } from './sections/AppointmentsSection';
import { TreatmentsSection } from './sections/TreatmentsSection';
import { MembershipSection } from './sections/MembershipSection';
import { InventorySection } from './sections/InventorySection';

// Export functions
import {
  exportAppointmentAnalytics,
  exportPatientAnalytics,
  exportTreatmentAnalytics,
  exportMembershipAnalytics,
  exportInventoryAnalytics,
} from '@/hooks/analytics';

// ─── Date Range Picker ─────────────────────────────────────────────────────────
const PERIODS = [
  { key: 'today',     label: 'Today'       },
  { key: 'week',      label: 'This Week'   },
  { key: 'month',     label: 'This Month'  },
  { key: 'lastmonth', label: 'Last Month'  },
  { key: 'year',      label: 'This Year'   },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const REPORT_TABS = [
  { id: 'revenue',     label: 'Revenue',     icon: TrendingUp,   color: 'from-emerald-500 to-teal-600'     },
  { id: 'patients',    label: 'Patients',    icon: Users,        color: 'from-blue-500 to-indigo-600'      },
  { id: 'appointments',label: 'Appointments',icon: Calendar,     color: 'from-violet-500 to-purple-600'    },
  { id: 'treatments',  label: 'Treatments',  icon: BarChart3,    color: 'from-amber-500 to-orange-600'     },
  { id: 'membership',  label: 'Membership',  icon: Building2,    color: 'from-indigo-500 to-violet-600'    },
  { id: 'inventory',   label: 'Inventory',   icon: Package,      color: 'from-rose-500 to-red-600'         },
];

export function ReportsDashboard({ patients, appointments, treatments, invoices }: any) {
  const [period, setPeriod]   = useState('month');
  const [activeTab, setTab]   = useState('revenue');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const exportFnMap: Record<string, (filter: any) => Promise<any>> = {
      appointments: exportAppointmentAnalytics,
      patients: exportPatientAnalytics,
      treatments: exportTreatmentAnalytics,
      membership: exportMembershipAnalytics,
      inventory: exportInventoryAnalytics,
    };

    const exportFn = exportFnMap[activeTab];
    if (!exportFn) {
      toast.error("Export is not available for this section yet.");
      return;
    }

    try {
      setIsExporting(true);
      const filter = getFilterPayload(period);
      
      const response = await exportFn(filter);

      if (response.data instanceof Blob && response.data.type === 'application/json') {
        const text = await response.data.text();
        const json = JSON.parse(text);
        if (json?.responseStatusList?.statusList?.[0]?.statusDesc) {
          throw new Error(json.responseStatusList.statusList[0].statusDesc);
        } else {
          throw new Error("Export failed on server");
        }
      }

      await downloadExcelFromBlob(response.data, `${activeTab}-analytics-export.xlsx`);
      toast.success("Export successful");
    } catch (error: any) {
      console.error("Export failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to export data. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-border/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Clinic Analytics</h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Performance insights across revenue, patients, appointments & more
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FilterTabs
              tabs={PERIODS}
              active={period}
              onChange={setPeriod}
            />
            <Button 
              variant="outline" 
              className="gap-2 flex-shrink-0"
              onClick={handleExport}
              disabled={isExporting || !['appointments', 'patients', 'treatments', 'membership', 'inventory'].includes(activeTab)}
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        <div className="h-px bg-border/50 mx-0" />

        {/* Tab bar */}
        <div className="flex overflow-x-auto scrollbar-hide">
          {REPORT_TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 border-b-2 transition-all text-sm font-bold whitespace-nowrap ${
                  active
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${tab.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                {tab.label}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <div key={activeTab}>
          {activeTab === 'revenue'      && <RevenueSection period={period} />}
          {activeTab === 'patients'     && <PatientsSection period={period} />}
          {activeTab === 'appointments' && <AppointmentsSection period={period} />}
          {activeTab === 'treatments'   && <TreatmentsSection period={period} />}
          {activeTab === 'membership'   && <MembershipSection period={period} />}
          {activeTab === 'inventory'    && <InventorySection period={period} />}
        </div>
      </AnimatePresence>
    </div>
  );
}
