import { useApiQuery } from "../useApiQuery";
import apiClient from "../../services/apiClient";
import { normalizePatient } from "../patients/usePatientDetailQuery";

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
  let parsedItems = rawItems.map((item: any) => {
    const rate = Number(item.rate ?? item.unit_price ?? item.total_amount ?? item.billed_amount ?? 0);
    const quantity = Number(item.quantity ?? 1);
    const discountPct = Number(item.discount_value ?? item.item_discount ?? 0);
    
    const preDiscountTotal = quantity * rate;
    const discountVal = (preDiscountTotal * discountPct) / 100;
    const finalAmount = Math.max(0, preDiscountTotal - discountVal);

    return {
      id: item.id,
      item_type: item.item_type || "Service",
      description: item.description || '',
      billing_description_name: item.billing_description_name || item.billingDescriptionName || item.billing_description?.name || item.billingDescription?.name || '',
      billing_description_id: item.billing_description_id || item.billingDescriptionId || '',
      company_name: item.company_name || item.companyName || '',
      quantity,
      rate,
      discount_value: discountPct,
      item_discount: discountPct,
      amount: finalAmount,
      total_amount: preDiscountTotal,
      billed_amount: finalAmount,
      hsn_code: item.hsn_code || item.hsnCode || '999312',
    };
  });

  const isMemberInvoice = !!(inv.member_id || inv.memberId || (inv.member?.id) || inv.corporate_plan_id || inv.corporatePlanId);
  const hasNoPatientOrMember = !inv.patient_id && !inv.patientId && !inv.patient?.id && !inv.member_id && !inv.memberId && !inv.member?.id;

  const isCorporateInvoice =
    !!inv.isCorporateBilling ||
    !!inv.is_corporate_billing ||
    hasNoPatientOrMember ||
    parsedItems.some(
      (item: any) =>
        (item.description && item.description.startsWith("Employee Membership")) ||
        (item.item_type === "MEMBERSHIP" && !!item.billing_description_name) ||
        !!item.billing_description_name
    );

  let companyName = "";
  if (isCorporateInvoice) {
    companyName =
      inv.company_name ||
      inv.companyName ||
      inv.corporate_plan_name ||
      inv.corporatePlanName ||
      inv.plan_name ||
      inv.planName ||
      inv.plan?.company_name ||
      inv.plan?.plan_name ||
      "";

    if (!companyName) {
      const itemWithCompany = parsedItems.find(
        (i: any) => i.billing_description_name || i.company_name
      );
      if (itemWithCompany) {
        companyName =
          itemWithCompany.billing_description_name ||
          itemWithCompany.company_name;
      }
    }
  }

  // Consolidate corporate membership items if present
  const isCorporateItem = (item: any) =>
    item.item_type === "MEMBERSHIP" ||
    (item.description && item.description.startsWith("Employee Membership")) ||
    (isCorporateInvoice && !!item.billing_description_name);

  const corpItems = parsedItems.filter(isCorporateItem);
  const otherItems = parsedItems.filter((item: any) => !isCorporateItem(item));

  let items = parsedItems;

  if (corpItems.length > 0) {
    // Group corporate items by (billing_description_name or rate)
    const groupedMap = new Map<string, any[]>();
    corpItems.forEach((item: any) => {
      const key = `${item.billing_description_name || companyName || 'Corporate Plan'}_${item.rate}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, []);
      }
      groupedMap.get(key)!.push(item);
    });

    const consolidatedCorpItems: any[] = [];
    groupedMap.forEach((groupItems: any[]) => {
      const totalQty = groupItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
      const unitRate = groupItems[0].rate || (groupItems[0].total_amount ? groupItems[0].total_amount / (groupItems[0].quantity || 1) : 0);
      const discountPct = groupItems[0].discount_value || 0;
      const totalPreDiscount = groupItems.reduce((acc, i) => acc + (i.total_amount || 0), 0);
      const totalBilled = groupItems.reduce((acc, i) => acc + (i.billed_amount || i.amount || 0), 0);
      const name = companyName || groupItems[0].billing_description_name || "";
      const description = name ? `Corporate Membership - ${name}` : "Corporate Plan Membership";

      consolidatedCorpItems.push({
        id: groupItems[0].id,
        item_type: "MEMBERSHIP",
        description,
        billing_description_name: name,
        company_name: name,
        quantity: totalQty,
        rate: unitRate,
        discount_value: discountPct,
        item_discount: discountPct,
        amount: totalBilled,
        total_amount: totalPreDiscount,
        billed_amount: totalBilled,
        hsn_code: groupItems[0].hsn_code || '999312',
      });
    });

    items = [...consolidatedCorpItems, ...otherItems];
  }

  const discountVal = Number(inv.discount_percentage ?? inv.discount ?? 0);
  const taxVal = Number(inv.tax_percentage ?? inv.tax ?? 18);
  
  const subtotal = items.length > 0
    ? items.reduce((sum: number, item: any) => sum + item.amount, 0)
    : Number(inv.subtotal ?? 0);
    
  const discountAmount = Number(inv.discount_amount ?? (inv.is_complimentary ? subtotal : (subtotal * discountVal) / 100));
  const taxAmount = Number(inv.tax_amount ?? (inv.is_complimentary ? 0 : ((subtotal - discountAmount) * taxVal) / 100));
  
  const total = items.length > 0
    ? (inv.is_complimentary ? 0 : (subtotal - discountAmount + taxAmount))
    : Number(inv.total_amount ?? inv.total ?? 0);

  const paidAmount = Number(inv.paid_amount ?? inv.paidAmount ?? 0);
  const pendingAmount = Number(inv.pending_amount ?? inv.pendingAmount ?? 0);

  const patientName = isCorporateInvoice
    ? (companyName || inv.patient_name || inv.patientName || (inv.patient?.name) || (inv.member?.name) || inv.member_name || inv.memberName || 'Corporate Company')
    : (inv.patient_name || inv.patientName || (inv.patient?.name) || (inv.member?.name) || inv.member_name || inv.memberName || '');

  return {
    ...inv,
    id: inv.id,
    patientName,
    patientId: inv.patient_id || inv.patientId || (inv.patient?.id) || (inv.member?.id) || inv.member_id || inv.memberId || '',
    isMemberInvoice,
    isCorporateInvoice,
    companyName,
    phone: (() => {
      let p = inv.phone || inv.patient_phone || (inv.patient?.phone) || (inv.member?.phone) || inv.member_phone || '';
      const cc = inv.country_code || inv.patient_country_code || (inv.patient?.country_code) || (inv.member?.country_code) || inv.member_country_code || '';
      if (!p) return '';
      if (p.startsWith('+')) return p;
      const prefix = cc ? (cc.startsWith('+') ? cc : `+${cc}`) : '+91';
      return `${prefix} ${p}`;
    })(),
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
  const queryParams: any = { invoice_id: id };
  
  const query = useApiQuery<any>({
    queryKey: ["invoice", id],
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
  const rawPatient = query.data?.responseObject?.data?.patient || query.data?.data?.patient || null;
  const patient = rawPatient ? normalizePatient(rawPatient) : null;

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
    patient,
  };
}

export async function fetchInvoiceHistory(params?: any) {
  const res = await apiClient.get("/invoice/history", { params });
  return res.data;
}
