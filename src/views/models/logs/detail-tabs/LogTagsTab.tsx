import { AlertTriangle, CheckCircle2, Cpu, Globe, Key, Layers, Loader2, Network, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import type { RequestLog } from '@/types';
import { cn } from '@/utils/utils';

// ── 能力 Badge 样式复用
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

// ── 信息行
function InfoRow({
  label,
  icon: Icon,
  children,
  className,
}: {
  readonly label: string;
  readonly icon?: React.ElementType;
  readonly children: React.ReactNode;
  readonly className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'grid grid-cols-[160px_1fr] items-start gap-3 py-2.5 border-b border-border/50 last:border-0',
        className,
      )}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground pt-0.5">
        {Icon != null && <Icon className="h-3 w-3 shrink-0" />}
        {label}
      </span>
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

  const route = ctx.route;
  let StatusIcon = Loader2;
  if (log.status === 'completed') {
    StatusIcon = CheckCircle2;
  } else if (log.status === 'error') {
    StatusIcon = XCircle;
  }

  const ctxExtended = ctx as typeof ctx & { appName?: string };

  return (
    <div className="flex flex-col gap-6">
      {/* 错误信息（置顶） */}
      <ErrorSection log={log} />

      {/* 错误提示（若 error 存在但 status 不是 error，比如重试前拦截） */}
      {ctx.error != null && ctx.error !== '' && log.status !== 'error' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{ctx.error}</span>
        </div>
      )}

      {/* 路由信息卡片 */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Network className="h-4 w-4 text-muted-foreground" />
          网关与路由特征
        </h3>
        <div>
          <InfoRow label={t('modelsPage.logs.detail.status', '状态')} icon={StatusIcon}>
            <Badge
              variant="outline"
              className={cn(
                'font-medium',
                log.status === 'completed' &&
                  'border-green-300 text-green-700 bg-green-50/50 dark:border-green-900 dark:text-green-400 dark:bg-green-900/20',
                log.status === 'error' && 'border-destructive/40 text-destructive bg-destructive/5',
                log.status !== 'completed' && log.status !== 'error' && 'text-muted-foreground',
              )}
            >
              {((): string => {
                if (log.status === 'completed') {
                  return t('modelsPage.logs.statusCompleted', '成功');
                }
                if (log.status === 'error') {
                  return t('modelsPage.logs.statusError', '失败');
                }
                return t('modelsPage.logs.statusProcessing', '处理中');
              })()}
            </Badge>
          </InfoRow>
          <InfoRow label={t('modelsPage.logs.detail.requestModel', '请求型号')} icon={Layers}>
            <InfoText text={ctx.requestModel} mono />
          </InfoRow>
          {route && (
            <>
              <InfoRow label={t('modelsPage.logs.detail.providerModel', '最后执行的提供商型号')} icon={Cpu}>
                <InfoText text={route.model} mono />
              </InfoRow>
              <InfoRow label={t('modelsPage.logs.detail.provider', '提供商实体')}>
                <span className="text-sm">
                  {route.providerName === '' ? route.providerId : route.providerName}
                  {route.providerKind !== '' && (
                    <span className="ml-2 text-xs text-muted-foreground font-mono">({route.providerKind})</span>
                  )}
                </span>
              </InfoRow>
              <InfoRow label={t('modelsPage.logs.detail.strategy', '选用策略')}>
                <Badge variant="secondary" className="text-xs font-mono capitalize">
                  {route.strategy || '—'}
                </Badge>
              </InfoRow>
              {route.capabilities.length > 0 && (
                <InfoRow label={t('modelsPage.logs.detail.capabilities', '能力标签')}>
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
              <InfoRow label={t('modelsPage.logs.detail.modelType', '模型类型')}>
                <Badge variant="outline" className="text-xs capitalize">
                  {route.modelType}
                </Badge>
              </InfoRow>
            </>
          )}
          <InfoRow label={t('modelsPage.logs.detail.stream', '工作模式 (Stream)')}>
            <Badge
              variant="outline"
              className={
                ctx.stream
                  ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
                  : 'text-muted-foreground'
              }
            >
              {ctx.stream ? t('modelsPage.logs.stream', '流式工作') : t('modelsPage.logs.nonStream', '阻断响应')}
            </Badge>
          </InfoRow>
          <InfoRow label={t('modelsPage.logs.detail.userFormat', '用户下发格式')}>
            <InfoText text={ctx.userFormat} mono />
          </InfoRow>
        </div>
      </div>

      {/* 客户端追踪 */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Globe className="h-4 w-4 text-muted-foreground" />
          下发来源追踪追踪
        </h3>
        <div>
          <InfoRow label={t('modelsPage.logs.detail.app', '归属应用 (App)')} icon={Key}>
            <span className="text-sm">
              {ctxExtended.appName != null && ctxExtended.appName !== '' && (
                <span className="font-medium">{ctxExtended.appName}</span>
              )}
              {ctx.apiKeyName != null &&
                ctx.apiKeyName !== '' &&
                (ctxExtended.appName == null || ctxExtended.appName === '') && (
                  <span className="font-medium">{ctx.apiKeyName}</span>
                )}
              {ctx.apiKeyPrefix != null && ctx.apiKeyPrefix !== '' && (
                <span className="ml-2 font-mono text-xs text-muted-foreground">{ctx.apiKeyPrefix}…</span>
              )}
              {(ctxExtended.appName == null || ctxExtended.appName === '') &&
                (ctx.apiKeyName == null || ctx.apiKeyName === '') &&
                (ctx.apiKeyPrefix == null || ctx.apiKeyPrefix === '') && (
                  <span className="text-muted-foreground opacity-50">未追踪到明确的 App / 或匿名请求</span>
                )}
            </span>
          </InfoRow>
          <InfoRow label={t('modelsPage.logs.detail.ip', '客户端原始 IP')}>
            <InfoText text={ctx.ip} mono />
          </InfoRow>
          <InfoRow label={t('modelsPage.logs.detail.httpPath', '网关接受路径')}>
            <InfoText text={`${ctx.http.method} ${ctx.http.path}`} mono />
          </InfoRow>
          {ctx.http.userAgent != null && ctx.http.userAgent !== '' && (
            <InfoRow label={t('modelsPage.logs.detail.userAgent', '识别出的 User-Agent')}>
              <InfoText text={ctx.http.userAgent} />
            </InfoRow>
          )}
        </div>
      </div>
    </div>
  );
}
