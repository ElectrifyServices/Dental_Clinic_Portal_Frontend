import { useState } from 'react';
import { removeDependent, notifyDependentChange } from './dependentStorage';

export function useRemoveDependentMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async ({ id }: { id: string }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      removeDependent(id);
      notifyDependentChange();
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutateAsync, isLoading, error };
}
