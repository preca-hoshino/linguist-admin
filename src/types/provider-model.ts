export interface ProviderModel {
  id: string;
  readonly object: 'provider_model';
  provider_id: string;
  name: string;
  model_type: 'chat' | 'embedding';
  capabilities: string[];
  parameters: Record<string, unknown>;
  /** 提供商模型级专属配置（如 Copilot 端点覆盖、特殊 Header 等） */
  model_config?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  provider_name?: string;
  provider_kind?: string;
  max_tokens: number;
  pricing_tiers?: PricingTier[];
  rpm_limit?: number | null;
  tpm_limit?: number | null;
}

export interface PricingTier {
  startTokens: number;
  maxTokens: number | null;
  /** 每百万 Token 输入价格（CNY） */
  inputPrice: number;
  /** 每百万 Token 输出价格（CNY） */
  outputPrice: number;
  /** 每百万 Token 缓存命中价格（CNY） */
  cachePrice: number;
}
