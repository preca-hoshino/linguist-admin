import type { ApiResult, DeletedResponse, ListResponse, Provider } from '../types';
import { request } from './client';

export const listProviders = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<ApiResult<ListResponse<Provider>>> => {
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
  return await request<ListResponse<Provider>>('GET', `/providers${queryStr}`);
};

export const getProvider = async (id: string): Promise<ApiResult<Provider>> => {
  return await request<Provider>('GET', `/providers/${id}`);
};

/** 创建提供商的请求体 */
export interface CreateProviderPayload {
  name: string;
  kind: string;
  base_url: string;
  credential_type?: 'api_key' | 'oauth2' | 'none';
  credential?: Record<string, unknown>;
  config?: Partial<Provider['config']>;
}

/** 更新提供商的请求体 */
export type UpdateProviderPayload = Partial<CreateProviderPayload>;

export const createProvider = async (data: CreateProviderPayload): Promise<ApiResult<Provider>> => {
  return await request<Provider>('POST', '/providers', data);
};

export const updateProvider = async (id: string, data: UpdateProviderPayload): Promise<ApiResult<Provider>> => {
  return await request<Provider>('PATCH', `/providers/${id}`, data);
};

export const deleteProvider = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/providers/${id}`);
};
