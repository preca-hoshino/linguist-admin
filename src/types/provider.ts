export interface Provider {
  id: string;
  readonly object: 'provider';
  name: string;
  kind: string;
  base_url: string;
  /** 凭证类型 */
  credential_type: 'api_key' | 'oauth2' | 'copilot' | 'none';
  /** 凭证数据 */
  credential: Record<string, unknown>;
  /** 高级配置 */
  config: {
    http_proxy: string;
    [key: string]: unknown;
  };
  /**
   * 该提供商插件代码中声明的支持模型类型列表（由后端即时注入，不入库）。
   * 前端可据此过滤模型类别选型。
   */
  supported_model_types: string[];
  /** 提供商级 RPM 并发限制（null = 无限制） */
  rpm_limit: number | null;
  /** 提供商级 TPM 并发限制（null = 无限制） */
  tpm_limit: number | null;
  created_at: string;
  updated_at: string;
}
