import { useState, useMemo, useCallback } from "react";

interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  // Adjust page if it exceeds totalPages
  const currentPage = useMemo(() => {
    if (page > totalPages) {
      return totalPages;
    }
    return page;
  }, [page, totalPages]);

  const setPageSafe = useCallback(
    (newPage: number) => {
      setPage(Math.max(1, Math.min(newPage, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setPageSafe(currentPage + 1);
  }, [currentPage, setPageSafe]);

  const prevPage = useCallback(() => {
    setPageSafe(currentPage - 1);
  }, [currentPage, setPageSafe]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems);
  }, [startIndex, pageSize, totalItems]);

  const paginateData = useCallback(
    <T>(data: T[]): T[] => {
      return data.slice(startIndex, endIndex);
    },
    [startIndex, endIndex]
  );

  return {
    page: currentPage,
    pageSize,
    totalPages,
    setPage: setPageSafe,
    setPageSize,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    paginateData,
  };
}
