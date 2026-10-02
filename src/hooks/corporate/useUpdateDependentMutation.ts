import type { ApiAny } from "../../types/api";
import { useState } from 'react';
import { PlanDependent } from '../../types';
import { updateDependent, notifyDependentChange } from './dependentStorage';

export interface UpdateDependentVariables {
  id: string;
  name?: string;
  relationship?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  patientId?: string;
}

export function useUpdateDependentMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async ({ id, ...updates }: UpdateDependentVariables): Promise<PlanDependent> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = updateDependent(id, updates);
      notifyDependentChange();
      return result;
    } catch (caught) {
      const err = caught as ApiAny;
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutateAsync, isLoading, error };
}
