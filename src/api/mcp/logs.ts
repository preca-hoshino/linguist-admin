import type { ApiResult, ListResponse } from '../../types';
import type { McpLog } from '../../types/mcp';
import { request } from '../client';

interface McpLogListParams {
  limit?: number;
  offset?: number;
  search?: string;
  virtual_mcp_id?: string;
  mcp_provider_id?: string;
  method?: string;
  /** 按状态过滤（completed / error / processing）*/
  status?: string;
  /** 按工具名过滤（仅对 tools/call 有意义）*/
  tool_name?: string;
  app_id?: string;
}

function buildMcpLogQuery(params: McpLogListParams): URLSearchParams {
  const qs = new URLSearchParams();
  const str = (k: string, v?: string | null): void => {
    if (v != null && v !== '') {
      qs.set(k, v);
    }
  };
  if (params.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    qs.set('offset', String(params.offset));
  }
  str('search', params.search);
  str('virtual_mcp_id', params.virtual_mcp_id);
  str('mcp_provider_id', params.mcp_provider_id);
  str('method', params.method);
  str('status', params.status);
  str('tool_name', params.tool_name);
  str('app_id', params.app_id);
  return qs;
}

export const listMcpLogs = async (params: McpLogListParams = {}): Promise<ApiResult<ListResponse<McpLog>>> => {
  const qs = buildMcpLogQuery(params);
  const queryStr = qs.toString() ? `?${qs.toString()}` : '';
  return await request<ListResponse<McpLog>>('GET', `/mcp/logs${queryStr}`);
};

export const getMcpLog = async (id: string): Promise<ApiResult<McpLog>> => {
  return await request<McpLog>('GET', `/mcp/logs/${id}`);
};

export const deleteMcpLog = async (id: string): Promise<ApiResult<{ id: string; object: string; deleted: true }>> => {
  return await request<{ id: string; object: string; deleted: true }>('DELETE', `/mcp/logs/${id}`);
};
