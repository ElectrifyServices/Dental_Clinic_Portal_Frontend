import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useInvoiceData() {
  const [invoices, setInvoices] = useLocalStorage<any[]>('invoices', []);

  // Auto-mark overdue invoices
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let changed = false;
    const updated = invoices.map(inv => {
      const due = new Date(inv.dueDate);
      due.setHours(0, 0, 0, 0);
      if (inv.status !== 'paid' && due < today && inv.status !== 'overdue') {
        changed = true;
        return { ...inv, status: 'overdue' };
      }
      return inv;
    });
    if (changed) setInvoices(updated);
  }, [invoices]); // eslint-disable-line react-hooks/exhaustive-deps

  return { invoices, setInvoices };
}
