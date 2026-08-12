import React from 'react';
import { AlertTriangle, CreditCard, Package, Users, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { MOCK_SMART_ALERTS } from '../../data/mockAnalytics';

const ALERT_CONFIG = {
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600 bg-amber-100',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-400',
  },
  danger: {
    bg: 'bg-rose-50 border-rose-200',
    icon: 'text-rose-600 bg-rose-100',
    badge: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-400',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600 bg-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-600 bg-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-400',
  },
};

const ALERT_ICONS: Record<string, React.ReactNode> = {
  invoice: <CreditCard className="w-4 h-4" />,
  stock:   <Package className="w-4 h-4" />,
  followup:<Users className="w-4 h-4" />,
  membership: <CheckCircle className="w-4 h-4" />,
};

export function SmartAlerts({ period = 'today' }: { period?: string }) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
  
  // In a real app, you might filter alerts based on period.
  // For mock UI, we'll just show them all.
  const alerts = MOCK_SMART_ALERTS.filter(a => !dismissed.has(a.id));
  
  const periodLabel = period === 'today' ? "Today's" : period === 'week' ? "This Week's" : period === 'month' ? "This Month's" : "This Year's";

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card h-full">
      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        {periodLabel} Smart Alerts
        {alerts.length > 0 && (
          <span className="ml-auto bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
            {alerts.length}
          </span>
        )}
      </p>
      
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
          <p className="text-xs text-muted-foreground font-medium">All clear! No pending action items.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {alerts.map((alert) => {
              const cfg = ALERT_CONFIG[alert.type as keyof typeof ALERT_CONFIG];
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.icon}`}>
                    {ALERT_ICONS[alert.icon]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground leading-tight">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{alert.value}</p>
                    <button className={`mt-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${cfg.badge}`}>
                      {alert.action}
                    </button>
                  </div>
                  <button
                    onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
                    className="text-muted-foreground/40 hover:text-muted-foreground p-0.5 rounded flex-shrink-0 mt-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
