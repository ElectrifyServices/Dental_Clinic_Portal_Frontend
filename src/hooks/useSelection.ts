import { useState, useCallback } from "react";

interface UseSelectionOptions<T> {
  initialSelected?: T[];
  getKey?: (item: T) => string | number;
}

export function useSelection<T>({
  initialSelected = [],
  getKey = (item) => (item as any).id || (item as any),
}: UseSelectionOptions<T> = {}) {
  const [selectedMap, setSelectedMap] = useState<Record<string | number, T>>(() => {
    const map: Record<string | number, T> = {};
    initialSelected.forEach((item) => {
      map[getKey(item)] = item;
    });
    return map;
  });

  const isSelected = useCallback(
    (item: T) => {
      return getKey(item) in selectedMap;
    },
    [selectedMap, getKey]
  );

  const select = useCallback(
    (item: T) => {
      setSelectedMap((prev) => ({ ...prev, [getKey(item)]: item }));
    },
    [getKey]
  );

  const deselect = useCallback(
    (item: T) => {
      setSelectedMap((prev) => {
        const next = { ...prev };
        delete next[getKey(item)];
        return next;
      });
    },
    [getKey]
  );

  const toggle = useCallback(
    (item: T) => {
      setSelectedMap((prev) => {
        const key = getKey(item);
        const next = { ...prev };
        if (key in next) {
          delete next[key];
        } else {
          next[key] = item;
        }
        return next;
      });
    },
    [getKey]
  );

  const selectAll = useCallback(
    (items: T[]) => {
      setSelectedMap((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          next[getKey(item)] = item;
        });
        return next;
      });
    },
    [getKey]
  );

  const clear = useCallback(() => {
    setSelectedMap({});
  }, []);

  const selectedItems = Object.values(selectedMap) as T[];

  return {
    selectedItems,
    isSelected,
    select,
    deselect,
    toggle,
    selectAll,
    clear,
  };
}
