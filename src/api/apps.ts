// src/api/apps.ts
// 应用管理 API (Stripe 风格嵌套资源)

import type { ApiResult, ListResponse } from '../types';
import type { ApiKey } from '../types/api-key';
import type { App, AppCreateInput, AppUpdateInput } from '../types/app';
import { request } from './client';

// ==================== 应用 (App) ====================

/** 列出应用（游标分页） */
export const listApps = async (params?: {
  limit?: number;
  starting_after?: string;
  search?: string;
  is_active?: boolean;
}): Promise<ApiResult<ListResponse<App>>> => {
  const qs = new URLSearchParams();
  if (params?.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  if (params?.starting_after != null && params.starting_after !== '') {
    qs.set('starting_after', params.starting_after);
  }
  if (params?.search != null && params.search !== '') {
    qs.set('search', params.search);
  }
  if (params?.is_active !== undefined) {
    qs.set('is_active', String(params.is_active));
  }
  const queryStr = qs.toString() === '' ? '' : `?${qs.toString()}`;

  return await request<ListResponse<App>>('GET', `/apps${queryStr}`);
};

/** 获取应用详情 */
export const getApp = async (id: string): Promise<ApiResult<App>> => {
  return await request<App>('GET', `/apps/${id}`);
};

/** 创建应用 */
export const createApp = async (data: AppCreateInput): Promise<ApiResult<App>> => {
  return await request<App>('POST', '/apps', data);
};

/** 更新应用（Stripe: PATCH 局部更新） */
export const updateApp = async (id: string, data: AppUpdateInput): Promise<ApiResult<App>> => {
  return await request<App>('PATCH', `/apps/${id}`, data);
};

/** 删除应用 */
export const deleteApp = async (id: string): Promise<ApiResult<{ id: string; object: string; deleted: boolean }>> => {
  return await request<{ id: string; object: string; deleted: boolean }>('DELETE', `/apps/${id}`);
};

// ==================== 应用下嵌套的 API Keys ====================

/** 列出应用下的 Keys */
export const listAppKeys = async (
  appId: string,
  params?: { limit?: number; starting_after?: string; search?: string },
): Promise<ApiResult<ListResponse<ApiKey>>> => {
  const qs = new URLSearchParams();
  if (params?.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  if (params?.starting_after != null && params.starting_after !== '') {
    qs.set('starting_after', params.starting_after);
  }
  if (params?.search != null && params.search !== '') {
    qs.set('search', params.search);
  }
  const queryStr = qs.toString() === '' ? '' : `?${qs.toString()}`;
  const url = appId ? `/apps/${appId}/keys${queryStr}` : `/apps/keys${queryStr}`;

  return await request<ListResponse<ApiKey>>('GET', url);
};

/** 获取指定 Key 详情 */
export const getAppKey = async (appId: string, keyId: string): Promise<ApiResult<ApiKey>> => {
  return await request<ApiKey>('GET', `/apps/${appId}/keys/${keyId}`);
};

/** 在应用下创建 Key */
export const createAppKey = async (
  appId: string,
  data: { name: string; expires_at?: string | null },
): Promise<ApiResult<ApiKey>> => {
  return await request<ApiKey>('POST', `/apps/${appId}/keys`, data);
};

/** 更新 Key（Stripe: PATCH 局部更新） */
export const updateAppKey = async (
  appId: string,
  keyId: string,
  data: { name?: string; is_active?: boolean; expires_at?: string | null },
): Promise<ApiResult<ApiKey>> => {
  return await request<ApiKey>('PATCH', `/apps/${appId}/keys/${keyId}`, data);
};

/** 删除 Key */
export const deleteAppKey = async (
  appId: string,
  keyId: string,
): Promise<ApiResult<{ id: string; object: string; deleted: boolean }>> => {
  return await request<{ id: string; object: string; deleted: boolean }>('DELETE', `/apps/${appId}/keys/${keyId}`);
};

/** 轮换 Key */
export const rotateAppKey = async (appId: string, keyId: string): Promise<ApiResult<ApiKey>> => {
  return await request<ApiKey>('POST', `/apps/${appId}/keys/${keyId}/rotate`);
};
