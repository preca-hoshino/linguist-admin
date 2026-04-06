import type { ApiResult, DeletedResponse, RequestLog, RequestLogList } from '../types';
import { request } from './client';

export const listRequestLogs = async (params?: {
  status?: string;
  request_model?: string;
  provider_kind?: string;
  provider_id?: string;
  error_type?: string;
  api_key_prefix?: string;
  user_format?: string;
  is_stream?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiResult<RequestLogList>> => {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (typeof v !== 'undefined' && String(v) !== '') {
        qs.set(k, String(v));
      }
    }
  }
  const query = qs.toString();
  // list 路由返回了 object: 'list', data, total，恰好符合 RequestLogList
  // RequestLogList 类型在 types 中包含了 total 和 data
  const queryStr = query ? `?${query}` : '';
  return await request<RequestLogList>('GET', `/request-logs${queryStr}`);
};

export const getRequestLog = async (id: string): Promise<ApiResult<RequestLog>> => {
  return await request<RequestLog>('GET', `/request-logs/${id}`);
};

export const deleteRequestLog = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/request-logs/${id}`);
};

export const deleteRequestLogsBatch = async (
  ids: string[],
): Promise<ApiResult<{ deleted_count: number; requested_count: number }>> => {
  return await request<{ deleted_count: number; requested_count: number }>('POST', '/request-logs/batch-delete', {
    body: JSON.stringify({ ids }),
  });
};
