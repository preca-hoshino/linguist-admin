import { Settings2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuditMessage, AuditToolCall, GatewayContextSnapshot } from '@/types';
import { ChatBubble, SystemBanner } from './components/ChatBubble';
import { TokenUsageBar } from './components/TokenUsageBar';
import { processMessages } from './utils';

// ── Tab 内容：聊天
function ChatContent({
  ctx,
  usage,
  t,
}: {
  readonly ctx: GatewayContextSnapshot;
  readonly usage?:
    | {
        prompt_tokens?: number;
        total_tokens?: number;
        completion_tokens?: number;
        cached_tokens?: number;
        reasoning_tokens?: number;
      }
    | undefined;
  readonly t: (key: string, fallback: string) => string;
}): React.JSX.Element {
  const chatReq = ctx.request as { messages?: AuditMessage[] } | undefined;
  const chatResp = ctx.response as
    | {
        choices?: Array<{
          message?: { content?: string | null; reasoning_content?: string; tool_calls?: AuditToolCall[] };
        }>;
      }
    | undefined;

  const messages = chatReq?.messages;
  const assistantMsg = chatResp?.choices?.[0]?.message;

  const allMessages = useMemo(() => {
    const arr: AuditMessage[] = [...(messages ?? [])];
    if (assistantMsg && (arr.length === 0 || arr.at(-1)?.role !== 'assistant')) {
      const newMsg: Partial<AuditMessage> = { role: 'assistant' };
      if (assistantMsg.content != null && assistantMsg.content !== '') {
        newMsg.content = assistantMsg.content;
      }
      if (assistantMsg.reasoning_content != null && assistantMsg.reasoning_content !== '') {
        newMsg.reasoning_content = assistantMsg.reasoning_content;
      }
      if (assistantMsg.tool_calls) {
        newMsg.tool_calls = assistantMsg.tool_calls;
      }
      arr.push(newMsg as AuditMessage);
    }
    return arr;
  }, [messages, assistantMsg]);

  const chatItems = processMessages(allMessages);
  const systemItems = chatItems.filter((i) => i.role === 'system');
  const dialogItems = chatItems.filter((i) => i.role !== 'system');

  // 构建工具双端上下文缓存以便弹窗能够拼合双边数据
  const toolCallMap = useMemo(() => {
    const map = new Map<string, AuditToolCall>();
    for (const m of allMessages) {
      if (m.role === 'assistant' && m.tool_calls) {
        for (const tc of m.tool_calls) {
          map.set(tc.id, tc);
        }
      }
    }
    return map;
  }, [allMessages]);

  const toolResponseMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of allMessages) {
      if (m.role === 'tool' && m.tool_call_id != null && m.tool_call_id !== '') {
        const contentStr = typeof m.content === 'string' ? m.content : JSON.stringify(m.content, null, 2);
        map.set(m.tool_call_id, contentStr);
      }
    }
    return map;
  }, [allMessages]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 pt-4 shrink-0">
        <TokenUsageBar usage={usage} mode="chat" />
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto p-4 w-full pt-4">
        {systemItems.length > 0 && (
          <div className="flex flex-col mb-2">
            {systemItems.map((sys) => (
              <SystemBanner key={sys.id} msg={sys} />
            ))}
          </div>
        )}

        {dialogItems.length > 0 ? (
          <div className="flex flex-col w-full pb-10">
            {dialogItems.map((item, idx) => {
              const prev = dialogItems[idx - 1];
              const isMerged = !!(
                prev &&
                prev.role === item.role &&
                prev.nameLabel === item.nameLabel &&
                prev.isRight === item.isRight
              );
              return (
                <ChatBubble
                  key={item.id}
                  item={item}
                  isMerged={isMerged}
                  isFirst={idx === 0}
                  toolCallMap={toolCallMap}
                  toolResponseMap={toolResponseMap}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            {t('modelsPage.logs.detail.noMessages', '暂无对话消息数据')}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 内容：嵌入
function EmbeddingContent({
  ctx,
  usage,
  t,
}: {
  readonly ctx: GatewayContextSnapshot;
  readonly usage?:
    | {
        prompt_tokens?: number;
        total_tokens?: number;
        completion_tokens?: number;
        cached_tokens?: number;
        reasoning_tokens?: number;
      }
    | undefined;
  readonly t: (key: string, fallback: string) => string;
}): React.JSX.Element {
  const embeddingReq = ctx.request as
    | { input?: Array<{ type?: string; text?: string; url?: string; base64_data?: string }> | string | string[] }
    | undefined;
  const input = embeddingReq?.input;

  const inputs: string[] = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') {
        inputs.push(item);
      } else if (typeof item === 'object' && item.type === 'text' && item.text != null && item.text !== '') {
        inputs.push(item.text);
      } else if (typeof item === 'object' && item.type === 'image' && item.url != null && item.url !== '') {
        inputs.push(`[Image URL]: ${item.url}`);
      } else if (typeof item === 'object' && item.type === 'video' && item.url != null && item.url !== '') {
        inputs.push(`[Video URL]: ${item.url}`);
      } else {
        inputs.push(JSON.stringify(item));
      }
    }
  } else if (typeof input === 'string') {
    inputs.push(input);
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 pt-4 shrink-0">
        <TokenUsageBar usage={usage} mode="embedding" />
      </div>
      {inputs.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          {t('modelsPage.logs.detail.noEmbeddingInput', '暂无向量输入数据')}
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4 w-full">
          {inputs.map((text, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Array values might not be unique
            <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Settings2 className="h-3.5 w-3.5" />
                {t('modelsPage.logs.detail.input', '输入')} #{i + 1}
              </div>
              <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-relaxed">{text}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 主组件
interface LogContentTabProps {
  readonly ctx: GatewayContextSnapshot;
}

export function LogContentTab({ ctx }: LogContentTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const modelType = ctx.route?.modelType ?? 'chat';
  const usage = ctx.response?.usage;

  if (modelType === 'embedding') {
    return <EmbeddingContent ctx={ctx} usage={usage} t={t} />;
  }
  return <ChatContent ctx={ctx} usage={usage} t={t} />;
}
