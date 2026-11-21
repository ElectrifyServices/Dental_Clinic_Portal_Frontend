import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retryOnMount: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

