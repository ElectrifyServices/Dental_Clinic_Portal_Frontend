import { useState, useMemo, useCallback } from 'react';

interface UseSearchOptions<T> {
  /** The full data array to filter */
  data: T[];
  /** Fields to search against when using the text query (ignored for primitives) */
  searchFields?: (keyof T)[];
  /** Initial filter state (key-value pairs) */
  initialFilters?: Record<string, string>;
}

interface UseSearchReturn<T> {
  /** Current search query string */
  searchQuery: string;
  /** Set the search query */
  setSearchQuery: (query: string) => void;
  /** Current filter values */
  filters: Record<string, string>;
  /** Set a specific filter value */
  setFilter: (key: string, value: string) => void;
  /** Reset all filters */
  resetFilters: () => void;
  /** The filtered data result */
  filteredData: T[];
  /** Whether any filters are active */
  hasActiveFilters: boolean;
}

/**
 * Hook for managing search queries and filter state with automatic data filtering.
 * Supports both object datasets and primitive string/number arrays.
 */
export function useSearch<T>({
  data,
  searchFields = [],
  initialFilters = {},
}: UseSearchOptions<T>): UseSearchReturn<T> {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = useMemo(() => {
    const hasQuery = searchQuery.trim() !== '';
    const hasFilter = Object.entries(filters).some(
      ([key, value]) => value !== 'all' && value !== '' && value !== initialFilters[key]
    );
    return hasQuery || hasFilter;
  }, [searchQuery, filters, initialFilters]);

  const filteredData = useMemo(() => {
    let result = data;

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        if (typeof item === 'string') {
          return item.toLowerCase().includes(query);
        }
        if (typeof item === 'number') {
          return String(item).includes(query);
        }
        if (item && typeof item === 'object') {
          return searchFields.some((field) => {
            const value = item[field];
            if (typeof value === 'string') {
              return value.toLowerCase().includes(query);
            }
            if (typeof value === 'number') {
              return String(value).includes(query);
            }
            return false;
          });
        }
        return false;
      });
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter((item) => {
          if (item && typeof item === 'object') {
            const itemValue = item[key as keyof T];
            if (typeof itemValue === 'string') {
              return itemValue === value || itemValue.toLowerCase().replace(/\s/g, '-') === value;
            }
            return String(itemValue) === value;
          }
          return false;
        });
      }
    });

    return result;
  }, [data, searchQuery, searchFields, filters]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    filteredData,
    hasActiveFilters,
  };
}
