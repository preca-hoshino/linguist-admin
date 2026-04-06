import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/utils'

// ── 组件：Token 用量卡片
interface TokenUsage {
  prompt_tokens?: number
  total_tokens?: number
  completion_tokens?: number
  cached_tokens?: number
  reasoning_tokens?: number
}

function StatItem({ label, value, accent }: { readonly label: string; readonly value?: number | undefined; readonly accent?: 'emerald' | 'amber' | undefined }): React.JSX.Element | null {
  if (value == null) return null
  let color = 'text-foreground';
  if (accent === 'emerald') {
    color = 'text-emerald-600 dark:text-emerald-400';
  } else if (accent === 'amber') {
    color = 'text-amber-600 dark:text-amber-400';
  }
  return (
    <div className='flex flex-col'>
      <span className='text-[10px] text-muted-foreground'>{label}</span>
      <span className={cn('font-mono text-sm font-semibold', color)}>{value.toLocaleString()}</span>
    </div>
  )
}

export function TokenUsageBar({ usage, mode = 'chat' }: { readonly usage?: TokenUsage | undefined; readonly mode?: 'chat' | 'embedding' }): React.JSX.Element | null {
  const { t } = useTranslation()
  if (usage == null || usage.total_tokens == null || usage.total_tokens === 0) return null

  return (
    <div className='flex flex-wrap gap-4 rounded-xl border bg-card p-4 shadow-sm w-full shrink-0'>
      <StatItem label={t('modelsPage.logs.detail.totalTokens', '总 Token')} value={usage.total_tokens} />
      <StatItem label={t('modelsPage.logs.detail.promptTokens', '输入')} value={usage.prompt_tokens} />

      {mode === 'chat' && (
        <StatItem label={t('modelsPage.logs.detail.completionTokens', '输出')} value={usage.completion_tokens} />
      )}

      {mode === 'chat' && usage.cached_tokens != null && usage.cached_tokens > 0 && (
        <StatItem label={t('modelsPage.logs.detail.cachedTokens', '缓存')} value={usage.cached_tokens} accent='emerald' />
      )}

      {mode === 'chat' && usage.reasoning_tokens != null && usage.reasoning_tokens > 0 && (
        <StatItem label={t('modelsPage.logs.detail.reasoningTokens', '思考')} value={usage.reasoning_tokens} accent='amber' />
      )}
    </div>
  )
}
