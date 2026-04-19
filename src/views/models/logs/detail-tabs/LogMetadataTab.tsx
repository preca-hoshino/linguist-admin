import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useTheme } from '@/providers/ThemeProvider';
import type { RequestLog } from '@/types';
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
  const textColor = getStatusColor(code);
  const bgColor = getStatusBgColor(code);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-foreground/90 px-0.5">HTTP Status Code</div>
      <div className="rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <div
          className={cn(
            'inline-flex items-center rounded-md px-3 py-1 font-mono font-bold text-lg',
            textColor,
            bgColor,
          )}
        >
          {code === undefined ? 'N/A' : `HTTP ${String(code)}`}
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
      <div className="flex items-center justify-between px-0.5">
        <div className="text-sm font-semibold text-foreground/90">Headers</div>
        {!isEmpty && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {entries.length} items
          </span>
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
function BodyCard({
  data,
  title = 'Body Payload',
}: {
  readonly data: unknown;
  readonly title?: string;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isEmpty =
    data == null || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-foreground/90 px-0.5">{title}</div>
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
interface LogMetadataTabProps {
  readonly log: RequestLog;
}

export function LogMetadataTab({ log }: LogMetadataTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = log.gateway_context;
  const audit = ctx?.audit;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        {t(
          'modelsPage.logs.detail.metadataDesc',
          '以下为请求生命周期的完整协议快照与底层元数据，可用于底层框架调试和审计。',
        )}
      </p>

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
              Context
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. 用户请求 */}
        <TabsContent value="userRequest" className="flex flex-col gap-4 focus-visible:outline-none">
          <HeadersCard headers={audit?.userRequest?.headers as AuditHeaderMap | undefined} />
          <BodyCard data={audit?.userRequest?.body} />
        </TabsContent>

        {/* 2. 提供商请求 */}
        <TabsContent value="providerRequest" className="flex flex-col gap-4 focus-visible:outline-none">
          <HeadersCard headers={audit?.providerRequest?.headers as AuditHeaderMap | undefined} />
          <BodyCard data={audit?.providerRequest?.body} />
        </TabsContent>

        {/* 3. 提供商响应 */}
        <TabsContent value="providerResponse" className="flex flex-col gap-4 focus-visible:outline-none">
          <StatusCodeCard code={audit?.providerResponse?.statusCode} />
          <HeadersCard headers={audit?.providerResponse?.headers as AuditHeaderMap | undefined} />
          <BodyCard data={audit?.providerResponse?.body} />
        </TabsContent>

        {/* 4. 用户响应 */}
        <TabsContent value="userResponse" className="flex flex-col gap-4 focus-visible:outline-none">
          <StatusCodeCard code={audit?.userResponse?.statusCode} />
          <HeadersCard headers={audit?.userResponse?.headers as AuditHeaderMap | undefined} />
          <BodyCard data={audit?.userResponse?.body} />
        </TabsContent>

        {/* 5. Context */}
        <TabsContent value="context" className="focus-visible:outline-none">
          <BodyCard data={ctx} title="Gateway Context Snapshot" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
