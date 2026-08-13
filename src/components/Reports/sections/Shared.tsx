import React from 'react';
import { motion } from 'framer-motion';

// ─── Section wrapper ───────────────────────────────────────────────────────────
export function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {children}
    </motion.div>
  );
}

// Helper function to build filter payload based on period string
export function getFilterPayload(period: string, startDate?: string, endDate?: string) {
  if (period === 'custom') {
    return {
      timeRange: 'custom',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  }

  let timeRange = 'this_month';

  if (period === 'today') {
    timeRange = 'today';
  } else if (period === 'week') {
    timeRange = 'this_week';
  } else if (period === 'month') {
    timeRange = 'this_month';
  } else if (period === 'lastmonth') {
    timeRange = 'last_month';
  } else if (period === 'year') {
    timeRange = 'this_year';
  }

  return { timeRange };
}
