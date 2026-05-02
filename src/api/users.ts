import type { ApiResult, ListResponse } from '../types';
import { request } from './client';

export interface User {
  id: string;
  readonly object: 'user';
  username: string;
  email: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** 用户更新参数 */
export interface UserUpdatePayload {
  username?: string;
  email?: string;
  password?: string;
  avatar_data?: string;
  is_active?: boolean;
}

export async function fetchUsers(params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<ApiResult<ListResponse<User>>> {
  const qs = new URLSearchParams();
  if (params?.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  if (params?.offset !== undefined && params.offset > 0) {
    qs.set('offset', String(params.offset));
  }
  if (params?.search != null && params.search !== '') {
    qs.set('search', params.search);
  }
  const query = qs.toString();
  const queryStr = query ? `?${query}` : '';
  return await request<ListResponse<User>>('GET', `/users${queryStr}`);
}

export async function createUserApi(data: {
  username: string;
  email: string;
  password: string;
  avatar_data?: string;
}): Promise<ApiResult<User>> {
  return await request<User>('POST', '/users', data);
}

export async function updateUserApi(id: string, data: UserUpdatePayload): Promise<ApiResult<User>> {
  return await request<User>('PATCH', `/users/${id}`, data);
}

export async function deleteUserApi(id: string): Promise<ApiResult<{ deleted: true; id: string; object: 'user' }>> {
  return await request<{ deleted: true; id: string; object: 'user' }>('DELETE', `/users/${id}`);
}
