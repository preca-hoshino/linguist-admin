export type McpTransportType = 'stdio' | 'sse' | 'streamable_http';

/** 与 model_providers 字段结构对称 */
export interface McpProvider {
  id: string;
  name: string;
  /** 传输类型（原 transport_type） */
  kind: McpTransportType;
  /** 网络端点（原 endpoint_url） */
  base_url: string;
  /** 认证类型 */
  credential_type: string;
  /** API Key 池（原 api_keys，现统一为 credential 数组） */
  credential: string[];
  /** 传输配置（原散装 headers/stdio_* 字段整合为 config JSONB） */
  config: McpProviderConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface McpProviderConfig {
  headers?: Record<string, string>;
  stdio_command?: string;
  stdio_args?: string[];
  stdio_env?: Record<string, string>;
}

export interface McpProviderCreateInput {
  name: string;
  /** 传输类型（原 transport_type） */
  kind: McpTransportType;
  base_url?: string;
  credential_type?: string;
  credential?: string[];
  config?: McpProviderConfig;
}

export interface McpProviderUpdateInput extends Partial<McpProviderCreateInput> {
  is_active?: boolean;
}

/** 虚拟 MCP（原 VirtualMcp，与 virtual_models 命名对称） */
export interface VirtualMcp {
  id: string;
  name: string;
  description: string;
  mcp_provider_id: string;
  /** 工具白名单等配置（原 tools 直接字段整合为 config JSONB） */
  config: VirtualMcpConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VirtualMcpConfig {
  tools?: string[];
}

export interface VirtualMcpCreateInput {
  name: string;
  description?: string;
  mcp_provider_id: string;
  config?: VirtualMcpConfig;
}

export interface VirtualMcpUpdateInput extends Partial<VirtualMcpCreateInput> {
  is_active?: boolean;
}

export interface McpLog {
  id: string;
  virtual_mcp_id: string | null;
  /** 关联的 MCP 提供商 ID（原 provider_mcp_id） */
  mcp_provider_id: string | null;
  app_id: string | null;
  session_id: string;
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
