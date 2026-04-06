import { useTranslation } from 'react-i18next'
import { Activity, Zap, Timer, BarChart, Server } from 'lucide-react'
import { cn } from '@/utils/utils'
import type { RequestLog, GatewayContextSnapshot } from '@/types'

function MetricCard({
  title,
  value,
  unit,
  desc,
  icon: Icon,
  accent = 'blue',
}: {
  readonly title: string
  readonly value: string | number | null
  readonly unit?: string
  readonly desc?: string
  readonly icon?: React.ElementType
  readonly accent?: 'blue' | 'emerald' | 'amber' | 'violet'
}): React.JSX.Element {
  const TEXT_COLORS = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    violet: 'text-violet-600 dark:text-violet-400',
    blue: 'text-blue-600 dark:text-blue-400'
  } as const;
  
  const BG_COLORS = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10',
    amber: 'bg-amber-50 dark:bg-amber-500/10',
    violet: 'bg-violet-50 dark:bg-violet-500/10',
    blue: 'bg-blue-50 dark:bg-blue-500/10'
  } as const;

  const colorText = TEXT_COLORS[accent];
  const colorBg = BG_COLORS[accent];

  return (
    <div className='rounded-lg border bg-card p-5 shadow-sm'>
      <div className='flex items-center gap-2 mb-3'>
        {Icon != null && (
          <div className={cn('p-1.5 rounded-md', colorBg)}>
            <Icon className={cn('h-4 w-4', colorText)} />
          </div>
        )}
        <h3 className='text-sm font-medium text-muted-foreground'>{title}</h3>
      </div>
      <div className='flex items-baseline gap-1.5'>
        {value == null ? (
          <span className='text-xl font-medium text-muted-foreground/50'>—</span>
        ) : (
          <>
            <span className={cn('text-2xl font-bold font-mono tracking-tight', colorText)}>
              {value}
            </span>
            {unit != null && unit !== '' && <span className='text-xs font-semibold text-muted-foreground'>{unit}</span>}
          </>
        )}
      </div>
      {desc != null && desc !== '' && <p className='mt-2 text-[11px] text-muted-foreground'>{desc}</p>}
    </div>
  )
}

// ── 时间线组件 ──
function TimingTimeline({ ctx }: { readonly ctx: GatewayContextSnapshot }): React.JSX.Element {
  const { t } = useTranslation()
  const { start, requestAdapted, routed, providerStart, ttft, providerEnd, end } = ctx.timing
  const isStream = ctx.stream

  const startMs = start

  // 关键节点
  const phases: { label: string; ts?: number; key: string }[] = [
    { label: t('modelsPage.logs.detail.timingStart', '请求到达'), ts: startMs, key: 'start' },
    ...(requestAdapted == null ? [] : [{ label: t('modelsPage.logs.detail.timingAdapted', '请求适配'), ts: requestAdapted, key: 'adapted' }]),
    ...(routed == null ? [] : [{ label: t('modelsPage.logs.detail.timingRouted', '路由完成'), ts: routed, key: 'routed' }]),
    ...(providerStart == null ? [] : [{ label: t('modelsPage.logs.detail.timingProviderStart', '发给提供商'), ts: providerStart, key: 'providerStart' }]),
    ...(isStream && ttft != null ? [{ label: t('modelsPage.logs.detail.timingTtft', 'TTFT'), ts: ttft, key: 'ttft' }] : []),
    ...(providerEnd == null ? [] : [{ label: t('modelsPage.logs.detail.timingProviderEnd', '提供商响应'), ts: providerEnd, key: 'providerEnd' }]),
    ...(end == null ? [] : [{ label: t('modelsPage.logs.detail.timingEnd', '请求完成'), ts: end, key: 'end' }]),
  ]

  return (
    <div className='rounded-lg border bg-card p-6 shadow-sm overflow-x-auto'>
      <h3 className='mb-6 flex items-center gap-2 text-sm font-semibold'>
        <BarChart className='h-4 w-4 text-muted-foreground' />
        瀑布流时序分析
      </h3>
      <div className='flex justify-center min-w-max my-8'>
        {phases.map((p, i) => {
          const delta = i === 0 ? 0 : (p.ts ?? 0) - startMs
          return (
            <div key={p.key} className='flex items-center'>
              <div className='flex flex-col items-center relative'>
                {/* 节点点缀 */}
                <div className='h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20 z-10' />
                <div className='absolute top-6 flex flex-col items-center min-w-24'>
                  <span className='text-xs font-medium text-foreground whitespace-nowrap'>{p.label}</span>
                  {i > 0 && (
                    <span className='text-[10px] font-mono font-medium text-muted-foreground mt-0.5'>+{delta}ms</span>
                  )}
                  {i === 0 && (
                    <span className='text-[10px] font-mono text-muted-foreground mt-0.5'>
                      {new Date(startMs).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              {i < phases.length - 1 && (
                <div className='h-[2px] w-16 md:w-32 bg-border relative'>
                  {/* 分段耗时? 暂不显示以免过密，通过上面的 +delta 已经清晰 */}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LogPerformanceTab({ log }: { readonly log: RequestLog }): React.JSX.Element {
  const { t } = useTranslation()
  const ctx = log.gateway_context

  if (!ctx) {
    return (
      <div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
        {t('modelsPage.logs.detail.noContext', '暂无上下文数据')}
      </div>
    )
  }

  const { start, providerStart, providerEnd, ttft, end } = ctx.timing
  const isStream = ctx.stream
  const usage = ctx.response?.usage

  // 1. E2E Latency
  const startMs = start
  const endMs = end ?? null
  const totalMs = endMs == null ? null : endMs - startMs

  // 2. TTFT (Time To First Token)
  const ttftMs = isStream && ttft != null && providerStart != null ? Math.round(ttft - startMs) : null

  // 3. Provider Processing Time
  const providerTimeMs = providerStart != null && providerEnd != null ? Math.round(providerEnd - providerStart) : null

  // 4. Gateway Overhead
  const gatewayOverheadMs = totalMs != null && providerTimeMs != null ? totalMs - providerTimeMs : null

  // 5. ITL (Inter-Token Latency) & Generation Rate
  let itlMs: number | null = null
  let genRate: number | null = null

  if (isStream && ttft != null && providerEnd != null && usage?.completion_tokens != null && usage.completion_tokens > 0) {
    const genTime = providerEnd - ttft
    if (genTime > 0 && usage.completion_tokens > 1) {
      itlMs = Math.round(genTime / (usage.completion_tokens - 1))
      genRate = Math.round((usage.completion_tokens / genTime) * 1000)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <MetricCard
          title='E2E 延时'
          value={totalMs}
          unit='ms'
          desc='系统完整处理耗时 (Client 感知)'
          icon={Timer}
          accent='blue'
        />
        <MetricCard
          title='TTFT 首字延时'
          value={ttftMs}
          unit='ms'
          desc='从请求到达网关至产生第一个输出 Token'
          icon={Zap}
          accent='amber'
        />
        <MetricCard
          title='网关处理损耗'
          value={gatewayOverheadMs}
          unit='ms'
          desc='鉴权、路由适配及网络转发带来的额外耗时'
          icon={Server}
          accent='violet'
        />
        <MetricCard
          title='生成极速 (Tok/s)'
          value={genRate}
          unit='Tok/s'
          desc={itlMs == null ? '流式输出每秒生成速度' : `打字平顺度 (ITL): ${itlMs}ms/字`}
          icon={Activity}
          accent='emerald'
        />
      </div>

      <TimingTimeline ctx={ctx} />
    </div>
  )
}
