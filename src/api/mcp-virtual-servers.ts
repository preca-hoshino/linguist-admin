import type { ApiResult, DeletedResponse, ListResponse } from '../types';
import type { VirtualMcp, VirtualMcpCreateInput, VirtualMcpUpdateInput } from '../types/mcp';
import { request } from './client';

export const listVirtualMcps = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  is_active?: boolean;
  mcp_provider_id?: string;
}): Promise<ApiResult<ListResponse<VirtualMcp>>> => {
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
  if (params?.is_active !== undefined) {
    qs.set('is_active', String(params.is_active));
  }
  if (params?.mcp_provider_id != null && params.mcp_provider_id !== '') {
    qs.set('mcp_provider_id', params.mcp_provider_id);
  }

  const queryStr = qs.toString() ? `?${qs.toString()}` : '';
  return await request<ListResponse<VirtualMcp>>('GET', `/virtual-mcps${queryStr}`);
};

export const getVirtualMcp = async (id: string): Promise<ApiResult<VirtualMcp>> => {
  return await request<VirtualMcp>('GET', `/virtual-mcps/${id}`);
};

export const createVirtualMcp = async (data: VirtualMcpCreateInput): Promise<ApiResult<VirtualMcp>> => {
  return await request<VirtualMcp>('POST', '/virtual-mcps', data);
};

export const updateVirtualMcp = async (id: string, data: VirtualMcpUpdateInput): Promise<ApiResult<VirtualMcp>> => {
  return await request<VirtualMcp>('PATCH', `/virtual-mcps/${id}`, data);
};

export const deleteVirtualMcp = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/virtual-mcps/${id}`);
};
