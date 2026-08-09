import { useMutation } from '@tanstack/react-query';

import { sendChatMessage } from '@/features/ai/api';
import type { SendChatMessageInput } from '@/features/ai/types';

export function useSendChatMessage() {
  return useMutation({
    mutationFn: (payload: SendChatMessageInput) => sendChatMessage(payload),
  });
}
