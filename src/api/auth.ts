import type { ApiResult } from '../types';
import { request } from './client';

interface LoginResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export async function login(email: string, password: string): Promise<ApiResult<LoginResponse>> {
  return await request<LoginResponse>('POST', '/login', { email, password });
}
