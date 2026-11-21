import { useState, useEffect, useCallback } from 'react';

/**
 * In-Memory Session State Hook (DPDP Act 2023 & Security Audit Compliant)
 * 
 * Replaces persistent browser storage for clinical, EMR, queue,
 * and corporate health records with an isolated in-memory reactive store.
 * Data remains accessible during the active session across all components
 * but is NEVER persisted in the browser's unencrypted localStorage.
 */
const inMemoryStore = new Map<string, any>();
const initialValues = new Map<string, any>();
const listeners = new Map<string, Set<() => void>>();
const purgedKeys = new Set<string>();

export function useSessionState<T>(key: string, initialValue: T) {
  // Purge legacy persistent localStorage key only once per key (avoids side-effects on every render)
  if (typeof window !== 'undefined' && !purgedKeys.has(key)) {
    purgedKeys.add(key);
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  // Register initial value if not already registered
  if (!inMemoryStore.has(key)) {
    inMemoryStore.set(key, initialValue);
    initialValues.set(key, initialValue);
  }

  const [state, setStateInternal] = useState<T>(() => inMemoryStore.get(key) as T);

  useEffect(() => {
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    const listenerSet = listeners.get(key)!;
    const handleChange = () => {
      // Safely fall back to initial value if key was cleared
      const val = inMemoryStore.has(key) ? inMemoryStore.get(key) : initialValues.get(key);
      setStateInternal(val as T);
    };
    listenerSet.add(handleChange);

    return () => {
      listenerSet.delete(handleChange);
    };
  }, [key]);

  const setState = useCallback(
    (action: T | ((prev: T) => T)) => {
      const currentVal = inMemoryStore.has(key) ? (inMemoryStore.get(key) as T) : (initialValues.get(key) as T);
      const nextVal = typeof action === 'function' ? (action as (prev: T) => T)(currentVal) : action;
      inMemoryStore.set(key, nextVal);

      // Notify all listening components in the current session
      listeners.get(key)?.forEach((notify) => notify());
    },
    [key]
  );

  return [state, setState] as const;
}

/**
 * Resets all in-memory session stores back to their registered initial values
 * instead of leaving them undefined. Prevents UI components from crashing on logout.
 */
export function clearAllSessionStores(): void {
  inMemoryStore.clear();
  listeners.forEach((set, key) => {
    const defaultVal = initialValues.get(key);
    inMemoryStore.set(key, defaultVal);
    set.forEach((notify) => notify());
  });
}

// Backward compatibility alias (deprecated)
export { useSessionState as useLocalStorage, clearAllSessionStores as clearAllMemoryStores };
