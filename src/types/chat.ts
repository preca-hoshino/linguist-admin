export interface ContentPart {
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  text?: string;
  url?: string;
  base64_data?: string;
  mime_type?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[];
  name?: string;
  reasoning_content?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
}

export interface TokenUsageInfo {
  prompt: number;
  completion: number;
  total: number;
  cached: number;
  reasoning: number;
}
