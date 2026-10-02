import type { ApiAny } from "../types/api";
import { useInvoicesQuery } from './billing/useInvoicesQuery';
import { normalizeInvoice } from './billing/useInvoiceQuery';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteInvoiceMutation } from './billing/useDeleteInvoiceMutation';

export function useInvoiceData(params?: { search?: string; status?: string; paymentMethod?: string; startDate?: string; endDate?: string }, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const isEnabled = options?.enabled !== false;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [params?.search, params?.status, params?.paymentMethod, params?.startDate, params?.endDate]);

  const queryParams = useMemo(() => {
    const filters: ApiAny = {};
    if (params?.status && params.status !== "all") {
      filters.status = [params.status.toUpperCase()];
    }
    if (params?.paymentMethod && params.paymentMethod !== "all") {
      filters.payment_methods = [params.paymentMethod.toUpperCase()];
    }
    if (params?.startDate) {
      filters.start_date = params.startDate;
    }
    if (params?.endDate) {
      filters.end_date = params.endDate;
    }
    return {
      page: page,
      limit: limit,
      search: params?.search || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }, [params?.search, params?.status, params?.paymentMethod, params?.startDate, params?.endDate, page, limit]);

  const { data: apiInvoices, isLoading: isInvoicesLoading } = useInvoicesQuery(
    queryParams,
    { enabled: isEnabled }
  );

  const { mutateAsync: deleteInvoice } = useDeleteInvoiceMutation();

  const handleDeleteInvoice = async (id: string) => {
    try {
      await deleteInvoice({ id });
    } catch (_err) {
      // Error handled by mutation/toast
    }
  };

  const handleUpdateInvoiceStatus = (_id: string, _status: string) => {
    queryClient.invalidateQueries({ queryKey: ["patients"] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };

  const refetchInvoices = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  }, [queryClient]);

  const invoices = useMemo(() => {
    let rawList: ApiAny[] = [];
    if (Array.isArray(apiInvoices)) {
      rawList = apiInvoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as ApiAny).invoices)) {
      rawList = (apiInvoices as ApiAny).invoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as ApiAny).data?.invoices)) {
      rawList = (apiInvoices as ApiAny).data.invoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as ApiAny).data?.data)) {
      rawList = (apiInvoices as ApiAny).data.data;
    } else if (apiInvoices && Array.isArray((apiInvoices as ApiAny).data)) {
      rawList = (apiInvoices as ApiAny).data;
    } else if (apiInvoices && Array.isArray((apiInvoices as ApiAny).responseObject?.data?.invoices)) {
      rawList = (apiInvoices as ApiAny).responseObject.data.invoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as ApiAny).responseObject?.data)) {
      rawList = (apiInvoices as ApiAny).responseObject.data;
    }

    return rawList.map((inv: ApiAny) => normalizeInvoice(inv)).filter(Boolean);
  }, [apiInvoices]);

  const totalItems = useMemo(() => {
    return (
      (apiInvoices as ApiAny)?.pagination?.total ||
      (apiInvoices as ApiAny)?.pagination?.total_items ||
      (apiInvoices as ApiAny)?.data?.pagination?.total ||
      (apiInvoices as ApiAny)?.data?.pagination?.total_items ||
      (apiInvoices as ApiAny)?.responseObject?.data?.pagination?.total ||
      (apiInvoices as ApiAny)?.responseObject?.data?.pagination?.total_items ||
      (apiInvoices as ApiAny)?.total ||
      (apiInvoices as ApiAny)?.total_elements ||
      (apiInvoices as ApiAny)?.totalElements ||
      (apiInvoices as ApiAny)?.count ||
      invoices.length ||
      0
    );
  }, [apiInvoices, invoices]);

  const totalPages = useMemo(() => {
    return (
      (apiInvoices as ApiAny)?.pagination?.totalPages ||
      (apiInvoices as ApiAny)?.pagination?.total_pages ||
      (apiInvoices as ApiAny)?.data?.pagination?.totalPages ||
      (apiInvoices as ApiAny)?.data?.pagination?.total_pages ||
      (apiInvoices as ApiAny)?.responseObject?.data?.pagination?.totalPages ||
      (apiInvoices as ApiAny)?.responseObject?.data?.pagination?.total_pages ||
      (apiInvoices as ApiAny)?.totalPages ||
      (apiInvoices as ApiAny)?.total_pages ||
      Math.max(1, Math.ceil(totalItems / limit))
    );
  }, [apiInvoices, totalItems, limit]);

  // Keep setInvoices as no-op stub for backward compatibility
  const setInvoices = (_updater: ApiAny) => {};

  return {
    invoices,
    setInvoices,
    isInvoicesLoading,
    refetchInvoices,
    handleDeleteInvoice,
    handleUpdateInvoiceStatus,
    page,
    setPage,
    limit,
    setLimit,
    totalItems,
    totalPages,
  };
}

