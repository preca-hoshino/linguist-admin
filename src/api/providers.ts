import type { ApiResult, DeletedResponse, ListResponse, Provider } from '../types';
import { request } from './client';

export const listProviders = async (params?: {
  limit?: number;
  starting_after?: string;
  search?: string;
}): Promise<ApiResult<ListResponse<Provider>>> => {
  const qs = new URLSearchParams();
  if (params?.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  if (params?.starting_after !== undefined) {
    qs.set('starting_after', String(params.starting_after));
  }
  if (params?.search != null && params.search !== '') {
    qs.set('search', params.search);
  }
  const query = qs.toString();
  const queryStr = query ? `?${query}` : '';
  return await request<ListResponse<Provider>>('GET', `/providers${queryStr}`);
};

export const getProvider = async (id: string): Promise<ApiResult<Provider>> => {
  return await request<Provider>('GET', `/providers/${id}`);
};

/** 创建提供商的请求体 */
export interface CreateProviderPayload {
  name: string;
  kind: string;
  base_url: string;
  credential_type?: 'api_key' | 'oauth2' | 'copilot' | 'none';
  credential?: Record<string, unknown>;
  config?: Partial<Provider['config']>;
}

/** 更新提供商的请求体 */
export type UpdateProviderPayload = Partial<CreateProviderPayload>;

export const createProvider = async (data: CreateProviderPayload): Promise<ApiResult<Provider>> => {
  return await request<Provider>('POST', '/providers', data);
};

export const updateProvider = async (id: string, data: UpdateProviderPayload): Promise<ApiResult<Provider>> => {
  return await request<Provider>('PATCH', `/providers/${id}`, data);
};

export const deleteProvider = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/providers/${id}`);
};

// ===== Copilot OAuth Device Flow API =====

/** Device Code 响应 */
export interface CopilotDeviceCodeResponse {
  object: 'device_code';
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

/** Poll Token 响应 */
export interface CopilotPollTokenResponse {
  object: 'oauth_token';
  status: 'pending' | 'complete' | 'expired';
  provider_id?: string | null;
  token_prefix?: string;
  access_token?: string;
}

/** 验证响应 */
export interface CopilotVerifyResponse {
  object: 'oauth_verification';
  valid: boolean;
  github_login?: string;
}

/** 发起 Copilot OAuth Device Flow */
export const copilotCreateDeviceCode = async (): Promise<ApiResult<CopilotDeviceCodeResponse>> =>
  await request<CopilotDeviceCodeResponse>('POST', '/oauth/copilot/device-codes');

/**
 * 轮询 OAuth 授权状态，尝试换取 access_token
 * @param deviceCode - 第一步返回的 device_code
 * @param providerId - 可选。有则写入 DB；无则返回完整 token（创建模式用）
 */
export const copilotPollToken = async (
  deviceCode: string,
  providerId?: string,
): Promise<ApiResult<CopilotPollTokenResponse>> =>
  await request<CopilotPollTokenResponse>('POST', `/oauth/copilot/device-codes/${deviceCode}/poll`, {
    ...(providerId !== undefined && providerId !== '' ? { provider_id: providerId } : {}),
  });

/** 验证 provider 凭证是否仍然有效 */
export const copilotVerifyToken = async (providerId: string): Promise<ApiResult<CopilotVerifyResponse>> =>
  await request<CopilotVerifyResponse>('POST', '/oauth/copilot/verify', { provider_id: providerId });
