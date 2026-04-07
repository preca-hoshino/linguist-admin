import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/utils';
import { BarChart2 } from 'lucide-react';

// ── 组件：Token 用量卡片
interface TokenUsage {
  prompt_tokens?: number;
  total_tokens?: number;
  completion_tokens?: number;
  cached_tokens?: number;
  reasoning_tokens?: number;
}

function StatItem({
  label,
  value,
  isTotal,
}: {
  readonly label: string;
  readonly value?: number | undefined;
  readonly isTotal?: boolean;
}): React.JSX.Element | null {
  if (value == null) {
    return null;
  }
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={cn('text-sm font-bold mt-0.5', isTotal ? 'text-primary text-[15px]' : 'text-foreground')}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function TokenUsageBar({
  usage,
  mode = 'chat',
}: {
  readonly usage?: TokenUsage | undefined;
  readonly mode?: 'chat' | 'embedding';
}): React.JSX.Element | null {
  const { t } = useTranslation();
  if (usage == null || usage.total_tokens == null || usage.total_tokens === 0) {
    return null;
  }

  return (
    <div className="flex w-full items-center rounded-xl border bg-card/60 backdrop-blur px-4 py-2.5 shadow-sm overflow-x-auto scrollbar-hide">
      {/* 左侧：标题 */}
      <div className="flex shrink-0 items-center justify-center gap-2 pr-4 text-primary/80">
        <BarChart2 className="h-4 w-4" />
        <span className="text-[13px] font-bold text-foreground/80">{t('modelsPage.logs.detail.tokenUsageTitle', 'Token 用量')}</span>
      </div>

      <div className="h-5 w-[1px] shrink-0 bg-border/80" />

      {/* 中间：各项明细 */}
      <div className="flex items-center gap-6 md:gap-8 px-5 flex-1 min-w-0">
        <StatItem label={t('modelsPage.logs.detail.promptTokens', 'PROMPT')} value={usage.prompt_tokens} />
        
        {mode === 'chat' && (
          <StatItem label={t('modelsPage.logs.detail.completionTokens', 'COMPLETION')} value={usage.completion_tokens} />
        )}
        
        {mode === 'chat' && usage.cached_tokens != null && (
          <StatItem
            label={t('modelsPage.logs.detail.cachedTokens', 'CACHED')}
            value={usage.cached_tokens}
          />
        )}
        
        {mode === 'chat' && usage.reasoning_tokens != null && usage.reasoning_tokens > 0 && (
          <StatItem
            label={t('modelsPage.logs.detail.reasoningTokens', 'REASONING')}
            value={usage.reasoning_tokens}
          />
        )}
      </div>

      <div className="h-5 w-[1px] shrink-0 bg-border/80" />

      {/* 右侧：总计 */}
      <div className="flex shrink-0 items-center pl-5">
        <StatItem label={t('modelsPage.logs.detail.totalTokens', 'TOTAL')} value={usage.total_tokens} isTotal />
      </div>
    </div>
  );
}
