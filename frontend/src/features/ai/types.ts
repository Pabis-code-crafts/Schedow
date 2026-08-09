export type AiChatContext = {
  contextType: string;
  [key: string]: string | number | null | undefined;
};

export type ChatRequest = {
  context?: AiChatContext;
  message: string;
};

export type SendChatMessageInput = ChatRequest;

export type ChatResponse = {
  action?: AiActionProposal | null;
  actionProposal?: AiActionProposal | null;
  pendingAction?: AiActionProposal | null;
  response: string;
  type?: string;
};

export type AiActionProposal = {
  type?: string;
  action: string;
  workerId: number;
  workerName: string;
  shiftId: number;
  shiftName?: string | null;
  assignmentId?: number | null;
  date?: string | null;
  dayOfWeek: string;
  weekStartDate: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
};
