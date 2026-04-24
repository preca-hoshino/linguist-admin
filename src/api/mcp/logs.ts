import type { ApiResult, ListResponse } from '../../types';
import type { McpLog } from '../../types/mcp';
import { request } from '../client';

export const listMcpLogs = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  virtual_mcp_id?: string;
  mcp_provider_id?: string;
  method?: string;
}): Promise<ApiResult<ListResponse<McpLog>>> => {
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
  if (params?.virtual_mcp_id != null && params.virtual_mcp_id !== '') {
    qs.set('virtual_mcp_id', params.virtual_mcp_id);
  }
  if (params?.mcp_provider_id != null && params.mcp_provider_id !== '') {
    qs.set('mcp_provider_id', params.mcp_provider_id);
  }
  if (params?.method != null && params.method !== '') {
    qs.set('method', params.method);
  }

  const queryStr = qs.toString() ? `?${qs.toString()}` : '';
  return await request<ListResponse<McpLog>>('GET', `/mcp/logs${queryStr}`);
};

export const getMcpLog = async (id: string): Promise<ApiResult<McpLog>> => {
  return await request<McpLog>('GET', `/mcp/logs/${id}`);
};

export const deleteMcpLog = async (id: string): Promise<ApiResult<{ id: string; deleted: boolean }>> => {
  return await request<{ id: string; deleted: boolean }>('DELETE', `/mcp/logs/${id}`);
};
