import { httpClient } from '@/services/api';
import type { RegisterUserPayload, UserResponse } from '@/features/users/types';

export async function getWorkers(): Promise<UserResponse[]> {
  const response = await httpClient.get<UserResponse[]>('/api/v1/users/workers');

  return response.data;
}

export async function registerUser(payload: RegisterUserPayload): Promise<UserResponse> {
  const response = await httpClient.post<UserResponse>('/api/v1/users/register', payload);

  return response.data;
}
