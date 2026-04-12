import type { ApiResult, ListResponse } from '../types';
import type { McpLog } from '../types/mcp';
import { request } from './client';

export const listMcpLogs = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  virtual_mcp_id?: string;
  provider_mcp_id?: string;
  method?: string;
  direction?: 'inbound' | 'outbound';
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
  if (params?.provider_mcp_id != null && params.provider_mcp_id !== '') {
    qs.set('provider_mcp_id', params.provider_mcp_id);
  }
  if (params?.method != null && params.method !== '') {
    qs.set('method', params.method);
  }
  if (params?.direction != null) {
    qs.set('direction', params.direction);
  }

  const queryStr = qs.toString() ? `?${qs.toString()}` : '';
  return await request<ListResponse<McpLog>>('GET', `/mcp-logs${queryStr}`);
};

export const getMcpLog = async (id: string): Promise<ApiResult<McpLog>> => {
  return await request<McpLog>('GET', `/mcp-logs/${id}`);
};
