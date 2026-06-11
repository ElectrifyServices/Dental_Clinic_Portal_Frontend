import { useState, useEffect, useCallback } from 'react';
import { PlanDependent } from '../../types';
import { getDependentsByMember } from './dependentStorage';

export function useDependentsQuery(memberId: string | undefined) {
  const [data, setData] = useState<PlanDependent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(() => {
    if (!memberId) { setData([]); return; }
    setIsLoading(true);
    // Simulate async tick so consumers can show loading state
    setTimeout(() => {
      setData(getDependentsByMember(memberId));
      setIsLoading(false);
    }, 0);
  }, [memberId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Re-sync when any dependent is added/removed/updated
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('plan_dependents_changed', handler);
    return () => window.removeEventListener('plan_dependents_changed', handler);
  }, [refetch]);

  return { data, isLoading, refetch };
}
