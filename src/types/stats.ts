export type StatsRange = '15m' | '1h' | '6h' | '24h' | '7d' | '14d' | '30d';
export type StatsDimension = 'global' | 'provider' | 'provider_model' | 'virtual_model' | 'api_key';

/** 图表预设粒度选项（UI 层使用） */
export type ChartPreset = '1d' | '7d' | '30d';

/** 图表时间范围配置（UI 层使用，包含预设和自定义两种模式） */
export interface ChartRangeConfig {
  /** 预设选项或 'custom' */
  preset: ChartPreset | 'custom';
  /** 自定义范围起点（YYYY-MM-DD），仅在 preset='custom' 时有效 */
  from?: string;
  /** 自定义范围终点（YYYY-MM-DD，不含），仅在 preset='custom' 时有效 */
  to?: string;
}

export interface StatsOverview {
  total_requests: number;
  rpm: number;
  total_tokens: number;
  tpm: number;
  prompt_tokens: number;
  completion_tokens: number;
  reasoning_tokens: number;
  cached_tokens: number;
  cache_hit_rate: number;
  error_count: number;
  error_rate: number;
  rate_limit_error_count: number;
  rate_limit_error_rate: number;
  timeout_error_count: number;
  timeout_error_rate: number;
  avg_latency_ms: number | null;
  p95_latency_ms: number | null;
  avg_provider_latency_ms: number | null;
  gateway_overhead_ms: number | null;
  avg_input_tokens_per_req: number | null;
  avg_output_tokens_per_req: number | null;
  ttft_avg_ms: number | null;
  itl_avg_ms: number | null;
  total_cost: number;
}

export interface TimeSeriesPoint {
  time: string;
  requests: number;
  rpm: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cached_tokens: number;
  tpm: number;
  error_count: number;
  error_rate: number;
  timeout_count: number;
  rate_limit_count: number;
  avg_latency_ms: number | null;
  p50_latency_ms: number | null;
  p90_latency_ms: number | null;
  p99_latency_ms: number | null;
  ttft_avg_ms: number | null;
  ttft_p50_ms: number | null;
  ttft_p90_ms: number | null;
  ttft_p99_ms: number | null;
  itl_avg_ms: number | null;
  itl_p50_ms: number | null;
  itl_p90_ms: number | null;
  itl_p99_ms: number | null;
  cache_hit_rate: number;
  cost: number;
}

export interface TimeSeriesResult {
  interval: string;
  series: TimeSeriesPoint[];
}

export interface StatsErrors {
  total_errors: number;
  error_rate: number;
  by_type: Record<string, number>;
  by_code: Record<string, number>;
  recent_samples: {
    id: string;
    error_type: string | null;
    error_code: string | null;
    error_message: string | null;
    provider_kind: string | null;
    request_model: string | null;
    created_at: string;
  }[];
}

export interface StatsTokens {
  prompt_tokens: number;
  completion_tokens: number;
  reasoning_tokens: number;
  cached_tokens: number;
  cache_hit_rate: number;
  avg_input_tokens_per_req: number | null;
  avg_output_tokens_per_req: number | null;
  p95_input_tokens_per_req: number | null;
  p95_output_tokens_per_req: number | null;
}

export interface StatsToday {
  today_requests: number;
  today_tokens: number;
  today_prompt_tokens: number;
  today_completion_tokens: number;
  today_errors: number;
  current_rpm: number;
  current_tpm: number;
  current_avg_latency_ms: number | null;
  today_avg_latency_ms: number | null;
  today_avg_ttft_ms: number | null;
  today_avg_itl_ms: number | null;
  current_error_rate: number;
  current_cache_hit_rate: number;
  today_cost: number;
}

export interface StatsBreakdownItem {
  name: string;
  /** 提供商名称（仅 provider_model 分组时有値） */
  provider_name: string | null;
  /** 提供商种类（如 openai, anthropic，用于匹配图标） */
  provider_kind?: string | null;
  /** 关联的内部 provider_model id（用于页面跳转） */
  provider_model_id?: string | null;
  request_count: number;
  total_tokens: number;
  error_count: number;
  avg_latency_ms: number | null;
  p50_latency_ms: number | null;
  p90_latency_ms: number | null;
  p99_latency_ms: number | null;
  /** 平均首 Token 延迟（ms，仅流式请求有値） */
  ttft_avg_ms: number | null;
  /** 平均 ITL（首 Token 之后的生成时间，ms，仅流式请求有値） */
  itl_avg_ms: number | null;
  /** 平均每请求输出 Token 数 */
  avg_completion_tokens: number | null;
  total_cost: number;
}

export type StatsBreakdownGroupBy =
  | 'provider'
  | 'provider_model'
  | 'virtual_model'
  | 'app'
  | 'error_type'
  | 'user_format';

export interface StatsBreakdown {
  group_by: StatsBreakdownGroupBy;
  items: StatsBreakdownItem[];
}
