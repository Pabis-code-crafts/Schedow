import { httpClient } from '@/services/api';
import type {
  ListResponse,
  CreateAssignmentPayload,
  ScheduleAssignmentDto,
  ShiftTemplateDto,
  WeeklyAssignmentsResponse,
  WorkerDto,
} from '@/features/schedule/types';

export async function getShiftTemplates(): Promise<ListResponse<ShiftTemplateDto>> {
  const response = await httpClient.get<ListResponse<ShiftTemplateDto>>('/api/v1/schedules/shifts');

  return response.data;
}

export async function getWeeklyScheduleAssignments(
  weekStartDate: string,
): Promise<WeeklyAssignmentsResponse> {
  const response = await httpClient.get<WeeklyAssignmentsResponse>(
    `/api/v1/schedules/assignments/week/${weekStartDate}`,
  );

  return response.data;
}

export async function getWorkers(): Promise<ListResponse<WorkerDto>> {
  const response = await httpClient.get<ListResponse<WorkerDto>>('/api/v1/users/workers');

  return response.data;
}

export async function createScheduleAssignment(
  payload: CreateAssignmentPayload,
): Promise<ScheduleAssignmentDto> {
  console.log('Create schedule assignment payload', payload);

  const response = await httpClient.post<ScheduleAssignmentDto>(
    '/api/v1/schedules/assignments',
    payload,
  );

  return response.data;
}
