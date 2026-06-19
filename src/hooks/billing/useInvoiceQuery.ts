import { useApiQuery } from "../useApiQuery";

export function normalizeInvoice(payload: any) {
  if (!payload) return null;
  const inv = payload?.responseObject?.data || payload?.data || payload?.invoice || payload;

  // Normalize items array
  const rawItems = inv.invoice_items || inv.invoiceItems || inv.items || [];
  const items = rawItems.map((item: any) => {
    const rate = Number(item.rate ?? item.unit_price ?? item.total_amount ?? item.billed_amount ?? 0);
    const quantity = Number(item.quantity ?? 1);
    return {
      id: item.id,
      description: item.description || '',
      quantity,
      rate,
      amount: Number(item.amount ?? (quantity * rate) ?? 0),
    };
  });

  const discountVal = Number(inv.discount_percentage ?? inv.discount ?? 0);
  const taxVal = Number(inv.tax_percentage ?? inv.tax ?? 18);
  const subtotal = Number(inv.subtotal ?? items.reduce((sum: number, item: any) => sum + item.amount, 0));
  const discountAmount = Number(inv.discount_amount ?? (inv.is_complimentary ? subtotal : (subtotal * discountVal) / 100));
  const taxAmount = Number(inv.tax_amount ?? (inv.is_complimentary ? 0 : ((subtotal - discountAmount) * taxVal) / 100));
  const total = Number(inv.total_amount ?? inv.total ?? (inv.is_complimentary ? 0 : (subtotal - discountAmount + taxAmount)));

  return {
    ...inv,
    id: inv.id,
    patientName: inv.patient_name || inv.patientName || (inv.patient?.name) || '',
    patientId: inv.patient_id || inv.patientId || (inv.patient?.id) || '',
    phone: inv.phone || inv.patient_phone || (inv.patient?.phone) || '',
    doctor: inv.doctor_name || inv.doctor || (inv.doctor?.name) || '',
    date: inv.invoice_date ? inv.invoice_date.split('T')[0] : (inv.date ? inv.date.split('T')[0] : (inv.created_at ? inv.created_at.split('T')[0] : '')),
    dueDate: inv.due_date ? inv.due_date.split('T')[0] : (inv.dueDate ? inv.dueDate.split('T')[0] : ''),
    discount: discountVal,
    tax: taxVal,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    invoice_number: inv.invoice_number || inv.invoiceNumber || inv.id,
    isComplimentary: inv.is_complimentary || inv.isComplimentary || false,
    complimentaryNote: inv.complimentary_reason || inv.complimentaryNote || '',
    linkedItemIds: inv.linked_item_ids || inv.linkedItemIds || [],
    items,
    status: inv.status ? inv.status.toLowerCase() : 'draft',
  };
}

export function useInvoiceQuery(id: string, options?: any) {
  const query = useApiQuery<any>({
    queryKey: ["invoice", id],
    endpoint: `/invoice/${id}`,
    method: "get",
    options: {
      enabled: !!id,
      ...options,
    },
  });

  return {
    ...query,
    data: query.data ? normalizeInvoice(query.data) : null,
  };
}
