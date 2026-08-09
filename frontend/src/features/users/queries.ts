import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { scheduleQueryKeys } from '@/features/schedule/queries';
import { getWorkers, registerUser } from '@/features/users/api';
import type { RegisterUserPayload } from '@/features/users/types';

export const userQueryKeys = {
  all: ['users'] as const,
  workers: () => [...userQueryKeys.all, 'workers'] as const,
};

export function useWorkers() {
  return useQuery({
    queryKey: userQueryKeys.workers(),
    queryFn: getWorkers,
  });
}

export function useRegisterUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterUserPayload) => registerUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userQueryKeys.workers(),
      });
      await queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.workers() });
    },
  });
}
