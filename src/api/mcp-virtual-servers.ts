import type { ApiResult, DeletedResponse, ListResponse } from '../types';
import type { McpVirtualServer, McpVirtualServerCreateInput, McpVirtualServerUpdateInput } from '../types/mcp';
import { request } from './client';

export const listMcpVirtualServers = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  is_active?: boolean;
  mcp_provider_id?: string;
}): Promise<ApiResult<ListResponse<McpVirtualServer>>> => {
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
  return await request<ListResponse<McpVirtualServer>>('GET', `/mcp-virtual-servers${queryStr}`);
};

export const getMcpVirtualServer = async (id: string): Promise<ApiResult<McpVirtualServer>> => {
  return await request<McpVirtualServer>('GET', `/mcp-virtual-servers/${id}`);
};

export const createMcpVirtualServer = async (
  data: McpVirtualServerCreateInput,
): Promise<ApiResult<McpVirtualServer>> => {
  return await request<McpVirtualServer>('POST', '/mcp-virtual-servers', data);
};

export const updateMcpVirtualServer = async (
  id: string,
  data: McpVirtualServerUpdateInput,
): Promise<ApiResult<McpVirtualServer>> => {
  return await request<McpVirtualServer>('PATCH', `/mcp-virtual-servers/${id}`, data);
};

export const deleteMcpVirtualServer = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/mcp-virtual-servers/${id}`);
};
