export type McpTransportType = 'stdio' | 'sse' | 'streamable_http';

export interface McpProvider {
  id: string;
  name: string;
  transport_type: McpTransportType;
  endpoint_url: string;
  headers: Record<string, string>;
  stdio_command: string;
  stdio_args: string[];
  stdio_env: Record<string, string>;
  api_keys: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface McpProviderCreateInput {
  name: string;
  transport_type: McpTransportType;
  endpoint_url?: string;
  headers?: Record<string, string>;
  stdio_command?: string;
  stdio_args?: string[];
  stdio_env?: Record<string, string>;
  api_keys?: string[];
}

export interface McpProviderUpdateInput extends Partial<McpProviderCreateInput> {
  is_active?: boolean;
}

export type McpToolFilterMode = 'allow' | 'deny' | 'all';

export interface McpVirtualServer {
  id: string;
  name: string;
  description: string;
  mcp_provider_id: string;
  tool_filter_mode: McpToolFilterMode;
  tool_filter_list: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface McpVirtualServerCreateInput {
  name: string;
  description?: string;
  mcp_provider_id: string;
  tool_filter_mode?: McpToolFilterMode;
  tool_filter_list?: string[];
}

export interface McpVirtualServerUpdateInput extends Partial<McpVirtualServerCreateInput> {
  is_active?: boolean;
}

export type McpLogDirection = 'inbound' | 'outbound';

export interface McpLog {
  id: string;
  virtual_mcp_id: string | null;
  provider_mcp_id: string | null;
  session_id: string;
  direction: McpLogDirection;
  method: string;
  params: Record<string, unknown>;
  result: Record<string, unknown>;
  error: Record<string, unknown> | null;
  duration_ms: number;
  created_at: string;
}

export interface McpToolInfo {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}
