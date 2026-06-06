export interface VirtualModelBackend {
  provider_model_id: string;
  weight: number;
  priority: number;
  provider_model_name?: string;
  provider_name?: string;
  provider_id?: string;
  provider_kind?: string;
}

export interface VirtualModel {
  id: string;
  readonly object: 'virtual_model';
  name: string;
  description: string;
  model_type: 'chat' | 'embedding';
  routing_strategy: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  backends: VirtualModelBackend[];
  rpm_limit?: number | null;
  tpm_limit?: number | null;
  /** 模型思考能力配置 */
  thinking_config?: { enabled?: boolean; reasoning_content_backfill?: boolean; levels?: Array<{ name: string; ratio: number }> };
  throughput?: {
    rpm: number;
    tpm: number;
  };
}
