import { CreditCard, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react'
import type { RequestLog } from '@/types'

function FinancialCard({
  title,
  amount,
  desc,
  icon: Icon,
  primary = false,
}: {
  readonly title: string
  readonly amount: number | string | null | undefined
  readonly desc?: string
  readonly icon?: React.ElementType
  readonly primary?: boolean
}): React.JSX.Element {
  const isPrimary = primary
  const textColor = isPrimary ? 'text-blue-700 dark:text-blue-300' : 'text-foreground'
  const bgColor = isPrimary
    ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30 shadow-md'
    : 'bg-card border-border shadow-sm'

  let displayAmount: string | null = null;
  if (amount != null) {
    displayAmount = typeof amount === 'number' ? amount.toFixed(6) : amount;
  }

  return (
    <div className={`rounded-xl border p-6 flex flex-col justify-between ${bgColor}`}>
      <div className='flex items-center justify-between'>
        <h3 className={`text-sm font-semibold ${isPrimary ? 'text-blue-800 dark:text-blue-300' : 'text-muted-foreground'}`}>
          {title}
        </h3>
        {Icon != null && <Icon className={`h-5 w-5 ${isPrimary ? 'text-blue-500' : 'text-muted-foreground/30'}`} />}
      </div>
      
      <div className='mt-4 flex flex-col'>
        <div className='flex items-end gap-1'>
          <span className='text-sm font-semibold opacity-70 mb-1'>¥</span>
          {displayAmount == null ? (
            <span className='text-3xl font-bold font-mono text-muted-foreground/30'>
              0.000000
            </span>
          ) : (
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${textColor}`}>
              {displayAmount}
            </span>
          )}
        </div>
        {desc != null && desc !== '' && <span className='text-[11px] text-muted-foreground mt-1.5'>{desc}</span>}
      </div>
    </div>
  )
}

export function LogBillingTab({ log }: { readonly log: RequestLog }): React.JSX.Element {
  const ctx = log.gateway_context
  const breakdown = log.cost_breakdown
  const isEmbedding = ctx?.route?.modelType === 'embedding'

  // 守卫：没有 cost_breakdown 或 breakdown 是空对象（兼容旧数据）
  const hasBreakdown = breakdown != null
    && typeof breakdown === 'object'
    && 'inputCost' in breakdown

  if (!ctx || !hasBreakdown) {
    return (
      <div className='flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground'>
        <Wallet className='h-8 w-8 text-muted-foreground/30 mb-2' />
        <p>此请求未产生计费记录</p>
        <span className='text-xs opacity-70'>
          {ctx
            ? '未配置阶梯定价、无有效用量、或请求发生在计费启用之前。'
            : '缺少网关上下文数据。'}
        </span>
      </div>
    )
  }

  const { calculated_cost } = log
  const inputCost = breakdown.inputCost
  const outputCost = breakdown.outputCost
  const cacheCost = breakdown.cacheCost
  const tierStartTokens = breakdown.tierStartTokens

  return (
    <div className='flex flex-col gap-6 max-w-5xl mx-auto w-full'>
      
      {/* 行 1: 总花销 */}
      <FinancialCard
        title='本次请求总扣款'
        amount={calculated_cost}
        desc={isEmbedding
          ? '嵌入模型按输入 Token 量结算（无输出费用）'
          : '结合模型定价与实际使用的最终网关结算快照'}
        icon={CreditCard}
        primary
      />

      {/* 行 2: 拆分结构 */}
      <h3 className='text-sm font-semibold text-muted-foreground mt-2 flex items-center gap-2'>
        费用拆分 <ArrowRight className='h-3 w-3' />
      </h3>
      
      {isEmbedding ? (
        /* 嵌入模型：只有输入费用和缓存费用 */
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <FinancialCard
            title='输入扣费'
            amount={inputCost}
            desc='按嵌入输入文本累积的 Token 计算'
          />
          <FinancialCard
            title='Cache 缓存命中'
            amount={cacheCost}
            desc='若提供商支持嵌入缓存，此处结算匹配的低价 Token'
          />
        </div>
      ) : (
        /* Chat 模型：输入 + 输出 + 缓存 三列 */
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          <FinancialCard
            title='Prompt 输入扣费'
            amount={inputCost}
            desc='按请求输入文本/视觉内容的 Token 计算'
          />
          <FinancialCard
            title='Completion 输出扣费'
            amount={outputCost}
            desc='模型生成内容对应的 Token 开支'
          />
          <FinancialCard
            title='Cache 缓存命中'
            amount={cacheCost}
            desc='通过上下文缓存匹配的低价结算费'
          />
        </div>
      )}

      {/* 定价上下文 */}
      <div className='rounded-lg border bg-muted/20 p-5 mt-4 flex flex-col gap-3 relative overflow-hidden'>
        <div className='absolute right-0 top-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -z-10 blur-xl opacity-50' />
        
        <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          定价依据
        </h4>

        <div className='grid grid-cols-2 lg:grid-cols-3 gap-6 text-sm'>
          <div className='flex flex-col gap-1'>
            <span className='text-[10px] text-muted-foreground'>
              定价所属模型
            </span>
            <span className='font-mono font-medium'>{(ctx.route?.model != null && ctx.route.model !== '') ? ctx.route.model : '—'}</span>
          </div>

          <div className='flex flex-col gap-1'>
            <span className='text-[10px] text-muted-foreground'>阶梯阈值 (Tier Start)</span>
            {((): React.ReactNode => {
              if (tierStartTokens === 0) {
                return (
                  <span className='font-mono font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='h-3 w-3' /> Base Tier
                  </span>
                );
              }
              return <span className='font-mono font-medium'>{tierStartTokens.toLocaleString()} Toks</span>;
            })()}
          </div>
          
          <div className='flex flex-col gap-1'>
            <span className='text-[10px] text-muted-foreground'>模型类型</span>
            <span className='text-xs font-medium uppercase'>
              {isEmbedding ? 'Embedding' : 'Chat'}
            </span>
          </div>
        </div>
      </div>
      
    </div>
  )
}
