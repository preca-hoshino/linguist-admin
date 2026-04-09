export interface VirtualModelBackend {
  provider_model_id: string;
  weight: number;
  priority: number;
  provider_model_name?: string;
  provider_name?: string;
  provider_id?: string;
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
  throughput?: {
    rpm: number;
    tpm: number;
  };
}
