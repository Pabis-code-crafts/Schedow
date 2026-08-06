import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  createScheduleAssignment,
  getShiftRecommendations,
  getShiftTemplates,
  getWeeklyScheduleAssignments,
  getWorkers,
} from '@/features/schedule/api';
import { mapWeeklySchedule } from '@/features/schedule/scheduleMapper';
import type { CreateAssignmentPayload, ShiftRecommendationPayload } from '@/features/schedule/types';

export const scheduleQueryKeys = {
  all: ['schedule'] as const,
  shiftTemplates: () => [...scheduleQueryKeys.all, 'shift-templates'] as const,
  weekAssignments: (weekStartDate: string) =>
    [...scheduleQueryKeys.all, 'assignments', 'week', weekStartDate] as const,
  workers: () => [...scheduleQueryKeys.all, 'workers'] as const,
};

export function useScheduleWorkspace(weekStartDate: string) {
  const shiftTemplatesQuery = useQuery({
    queryKey: scheduleQueryKeys.shiftTemplates(),
    queryFn: getShiftTemplates,
  });

  const workersQuery = useQuery({
    queryKey: scheduleQueryKeys.workers(),
    queryFn: getWorkers,
  });

  const assignmentsQuery = useQuery({
    queryKey: scheduleQueryKeys.weekAssignments(weekStartDate),
    queryFn: () => getWeeklyScheduleAssignments(weekStartDate),
    enabled: shiftTemplatesQuery.isSuccess && workersQuery.isSuccess,
  });

  const schedule = useMemo(() => {
    if (!shiftTemplatesQuery.data || !assignmentsQuery.data || !workersQuery.data) {
      return undefined;
    }

    return mapWeeklySchedule({
      shiftTemplatesResponse: shiftTemplatesQuery.data,
      assignmentsResponse: assignmentsQuery.data,
      workersResponse: workersQuery.data ?? [],
      weekStartDate,
    });
  }, [assignmentsQuery.data, shiftTemplatesQuery.data, weekStartDate, workersQuery.data]);

  const error = shiftTemplatesQuery.error ?? workersQuery.error ?? assignmentsQuery.error;

  return {
    data: schedule,
    error,
    isError: shiftTemplatesQuery.isError || workersQuery.isError || assignmentsQuery.isError,
    isFetching:
      shiftTemplatesQuery.isFetching || workersQuery.isFetching || assignmentsQuery.isFetching,
    isLoading: shiftTemplatesQuery.isLoading || workersQuery.isLoading || assignmentsQuery.isLoading,
    refetch: async () => {
      await shiftTemplatesQuery.refetch();
      await workersQuery.refetch();
      await assignmentsQuery.refetch();
    },
  };
}

export function useCreateScheduleAssignment(weekStartDate: string) {
  const queryClient = useQueryClient();
  const weekAssignmentsQueryKey = scheduleQueryKeys.weekAssignments(weekStartDate);

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createScheduleAssignment(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: weekAssignmentsQueryKey,
      });
      await queryClient.refetchQueries({
        queryKey: weekAssignmentsQueryKey,
        type: 'active',
      });
    },
  });
}

export function useShiftRecommendations() {
  return useMutation({
    mutationFn: (payload: ShiftRecommendationPayload) => getShiftRecommendations(payload),
  });
}
