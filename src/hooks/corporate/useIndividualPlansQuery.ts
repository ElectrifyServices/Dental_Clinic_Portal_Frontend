import { useCorporatePlansQuery } from './useCorporatePlansQuery';
import { CorporatePlan } from '../../types';

export function useIndividualPlansQuery() {
  const result = useCorporatePlansQuery({ limit: 100 });

  const individualPlans: CorporatePlan[] = (result.data?.data ?? []).filter(
    (p: CorporatePlan) => p.planCategory === 'individual'
  );

  return { ...result, data: { ...result.data, data: individualPlans } };
}
