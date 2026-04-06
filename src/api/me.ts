import type { ApiResult } from '../types';
import { request } from './client';
import type { User } from './users';

export async function fetchMe(): Promise<ApiResult<User>> {
  return await request<User>('GET', '/me');
}
