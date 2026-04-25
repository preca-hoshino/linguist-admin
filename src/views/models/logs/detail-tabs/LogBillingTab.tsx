import { Link } from '@tanstack/react-router';
import { ArrowDownToLine, ArrowUpFromLine, Database, ExternalLink, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listProviderModels } from '@/api/model/provider-models';
import { ProviderLogo } from '@/components/provider/ProviderLogo';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { CostBreakdown, GatewayContextSnapshot, PricingTier, RequestLog } from '@/types';

function InvoiceRow({
  label,
  desc,
  amount,
  icon: Icon,
  isDiscount = false,
}: {
  readonly label: string;
  readonly desc: string;
  readonly amount: number | null | undefined;
  readonly icon: React.ElementType;
  readonly isDiscount?: boolean;
}): React.JSX.Element | null {
  if (amount == null) {
    return null;
  }

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0 border-border/40 hover:bg-muted/10 transition-colors px-2 rounded-sm -mx-2">
      <div className="flex items-start gap-3.5">
        <div
          className={`mt-0.5 rounded-lg p-2 ${isDiscount ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-secondary text-secondary-foreground/70'}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs text-muted-foreground max-w-sm leading-relaxed">{desc}</span>
        </div>
      </div>
      <div
        className={`font-mono text-[15px] font-bold tracking-tight ${isDiscount ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}
      >
        {isDiscount && amount > 0 ? '-' : ''}¥{amount.toFixed(6)}
      </div>
    </div>
  );
}

