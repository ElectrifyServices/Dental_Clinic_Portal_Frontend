import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  enabled?: boolean;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll({
  enabled = true,
  hasMore = true,
  isLoading = false,
  onLoadMore,
  rootMargin = "200px",
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const targetRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node || !enabled || !hasMore || isLoading) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { root: null, rootMargin, threshold }
    );

    observerRef.current.observe(node);
  }, [enabled, hasMore, isLoading, onLoadMore, rootMargin, threshold]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return targetRef;
}
