import type { ApiResult, DeletedResponse, ListResponse } from '../../types';
import type { McpProvider, McpProviderCreateInput, McpProviderUpdateInput, McpToolInfo } from '../../types/mcp';
import { request } from '../client';

export const listMcpProviders = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  is_active?: boolean;
  kind?: string;
}): Promise<ApiResult<ListResponse<McpProvider>>> => {
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
  if (params?.kind != null && params.kind !== '') {
    qs.set('kind', params.kind);
  }

  const queryStr = qs.toString() ? `?${qs.toString()}` : '';
  return await request<ListResponse<McpProvider>>('GET', `/mcp/provider-mcps${queryStr}`);
};

export const getMcpProvider = async (id: string): Promise<ApiResult<McpProvider>> => {
  return await request<McpProvider>('GET', `/mcp/provider-mcps/${id}`);
};

export const createMcpProvider = async (data: McpProviderCreateInput): Promise<ApiResult<McpProvider>> => {
  return await request<McpProvider>('POST', '/mcp/provider-mcps', data);
};

export const updateMcpProvider = async (id: string, data: McpProviderUpdateInput): Promise<ApiResult<McpProvider>> => {
  return await request<McpProvider>('PATCH', `/mcp/provider-mcps/${id}`, data);
};

export const deleteMcpProvider = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/mcp/provider-mcps/${id}`);
};

export const listMcpProviderTools = async (id: string): Promise<ApiResult<{ object: 'list'; data: McpToolInfo[] }>> => {
  return await request<{ object: 'list'; data: McpToolInfo[] }>('GET', `/mcp/provider-mcps/${id}/tools`);
};
