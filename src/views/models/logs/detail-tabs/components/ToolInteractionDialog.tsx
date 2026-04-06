import { Wrench, X } from 'lucide-react';
import { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import { CopyableId } from '@/components/CopyableId';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useTheme } from '@/providers/ThemeProvider';
import 'react18-json-view/src/style.css';
import type { AuditToolCall } from '@/types';
import { cn } from '@/utils/utils';
import { detectResponseType, type ResponseType } from '../utils';

// ── 内部组件：请求与响应 Tab
function ToolRequestTab({
  toolCall,
  isJsonArgs,
  parsedArgs,
  t,
}: {
  readonly toolCall?: AuditToolCall | undefined;
  readonly isJsonArgs: boolean;
  readonly parsedArgs: Record<string, unknown> | null;
  readonly t: (k: string, f: string) => string;
}): React.JSX.Element {
  return (
    <TabsContent value="request" className="h-full m-0 flex flex-col min-h-0">
      {toolCall == null ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-border/50 rounded-md bg-background">
          {t('modelsPage.logs.detail.noRequestParams', '暂无请求参数')}
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 min-h-0 min-w-0 scrollbar-thin">
          {isJsonArgs && parsedArgs != null ? (
            <div className="flex flex-col w-full h-full pb-4">
              {Object.keys(parsedArgs).length > 0 ? (
                <div className="w-full max-w-full border border-border/40 rounded-md overflow-hidden bg-background">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-full">
                      <thead>
                        <tr className="bg-muted/40 dark:bg-muted/20 border-b border-border/40 text-[12px] font-medium text-muted-foreground">
                          <th className="px-6 py-4 font-medium whitespace-nowrap w-fit min-w-[160px] sm:min-w-[200px] border-r border-border/40 tracking-wider">
                            {t('modelsPage.logs.detail.field', '字段 (Field)')}
                          </th>
                          <th className="px-6 py-4 font-medium w-full tracking-wider">
                            {t('modelsPage.logs.detail.value', '值 (Value)')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {Object.entries(parsedArgs).map(([key, val]) => (
                          <tr key={key} className="hover:bg-muted/10 transition-colors group">
                            <td className="px-6 py-4 sm:py-5 align-top font-mono text-[13px] font-semibold text-muted-foreground border-r border-border/40 w-fit whitespace-nowrap min-w-[160px] sm:min-w-[200px]">
                              {key}
                            </td>
                            <td className="px-6 py-4 sm:py-5 align-top font-mono text-[13px] text-foreground break-all sm:break-words">
                              {((): React.ReactNode => {
                                if (val === undefined || val === null) {
                                  return (
                                    <span className="italic opacity-50">{val === null ? 'null' : 'undefined'}</span>
                                  );
                                }
                                if (val === '') {
                                  return (
                                    <span className="italic opacity-50">{t('common.emptyString', '[空字符串]')}</span>
                                  );
                                }
                                if (typeof val === 'object') {
                                  return (
                                    <pre className="whitespace-pre-wrap break-words leading-relaxed text-opacity-90 text-[13px] bg-transparent">
                                      {JSON.stringify(val, null, 2)}
                                    </pre>
                                  );
                                }
                                return (
                                  <span className="whitespace-pre-wrap leading-relaxed break-words">
                                    {typeof val === 'string' ? val : String(val as string | number | boolean)}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground/60 w-full italic border-y border-border/40">
                  {t('modelsPage.logs.detail.noToolArgs', '此工具请求未附带任何传参')}
                </div>
              )}
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-all font-mono text-[13px] text-foreground leading-relaxed bg-background border border-border/50 rounded-md p-5 min-h-full">
              {typeof toolCall.function.arguments === 'string'
                ? toolCall.function.arguments
                : JSON.stringify(toolCall.function.arguments, null, 2)}
            </pre>
          )}
        </div>
      )}
    </TabsContent>
  );
}

function ToolResponseTab({
  toolResponse,
  responseType,
  parsedJson,
  resolvedTheme,
  t,
}: {
  readonly toolResponse?: string | undefined;
  readonly responseType: ResponseType;
  readonly parsedJson: unknown;
  readonly resolvedTheme: string;
  readonly t: (k: string, f: string) => string;
}): React.JSX.Element {
  return (
    <TabsContent value="response" className="flex-1 min-h-0 m-0 overflow-y-auto scrollbar-thin">
      {toolResponse == null || toolResponse === '' ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground/50 italic">
          {t('modelsPage.logs.detail.noToolResult', '暂无工具返回结果')}
        </div>
      ) : (
        <div className="flex flex-col gap-3 min-h-full">
          <div className="flex items-center gap-3 shrink-0">
            <Badge
              variant="outline"
              className={cn(
                'font-mono text-[11px] px-2 py-0 h-5 gap-1.5',
                responseType === 'json' && 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5',
                responseType === 'xml' && 'border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/5',
                responseType === 'markdown' && 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0',
                  responseType === 'json' && 'bg-amber-500',
                  responseType === 'xml' && 'bg-violet-500',
                  responseType === 'markdown' && 'bg-blue-500',
                )}
              />
              {responseType.toUpperCase()}
            </Badge>
            <span className="text-[11px] text-muted-foreground/60 tabular-nums">
              {((): string => {
                const len = toolResponse.length;
                const cjk = (toolResponse.match(/[\u4E00-\u9FFF\u3400-\u4DBF\u{20000}-\u{2A6DF}]/gu) ?? []).length;
                const words = cjk + Math.round((len - cjk) / 5);
                let sizeStr = `${len} B`;
                if (len >= 1024 * 1024) {
                  sizeStr = `${(len / 1024 / 1024).toFixed(2)} MB`;
                } else if (len >= 1024) {
                  sizeStr = `${(len / 1024).toFixed(1)} KB`;
                }
                return `~${words.toLocaleString()} ${t('common.words', '词')} · ${sizeStr}`;
              })()}
            </span>
          </div>
          <div className="w-full rounded-md border border-border/40 bg-card px-6 py-4">
            {responseType === 'json' && parsedJson !== undefined ? (
              <JsonView
                src={parsedJson}
                collapsed={2}
                enableClipboard
                displaySize
                theme={resolvedTheme === 'dark' ? 'a11y' : 'default'}
                style={{ fontSize: '13px', lineHeight: '1.6', fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
              />
            ) : (
              <MarkdownViewer
                content={toolResponse}
                enableXmlHighlight={responseType === 'xml'}
                className="text-[13px] leading-relaxed"
              />
            )}
          </div>
        </div>
      )}
    </TabsContent>
  );
}

// ── 组件：工具交互综合弹窗（请求头尾共用）
export function ToolInteractionDialog({
  toolCall,
  toolResponse,
  toolName,
  callId,
  defaultTab,
}: {
  readonly toolCall?: AuditToolCall | undefined;
  readonly toolResponse?: string | undefined;
  readonly toolName: string;
  readonly callId?: string | undefined;
  readonly defaultTab: 'request' | 'response';
}): React.JSX.Element {
  const { t } = useTranslation();
  const displayId = callId != null && callId !== '' ? callId : 'Unknown ID';

  const { parsedArgs, isJsonArgs } = useMemo(() => {
    if (toolCall == null || toolCall.function.arguments === '') {
      return { parsedArgs: null, isJsonArgs: false };
    }
    const args = toolCall.function.arguments;
    try {
      if (typeof args === 'string') {
        const parsed: unknown = JSON.parse(args);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          return { parsedArgs: parsed as Record<string, unknown>, isJsonArgs: true };
        }
        return { parsedArgs: parsed as Record<string, unknown>, isJsonArgs: false };
      }
    } catch {
      // ignore parsing error softly
    }
    return { parsedArgs: null, isJsonArgs: false };
  }, [toolCall]);

  const { resolvedTheme } = useTheme();
  const { responseType, parsedJson } = useMemo(() => {
    if (toolResponse == null || toolResponse === '') {
      return { responseType: 'markdown' as ResponseType, parsedJson: undefined };
    }
    const result = detectResponseType(toolResponse);
    return { responseType: result.type, parsedJson: result.parsed };
  }, [toolResponse]);

  return (
    <DialogContent
      showCloseButton={false}
      className="flex flex-col h-[85vh] max-h-[850px] min-h-[540px] w-[95vw] sm:max-w-[960px] overflow-hidden p-0 gap-0"
    >
      <Tabs defaultValue={defaultTab} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 border-b px-8 py-5 bg-background relative min-h-[72px]">
          <div className="flex items-center gap-3 z-10 w-full min-w-0 pr-8">
            <Wrench className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5 text-left justify-center min-w-0 flex-1">
              <DialogTitle className="leading-tight flex items-center break-all sm:break-normal truncate sm:whitespace-normal sm:line-clamp-2 text-[15px]">
                {toolCall != null && toolCall.function.name !== '' ? toolCall.function.name : toolName}
              </DialogTitle>
              {displayId === 'Unknown ID' ? (
                <DialogDescription className="font-mono text-[11px] truncate">Unknown ID</DialogDescription>
              ) : (
                <div className="flex items-center">
                  <CopyableId id={displayId} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center z-10 h-full shrink-0">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground -mr-2 border-0">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 w-full min-w-0 px-8 py-6 bg-muted/10 overflow-hidden flex flex-col gap-5">
          <div className="flex w-full shrink-0 justify-center">
            <TabsList className="flex">
              <TabsTrigger value="request" className="text-[12px] px-4 w-32">
                {t('modelsPage.logs.detail.toolRequest', '请求参数')}
              </TabsTrigger>
              <TabsTrigger value="response" className="text-[12px] px-4 w-32">
                {t('modelsPage.logs.detail.toolResponse', '执行结果')}
              </TabsTrigger>
            </TabsList>
          </div>

          <ToolRequestTab toolCall={toolCall} isJsonArgs={isJsonArgs} parsedArgs={parsedArgs} t={t} />
          <ToolResponseTab
            toolResponse={toolResponse}
            responseType={responseType}
            parsedJson={parsedJson}
            resolvedTheme={resolvedTheme}
            t={t}
          />
        </div>
      </Tabs>
    </DialogContent>
  );
}

// ── 工具交互弹窗的触发元素（在气泡中使用）
export const ToolInteractionTrigger = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    readonly toolName: string;
    readonly callId?: string | undefined;
    readonly defaultTab: 'request' | 'response';
  }
>(({ toolName, callId, defaultTab, className, ...props }, ref) => {
  const { t } = useTranslation();
  const displayId = callId != null && callId !== '' ? callId : 'Unknown ID';
  return (
    // biome-ignore lint/a11y/useSemanticElements: Outer trigger needs to be a div because inner elements may be buttons, which HTML prevents nesting.
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      className={cn(
        'flex w-full items-center justify-between pt-1 pb-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer font-sans text-foreground mb-1 last:-mb-1',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3 w-full min-w-0 pl-1 my-0.5">
        <Wrench className="h-5 w-5 shrink-0" />
        <div className="flex flex-col text-left justify-center min-w-0 w-full gap-1">
          <span className="font-mono text-[15px] font-bold leading-none truncate pt-0.5">{toolName}</span>
          {displayId !== 'Unknown ID' && (
            // biome-ignore lint/a11y/useSemanticElements: Inner clickable element must be purely visual div
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                }
              }}
              role="button"
              tabIndex={0}
              className="max-w-full flex items-center"
            >
              <CopyableId id={displayId} prefix="" />
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0 ml-2 opacity-60">
        {defaultTab === 'request'
          ? t('modelsPage.logs.detail.viewParams', '查看参数')
          : t('modelsPage.logs.detail.viewResult', '查看结果')}
      </span>
    </div>
  );
});
ToolInteractionTrigger.displayName = 'ToolInteractionTrigger';
