import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import { useTheme } from '@/providers/ThemeProvider';
import type { McpLog } from '@/types/mcp';
import { SmartContentViewer } from '@/views/models/logs/detail-tabs/components/SmartContentViewer';
import 'react18-json-view/src/style.css';
import { Component, FileText, Wrench } from 'lucide-react';

interface McpLogContentTabProps {
  readonly log: McpLog;
}

function ToolCallView({
  log,
  auditParams,
  auditResult,
}: {
  readonly log: McpLog;
  readonly auditParams: Record<string, unknown>;
  readonly auditResult: Record<string, unknown>;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();

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

function GenericMethodView({
  log,
  auditParams,
  auditResult,
  auditError,
}: {
  readonly log: McpLog;
  readonly auditParams: Record<string, unknown>;
  readonly auditResult: Record<string, unknown>;
  readonly auditError: Record<string, unknown> | null | undefined;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6 bg-background h-full w-full">
      <div className="flex items-center gap-2">
        <Component className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold font-mono tracking-tight">{log.method}</h3>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold">
          {t('modelsPage.logs.detail.mcpRequestParams', 'JSON-RPC Arguments (参数载荷)')}
        </h4>
        <div className="border border-border/40 rounded-md bg-card w-full min-w-0 p-4 overflow-x-auto">
          {Object.keys(auditParams).length > 0 ? (
            <JsonView
              src={auditParams}
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
          ) : (
            <span className="text-muted-foreground text-sm italic">{t('common.noParam', '无参数')}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold">
          {t('modelsPage.logs.detail.mcpResponseResult', 'Execution Result (执行结果载荷)')}
        </h4>
        <div className="border border-border/40 rounded-md bg-card w-full min-w-0 p-4 overflow-x-auto">
          {Object.keys(auditResult).length > 0 ? (
            <JsonView
              src={auditResult}
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
          ) : (
            <span className="text-muted-foreground text-sm italic">{t('common.noResult', '无返回内容')}</span>
          )}
        </div>
      </div>

      {auditError != null && (
        <div className="flex flex-col gap-3 mt-4">
          <h4 className="text-sm font-semibold text-destructive">
            {t('modelsPage.logs.detail.mcpError', '错误详情 (Error)')}
          </h4>
          <div className="border border-destructive/40 bg-destructive/5 rounded-md w-full min-w-0 p-4 overflow-x-auto">
            <JsonView
              src={auditError}
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
        </div>
      )}
    </div>
  );
}

export function McpLogContentTab({ log }: McpLogContentTabProps): React.JSX.Element {
  // 冷热分离后，数据从 mcp_context JSONB 读取
  // 采用 4-envelope (userRequest / userResponse) 结构，兼容旧日志
  const ctx = log.mcp_context;
  const audit = ctx?.audit as Record<string, unknown> | undefined | null;

  const userReqBody = (audit?.userRequest as Record<string, unknown> | undefined)?.body as
    | Record<string, unknown>
    | undefined;
  const userResBody = (audit?.userResponse as Record<string, unknown> | undefined)?.body as
    | Record<string, unknown>
    | undefined;

  const auditParams = (userReqBody?.params ?? audit?.params ?? {}) as Record<string, unknown>;
  const auditError = (userResBody?.error ?? audit?.error) as Record<string, unknown> | null | undefined;

  // 若包含 error 字段，则不将其视作成功的 result
  const auditResult = (userResBody != null && auditError == null ? userResBody : (audit?.result ?? {})) as Record<
    string,
    unknown
  >;

  // Handle specially formatted tools/call
  if (log.method === 'tools/call') {
    return <ToolCallView log={log} auditParams={auditParams} auditResult={auditResult} />;
  }

  return <GenericMethodView log={log} auditParams={auditParams} auditResult={auditResult} auditError={auditError} />;
}
