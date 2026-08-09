import { httpClient } from '@/services/api';
import type { ChatResponse, SendChatMessageInput } from '@/features/ai/types';

export async function sendChatMessage(payload: SendChatMessageInput): Promise<ChatResponse> {
  const response = await httpClient.post<ChatResponse>('/api/v1/ai/chat', payload);

  return response.data;
}
