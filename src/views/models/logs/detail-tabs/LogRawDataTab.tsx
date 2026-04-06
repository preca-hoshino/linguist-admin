import { Check, ChevronDown, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RequestLog } from '@/types';
import { cn } from '@/utils/utils';

// ── 复制 hook
function useCopy(): { copied: boolean; copy: (text: string) => Promise<void> } {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      /* ignore */
    }
  }, []);
  return { copied, copy };
}

// ── 可折叠 JSON 卡片
function JsonCard({
  title,
  subtitle,
  data,
  defaultOpen = false,
  accentClass,
}: {
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly data: unknown;
  readonly defaultOpen?: boolean | undefined;
  readonly accentClass?: string | undefined;
}): React.JSX.Element {
  const [open, setOpen] = useState(defaultOpen);
  const { copied, copy } = useCopy();
  const isEmpty = data == null || (typeof data === 'object' && Object.keys(data).length === 0);
  const jsonStr = isEmpty ? '{}' : JSON.stringify(data, null, 2);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
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
        {isEmpty && <span className="text-[11px] text-muted-foreground mr-2">空</span>}
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="border-t">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/20">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">JSON</span>
            <button
              type="button"
              onClick={() => void copy(jsonStr)}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <pre className="px-4 py-4 font-mono text-xs leading-relaxed text-foreground overflow-auto max-h-96">
            {jsonStr}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── 主组件
interface LogRawDataTabProps {
  readonly log: RequestLog;
}

export function LogRawDataTab({ log }: LogRawDataTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = log.gateway_context;
  const audit = ctx?.audit;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {t('modelsPage.logs.detail.rawDataDesc', '以下为请求生命周期中四次 HTTP 交换的完整快照，可用于调试和审计。')}
      </p>

      <JsonCard
        title={t('modelsPage.logs.detail.userRequest', '用户请求')}
        subtitle={t('modelsPage.logs.detail.userRequestDesc', '用户发送给网关的原始请求体')}
        data={audit?.userRequest?.body}
        defaultOpen
        accentClass="bg-blue-400"
      />

      <JsonCard
        title={t('modelsPage.logs.detail.providerRequest', '提供商请求')}
        subtitle={t('modelsPage.logs.detail.providerRequestDesc', '网关转换后发给提供商的请求体')}
        data={audit?.providerRequest?.body}
        accentClass="bg-violet-400"
      />

      <JsonCard
        title={t('modelsPage.logs.detail.providerResponse', '提供商响应')}
        subtitle={t('modelsPage.logs.detail.providerResponseDesc', '提供商返回的原始响应体')}
        data={audit?.providerResponse?.body}
        accentClass="bg-amber-400"
      />

      <JsonCard
        title={t('modelsPage.logs.detail.userResponse', '用户响应')}
        subtitle={t('modelsPage.logs.detail.userResponseDesc', '网关组装后返回给用户的最终响应体')}
        data={audit?.userResponse?.body}
        accentClass="bg-emerald-400"
      />

      {log.cost_breakdown && (
        <JsonCard
          title={t('modelsPage.logs.detail.costBreakdown', '计费明细')}
          subtitle={
            log.calculated_cost == null
              ? undefined
              : t('modelsPage.logs.detail.totalCost', '总费用: ¥{{cost}}', {
                  cost: Number(log.calculated_cost).toFixed(6),
                  defaultValue: `总费用: ¥${Number(log.calculated_cost).toFixed(6)}`,
                })
          }
          data={log.cost_breakdown}
          accentClass="bg-rose-400"
        />
      )}
    </div>
  );
}
