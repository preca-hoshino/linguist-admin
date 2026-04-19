import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { useTheme } from '@/providers/ThemeProvider';
import type { RequestLog } from '@/types';
import { cn } from '@/utils/utils';

// 删 Header 字典类型别名（智识 sonarjs/use-type-alias）
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

// ── 状态码 Badge
function StatusBadge({ code }: { readonly code: number | undefined }): React.JSX.Element {
  const textColor = getStatusColor(code);
  const bgColor = getStatusBgColor(code);
  return (
    <span
      className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-semibold', textColor, bgColor)}
    >
      {code === undefined ? 'N/A' : `HTTP ${String(code)}`}
    </span>
  );
}

// ── Headers 展开区
function HeadersSection({ headers }: { readonly headers: AuditHeaderMap | undefined }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const entries = headers ? Object.entries(headers).filter(([, v]) => v !== undefined) : [];
  const isEmpty = entries.length === 0;

  return (
    <div className="border-t">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-muted/20 transition-colors"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('modelsPage.logs.detail.headers', 'Headers')}
          {!isEmpty && (
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-normal">{entries.length}</span>
          )}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="px-4 pb-3">
          {isEmpty ? (
            <span className="text-[12px] text-muted-foreground italic">{t('common.empty', '空')}</span>
          ) : (
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {entries.map(([key, value]) => (
                <div key={key} className="contents">
                  <span className="text-[11px] font-mono text-muted-foreground break-all py-0.5">{key}</span>
                  <span className="text-[11px] font-mono text-foreground break-all py-0.5">
                    {Array.isArray(value) ? value.join(', ') : value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Body 区（JSON 视图）
function BodySection({
  data,
  resolvedTheme,
}: {
  readonly data: unknown;
  readonly resolvedTheme: string;
}): React.JSX.Element {
  const { t } = useTranslation();
  const isEmpty = data == null || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0);

  return (
    <div className="border-t">
      <div className="px-4 pt-2 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Body</span>
      </div>
      <div className="px-4 pb-4">
        {isEmpty ? (
          <span className="text-[12px] text-muted-foreground italic">{t('common.empty', '空')}</span>
        ) : (
          <JsonView
            src={data as object}
            collapsed={2}
            enableClipboard
            displaySize
            theme={resolvedTheme === 'dark' ? 'a11y' : 'default'}
            style={{
              fontSize: '12px',
              lineHeight: '1.65',
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── 三区式 Audit 卡片（状态码 + Headers + Body）
function AuditCard({
  title,
  subtitle,
  statusCode,
  headers,
  body,
  defaultOpen = false,
  accentClass,
}: {
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly statusCode?: number | undefined;
  readonly headers?: AuditHeaderMap | undefined;
  readonly body?: unknown;
  readonly defaultOpen?: boolean | undefined;
  readonly accentClass?: string | undefined;
}): React.JSX.Element {
  const [open, setOpen] = useState(defaultOpen);
  const { resolvedTheme } = useTheme();

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* 折叠头 */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        {accentClass != null && accentClass !== '' && (
          <span className={cn('h-2 w-2 rounded-full shrink-0', accentClass)} />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          {subtitle != null && subtitle !== '' && (
            <div className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge code={statusCode} />
          <ChevronDown
            className={cn('h-4 w-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')}
          />
        </div>
      </button>

      {/* 展开内容 */}
      {open && (
        <>
          <HeadersSection headers={headers} />
          <BodySection data={body} resolvedTheme={resolvedTheme} />
        </>
      )}
    </div>
  );
}

// ── Gateway Context 卡片（纯 JSON）
function ContextCard({
  title,
  subtitle,
  data,
}: {
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly data: unknown;
}): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isEmpty = data == null || (typeof data === 'object' && Object.keys(data).length === 0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className={cn('h-2 w-2 rounded-full shrink-0 bg-zinc-400 dark:bg-zinc-600')} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          {subtitle != null && subtitle !== '' && (
            <div className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</div>
          )}
        </div>
        {isEmpty && <span className="text-[11px] text-muted-foreground mr-2">{t('common.empty', '空')}</span>}
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="border-t px-4 py-4">
          {isEmpty ? (
            <span className="text-[12px] text-muted-foreground italic">{t('common.empty', '空')}</span>
          ) : (
            <JsonView
              src={data as object}
              collapsed={2}
              enableClipboard
              displaySize
              theme={resolvedTheme === 'dark' ? 'a11y' : 'default'}
              style={{
                fontSize: '12px',
                lineHeight: '1.65',
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              }}
            />
          )}
        </div>
      )}
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
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {t(
          'modelsPage.logs.detail.metadataDesc',
          '以下为请求生命周期的完整协议快照与底层元数据，可用于底层框架调试和审计。',
        )}
      </p>

      {/* 1. 用户请求：入站原始请求（请求方，无 HTTP 状态码） */}
      <AuditCard
        title={t('modelsPage.logs.detail.userRequest', '用户请求')}
        subtitle={t('modelsPage.logs.detail.userRequestDesc', '用户发送给网关的原始请求体')}
        headers={audit?.userRequest?.headers as Record<string, string | string[] | undefined> | undefined}
        body={audit?.userRequest?.body}
        defaultOpen
        accentClass="bg-blue-400"
      />

      {/* 2. 提供商请求：出站转发请求（请求方，无 HTTP 状态码） */}
      <AuditCard
        title={t('modelsPage.logs.detail.providerRequest', '提供商请求')}
        subtitle={t('modelsPage.logs.detail.providerRequestDesc', '网关转换后发给提供商的请求体')}
        headers={audit?.providerRequest?.headers}
        body={audit?.providerRequest?.body}
        accentClass="bg-violet-400"
      />

      {/* 3. 提供商响应：上游响应（响应方，有 HTTP 状态码） */}
      <AuditCard
        title={t('modelsPage.logs.detail.providerResponse', '提供商响应')}
        subtitle={t('modelsPage.logs.detail.providerResponseDesc', '提供商返回的原始响应体')}
        statusCode={audit?.providerResponse?.statusCode}
        headers={audit?.providerResponse?.headers}
        body={audit?.providerResponse?.body}
        accentClass="bg-amber-400"
      />

      {/* 4. 用户响应：最终响应（响应方，有 HTTP 状态码） */}
      <AuditCard
        title={t('modelsPage.logs.detail.userResponse', '用户响应')}
        subtitle={t('modelsPage.logs.detail.userResponseDesc', '网关组装后返回给用户的最终响应体')}
        statusCode={audit?.userResponse?.statusCode}
        headers={audit?.userResponse?.headers as Record<string, string | string[] | undefined> | undefined}
        body={audit?.userResponse?.body}
        accentClass="bg-emerald-400"
      />

      {/* 5. Gateway Context 快照 */}
      <ContextCard
        title={t('modelsPage.logs.detail.gatewayContextSnapshot', 'Gateway Context Snapshot')}
        subtitle={t('modelsPage.logs.detail.gatewayContextSnapshotDesc', 'Linguist 内部流转所产生的所有状态上下文')}
        data={ctx}
      />
    </div>
  );
}
