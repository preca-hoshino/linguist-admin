export interface ApiKey {
  id: string;
  readonly object: 'api_key';
  name: string;
  key_prefix: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  key?: string;
}