function PricingContextCard({
  ctx,
  tierStartTokens,
}: {
  readonly ctx: GatewayContextSnapshot;
  readonly tierStartTokens: number;
}): React.JSX.Element {
  const { t } = useTranslation();
  const [tier, setTier] = useState<PricingTier | null>(null);
  const [providerModelId, setProviderModelId] = useState<string | null>(null);

  useEffect(() => {
    if (ctx.route !== undefined && ctx.route.providerId !== '' && ctx.route.model !== '') {
      listProviderModels({ provider_id: ctx.route.providerId })
        .then((res) => {
          if (res.ok) {
            const pm = res.data.data.find((m) => m.name === ctx.route?.model);
            if (pm != null) {
              setProviderModelId(pm.id);
              if (pm.pricing_tiers != null) {
                const matched = pm.pricing_tiers.find((t) => t.start_tokens === tierStartTokens);
                if (matched != null) {
                  setTier(matched);
                }
              }
            }
          }
        })
        .catch(() => {
          // ignore
        });
    }
  }, [ctx.route, tierStartTokens]);

  let maxTokensDisplay = '—';
  let inputCostDisplay = '—';
  let outputCostDisplay = '—';
  let cacheCostDisplay = '—';

  if (tier != null) {
    maxTokensDisplay = tier.max_tokens == null ? 'Infinity (无上限)' : tier.max_tokens.toLocaleString();
    inputCostDisplay = `¥${tier.input_price}`;
    outputCostDisplay = `¥${tier.output_price}`;
    cacheCostDisplay = `¥${tier.cache_price}`;
  }

  return (
    <Card className="shadow-sm border-border/60 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/40">
        <CardTitle className="text-sm font-semibold text-foreground/90">
          {t('modelsPage.logs.detail.billingContext', '计费参数矩阵')}
        </CardTitle>
        {providerModelId != null && (
          <Button variant="outline" size="sm" className="h-7 text-xs font-semibold" asChild>
            <Link to="/models/provider-models/$id" params={{ id: providerModelId }}>
              <ExternalLink className="mr-1.5 h-3 w-3" />
              {t('common.detail', 'Detail')}
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-5 flex flex-col gap-6">
        {/* Top Provider Model Rendering */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
            {(ctx.route?.providerKind != null && ctx.route.providerKind !== '') ||
            (ctx.route?.providerName != null && ctx.route.providerName !== '') ? (
              <ProviderLogo
                provider={(ctx.route.providerKind === '' ? ctx.route.providerName : ctx.route.providerKind) as string}
                size={20}
                className="opacity-80"
              />
            ) : (
              <div className="h-2 w-2 rounded-full bg-border" />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-xs text-muted-foreground/80">
              {ctx.route?.providerName != null && ctx.route.providerName !== ''
                ? ctx.route.providerName
                : 'Unknown Provider'}
            </span>
            <div className="truncate text-sm font-bold text-foreground/90" title={ctx.route?.model}>
              {ctx.route?.model != null && ctx.route.model !== '' ? ctx.route.model : '—'}
            </div>
          </div>
        </div>

        <div className="flex border-t border-border/40 pt-5 flex-col gap-5">
          <span className="text-xs font-medium text-muted-foreground">
            {t('modelsPage.logs.detail.tierMetadata', '计费参数元数据')}
          </span>

          {/* Row 1: Token Range Line */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end text-[11px] text-muted-foreground px-0.5">
              <div className="flex flex-col gap-1">
                <span>{t('modelsPage.logs.detail.tierStart', '起始 Token')}</span>
                <span className="font-mono text-xs font-semibold text-foreground/90">
                  {tierStartTokens.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span>{t('modelsPage.logs.detail.tierMax', '终止 Token')}</span>
                <span className="font-mono text-xs font-semibold text-foreground/60">{maxTokensDisplay}</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-full bg-primary/20 dark:bg-primary/30" />
            </div>
          </div>

          {/* Row 2: 3-column Prices */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <span
                className="text-[11px] text-muted-foreground truncate"
                title={t('modelsPage.logs.detail.tierPrompt', '请求单价 / 1M')}
              >
                {t('modelsPage.logs.detail.tierPrompt', '请求单价 / 1M')}
              </span>
              <span className="font-mono text-xs font-medium">{inputCostDisplay}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span
                className="text-[11px] text-muted-foreground truncate"
                title={t('modelsPage.logs.detail.tierCompletion', '响应单价 / 1M')}
              >
                {t('modelsPage.logs.detail.tierCompletion', '响应单价 / 1M')}
              </span>
              <span className="font-mono text-xs font-medium">{outputCostDisplay}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span
                className="text-[11px] text-muted-foreground truncate"
                title={t('modelsPage.logs.detail.tierCache', '缓存单价 / 1M')}
              >
                {t('modelsPage.logs.detail.tierCache', '缓存单价 / 1M')}
              </span>
              <span className="font-mono text-xs font-medium">{cacheCostDisplay}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LogBillingTab({ log }: { readonly log: RequestLog }): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = log.gateway_context;
  /** 计费数据统一从 gateway_context.billing 读取，迁移脚本已对存量数据回填 */
  const billing = ctx?.billing;
  const isEmbedding = ctx?.route?.modelType === 'embedding';

  if (!ctx || billing == null) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Wallet className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p>{t('modelsPage.logs.detail.billingNoRecord', '此请求未产生计费记录')}</p>
        <span className="text-xs opacity-70">
          {ctx
            ? t('modelsPage.logs.detail.billingNoRecordDesc1', '未配置阶梯定价、无有效用量、或请求发生在计费启用之前。')
            : t('modelsPage.logs.detail.billingNoRecordDesc2', '缺少网关上下文数据。')}
        </span>
      </div>
    );
  }

  const { calculatedCost, costBreakdown } = billing;
  const breakdown: CostBreakdown = costBreakdown;
  const inputCost = breakdown.inputCost;
  const outputCost = breakdown.outputCost;
  const cacheCost = breakdown.cacheCost;
  const tierStartTokens = breakdown.tierStartTokens;

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6 w-full">
      {/* 1. Header (Highlight Cost) */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-foreground/90">
                <span className="text-sm font-semibold">{t('modelsPage.logs.detail.billingTotal', '请求扣款')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isEmbedding
                  ? t('modelsPage.logs.detail.billingTotalDescEmbed', '基于输入 Token 量结算的无感支付快照')
                  : t('modelsPage.logs.detail.billingTotalDescChat', '最终网关结算快照')}
              </p>
            </div>

            <div className="flex items-baseline gap-1 text-foreground">
              <span className="text-lg font-semibold opacity-70">¥</span>
              <span className="text-3xl font-bold font-mono tracking-tighter">{calculatedCost.toFixed(6)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 2. Breakdown Table */}
        <Card className="lg:col-span-2 shadow-sm border-border/60 h-full">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
              {t('modelsPage.logs.detail.billingBreakdown', '费用明细')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-6 pb-4">
            <InvoiceRow
              label={t('modelsPage.logs.detail.billInput', 'Prompt 输入')}
              desc={
                isEmbedding
                  ? t('modelsPage.logs.detail.billInputDescEmbed', '按嵌入输入文本累积的 Token 计算')
                  : t('modelsPage.logs.detail.billInputDescChat', '按请求输入文本/视觉内容的 Token 计算')
              }
              amount={inputCost}
              icon={ArrowDownToLine}
            />

            {!isEmbedding && (
              <InvoiceRow
                label={t('modelsPage.logs.detail.billOutput', 'Completion 输出')}
                desc={t('modelsPage.logs.detail.billOutputDescChat', '模型生成内容对应的 Token 开支')}
                amount={outputCost}
                icon={ArrowUpFromLine}
              />
            )}

            <InvoiceRow
              label={t('modelsPage.logs.detail.billCache', 'Cache 命中计费')}
              desc={
                isEmbedding
                  ? t('modelsPage.logs.detail.billCacheDescEmbed', '缓存命中的输入 Token 以缓存单价结算')
                  : t(
                      'modelsPage.logs.detail.billCacheDescChat',
                      '缓存命中的上下文 Token 以缓存单价（低于输入单价）结算',
                    )
              }
              amount={cacheCost}
              icon={Database}
            />
          </CardContent>
        </Card>

        {/* 3. Pricing Context Meta */}
        <PricingContextCard ctx={ctx} tierStartTokens={tierStartTokens ?? 0} />
      </div>
    </div>
  );
}
