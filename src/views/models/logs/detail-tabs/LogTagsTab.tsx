import { AlertTriangle, Globe, Network, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProviderCell } from '@/components/ProviderCell';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { RequestLog } from '@/types';
import { cn } from '@/utils/utils';

// ── 能力 Badge 样式
const CAP_STYLE: Record<string, string> = {
  vision:
    'bg-violet-50 border-violet-300 text-violet-800 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30',
  tools:
    'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  thinking:
    'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  cache: 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  web_search: 'bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  multimodal:
    'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-800 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:border-fuchsia-500/30',
};

// userFormat → 可读协议名
const PROTOCOL_LABEL: Record<string, string> = {
  openaicompat: 'OpenAI API',
  anthropic: 'Anthropic API',
  gemini: 'Gemini API',
};

// ── 信息行
function InfoRow({
  label,
  children,
  className,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'grid grid-cols-[130px_1fr] items-start gap-3 py-2.5 border-b border-border/50 last:border-0',
        className,
      )}
    >
      <span className="text-[11px] font-medium text-muted-foreground pt-0.5 leading-snug">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function InfoText({ text, mono }: { readonly text?: string | null; readonly mono?: boolean }): React.JSX.Element {
  if (text == null || text === '') {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  return <span className={cn('text-sm break-all', mono && 'font-mono text-xs')}>{text}</span>;
}

// ── 错误区
function ErrorSection({ log }: { readonly log: RequestLog }): React.JSX.Element | null {
  const { t } = useTranslation();
  if (log.status !== 'error') {
    return null;
  }
  const ctx = log.gateway_context;

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <XCircle className="h-4 w-4" />
        {t('modelsPage.logs.detail.errorSection', '错误详情')}
      </h3>
      <div className="space-y-0">
        <InfoRow label={t('modelsPage.logs.detail.errorType', '错误类型')}>
          <InfoText text={log.error_type} mono />
        </InfoRow>
        <InfoRow label={t('modelsPage.logs.detail.errorCode', '错误代码')}>
          <InfoText text={log.error_code} mono />
        </InfoRow>
        <InfoRow label={t('modelsPage.logs.detail.errorMessage', '错误信息')}>
          <InfoText text={log.error_message} />
        </InfoRow>
        {ctx?.providerError && (
          <>
            <InfoRow label={t('modelsPage.logs.detail.providerStatus', '提供商状态码')}>
              <InfoText text={String(ctx.providerError.statusCode)} mono />
            </InfoRow>
            {ctx.providerError.errorCode != null && ctx.providerError.errorCode !== '' && (
              <InfoRow label={t('modelsPage.logs.detail.providerCode', '提供商错误码')}>
                <InfoText text={ctx.providerError.errorCode} mono />
              </InfoRow>
            )}
            {ctx.providerError.rawBody != null && ctx.providerError.rawBody !== '' && (
              <InfoRow label={t('modelsPage.logs.detail.providerRawBody', '提供商原始响应')}>
                <pre className="mt-1 rounded bg-muted px-3 py-2 font-mono text-xs overflow-auto max-h-40 text-destructive/80">
                  {ctx.providerError.rawBody}
                </pre>
              </InfoRow>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── 状态文字
function statusLabel(status: string, t: (key: string, fallback: string) => string): string {
  if (status === 'completed') {
    return t('modelsPage.logs.statusCompleted', '已完成');
  }
  if (status === 'error') {
    return t('modelsPage.logs.statusError', '失败');
  }
  return t('modelsPage.logs.statusProcessing', '处理中');
}

// ── 模型类型文字
function modelTypeLabel(modelType: string, t: (key: string, fallback: string) => string): string {
  if (modelType === 'chat') {
    return t('modelsPage.modelType.chat', '对话');
  }
  if (modelType === 'embedding') {
    return t('modelsPage.modelType.embedding', '嵌入');
  }
  return modelType;
}

// ── 来源应用展现
function AppCell({
  appName,
  apiKeyName,
  anonymousLabel,
}: {
  readonly appName?: string | null | undefined;
  readonly apiKeyName?: string | null | undefined;
  readonly anonymousLabel: string;
}): React.JSX.Element {
  if (appName != null && appName !== '') {
    return <span className="text-sm font-medium">{appName}</span>;
  }
  if (apiKeyName != null && apiKeyName !== '') {
    return <span className="text-sm font-medium">{apiKeyName}</span>;
  }
  return <span className="text-xs text-muted-foreground italic">{anonymousLabel}</span>;
}

// ── 网关与路由卡片
function GatewayCard({ log }: { readonly log: RequestLog }): React.JSX.Element {
  const { t } = useTranslation();
  // ctx 由调用方保证非 null（主组件已提前做早返回）

  const ctx = log.gateway_context as NonNullable<typeof log.gateway_context>;
  const route = ctx.route;

  const statusBadgeClass = cn(
    'font-medium',
    log.status === 'completed' &&
      'border-green-300 text-green-700 bg-green-50/50 dark:border-green-900 dark:text-green-400 dark:bg-green-900/20',
    log.status === 'error' && 'border-destructive/40 text-destructive bg-destructive/5',
    log.status !== 'completed' && log.status !== 'error' && 'text-muted-foreground',
  );

  const streamBadgeClass = ctx.stream
    ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
    : 'text-muted-foreground';

  const protocolLabel = (PROTOCOL_LABEL[ctx.userFormat] ?? ctx.userFormat) || '';

  // route 相关的提供商展现（在 {route && ...} 块内使用）
  let providerName = '';
  let providerIcon = '';
  if (route != null) {
    const rName = route.providerName ?? '';
    providerName = rName === '' ? route.providerId : rName;
    providerIcon = route.providerKind === '' ? providerName : route.providerKind;
  }

  return (
    <Card className="shadow-sm border-border/60 h-full gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 px-6 py-4 border-b border-border/40">
        <Network className="h-4 w-4 text-muted-foreground shrink-0" />
        <CardTitle className="text-sm font-semibold text-foreground/90">
          {t('modelsPage.logs.detail.tagsGatewaySection', '网关与路由')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-0 pb-2">
        {/* 状态 */}
        <InfoRow label={t('modelsPage.logs.detail.status', '状态')}>
          <Badge variant="outline" className={statusBadgeClass}>
            {statusLabel(log.status, t)}
          </Badge>
        </InfoRow>

        {/* 请求模型 */}
        <InfoRow label={t('modelsPage.logs.detail.requestModel', '请求模型')}>
          <InfoText text={ctx.requestModel} mono />
        </InfoRow>

        {route && (
          <>
            {/* 实际执行模型 */}
            <InfoRow label={t('modelsPage.logs.detail.providerModel', '实际执行模型')}>
              <InfoText text={route.model} mono />
            </InfoRow>

            {/* 提供商 */}
            <InfoRow label={t('modelsPage.logs.detail.provider', '提供商')}>
              <ProviderCell kind={providerIcon} id={route.providerId} name={providerName} />
            </InfoRow>

            {/* 路由策略 */}
            <InfoRow label={t('modelsPage.logs.detail.strategy', '路由策略')}>
              <Badge variant="secondary" className="text-xs font-mono">
                {route.strategy || '—'}
              </Badge>
            </InfoRow>

            {/* 激活能力 */}
            {route.capabilities.length > 0 && (
              <InfoRow label={t('modelsPage.logs.detail.capabilities', '激活能力')}>
                <div className="flex flex-wrap gap-1">
                  {route.capabilities.map((cap) => (
                    <Badge
                      key={cap}
                      variant="outline"
                      className={cn(
                        'text-[10px] font-medium rounded-full whitespace-nowrap',
                        CAP_STYLE[cap] != null && CAP_STYLE[cap] !== ''
                          ? CAP_STYLE[cap]
                          : 'bg-muted/50 border-border/40 text-muted-foreground',
                      )}
                    >
                      {cap}
                    </Badge>
                  ))}
                </div>
              </InfoRow>
            )}

            {/* 模型类型 */}
            <InfoRow label={t('modelsPage.logs.detail.modelType', '模型类型')}>
              <Badge variant="outline" className="text-xs">
                {modelTypeLabel(route.modelType, t)}
              </Badge>
            </InfoRow>
          </>
        )}

        {/* 请求模式 */}
        <InfoRow label={t('modelsPage.logs.detail.stream', '请求模式')}>
          <Badge variant="outline" className={streamBadgeClass}>
            {ctx.stream ? t('modelsPage.logs.stream', '流式') : t('modelsPage.logs.nonStream', '阻断')}
          </Badge>
        </InfoRow>

        {/* 接入协议 */}
        <InfoRow label={t('modelsPage.logs.detail.userFormat', '接入协议')}>
          {protocolLabel === '' ? (
            <span className="text-muted-foreground text-sm">—</span>
          ) : (
            <Badge variant="secondary" className="text-xs font-mono">
              {protocolLabel}
            </Badge>
          )}
        </InfoRow>
      </CardContent>
    </Card>
  );
}

// ── 请求来源卡片
function SourceCard({ log }: { readonly log: RequestLog }): React.JSX.Element {
  const { t } = useTranslation();
  // ctx 由调用方保证非 null（主组件已提前做早返回）

  const ctx = log.gateway_context as NonNullable<typeof log.gateway_context>;
  const ctxExtended = ctx as typeof ctx & { appName?: string };

  return (
    <Card className="shadow-sm border-border/60 h-full gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 px-6 py-4 border-b border-border/40">
        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
        <CardTitle className="text-sm font-semibold text-foreground/90">
          {t('modelsPage.logs.detail.tagsSourceSection', '请求来源')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-0 pb-2">
        {/* 来源应用 */}
        <InfoRow label={t('modelsPage.logs.detail.app', '来源应用')}>
          <AppCell
            appName={ctxExtended.appName}
            apiKeyName={ctx.apiKeyName}
            anonymousLabel={t('modelsPage.logs.detail.tagsAnonymousApp', '匿名请求')}
          />
        </InfoRow>

        {/* 客户端 IP */}
        <InfoRow label={t('modelsPage.logs.detail.ip', '客户端 IP')}>
          <InfoText text={ctx.ip} mono />
        </InfoRow>

        {/* 接入路径 */}
        <InfoRow label={t('modelsPage.logs.detail.httpPath', '接入路径')}>
          <span className="font-mono text-xs break-all">
            <span className="text-muted-foreground mr-1">{ctx.http.method}</span>
            {ctx.http.path}
          </span>
        </InfoRow>

        {/* User-Agent */}
        {ctx.http.userAgent != null && ctx.http.userAgent !== '' && (
          <InfoRow label={t('modelsPage.logs.detail.userAgent', 'User-Agent')}>
            <InfoText text={ctx.http.userAgent} />
          </InfoRow>
        )}
      </CardContent>
    </Card>
  );
}

// ── 主组件
interface LogTagsTabProps {
  readonly log: RequestLog;
}

export function LogTagsTab({ log }: LogTagsTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = log.gateway_context;

  if (!ctx) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {t('modelsPage.logs.detail.noContext', '暂无系统回填参数')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 错误信息（置顶） */}
      <ErrorSection log={log} />

      {/* 软错误提示（error 存在但 status 未标为 error 时） */}
      {ctx.error != null && ctx.error !== '' && log.status !== 'error' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{ctx.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GatewayCard log={log} />
        <SourceCard log={log} />
      </div>
    </div>
  );
}
