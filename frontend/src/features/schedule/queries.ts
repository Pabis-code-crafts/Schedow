import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  changeAssignmentWorker,
  createShiftTemplate,
  createScheduleAssignment,
  getShiftRecommendations,
  getShiftTemplates,
  getWeeklyScheduleAssignments,
  getWorkers,
  removeScheduleAssignment,
} from '@/features/schedule/api';
import { mapWeeklySchedule } from '@/features/schedule/scheduleMapper';
import type {
  ChangeAssignmentWorkerPayload,
  CreateAssignmentPayload,
  CreateShiftPayload,
  ShiftRecommendationPayload,
} from '@/features/schedule/types';

export const scheduleQueryKeys = {
  all: ['schedule'] as const,
  shiftTemplates: () => [...scheduleQueryKeys.all, 'shift-templates'] as const,
  weekAssignments: (weekStartDate: string) =>
    [...scheduleQueryKeys.all, 'assignments', 'week', weekStartDate] as const,
  workers: () => [...scheduleQueryKeys.all, 'workers'] as const,
};

export function useShiftTemplates() {
  return useQuery({
    queryKey: scheduleQueryKeys.shiftTemplates(),
    queryFn: getShiftTemplates,
  });
}
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
    },
  });
}

export function useCreateShiftTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShiftPayload) => createShiftTemplate(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.shiftTemplates(),
      });
    },
  });
}

export function useChangeAssignmentWorker(weekStartDate: string) {
  const queryClient = useQueryClient();
  const weekAssignmentsQueryKey = scheduleQueryKeys.weekAssignments(weekStartDate);

  return useMutation({
    mutationFn: (payload: ChangeAssignmentWorkerPayload) => changeAssignmentWorker(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: weekAssignmentsQueryKey,
      });
    },
  });
}

export function useRemoveScheduleAssignment(weekStartDate: string) {
  const queryClient = useQueryClient();
  const weekAssignmentsQueryKey = scheduleQueryKeys.weekAssignments(weekStartDate);

  return useMutation({
    mutationFn: (assignmentId: number) => removeScheduleAssignment(assignmentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: weekAssignmentsQueryKey,
      });
    },
  });
}

export function useShiftRecommendations() {
  return useMutation({
    mutationFn: (payload: ShiftRecommendationPayload) => getShiftRecommendations(payload),
  });
}

