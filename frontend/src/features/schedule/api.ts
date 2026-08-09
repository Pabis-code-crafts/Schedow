import { httpClient } from '@/services/api';
import type {
  ListResponse,
  ChangeAssignmentWorkerPayload,
  CreateAssignmentPayload,
  CreateShiftPayload,
  ScheduleAssignmentDto,
  ShiftRecommendation,
  ShiftRecommendationDto,
  ShiftRecommendationPayload,
  ShiftTemplateDto,
  WeeklyAssignmentsResponse,
  WorkerDto,
} from '@/features/schedule/types';

export async function getShiftTemplates(): Promise<ListResponse<ShiftTemplateDto>> {
  const response = await httpClient.get<ListResponse<ShiftTemplateDto>>('/api/v1/schedules/shifts');

  return response.data;
}

export async function createShiftTemplate(payload: CreateShiftPayload): Promise<ShiftTemplateDto> {
  const response = await httpClient.post<ShiftTemplateDto>('/api/v1/schedules/shifts', payload);

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
  const response = await httpClient.post<ScheduleAssignmentDto>(
    '/api/v1/schedules/assignments',
    payload,
  );

  return response.data;
}

export async function changeAssignmentWorker({
  assignmentId,
  newUserId,
}: ChangeAssignmentWorkerPayload): Promise<ScheduleAssignmentDto> {
  const response = await httpClient.patch<ScheduleAssignmentDto>(
    `/api/v1/schedules/assignments/${assignmentId}/worker`,
    { newUserId },
  );

  return response.data;
}

export async function removeScheduleAssignment(assignmentId: number): Promise<void> {
  await httpClient.delete(`/api/v1/schedules/assignments/${assignmentId}`);
}

export async function getShiftRecommendations(
  payload: ShiftRecommendationPayload,
): Promise<ShiftRecommendation[]> {
  const response = await httpClient.post<ShiftRecommendationDto[]>(
    '/api/v1/schedules/recommendations',
    payload,
  );

  return response.data.map(mapShiftRecommendation);
}

function mapShiftRecommendation(recommendation: ShiftRecommendationDto): ShiftRecommendation {
  const userId =
    recommendation.userId !== undefined && Number.isFinite(Number(recommendation.userId))
      ? Number(recommendation.userId)
      : null;
  const canAssign =
    userId !== null &&
    recommendation.canAssign !== false &&
    recommendation.assignable !== false &&
    recommendation.disabled !== true;

  return {
    userId,
    workerName: recommendation.workerName ?? 'Worker name missing',
    fairnessScore: recommendation.fairnessScore ?? null,
    recurringWorker: recommendation.recurringWorker ?? false,
    reason: recommendation.reason ?? null,
    canAssign,
    disabledReason:
      recommendation.disabledReason ?? (userId === null ? 'Missing worker id' : null),
  };
}
