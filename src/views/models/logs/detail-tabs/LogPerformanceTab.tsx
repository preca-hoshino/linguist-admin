import { Clock, Gauge, Server, Timer, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { GatewayContextSnapshot, RequestLog } from '@/types';
import { cn, formatDuration, formatDurationUnit } from '@/utils/utils';

function MetricCard({
  title,
  value,
  unit,
  desc,
  icon: Icon,
}: {
  readonly title: string;
  readonly value: string | number | null;
  readonly unit?: string;
  readonly desc?: string;
  readonly icon?: React.ElementType;
}): React.JSX.Element {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon != null && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold tracking-normal">
          {value == null ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <>
              {value}
              {unit != null && unit !== '' && (
                <span className="ml-1 text-lg font-medium text-muted-foreground">{unit}</span>
              )}
            </>
          )}
        </div>
        {desc != null && desc !== '' && <p className="mt-4 text-xs text-muted-foreground">{desc}</p>}
      </CardContent>
    </Card>
  );
}

// ── 时序组件：垂直瀑布流 ──
function getWaterfallBlocks(
  ctx: GatewayContextSnapshot,
  startMs: number,
  endMs: number,
  t: (key: string, fallback: string) => string,
): { label: string; start: number; end: number; colorBg: string; colorText: string }[] {
  const { providerStart, ttft, providerEnd } = ctx.timing;
  const isStream = ctx.stream;
  const blocks = [];

  // 1. 网关接收与适配
  if (providerStart != null && providerStart >= startMs) {
    blocks.push({
      label: t('modelsPage.logs.detail.phaseGatewayIn', '网关接收与适配'),
      start: startMs,
      end: providerStart,
      colorBg: 'bg-violet-500/80 dark:bg-violet-500/60',
      colorText: 'text-violet-600 dark:text-violet-400',
    });
  }

  // 2. 提供商等待 / 推理 (TTFT 或 完整响应)
  if (providerStart != null) {
    const waitEnd = isStream && ttft != null ? ttft : (providerEnd ?? endMs);
    if (waitEnd >= providerStart) {
      blocks.push({
        label: isStream
          ? t('modelsPage.logs.detail.phaseProviderTtft', '大模型推理 (TTFT)')
          : t('modelsPage.logs.detail.phaseProviderFull', '大模型推理与生成'),
        start: providerStart,
        end: waitEnd,
        colorBg: 'bg-amber-500/80 dark:bg-amber-500/60',
        colorText: 'text-amber-600 dark:text-amber-400',
      });
    }
  }

  // 3. 流式持续生成 (若有)
  if (isStream && ttft != null && providerEnd != null && providerEnd >= ttft) {
    blocks.push({
      label: t('modelsPage.logs.detail.phaseGeneration', '流式持续输出'),
      start: ttft,
      end: providerEnd,
      colorBg: 'bg-emerald-500/80 dark:bg-emerald-500/60',
      colorText: 'text-emerald-600 dark:text-emerald-400',
    });
  }

  // 4. 网关后处理与下发响应
  if (providerEnd != null && endMs >= providerEnd) {
    blocks.push({
      label: t('modelsPage.logs.detail.phaseGatewayOut', '网关后处理与下发'),
      start: providerEnd,
      end: endMs,
      colorBg: 'bg-blue-500/80 dark:bg-blue-500/60',
      colorText: 'text-blue-600 dark:text-blue-400',
    });
  }

  return blocks;
}

