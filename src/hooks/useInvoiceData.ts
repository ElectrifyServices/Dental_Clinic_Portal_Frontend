import { useInvoicesQuery } from './billing/useInvoicesQuery';
import { normalizeInvoice } from './billing/useInvoiceQuery';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteInvoiceMutation } from './billing/useDeleteInvoiceMutation';

export function useInvoiceData(params?: { search?: string; status?: string }, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const isEnabled = options?.enabled !== false;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [params?.search, params?.status]);

  const queryParams = useMemo(() => {
    const filters: any = {};
    if (params?.status && params.status !== "all") {
      filters.status = [params.status.toUpperCase()];
    }
    return {
      page: page,
      limit: limit,
      search: params?.search || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }, [params?.search, params?.status, page, limit]);

  const { data: apiInvoices, isLoading: isInvoicesLoading } = useInvoicesQuery(
    queryParams,
    { enabled: isEnabled }
  );

  const { mutateAsync: deleteInvoice } = useDeleteInvoiceMutation();

  const handleDeleteInvoice = async (id: string) => {
    try {
      await deleteInvoice({ id });
    } catch (err) {
      // Error handled by mutation/toast
    }
  };

  const handleUpdateInvoiceStatus = (id: string, status: string) => {
    queryClient.invalidateQueries({ queryKey: ["patients"] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };

  const refetchInvoices = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  }, [queryClient]);

  const invoices = useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(apiInvoices)) {
      rawList = apiInvoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as any).invoices)) {
      rawList = (apiInvoices as any).invoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as any).data?.invoices)) {
      rawList = (apiInvoices as any).data.invoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as any).data?.data)) {
      rawList = (apiInvoices as any).data.data;
    } else if (apiInvoices && Array.isArray((apiInvoices as any).data)) {
      rawList = (apiInvoices as any).data;
    } else if (apiInvoices && Array.isArray((apiInvoices as any).responseObject?.data?.invoices)) {
      rawList = (apiInvoices as any).responseObject.data.invoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as any).responseObject?.data)) {
      rawList = (apiInvoices as any).responseObject.data;
    }

    return rawList.map((inv: any) => normalizeInvoice(inv)).filter(Boolean);
  }, [apiInvoices]);

  const totalItems = useMemo(() => {
    return (
      (apiInvoices as any)?.pagination?.total ||
      (apiInvoices as any)?.pagination?.total_items ||
      (apiInvoices as any)?.data?.pagination?.total ||
      (apiInvoices as any)?.data?.pagination?.total_items ||
      (apiInvoices as any)?.responseObject?.data?.pagination?.total ||
      (apiInvoices as any)?.responseObject?.data?.pagination?.total_items ||
      (apiInvoices as any)?.total ||
      (apiInvoices as any)?.total_elements ||
      (apiInvoices as any)?.totalElements ||
      (apiInvoices as any)?.count ||
      invoices.length ||
      0
    );
  }, [apiInvoices, invoices]);

  const totalPages = useMemo(() => {
    return (
      (apiInvoices as any)?.pagination?.totalPages ||
      (apiInvoices as any)?.pagination?.total_pages ||
      (apiInvoices as any)?.data?.pagination?.totalPages ||
      (apiInvoices as any)?.data?.pagination?.total_pages ||
      (apiInvoices as any)?.responseObject?.data?.pagination?.totalPages ||
      (apiInvoices as any)?.responseObject?.data?.pagination?.total_pages ||
      (apiInvoices as any)?.totalPages ||
      (apiInvoices as any)?.total_pages ||
      Math.max(1, Math.ceil(totalItems / limit))
    );
  }, [apiInvoices, totalItems, limit]);

  // Keep setInvoices as no-op stub for backward compatibility
  const setInvoices = (_updater: any) => {};

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

