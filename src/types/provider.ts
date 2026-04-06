export interface Provider {
  id: string;
  readonly object: 'provider';
  name: string;
  kind: string;
  base_url: string;
  /** 凭证类型 */
  credential_type: 'api_key' | 'oauth2' | 'none';
  /** 凭证数据 */
  credential: Record<string, unknown>;
  /** 高级配置 */
  config: {
    custom_headers: Record<string, string>;
    http_proxy: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}
