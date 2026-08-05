import type {
  ListResponse,
  ScheduleAssignmentDto,
  ScheduledShift,
  ScheduleWorker,
  ShiftTemplate,
  ShiftTemplateDto,
  WeeklyAssignmentsResponse,
  WeeklySchedule,
  WeekDay,
  WorkerDto,
} from '@/features/schedule/types';

const dayFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const fullDayFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const weekFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

type MapWeeklyScheduleInput = {
  shiftTemplatesResponse: ListResponse<ShiftTemplateDto>;
  assignmentsResponse: WeeklyAssignmentsResponse;
  workersResponse: ListResponse<WorkerDto>;
  weekStartDate: string;
};

export function mapWeeklySchedule({
  assignmentsResponse,
  shiftTemplatesResponse,
  weekStartDate,
  workersResponse,
}: MapWeeklyScheduleInput): WeeklySchedule {
  const days = buildWeekDays(weekStartDate);
  const shiftTemplates = unwrapList(shiftTemplatesResponse, 'shifts').map(mapShiftTemplate);
  const workers = mapWorkers(unwrapList(workersResponse, 'workers'));
  const workerLookup = buildWorkerLookup(workers);
  const assignments = unwrapAssignments(assignmentsResponse);
  const shifts = mapAssignments(assignments, days, shiftTemplates, workerLookup);

  return {
    weekStartDate,
    weekLabel: `Week of ${weekFormatter.format(parseLocalDate(weekStartDate))}`,
    days,
    shiftTemplates,
    shifts,
    workers,
  };
}

function buildWeekDays(weekStartDate: string): WeekDay[] {
  const startDate = parseLocalDate(weekStartDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      id: toDateId(date),
      label: dayFormatter.format(date),
      date: dateFormatter.format(date),
      fullLabel: fullDayFormatter.format(date),
    };
  });
}

function mapShiftTemplate(template: ShiftTemplateDto, index: number): ShiftTemplate {
  const templateId = template.id ?? template.shiftTemplateId ?? template.templateId;
  const name = template.name ?? template.shiftName;
  const requiredWorkers = template.requiredWorkers ?? template.requiredWorkerCount ?? null;

  return {
    id: templateId !== undefined ? String(templateId) : `missing-shift-template-id-${index}`,
    name: name ?? 'Missing shift name',
    startTime: template.startTime ?? null,
    endTime: template.endTime ?? null,
    requiredWorkers,
  };
}

function mapAssignments(
  assignments: ScheduleAssignmentDto[],
  days: WeekDay[],
  shiftTemplates: ShiftTemplate[],
  workerLookup: Map<string, ScheduleWorker>,
): ScheduledShift[] {
  const shiftGroups = new Map<string, ScheduledShift>();

  assignments.forEach((assignment, index) => {
    const templateId = getAssignmentTemplateId(assignment, index);
    const dayId = getDayId(assignment, days);
    const key = `${dayId}:${templateId}`;
    const template = shiftTemplates.find((item) => item.id === templateId);
    const assignedWorkerIds = getAssignedWorkerIds(assignment);
    const existingShift = shiftGroups.get(key);
    const currentWorkerIds = existingShift?.assignedWorkerIds ?? [];
    const nextWorkerIds = Array.from(new Set([...currentWorkerIds, ...assignedWorkerIds]));
    const assignedWorkers = nextWorkerIds.map((workerId) => {
      const worker = workerLookup.get(workerId);

      return (
        worker ?? {
          id: workerId,
          name: `Missing worker name (${workerId})`,
          initials: '??',
        }
      );
    });
    const assignedWorkerCount = nextWorkerIds.length;
    const requiredWorkers =
      assignment.requiredWorkers ?? assignment.requiredWorkerCount ?? template?.requiredWorkers ?? null;
    const coverage =
      assignment.coverage ??
      assignment.coveragePercentage ??
      calculateCoverage(assignedWorkerCount, requiredWorkers);

    shiftGroups.set(key, {
      id: existingShift?.id ?? String(assignment.id ?? assignment.assignmentId ?? key),
      dayId,
      templateId,
      assignedWorkers,
      assignedWorkerIds: nextWorkerIds,
      assignedWorkerCount,
      requiredWorkers,
      coverage,
      aiRecommendationAvailable:
        Boolean(existingShift?.aiRecommendationAvailable) ||
        assignment.aiRecommendationAvailable ||
        assignment.hasAiRecommendation ||
        false,
    });
  });

  return Array.from(shiftGroups.values());
}

