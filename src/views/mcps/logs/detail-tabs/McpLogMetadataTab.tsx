import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useTheme } from '@/providers/ThemeProvider';
import type { GatewayContextSnapshot } from '@/types';
import type { McpLog } from '@/types/mcp';
import { formatBytes } from '@/utils/format-number';
import { cn } from '@/utils/utils';

type AuditHeaderMap = Record<string, string | string[] | undefined>;

// ── 状态码色彩映射
function getStatusColor(code: number | undefined): string {
  if (code === undefined) {
    return 'text-muted-foreground';
  }
  if (code >= 200 && code < 300) {
    return 'text-emerald-600 dark:text-emerald-400';
  }
  if (code >= 400 && code < 500) {
    return 'text-amber-600 dark:text-amber-400';
  }
  if (code >= 500) {
    return 'text-destructive';
  }
  return 'text-muted-foreground';
}

function getStatusBgColor(code: number | undefined): string {
  if (code === undefined) {
    return 'bg-muted/50';
  }
  if (code >= 200 && code < 300) {
    return 'bg-emerald-50 dark:bg-emerald-900/20';
  }
  if (code >= 400 && code < 500) {
    return 'bg-amber-50 dark:bg-amber-900/20';
  }
  if (code >= 500) {
    return 'bg-destructive/10';
  }
  return 'bg-muted/50';
}

// ── Status Code Card
function StatusCodeCard({ code }: { readonly code: number | undefined }): React.JSX.Element {
  const { t } = useTranslation();
  const textColor = getStatusColor(code);
  const bgColor = getStatusBgColor(code);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-foreground/90 px-0.5">
        {t('modelsPage.logs.detail.httpStatusCode', 'HTTP Status Code')}
      </div>
      <div className="rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <div
          className={cn(
            'inline-flex items-center rounded-md px-3 py-1 font-mono font-bold text-lg',
            textColor,
            bgColor,
          )}
        >
          {code === undefined ? t('common.na', 'N/A') : `HTTP ${String(code)}`}
        </div>
      </div>
    </div>
  );
}

// ── Headers Card
function HeadersCard({ headers }: { readonly headers: AuditHeaderMap | undefined }): React.JSX.Element {
  const { t } = useTranslation();
  const entries = headers ? Object.entries(headers).filter(([, v]) => v !== undefined) : [];
  const isEmpty = entries.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center px-0.5">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-foreground/90">
            {t('modelsPage.logs.detail.headers', 'Headers')}
          </div>
          {!isEmpty && (
            <span className="text-[11px] font-semibold text-muted-foreground">
              · {entries.length} {t('common.items', '项')}
            </span>
          )}
        </div>
        {!isEmpty && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-1 text-muted-foreground hover:text-foreground shrink-0"
            title={t('common.download', '下载')}
            onClick={() => {
              const str = Object.entries(headers as Record<string, string | string[]>)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join('\n');
              const blob = new Blob([str], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'headers.txt';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm overflow-x-auto">
        {isEmpty ? (
          <span className="text-sm text-muted-foreground italic">{t('common.empty', '空')}</span>
        ) : (
          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
            {entries.map(([key, value]) => (
              <div key={key} className="contents">
                <span className="font-mono text-[13px] text-muted-foreground break-all py-0.5">{key}</span>
                <span className="font-mono text-[13px] text-foreground break-all py-0.5">
                  {Array.isArray(value) ? value.join(', ') : value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Body Card
function BodyCard({ data, title }: { readonly data: unknown; readonly title: string }): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isEmpty = data == null || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0);

  const sizeAnnotation = isEmpty ? null : formatBytes(new Blob([JSON.stringify(data)]).size);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center px-0.5">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-foreground/90">{title}</div>
          {sizeAnnotation != null && (
            <span className="text-[11px] font-semibold text-muted-foreground">· {sizeAnnotation}</span>
          )}
        </div>
        {!isEmpty && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-1 text-muted-foreground hover:text-foreground shrink-0"
            title={t('common.download', '下载')}
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'payload.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border/60 bg-zinc-50/50 p-4 shadow-sm dark:bg-zinc-900/50">
        {isEmpty ? (
          <span className="text-sm text-muted-foreground italic">{t('common.empty', '空')}</span>
        ) : (
          <JsonView
            src={data as object}
            collapsed={2}
            enableClipboard
            displaySize
            theme={resolvedTheme === 'dark' ? 'a11y' : 'default'}
            style={{
              fontSize: '13px',
              lineHeight: '1.6',
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              backgroundColor: 'transparent',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── 主组件
interface McpLogMetadataTabProps {
  readonly log: McpLog;
}

export function McpLogMetadataTab({ log }: McpLogMetadataTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = log.mcp_context as unknown as GatewayContextSnapshot | undefined | null;
  const audit = ctx?.audit;

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6 w-full">
      <Tabs defaultValue="userRequest" className="w-full">
        <div className="overflow-x-auto pb-1 mb-2">
          <TabsList className="grid w-[600px] sm:w-full grid-cols-5 h-auto py-1">
            <TabsTrigger value="userRequest" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.userRequest', '用户请求')}
            </TabsTrigger>
            <TabsTrigger value="providerRequest" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.providerRequest', '提供商请求')}
            </TabsTrigger>
            <TabsTrigger value="providerResponse" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.providerResponse', '提供商响应')}
            </TabsTrigger>
            <TabsTrigger value="userResponse" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.userResponse', '用户响应')}
            </TabsTrigger>
            <TabsTrigger value="context" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.context', '内部上下文')}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. 用户请求 */}
        <TabsContent value="userRequest" className="flex flex-col gap-4 focus-visible:outline-none">
          <HeadersCard headers={audit?.userRequest?.headers as AuditHeaderMap | undefined} />
          <BodyCard data={audit?.userRequest?.body} title={t('modelsPage.logs.detail.bodyPayload', 'Body Payload')} />
        </TabsContent>

        {/* 2. 提供商请求 */}
        <TabsContent value="providerRequest" className="flex flex-col gap-4 focus-visible:outline-none">
          <HeadersCard headers={audit?.providerRequest?.headers as AuditHeaderMap | undefined} />
          <BodyCard
            data={audit?.providerRequest?.body}
            title={t('modelsPage.logs.detail.bodyPayload', 'Body Payload')}
          />
        </TabsContent>

        {/* 3. 提供商响应 */}
        <TabsContent value="providerResponse" className="flex flex-col gap-4 focus-visible:outline-none">
          <StatusCodeCard code={audit?.providerResponse?.statusCode} />
          <HeadersCard headers={audit?.providerResponse?.headers as AuditHeaderMap | undefined} />
          <BodyCard
            data={audit?.providerResponse?.body}
            title={t('modelsPage.logs.detail.bodyPayload', 'Body Payload')}
          />
        </TabsContent>

        {/* 4. 用户响应 */}
        <TabsContent value="userResponse" className="flex flex-col gap-4 focus-visible:outline-none">
          <StatusCodeCard code={audit?.userResponse?.statusCode} />
          <HeadersCard headers={audit?.userResponse?.headers as AuditHeaderMap | undefined} />
          <BodyCard data={audit?.userResponse?.body} title={t('modelsPage.logs.detail.bodyPayload', 'Body Payload')} />
        </TabsContent>

        {/* 5. Context */}
        <TabsContent value="context" className="focus-visible:outline-none">
          <BodyCard data={ctx} title={t('modelsPage.logs.detail.gatewayContextSnapshot', 'Gateway Context Snapshot')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
