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
  /** 请求规则重写 */
  request_overrides?: {
    headers?: Record<string, string | null>;
    body?: Record<string, unknown>;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  provider_name?: string;
  provider_kind?: string;
  max_tokens: number;
  pricing_tiers?: PricingTier[];
  rpm_limit?: number | null;
  tpm_limit?: number | null;
  /** API 调用超时时间（毫秒）。null = 使用系统默认超时 */
  timeout_ms?: number | null;
  throughput?: {
    rpm: number;
    tpm: number;
  };
}

export interface PricingTier {
  start_tokens: number;
  max_tokens: number | null;
  /** 每百万 Token 输入价格（CNY） */
  input_price: number;
  /** 每百万 Token 输出价格（CNY） */
  output_price: number;
  /** 每百万 Token 缓存命中价格（CNY） */
  cache_price: number;
}
