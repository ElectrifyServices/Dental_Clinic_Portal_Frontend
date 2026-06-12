import { useState } from 'react';
import { PlanDependent } from '../../types';
import { addDependent, notifyDependentChange } from './dependentStorage';

export interface AddDependentVariables {
  memberId: string;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  corporatePlanId?: string;   // copied from primary member's plan
  primaryMemberName?: string; // copied from primary member's name
}

export function useAddDependentMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (variables: AddDependentVariables): Promise<PlanDependent> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = addDependent(variables);
      notifyDependentChange();
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutateAsync, isLoading, error };
}
