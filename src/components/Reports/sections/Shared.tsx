import React from 'react';
import { motion } from 'framer-motion';
import { getLocalDateString } from '../../../utils/dateUtils';

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

// Compute the YYYY-MM-DD start/end for a preset period
function getRangeForPeriod(period: string): { startDate: string; endDate: string } {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      break;
    case 'week': {
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    }
    case 'lastmonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      break;
    case 'month':
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  return { startDate: getLocalDateString(start), endDate: getLocalDateString(end) };
}

// Always builds a complete filter payload: timeRange + startDate + endDate.
// - custom   -> dates come from the date pickers
// - presets  -> dates derived from the selected period
export function getFilterPayload(period: string, startDate?: string, endDate?: string) {
  if (period === 'custom') {
    return {
      timeRange: 'custom',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  }

  const timeRangeMap: Record<string, string> = {
    today: 'today',
    week: 'this_week',
    month: 'this_month',
    lastmonth: 'last_month',
    year: 'this_year',
  };

  return {
    timeRange: timeRangeMap[period] ?? 'this_month',
    ...getRangeForPeriod(period),
  };
}
