// src/types/app.ts
export interface App {
  id: string;
  readonly object: 'app';
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  key_count: number;
  allowed_model_ids: string[];
  allowed_mcp_ids?: string[];
}

export interface AppCreateInput {
  name: string;
  allowed_model_ids?: string[];
  allowed_mcp_ids?: string[];
}

export interface AppUpdateInput {
  name?: string;
  is_active?: boolean;
  allowed_model_ids?: string[];
  allowed_mcp_ids?: string[];
}
