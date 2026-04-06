// ==================== Audit 精确类型 ====================

/** 内容块 - 文本 */
export interface AuditTextPart {
  type: 'text';
  text: string;
}

/** 内容块 - 图片/媒体 */
export interface AuditMediaPart {
  type: 'image' | 'audio' | 'video' | 'file';
  url?: string;
  base64_data?: string;
  mime_type?: string;
}

export type AuditContentPart = AuditTextPart | AuditMediaPart;

/** 工具调用（非流式） */
export interface AuditToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/** 对话消息 */
export interface AuditMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | AuditContentPart[] | null;
  name?: string;
  reasoning_content?: string;
  tool_calls?: AuditToolCall[];
  tool_call_id?: string;
}

/** 工具/函数定义 */
export interface AuditToolDefinition {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
}

/** tool_choice 策略 */
export type AuditToolChoice = 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };

/** 用户入站请求体（Chat） */
export interface AuditUserChatRequest {
  messages?: AuditMessage[];
  tools?: AuditToolDefinition[];
  tool_choice?: AuditToolChoice;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
}

/** 用户入站请求体（Embedding） */
export interface AuditUserEmbeddingRequest {
  input?: string | string[];
  [key: string]: unknown;
}

/** 助手回复 choice（非流式） */
export interface AuditChatChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string | null;
    reasoning_content?: string;
    tool_calls?: AuditToolCall[];
  };
  finish_reason: string;
}

/** 用户响应体（Chat 非流式） */
export interface AuditUserChatResponse {
  choices?: AuditChatChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cached_tokens?: number;
    reasoning_tokens?: number;
  };
  [key: string]: unknown;
}

/** Audit 四次交换的请求/响应包装 */
export interface AuditEnvelope {
  headers?: Record<string, string | string[]>;
  body?: unknown;
}

// ==================== Snapshot ====================

/** GatewayContext 完整快照（审计数据源，从 gateway_context JSONB 列返回） */
export interface GatewayContextSnapshot {
  id: string;
  ip: string;
  apiKeyPrefix?: string;
  apiKeyName?: string;
  userFormat: string;
  http: { method: string; path: string; userAgent?: string };
  requestModel: string;
  route?: {
    model: string;
    modelType: 'chat' | 'embedding';
    providerKind: string;
    providerId: string;
    providerName?: string;
    strategy: string;
    capabilities: string[];
  };
  stream?: boolean;
  request?: Record<string, unknown>;
  response?: {
    usage?: {
      prompt_tokens: number;
      total_tokens: number;
      completion_tokens?: number;
      cached_tokens?: number;
      reasoning_tokens?: number;
    };
    [key: string]: unknown;
  };
  /** 审计数据：记录完整生命周期中的 4 次 HTTP 交换 */
  audit?: {
    /** 用户 → 网关：入站原始请求 */
    userRequest?: AuditEnvelope;
    /** 网关 → 提供商：转发请求 */
    providerRequest?: AuditEnvelope;
    /** 提供商 → 网关：上游响应 */
    providerResponse?: AuditEnvelope;
    /** 网关 → 用户：最终响应 */
    userResponse?: AuditEnvelope;
  };
  timing: {
    start: number;
    requestAdapted?: number;
    middlewareDone?: number;
    routed?: number;
    providerStart?: number;
    ttft?: number;
    providerEnd?: number;
    responseMiddlewareDone?: number;
    responseAdapted?: number;
    end?: number;
    [key: string]: number | undefined;
  };
  error?: string;
  providerError?: {
    statusCode: number;
    errorCode?: string;
    rawBody?: string;
  };
}

/**
 * 请求日志条目（列表和详情共用类型）
 *
 * 仅包含 DB 元数据字段 + gateway_context 完整快照。
 * 用户/路由/Token 等业务数据全部从 gateway_context 读取，不再重复。
 */
export interface RequestLog {
  id: string;
  readonly object: 'request_log';
  status: 'processing' | 'completed' | 'error';
  error_type: string | null;
  error_code: string | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
  updated_at: string;
  /** GatewayContext 完整快照 */
  gateway_context: GatewayContextSnapshot | null;
  /** 后置计费总额（PostgreSQL numeric 类型，可能以字符串返回） */
  calculated_cost: number | string | null;
  /** 计费明细快照 */
  cost_breakdown: CostBreakdown | null;
}

export interface CostBreakdown {
  tierStartTokens: number;
  inputCost: number;
  cacheCost: number;
  outputCost: number;
}

export interface RequestLogList {
  total: number;
  data: RequestLog[];
}
