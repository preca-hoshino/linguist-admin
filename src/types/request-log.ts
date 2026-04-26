import type { ListResponse } from './api';

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
  /** HTTP 响应状态码（仅响应方具备，即 providerResponse 和 userResponse） */
  statusCode?: number;
  headers?: Record<string, string | string[]>;
  body?: unknown;
}

// ==================== Snapshot ====================

/** GatewayContext 完整快照（审计数据源，从 gateway_context JSONB 列返回） */
export interface GatewayContextSnapshot {
  id: string;
  ip: string;
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
  billing?: {
    calculatedCost: number;
    costBreakdown: CostBreakdown;
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
 * 列表接口（GET /model/logs）返回热表独立列，可直接在表格中渲染。
 * 详情接口（GET /model/logs/:id）额外返回 gateway_context 完整快照用于审计展示。
 */
export interface RequestLog {
  id: string;
  readonly object: 'request_log';
  status: 'processing' | 'completed' | 'error';
  // ─── 热表列（列表页直接可用，无需 JOIN 冷表） ───
  /** 请求的虚拟模型名称 */
  request_model: string | null;
  /** 实际路由到的后端模型名称 */
  routed_model: string | null;
  /** 提供商协议类型 */
  provider_kind: string | null;
  /** 提供商 ID */
  provider_id: string | null;
  /** 关联应用 ID */
  app_id: string | null;
  /** 关联应用名称（migration 12 新增） */
  app_name: string | null;
  /** 请求来源 IP（migration 12 新增） */
  ip: string | null;
  /** 是否流式 */
  is_stream: boolean | null;
  /** 客户端协议格式（openaicompat / anthropic / gemini 等） */
  user_format: string | null;
  error_type: string | null;
  error_code: string | null;
  error_message: string | null;
  /** 后置计费总额（PostgreSQL numeric 类型，可能以字符串返回） */
  calculated_cost: number | string | null;
  // ─── Token 统计列（热表，migration 08 恢复） ───
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cached_tokens: number | null;
  reasoning_tokens: number | null;
  /** 全链路延迟（ms） */
  duration_ms: number | null;
  /** 首 Token 延迟（ms，流式专用） */
  ttft_ms: number | null;
  created_at: string;
  updated_at: string;
  // ─── 详情页专用（列表不返回） ───
  /** GatewayContext 完整快照（仅详情点查时返回） */
  gateway_context: GatewayContextSnapshot | null;
}

export interface CostBreakdown {
  tierStartTokens?: number;
  inputCost: number;
  cacheCost: number;
  outputCost: number;
}

export type RequestLogList = Omit<ListResponse<RequestLog>, 'total'> & { total?: number };
