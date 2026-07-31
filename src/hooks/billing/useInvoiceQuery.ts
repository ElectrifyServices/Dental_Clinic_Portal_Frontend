import { useApiQuery } from "../useApiQuery";
import apiClient from "../../services/apiClient";

export function normalizeInvoice(payload: any, expectedId?: string) {
  if (!payload) return null;
  let inv = payload?.responseObject?.data || payload?.data || payload?.invoice || payload;

  if (inv && inv.invoices && Array.isArray(inv.invoices)) {
    inv = inv.invoices;
  }

  if (Array.isArray(inv)) {
    if (expectedId) {
      inv = inv.find((i: any) => i.id === expectedId || i.invoice_number === expectedId) || inv[0];
    } else {
      inv = inv[0];
    }
  }

  if (!inv) return null;

  // Normalize items array
  const rawItems = inv.invoice_items || inv.invoiceItems || inv.items || [];
  const items = rawItems.map((item: any) => {
    const rate = Number(item.rate ?? item.unit_price ?? item.total_amount ?? item.billed_amount ?? 0);
    const quantity = Number(item.quantity ?? 1);
    return {
      id: item.id,
      item_type: item.item_type || "Service",
      description: item.description || '',
      quantity,
      rate,
      amount: Number(item.amount ?? (quantity * rate) ?? 0),
      total_amount: Number(item.total_amount ?? item.amount ?? (quantity * rate) ?? 0),
      billed_amount: Number(item.billed_amount ?? item.amount ?? (quantity * rate) ?? 0),
    };
  });

  const discountVal = Number(inv.discount_percentage ?? inv.discount ?? 0);
  const taxVal = Number(inv.tax_percentage ?? inv.tax ?? 18);
  const subtotal = Number(inv.subtotal ?? items.reduce((sum: number, item: any) => sum + item.amount, 0));
  const discountAmount = Number(inv.discount_amount ?? (inv.is_complimentary ? subtotal : (subtotal * discountVal) / 100));
  const taxAmount = Number(inv.tax_amount ?? (inv.is_complimentary ? 0 : ((subtotal - discountAmount) * taxVal) / 100));
  const total = Number(inv.total_amount ?? inv.total ?? (inv.is_complimentary ? 0 : (subtotal - discountAmount + taxAmount)));

  const paidAmount = Number(inv.paid_amount ?? inv.paidAmount ?? 0);
  const pendingAmount = Number(inv.pending_amount ?? inv.pendingAmount ?? 0);

  const isMemberInvoice = !!(inv.member_id || inv.memberId || (inv.member?.id) || inv.corporate_plan_id || inv.corporatePlanId);

  return {
    ...inv,
    id: inv.id,
    patientName: inv.patient_name || inv.patientName || (inv.patient?.name) || (inv.member?.name) || inv.member_name || inv.memberName || '',
    patientId: inv.patient_id || inv.patientId || (inv.patient?.id) || (inv.member?.id) || inv.member_id || inv.memberId || '',
    isMemberInvoice,
    phone: inv.phone || inv.patient_phone || (inv.patient?.phone) || (inv.member?.phone) || inv.member_phone || '',
    doctor: inv.doctor_name || inv.doctor || (inv.doctor?.name) || '',
    date: inv.invoice_date ? inv.invoice_date.split('T')[0] : (inv.date ? inv.date.split('T')[0] : (inv.created_at ? inv.created_at.split('T')[0] : '')),
    dueDate: inv.due_date ? inv.due_date.split('T')[0] : (inv.dueDate ? inv.dueDate.split('T')[0] : ''),
    discount: discountVal,
    tax: taxVal,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    paidAmount,
    pendingAmount,
    invoice_number: inv.invoice_number || inv.invoiceNumber || inv.id,
    isComplimentary: inv.is_complimentary || inv.isComplimentary || false,
    complimentaryNote: inv.complimentary_reason || inv.complimentaryNote || '',
    linkedItemIds: inv.linked_item_ids || inv.linkedItemIds || [],
    items,
    status: inv.status ? inv.status.toLowerCase() : 'draft',
  };
}

export function useInvoiceQuery(id: string, patientId?: string, isMember?: boolean, options?: any) {
  const isMemberCheck = isMember || (patientId && (patientId.startsWith('EMP-') || patientId.startsWith('IND-') || patientId.startsWith('MEM-')));
  const queryParams: any = { invoice_id: id };
  if (patientId) {
    if (isMemberCheck) queryParams.member_id = patientId;
    else queryParams.patient_id = patientId;
  }
  
  const query = useApiQuery<any>({
    queryKey: ["invoice", id, patientId],
    endpoint: `/invoice/history`,
    method: "get",
    params: queryParams,
    options: {
      enabled: !!id,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });

  let rawData = query.data?.responseObject?.data || query.data?.data || query.data?.invoice || query.data;
  if (rawData && rawData.invoices && Array.isArray(rawData.invoices)) {
    rawData = rawData.invoices;
  }
  const allInvoices = Array.isArray(rawData)
    ? rawData.map((inv: any) => normalizeInvoice(inv))
    : rawData ? [normalizeInvoice(rawData)] : [];

  return {
    ...query,
    data: query.data ? normalizeInvoice(query.data, id) : null,
    allInvoices,
  };
}

export async function fetchInvoiceHistory(params?: any) {
  const res = await apiClient.get("/invoice/history", { params });
  return res.data;
}
