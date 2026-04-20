import { useTranslation } from 'react-i18next';
import { Dialog, DialogTrigger } from '@/components/ui/Dialog';
import { Separator } from '@/components/ui/Separator';
import type { AuditToolCall, AuditUserChatRequest, AuditUserChatResponse } from '@/types';
import { ToolInteractionButton, ToolInteractionDialog, ToolInteractionTrigger } from './ToolInteractionDialog';
import { extractToolName } from './utils';

export function ToolCallsResult({
  resp,
  reqBody,
}: {
  readonly resp: AuditUserChatResponse | undefined;
  readonly reqBody: AuditUserChatRequest | undefined;
}): React.JSX.Element | null {
  const { t } = useTranslation();
  const toolCalls = resp?.choices?.[0]?.message.tool_calls;
  if (toolCalls == null || toolCalls.length === 0) {
    return null;
  }

  const invokedCount = toolCalls.length;

  // 从消息历史找工具结果
  const toolResults = reqBody?.messages?.filter((m) => m.role === 'tool') ?? [];

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.thisCallTools', '工具调用')}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
              <span>{t('modelsPage.logs.detail.invokedShort', '并发:')}</span>
              <span className="font-mono">{invokedCount}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(toolCalls as unknown[]).map((tcRaw) => {
            const tc = typeof tcRaw === 'object' && tcRaw !== null ? (tcRaw as Record<string, unknown>) : {};
            const tcId = typeof tc.id === 'string' ? tc.id : '';
            const result = toolResults.find((r) => r.tool_call_id === tcId);
            const funcObj =
              typeof tc.function === 'object' && tc.function !== null ? (tc.function as Record<string, unknown>) : null;
            const isFunc = tc.type === 'function' && funcObj != null;
            const callName = extractToolName(isFunc, tc, funcObj);

            let resultText: string | undefined;
            if (result != null) {
              resultText =
                typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2);
            }

            return (
              <Dialog key={tcId}>
                <div className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2 shadow-sm text-foreground">
                  <ToolInteractionTrigger toolName={callName} callId={tcId} defaultTab="request" />
                  <DialogTrigger asChild>
                    <ToolInteractionButton defaultTab="request" className="ml-2 shrink-0" />
                  </DialogTrigger>
                </div>
                <ToolInteractionDialog
                  toolName={callName}
                  toolCall={tc as unknown as AuditToolCall}
                  toolResponse={resultText}
                  callId={tcId}
                  defaultTab="request"
                />
              </Dialog>
            );
          })}
        </div>
      </div>
    </>
  );
}
