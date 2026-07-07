import { useInvoicesQuery } from './billing/useInvoicesQuery';
import { normalizeInvoice } from './billing/useInvoiceQuery';
import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteInvoiceMutation } from './billing/useDeleteInvoiceMutation';

export function useInvoiceData(params?: { search?: string; status?: string }, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const isEnabled = options?.enabled !== false;

  const queryParams = useMemo(() => {
    const filters: any = {};
    if (params?.status && params.status !== "all") {
      filters.status = [params.status.toUpperCase()];
    }
    return {
      page: 1,
      limit: 1000,
      search: params?.search || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }, [params?.search, params?.status]);

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

  // Keep setInvoices as no-op stub for backward compatibility
  const setInvoices = (_updater: any) => {};

  return {
    invoices,
    setInvoices,
    isInvoicesLoading,
    refetchInvoices,
    handleDeleteInvoice,
    handleUpdateInvoiceStatus,
  };
}

