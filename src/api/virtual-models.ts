import type { ApiResult, DeletedResponse, ListResponse, VirtualModel } from '../types';
import { request } from './client';

export const listVirtualModels = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<ApiResult<ListResponse<VirtualModel>>> => {
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
  return await request<ListResponse<VirtualModel>>('GET', `/virtual-models${queryStr}`);
};

export const getVirtualModel = async (id: string): Promise<ApiResult<VirtualModel>> => {
  return await request<VirtualModel>('GET', `/virtual-models/${id}`);
};

export const createVirtualModel = async (data: {
  name: string;
  description?: string;
  model_type: string;
  routing_strategy?: string;
  backends: { provider_model_id: string; weight?: number; priority?: number }[];
  rpm_limit?: number | null | undefined;
  tpm_limit?: number | null | undefined;
}): Promise<ApiResult<VirtualModel>> => {
  return await request<VirtualModel>('POST', '/virtual-models', data);
};

export const updateVirtualModel = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    routing_strategy: string;
    is_active: boolean;
    backends: { provider_model_id: string; weight?: number; priority?: number }[];
    rpm_limit?: number | null | undefined;
    tpm_limit?: number | null | undefined;
  }>,
): Promise<ApiResult<VirtualModel>> => {
  return await request<VirtualModel>('PATCH', `/virtual-models/${id}`, data);
};

export const deleteVirtualModel = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/virtual-models/${id}`);
};
