import type { ApiResult, DeletedResponse, RequestLog, RequestLogList } from '../../types';
import { request } from '../client';

export const listRequestLogs = async (params?: {
  status?: string;
  request_model?: string;
  provider_kind?: string;
  provider_id?: string;
  error_type?: string;
  api_key_prefix?: string;
  user_format?: string;
  is_stream?: string;
  app_id?: string;
  limit?: number;
  starting_after?: string;
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
  const queryStr = query ? `?${query}` : '';
  return await request<RequestLogList>('GET', `/request-logs${queryStr}`);
};

export const getRequestLog = async (id: string): Promise<ApiResult<RequestLog>> => {
  return await request<RequestLog>('GET', `/request-logs/${id}`);
};

export const deleteRequestLog = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/request-logs/${id}`);
};
