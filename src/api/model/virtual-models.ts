import type { ApiResult, DeletedResponse, ListResponse, VirtualModel } from '../../types';
import { request } from '../client';

export const listVirtualModels = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  model_type?: string;
  routing_strategy?: string;
  is_active?: boolean;
}): Promise<ApiResult<ListResponse<VirtualModel>>> => {
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
  if (params?.model_type != null && params.model_type !== '') {
    qs.set('model_type', params.model_type);
  }
  if (params?.routing_strategy != null && params.routing_strategy !== '') {
    qs.set('routing_strategy', params.routing_strategy);
  }
  if (params?.is_active !== undefined) {
    qs.set('is_active', String(params.is_active));
  }
  qs.append('expand', 'backends');

  const query = qs.toString();
  const queryStr = query ? `?${query}` : '';
  return await request<ListResponse<VirtualModel>>('GET', `/model/virtual-models${queryStr}`);
};

export const getVirtualModel = async (id: string): Promise<ApiResult<VirtualModel>> => {
  return await request<VirtualModel>('GET', `/model/virtual-models/${id}`);
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
  return await request<VirtualModel>('POST', '/model/virtual-models', data);
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
  return await request<VirtualModel>('PATCH', `/model/virtual-models/${id}`, data);
};

export const deleteVirtualModel = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/model/virtual-models/${id}`);
};