function WaterfallChart({ ctx }: { readonly ctx: GatewayContextSnapshot }): React.JSX.Element {
  const { t } = useTranslation();
  const { start, end } = ctx.timing;

  const startMs = start;
  const endMs = end ?? startMs; // 兜底防止意外空值
  const e2eTotalMs = Math.max(1, endMs - startMs);

  const blocks = getWaterfallBlocks(ctx, startMs, endMs, t);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">{t('modelsPage.logs.detail.waterfallTitle', '耗时分析')}</h3>

      <div className="flex flex-col gap-3">
        {blocks.map((b) => {
          const offsetPct = Math.max(0, ((b.start - startMs) / e2eTotalMs) * 100);
          let widthPct = Math.max(0, ((b.end - b.start) / e2eTotalMs) * 100);
          if (offsetPct + widthPct > 100) {
            widthPct = 100 - offsetPct;
          }
          const duration = Math.round(b.end - b.start);

          return (
            <div key={b.label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="w-32 shrink-0 sm:text-right">
                <div className="text-[11px] font-semibold text-foreground/70 tracking-wide">{b.label}</div>
              </div>

              {/* 进度条槽 */}
              <div className="flex-1 relative h-[22px] rounded-md bg-muted/30 overflow-hidden flex items-center">
                <div
                  className={cn('absolute h-full transition-all min-w-[2px] rounded-sm', b.colorBg)}
                  style={{ left: `${offsetPct}%`, width: `${Math.max(widthPct, 0.5)}%` }}
                />
              </div>

              {/* 时长说明 */}
              <div className="w-16 shrink-0 text-right">
                <span className={cn('text-sm font-bold', b.colorText)}>
                  {formatDuration(duration)}
                  {formatDurationUnit(duration)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* X 轴刻度指示 */}
      <div
        className="flex justify-between items-center mt-4 pt-3 border-t text-[10px] text-muted-foreground/60 font-medium"
        style={{ paddingLeft: '140px' }}
      >
        <span>0ms</span>
        <span>
          {formatDuration(Math.round(e2eTotalMs / 2))}
          {formatDurationUnit(Math.round(e2eTotalMs / 2))}
        </span>
        <span>
          {formatDuration(e2eTotalMs)}
          {formatDurationUnit(e2eTotalMs)}
        </span>
      </div>
    </div>
  );
}

interface PerfMetrics {
  totalMs: number | null;
  ttftMs: number | null;
  providerTimeMs: number | null;
  gatewayOverheadMs: number | null;
  itlMs: number | null;
  genRate: number | null;
}

function computeMetrics(ctx: GatewayContextSnapshot): PerfMetrics {
  const { start, providerStart, providerEnd, ttft, end } = ctx.timing;
  const isStream = ctx.stream;
  const usage = ctx.response?.usage;

  const startMs = start;
  const endMs = end ?? null;
  const totalMs = endMs == null ? null : endMs - startMs;
  const ttftMs = isStream && ttft != null && providerStart != null ? Math.round(ttft - startMs) : null;
  const providerTimeMs = providerStart != null && providerEnd != null ? Math.round(providerEnd - providerStart) : null;
  const gatewayOverheadMs = totalMs != null && providerTimeMs != null ? totalMs - providerTimeMs : null;

  let itlMs: number | null = null;
  let genRate: number | null = null;

  if (
    isStream &&
    ttft != null &&
    providerEnd != null &&
    usage?.completion_tokens != null &&
    usage.completion_tokens > 1
  ) {
    const genTime = providerEnd - ttft;
    if (genTime > 0) {
      itlMs = Math.round(genTime / (usage.completion_tokens - 1));
      genRate = Math.round((usage.completion_tokens / genTime) * 1000);
    }
  }

  return { totalMs, ttftMs, providerTimeMs, gatewayOverheadMs, itlMs, genRate };
}

function getDurationProps(ms: number | null): { value: string | null; unit: string } {
  return {
    value: ms == null ? null : formatDuration(ms),
    unit: ms == null ? 'ms' : formatDurationUnit(ms),
  };
}

function PerformanceCardsList({
  isStream,
  metrics,
  t,
}: {
  readonly isStream: boolean;
  readonly metrics: PerfMetrics;
  readonly t: (key: string, defaultValue: string) => string;
}): React.JSX.Element {
  const { totalMs, ttftMs, providerTimeMs, gatewayOverheadMs, itlMs, genRate } = metrics;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">{t('modelsPage.logs.detail.perfMetricsTitle', '性能指标')}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 1. E2E 卡片 */}
        <MetricCard
          title={t('dashboard.perf.stat_e2e', 'E2E')}
          {...getDurationProps(totalMs)}
          desc={t('modelsPage.logs.detail.perfE2EDesc', '网关及大模型全局端到端响应耗时')}
          icon={Clock}
        />

        {/* 2. TTFT 或 Provider Time 卡片 */}
        {isStream ? (
          <MetricCard
            title={t('dashboard.perf.stat_ttft', 'TTFT')}
            {...getDurationProps(ttftMs)}
            desc={t('modelsPage.logs.detail.perfTTFTDesc', '从网关接收请求至大模型响应首个有效 Token')}
            icon={Timer}
          />
        ) : (
          <MetricCard
            title={t('modelsPage.logs.detail.perfProviderTime', 'Provider Time')}
            {...getDurationProps(providerTimeMs)}
            desc={t('modelsPage.logs.detail.perfProviderTimeDesc', '大模型处理请求的完整耗时（包含推理与生成）')}
            icon={Timer}
          />
        )}

        {/* 3. ITL 或 网关损耗 卡片 */}
        {isStream ? (
          <MetricCard
            title={t('dashboard.perf.stat_itl', 'ITL')}
            {...getDurationProps(itlMs)}
            desc={t('modelsPage.logs.detail.perfITLDescSingle', '流式响应中每次字间生成的平均耗时')}
            icon={Gauge}
          />
        ) : (
          <MetricCard
            title={t('modelsPage.logs.detail.perfGatewayOverhead', 'Gateway Overhead')}
            {...getDurationProps(gatewayOverheadMs)}
            desc={t(
              'modelsPage.logs.detail.perfGatewayOverheadDesc',
              '网关执行鉴权、上下文编排及出入参映射产生的额外耗时',
            )}
            icon={Server}
          />
        )}

        {/* 4. Token 生成速率 卡片 */}
        <MetricCard
          title={t('dashboard.perf.stat_tok_s', 'Generation Rate')}
          value={isStream && genRate != null ? genRate.toLocaleString() : null}
          unit={isStream && genRate != null ? 'Tok/s' : ''}
          desc={t('modelsPage.logs.detail.perfGenRateDescSingle', '流式持续阶段单位时间内生成的 Token 数量')}
          icon={Zap}
        />
      </div>
    </div>
  );
}

export function LogPerformanceTab({ log }: { readonly log: RequestLog }): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = log.gateway_context;

  if (!ctx) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {t('modelsPage.logs.detail.noContext', '暂无上下文数据')}
      </div>
    );
  }

  const isStream = ctx.stream;
  const metrics = computeMetrics(ctx);

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6 w-full">
      <PerformanceCardsList isStream={isStream ?? false} metrics={metrics} t={t} />
      <WaterfallChart ctx={ctx} />
    </div>
  );
}