function mapWorkers(workers: WorkerDto[]): ScheduleWorker[] {
  return workers
    .map((worker, index) => {
      const id = worker.id ?? worker.workerId ?? worker.userId;

      if (id === undefined) {
        return null;
      }

      const name = getWorkerName(worker) ?? `Missing worker name (${id})`;

      return {
        id: String(id),
        name,
        initials: worker.initials ?? getInitials(name) ?? `W${index + 1}`,
      };
    })
    .filter((worker): worker is ScheduleWorker => worker !== null);
}

function buildWorkerLookup(workers: ScheduleWorker[]): Map<string, ScheduleWorker> {
  const lookup = new Map<string, ScheduleWorker>();

  workers.forEach((worker) => {
    lookup.set(worker.id, worker);
  });

  return lookup;
}

function getWorkerName(worker: WorkerDto): string | undefined {
  if (worker.name) {
    return worker.name;
  }

  if (worker.fullName) {
    return worker.fullName;
  }

  const joinedName = [worker.firstName, worker.lastName].filter(Boolean).join(' ');

  return joinedName || undefined;
}

function getAssignmentTemplateId(assignment: ScheduleAssignmentDto, index: number): string {
  const templateId =
    assignment.shiftTemplateId ??
    assignment.templateId ??
    assignment.shiftId ??
    assignment.shiftTemplate?.id;

  return templateId !== undefined ? String(templateId) : `missing-assignment-template-id-${index}`;
}

function getAssignedWorkerIds(assignment: ScheduleAssignmentDto): string[] {
  if (assignment.assignedUserId !== undefined) {
    return [String(assignment.assignedUserId)];
  }

  const directIds = assignment.assignedWorkerIds ?? assignment.workerIds;

  if (directIds) {
    return directIds.map(String);
  }

  const workerRefs = assignment.assignedWorkers ?? assignment.workers ?? [];

  return workerRefs
    .map((worker) => worker.id ?? worker.workerId ?? worker.userId)
    .filter((workerId): workerId is string | number => workerId !== undefined)
    .map(String);
}

function getDayId(assignment: ScheduleAssignmentDto, days: WeekDay[]): string {
  if (assignment.date) {
    return toDateId(parseLocalDate(assignment.date));
  }

  if (assignment.dayId) {
    return assignment.dayId;
  }

  if (assignment.day) {
    const matchingDay = days.find(
      (day) =>
        day.fullLabel.toLowerCase() === assignment.day?.toLowerCase() ||
        day.label.toLowerCase() === assignment.day?.slice(0, 3).toLowerCase(),
    );

    return matchingDay?.id ?? 'missing-assignment-date';
  }

  if (assignment.dayOfWeek) {
    const matchingDay = days.find(
      (day) => day.fullLabel.toUpperCase() === assignment.dayOfWeek?.toUpperCase(),
    );

    return matchingDay?.id ?? 'missing-assignment-date';
  }

  return 'missing-assignment-date';
}

function calculateCoverage(assignedWorkers: number, requiredWorkers: number | null): number | null {
  if (requiredWorkers === null) {
    return null;
  }

  if (requiredWorkers <= 0) {
    return 0;
  }

  return clampPercentage(Math.round((assignedWorkers / requiredWorkers) * 100));
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getInitials(name: string): string | undefined {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || undefined;
}

function unwrapList<TItem>(
  response: ListResponse<TItem>,
  domainKey: 'shifts' | 'workers',
): TItem[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response[domainKey] ?? response.data ?? response.items ?? response.content ?? [];
}

function unwrapAssignments(response: WeeklyAssignmentsResponse): ScheduleAssignmentDto[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.assignments ?? response.data ?? response.items ?? response.content ?? [];
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date(value);
  }

  return new Date(year, month - 1, day);
}

function toDateId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
