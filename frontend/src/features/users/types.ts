export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'WORKER';

export type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  site: string;
  contractedHours: number;
};

export type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  site: string;
  contractedHours: number;
  active: boolean;
};
