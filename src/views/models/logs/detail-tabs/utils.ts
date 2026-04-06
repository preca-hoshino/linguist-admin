import type { AuditMessage, AuditToolCall } from '@/types'
import { Bot, User, Settings2, Wrench } from 'lucide-react'

// ── 响应格式嗅探
export type ResponseType = 'json' | 'xml' | 'markdown'

export function detectResponseType(raw: string): { type: ResponseType; parsed?: unknown } {
  const s = raw.trim()
  // 1. JSON：尝试解析，成功且是对象/数组则判定
  try {
    const parsed: unknown = JSON.parse(s)
    if (parsed !== null && typeof parsed === 'object') return { type: 'json', parsed }
  } catch { /* not JSON */ }
  // 2. XML：首个非空字符是 `<`，且含有匹配的闭合标签
  if (s.startsWith('<') && /<\/\w|\/>/.test(s)) return { type: 'xml' }
  // 3. 兜底 Markdown
  return { type: 'markdown' }
}

// ── 聊天消息数据结构
export type ChatItem = {
  id: string
  role: 'system' | 'user' | 'assistant' | 'tool'
  isRight: boolean
  nameLabel: string
  icon: typeof User
  content?: string | undefined
  reasoning_content?: string | undefined
  tool_calls?: AuditToolCall[] | undefined
  tool_call_id?: string | undefined
  toolName?: string | undefined
  indexObj: number
}

function handleSystemMessage(msg: AuditMessage, idx: number): ChatItem {
  return {
    id: `sys-${idx}`,
    role: 'system',
    isRight: false,
    nameLabel: 'System',
    icon: Settings2,
    content: typeof msg.content === 'string' ? msg.content : undefined,
    indexObj: idx,
  }
}

function handleUserMessage(msg: AuditMessage, idx: number): ChatItem {
  let contentStr = ''
  if (typeof msg.content === 'string') contentStr = msg.content
  else if (Array.isArray(msg.content)) {
    contentStr = msg.content.map(p => p.type === 'text' ? p.text : `[${p.type}]`).join('\n')
  }

  return {
    id: `usr-${idx}`,
    role: 'user',
    isRight: true,
    nameLabel: 'User',
    icon: User,
    content: contentStr,
    indexObj: idx,
  }
}

function handleToolMessage(msg: AuditMessage, idx: number, toolNameMap: Map<string, string>): ChatItem {
  let contentStr = ''
  if (typeof msg.content === 'string') {
    contentStr = msg.content
  } else if (msg.content != null) {
    contentStr = JSON.stringify(msg.content, null, 2)
  }

  let inferredName: string | undefined
  if (msg.name != null && msg.name !== '') {
    inferredName = msg.name
  } else if (msg.tool_call_id != null && msg.tool_call_id !== '') {
    inferredName = toolNameMap.get(msg.tool_call_id)
  }

  return {
    id: `tool-${idx}`,
    role: 'tool',
    isRight: true,
    nameLabel: 'System',
    icon: Wrench,
    content: contentStr,
    tool_call_id: msg.tool_call_id,
    toolName: inferredName,
    indexObj: idx,
  }
}

function handleAssistantMessage(msg: AuditMessage, idx: number): ChatItem[] {
  const items: ChatItem[] = []
  const contentStr = typeof msg.content === 'string' ? msg.content : ''
  const hasText = (contentStr !== '') || (msg.reasoning_content != null && msg.reasoning_content !== '')
  const hasTools = msg.tool_calls != null && msg.tool_calls.length > 0

  if (hasText) {
    items.push({
      id: `ast-txt-${idx}`,
      role: 'assistant',
      isRight: false,
      nameLabel: 'Model',
      icon: Bot,
      content: contentStr,
      reasoning_content: msg.reasoning_content,
      indexObj: idx,
    })
  }

  if (hasTools && msg.tool_calls != null) {
    for (const [tcIdx, tc] of msg.tool_calls.entries()) {
      items.push({
        id: `ast-tools-${idx}-${tcIdx}`,
        role: 'assistant',
        isRight: false,
        nameLabel: 'Model',
        icon: Bot,
        tool_calls: [tc],
        indexObj: idx,
      })
    }
  }

  if (!hasText && !hasTools) {
    items.push({
      id: `ast-empty-${idx}`,
      role: 'assistant',
      isRight: false,
      nameLabel: 'Model',
      icon: Bot,
      content: '（空内容）',
      indexObj: idx,
    })
  }
  return items
}

export function processMessages(messages: AuditMessage[]): ChatItem[] {
  const items: ChatItem[] = []
  const toolNameMap = new Map<string, string>()

  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.tool_calls != null) {
      for (const tc of msg.tool_calls) {
        if (tc.id !== '' && tc.function.name !== '') {
          toolNameMap.set(tc.id, tc.function.name)
        }
      }
    }
  }

  for (const [idx, msg] of messages.entries()) {
    switch (msg.role) {
    case 'system': {
    items.push(handleSystemMessage(msg, idx))
    break;
    }
    case 'user': {
    items.push(handleUserMessage(msg, idx))
    break;
    }
    case 'tool': {
    items.push(handleToolMessage(msg, idx, toolNameMap))
    break;
    }
    case 'assistant': { {
    items.push(...handleAssistantMessage(msg, idx))
    // No default
    }
    break;
    }
    }
  }

  return items
}
