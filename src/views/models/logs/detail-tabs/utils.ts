import { Bot, Settings2, User, Wrench } from 'lucide-react';
import type { AuditMessage, AuditToolCall } from '@/types';

export function detectJsonContent(raw: string): { isJson: boolean; parsed?: unknown } {
  const s = raw.trim();
  try {
    const parsed: unknown = JSON.parse(s);
    if (parsed !== null && typeof parsed === 'object') {
      return { isJson: true, parsed };
    }
  } catch {
    /* not JSON */
  }
  return { isJson: false };
}

export function exportContent(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ── 聊天消息数据结构
export interface ChatItem {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  isRight: boolean;
  nameLabel: string;
  icon: typeof User;
  content?: string | undefined;
  imageUrl?: string | undefined;
  reasoning_content?: string | undefined;
  tool_calls?: AuditToolCall[] | undefined;
  tool_call_id?: string | undefined;
  toolName?: string | undefined;
  indexObj: number;
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
  };
}

interface ContentPartLoose {
  type?: string;
  text?: string;
  url?: string;
  image_url?: { url?: string };
  source?: { data?: string; media_type?: string };
  base64_data?: string;
  mime_type?: string;
}

function parseContentPart(p: ContentPartLoose): { content?: string; imageUrl?: string } {
  if (p.type === 'text' && p.text != null && p.text !== '') {
    return { content: p.text };
  }
  if (p.type === 'image_url' && p.image_url?.url != null && p.image_url.url !== '') {
    return { imageUrl: p.image_url.url };
  }
  if (p.type === 'image' && p.url != null && p.url !== '') {
    return { imageUrl: p.url };
  }
  if (p.type === 'image' && p.source?.data != null && p.source.data !== '') {
    const mime = p.source.media_type ?? 'image/jpeg';
    return { imageUrl: `data:${mime};base64,${p.source.data}` };
  }
  if (p.type === 'image' && p.base64_data != null && p.base64_data !== '') {
    const mime = p.mime_type ?? 'image/jpeg';
    return { imageUrl: `data:${mime};base64,${p.base64_data}` };
  }
  return { content: `[${typeof p.type === 'string' ? p.type : 'unknown'}]` };
}

function handleUserMessage(msg: AuditMessage, idx: number): ChatItem[] {
  const baseItem = {
    role: 'user' as const,
    isRight: true,
    nameLabel: 'User',
    icon: User,
    indexObj: idx,
  };

  if (typeof msg.content === 'string') {
    return [
      {
        ...baseItem,
        id: `usr-${idx}`,
        content: msg.content,
      },
    ];
  }

  if (Array.isArray(msg.content)) {
    const items: ChatItem[] = [];
    for (let i = 0; i < msg.content.length; i++) {
      const p = msg.content[i] as ContentPartLoose;
      const parsed = parseContentPart(p);
      items.push({
        ...baseItem,
        id: `usr-${idx}-${i}`,
        content: parsed.content,
        imageUrl: parsed.imageUrl,
      });
    }
    return items.length > 0 ? items : [{ ...baseItem, id: `usr-${idx}`, content: '' }];
  }

  return [
    {
      ...baseItem,
      id: `usr-${idx}`,
      content: '',
    },
  ];
}

function handleToolMessage(msg: AuditMessage, idx: number, toolNameMap: Map<string, string>): ChatItem {
  let contentStr = '';
  if (typeof msg.content === 'string') {
    contentStr = msg.content;
  } else if (msg.content != null) {
    contentStr = JSON.stringify(msg.content, null, 2);
  }

  let inferredName: string | undefined;
  if (msg.name != null && msg.name !== '') {
    inferredName = msg.name;
  } else if (msg.tool_call_id != null && msg.tool_call_id !== '') {
    inferredName = toolNameMap.get(msg.tool_call_id);
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
  };
}

function handleAssistantMessage(msg: AuditMessage, idx: number): ChatItem[] {
  const items: ChatItem[] = [];
  const contentStr = typeof msg.content === 'string' ? msg.content : '';
  const hasText = contentStr !== '' || (msg.reasoning_content != null && msg.reasoning_content !== '');
  const hasTools = msg.tool_calls != null && msg.tool_calls.length > 0;

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
    });
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
      });
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
    });
  }
  return items;
}

export function processMessages(messages: AuditMessage[]): ChatItem[] {
  const items: ChatItem[] = [];
  const toolNameMap = new Map<string, string>();

  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.tool_calls != null) {
      for (const tc of msg.tool_calls) {
        if (tc.id !== '' && tc.function.name !== '') {
          toolNameMap.set(tc.id, tc.function.name);
        }
      }
    }
  }

  for (const [idx, msg] of messages.entries()) {
    switch (msg.role) {
      case 'system': {
        items.push(handleSystemMessage(msg, idx));
        break;
      }
      case 'user': {
        items.push(...handleUserMessage(msg, idx));
        break;
      }
      case 'tool': {
        items.push(handleToolMessage(msg, idx, toolNameMap));
        break;
      }
      case 'assistant': {
        items.push(...handleAssistantMessage(msg, idx));
        break;
      }
    }
  }

  return items;
}
