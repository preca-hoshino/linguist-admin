import type { ApiKey, ApiResult, DeletedResponse, ListResponse } from '../types';
import { request } from './client';

export const listApiKeys = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<ApiResult<ListResponse<ApiKey>>> => {
  const qs = new URLSearchParams();
  if (params?.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  if (params?.offset !== undefined) {
    qs.set('offset', String(params.offset));
  }
  if (params?.search != null && params.search !== '') {
    qs.set('search', params.search);
  }
  const query = qs.toString();
  const queryStr = query ? `?${query}` : '';
  return await request<ListResponse<ApiKey>>('GET', `/api-keys${queryStr}`);
};

export const getApiKey = async (id: string): Promise<ApiResult<ApiKey>> => {
  return await request<ApiKey>('GET', `/api-keys/${id}`);
};

export const createApiKey = async (data: { name: string; expires_at?: string }): Promise<ApiResult<ApiKey>> => {
  return await request<ApiKey>('POST', '/api-keys', data);
};

export const updateApiKey = async (
  id: string,
  data: Partial<{ name: string; is_active: boolean; expires_at: string | null }>,
): Promise<ApiResult<ApiKey>> => {
  return await request<ApiKey>('PATCH', `/api-keys/${id}`, data);
};

export const rotateApiKey = async (id: string): Promise<ApiResult<ApiKey>> => {
  return await request<ApiKey>('POST', `/api-keys/${id}/rotate`);
};

export const deleteApiKey = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/api-keys/${id}`);
};
