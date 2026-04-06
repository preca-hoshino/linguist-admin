import type { ApiResult, DeletedResponse, ListResponse, PricingTier, ProviderModel } from '../types';
import { request } from './client';

export const getProviderModel = async (id: string): Promise<ApiResult<ProviderModel>> => {
  return await request<ProviderModel>('GET', `/provider-models/${id}`);
};

export const listProviderModels = async (params?: {
  provider_id?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<ApiResult<ListResponse<ProviderModel>>> => {
  const qs = new URLSearchParams();
  if (params?.provider_id != null && params.provider_id !== '') {
    qs.set('provider_id', params.provider_id);
  }
  if (params?.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  if (params?.offset !== undefined) {
    qs.set('offset', String(params.offset));
  }
  if (params?.search != null && params.search !== '') {
    qs.set('search', params.search);
  }
  const query = qs.toString();
  const queryStr = query ? `?${query}` : '';
  return await request<ListResponse<ProviderModel>>('GET', `/provider-models${queryStr}`);
};

export const createProviderModel = async (data: {
  id: string;
  provider_id: string;
  name: string;
  model_type: string;
  capabilities?: string[];
  parameters?: Record<string, unknown>;
  rpm_limit?: number | null | undefined;
  tpm_limit?: number | null | undefined;
  max_tokens?: number;
  pricing_tiers?: PricingTier[];
}): Promise<ApiResult<ProviderModel>> => {
  return await request<ProviderModel>('POST', '/provider-models', data);
};

export const updateProviderModel = async (
  id: string,
  data: Partial<{
    name: string;
    model_type: string;
    capabilities: string[];
    parameters: Record<string, unknown>;
    is_active: boolean;
    rpm_limit?: number | null | undefined;
    tpm_limit?: number | null | undefined;
    max_tokens?: number;
    pricing_tiers?: PricingTier[];
  }>,
): Promise<ApiResult<ProviderModel>> => {
  return await request<ProviderModel>('PATCH', `/provider-models/${id}`, data);
};

export const deleteProviderModel = async (id: string): Promise<ApiResult<DeletedResponse>> => {
  return await request<DeletedResponse>('DELETE', `/provider-models/${id}`);
};
