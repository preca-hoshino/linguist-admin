import { useTheme } from '@/providers/ThemeProvider';
import type { McpLog } from '@/types/mcp';
import { useTranslation } from 'react-i18next';
import { SmartContentViewer } from '@/views/models/logs/detail-tabs/components/SmartContentViewer';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { Wrench, FileText, Component } from 'lucide-react';

interface McpLogContentTabProps {
  readonly log: McpLog;
}

export function McpLogContentTab({ log }: McpLogContentTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();

  // 冷热分离后，params/result 从 mcp_context JSONB（冷宽表，详情页 JOIN 后返回）读取
  const ctx = log.mcp_context;
  const auditParams = (ctx?.params ?? {}) as Record<string, unknown>;
  const auditResult = (ctx?.result ?? {}) as Record<string, unknown>;

  // Handle specially formatted tools/call
  if (log.method === 'tools/call') {
    const toolName = typeof auditParams.name === 'string' ? auditParams.name : (log.tool_name ?? 'Unknown Tool');
    const toolArgs =
      typeof auditParams.arguments === 'object' && auditParams.arguments !== null ? auditParams.arguments : {};

    // Result is usually an array of content blocks for tools/call
    const resultContents = Array.isArray(auditResult.content) ? auditResult.content : [];

    return (
      <div className="flex flex-col gap-6 bg-background h-full w-full">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold font-mono tracking-tight">{toolName}</h3>
          </div>
          <div className="bg-muted/30 rounded-lg p-5 border shadow-sm">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              {t('modelsPage.logs.detail.mcpArguments', '调用参数')}
            </h4>
            <div className="rounded-md bg-card border overflow-hidden">
              {Object.keys(toolArgs).length > 0 ? (
                <div className="p-4 w-full overflow-x-auto">
                  <JsonView
                    src={toolArgs}
                    collapsed={2}
                    enableClipboard
                    displaySize
                    theme={resolvedTheme === 'dark' ? 'a11y' : 'default'}
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                    }}
                  />
                </div>
              ) : (
                <div className="p-4 text-muted-foreground text-sm italic">
                  {t('modelsPage.logs.detail.noArguments', '无参数')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            <h3 className="text-lg font-bold font-mono tracking-tight">
              {t('modelsPage.logs.detail.mcpToolResult', '工具返回结果')}
            </h3>
          </div>
          <div className="bg-muted/10 rounded-lg border shadow-sm divide-y">
            {resultContents.length === 0 && (
              <div className="p-6 text-center text-muted-foreground italic text-sm">
                {t('modelsPage.logs.detail.noToolResult', '无提取到的结果内容')}
              </div>
            )}

            {resultContents.map((cb: unknown, idx: number) => {
              const contentBlock = cb as Record<string, unknown> | null | undefined;
              if (contentBlock && typeof contentBlock === 'object' && contentBlock.type === 'text') {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Safe because result content is stable
                  <div key={idx} className="p-4 w-full max-w-full overflow-x-hidden flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground w-fit">
                      {t('mcpsPage.logs.textBlock', 'Text Block')}
                    </span>
                    <SmartContentViewer
                      content={typeof contentBlock.text === 'string' ? contentBlock.text : ''}
                      exportFileName={`tool-result-block-${idx}`}
                    />
                  </div>
                );
              }
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: Safe because result content is stable
                <div key={idx} className="p-4 w-full overflow-x-auto flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground w-fit">
                    {t('mcpsPage.logs.rawBlock', 'Raw Block')} (
                    {typeof contentBlock?.type === 'string' ? contentBlock.type : 'unknown'})
                  </span>
                  <JsonView
                    src={contentBlock as object}
                    collapsed={2}
                    enableClipboard
                    displaySize
                    theme={resolvedTheme === 'dark' ? 'a11y' : 'default'}
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for other methods
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Component className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold font-mono tracking-tight">{log.method}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t(
          'modelsPage.logs.detail.mcpNotToolCall',
          '此方法请求不是标准的 tools/call，无法进行内容高亮视图解析。请切换到 Raw Data 或 Metadata 查看详情。',
        )}
      </p>
    </div>
  );
}
