import type { ApiResult, DeletedResponse, ListResponse } from '@/types';
import { request } from './client';

/**
 * 将 params 对象序列化为 URL 查询字符串（?key=value&...）
 * 过滤掉 undefined、null、空字符串
 */
export function buildListQuery(params?: Record<string, unknown>): string {
  if (!params) {
    return '';
  }
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

/**
 * 分页参数基础类型
 */
export interface ListParams {
  readonly limit?: number;
  readonly offset?: number;
  readonly search?: string;
}

/**
 * 泛型 CRUD API 工厂 — 消除每个 API 文件中重复的 list/get/create/update/delete
 *
 * @example
 * const appsApi = createCrudApi<App, AppCreateInput, AppUpdateInput>('/apps');
 * // appsApi.list({ limit: 10, search: 'foo' })
 * // appsApi.get('abc')
 * // appsApi.create({ name: 'test' })
 * // appsApi.update('abc', { name: 'updated' })
 * // appsApi.delete('abc')
 */
export function createCrudApi<T, TCreate = Partial<T>, TUpdate = Partial<T>>(basePath: string) {
  return {
    async list(params?: ListParams & Record<string, unknown>): Promise<ApiResult<ListResponse<T>>> {
      return await request<ListResponse<T>>('GET', `${basePath}${buildListQuery(params)}`);
    },

    async get(id: string): Promise<ApiResult<T>> {
      return await request<T>('GET', `${basePath}/${id}`);
    },

    async create(data: TCreate): Promise<ApiResult<T>> {
      return await request<T>('POST', basePath, data);
    },

    async update(id: string, data: TUpdate): Promise<ApiResult<T>> {
      return await request<T>('PATCH', `${basePath}/${id}`, data);
    },

    async remove(id: string): Promise<ApiResult<DeletedResponse>> {
      return await request<DeletedResponse>('DELETE', `${basePath}/${id}`);
    },
  };
}
