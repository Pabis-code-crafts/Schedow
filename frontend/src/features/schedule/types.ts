export type ScheduleWorker = {
  id: string;
  name: string;
  initials: string;
};

export type ShiftTemplate = {
  id: string;
  name: string;
  startTime: string | null;
  endTime: string | null;
  requiredWorkers: number | null;
};

export type ScheduledShift = {
  id: string;
  dayId: string;
  templateId: string;
  assignedWorkers: ScheduleWorker[];
  assignedWorkerIds: string[];
  assignedWorkerCount: number;
  requiredWorkers: number | null;
  coverage: number | null;
  aiRecommendationAvailable?: boolean;
};

export type WeekDay = {
  id: string;
  label: string;
  date: string;
  fullLabel: string;
};

export type WeeklySchedule = {
  weekStartDate: string;
  weekLabel: string;
  days: WeekDay[];
  shiftTemplates: ShiftTemplate[];
  shifts: ScheduledShift[];
  workers: ScheduleWorker[];
};

export type ShiftTemplateDto = {
  id?: string | number;
  shiftTemplateId?: string | number;
  templateId?: string | number;
  name?: string;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  requiredWorkers?: number;
  requiredWorkerCount?: number;
};

export type WorkerDto = {
  id?: string | number;
  workerId?: string | number;
  userId?: string | number;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  initials?: string;
};

export type ScheduleAssignmentDto = {
  id?: string | number;
  assignmentId?: string | number;
  weekStartDate?: string;
  dayId?: string;
  day?: string;
  dayOfWeek?: string;
  date?: string;
  shiftTemplateId?: string | number;
  templateId?: string | number;
  shiftId?: string | number;
  shiftTemplate?: ShiftTemplateDto;
  assignedUserId?: string | number;
  assignedWorkerIds?: Array<string | number>;
  workerIds?: Array<string | number>;
  assignedWorkers?: Array<{
    id?: string | number;
    workerId?: string | number;
    userId?: string | number;
  }>;
  workers?: ScheduleAssignmentDto['assignedWorkers'];
  assignedWorkerCount?: number;
  requiredWorkers?: number;
  requiredWorkerCount?: number;
  coverage?: number;
  coveragePercentage?: number;
  aiRecommendationAvailable?: boolean;
  hasAiRecommendation?: boolean;
};

export type CreateAssignmentPayload = {
  weekStartDate: string;
  dayOfWeek: string;
  assignedUserId: number;
  shiftId: number;
};

export type ListResponse<TItem> =
  | TItem[]
  | {
      data?: TItem[];
      items?: TItem[];
      content?: TItem[];
      assignments?: TItem[];
      shifts?: TItem[];
      workers?: TItem[];
    };

export type WeeklyAssignmentsResponse =
  | ScheduleAssignmentDto[]
  | {
      weekStartDate?: string;
      assignments?: ScheduleAssignmentDto[];
      data?: ScheduleAssignmentDto[];
      items?: ScheduleAssignmentDto[];
      content?: ScheduleAssignmentDto[];
    };
