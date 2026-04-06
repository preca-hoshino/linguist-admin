import { BadgeDollarSign, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import type { UseFormReturn, UseFormSetValue, Path, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { FormLabel } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';

interface PricingTier {
  startTokens: number;
  maxTokens: number;
  inputPrice: number;
  outputPrice: number;
  cachePrice: number;
}

interface FormWithPricing {
  pricing_tiers?: PricingTier[];
  max_tokens: number;
  [key: string]: unknown;
}

interface PricingTiersSectionProps<T extends FormWithPricing> {
  readonly form: UseFormReturn<T>;
  readonly currentMaxTokens: number;
  readonly currentPricingTiers: PricingTier[];
  readonly splitPoints: number[];
  readonly onSliderChange: (newSplits: number[]) => void;
  readonly onAddSplit: () => void;
  readonly onRemoveSplit: (idx: number) => void;
}

export function PricingTiersSection<T extends FormWithPricing>({
  form,
  currentMaxTokens,
  currentPricingTiers,
  splitPoints,
  onSliderChange,
  onAddSplit,
  onRemoveSplit,
}: PricingTiersSectionProps<T>): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-3 flex items-center justify-start gap-2 text-left text-sm font-medium leading-none text-muted-foreground lg:col-span-2">
        <BadgeDollarSign className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">
          {t('modelsPage.providerModels.pricingTiers', '计费阶梯配置')}
        </span>
      </div>

      <div className="space-y-6 px-1 pt-4 pb-2 lg:col-span-2">
        <div className="flex items-center gap-5 px-1">
          <span className="w-8 text-right text-[11px] font-medium text-muted-foreground">0K</span>
          <Slider
            max={currentMaxTokens}
            step={1}
            value={splitPoints}
            onValueChange={(val) => {
              onSliderChange(val);
            }}
            className="flex-1"
          />
          <span className="w-12 text-[11px] font-medium text-muted-foreground">{currentMaxTokens}K</span>
        </div>

        <div className="mt-2 flex justify-end pt-2 pb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={splitPoints.length >= 4 || currentMaxTokens - (splitPoints.at(-1) ?? 0) <= 1}
            className="h-7 border-dashed text-xs shadow-none"
            onClick={onAddSplit}
          >
            <Plus className="mr-1 h-3 w-3" />
            {t('modelsPage.providerModels.addPricingTier', 'Add Split Point')}
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {currentPricingTiers.map((tier, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: no unique identifier available
              key={idx}
              className="grid grid-cols-4 items-end gap-3 rounded-lg border border-border/50 bg-background p-3 shadow-sm"
            >
              {/* Info Column */}
              <div className="flex h-full flex-col justify-center space-y-1 border-r border-border/50 py-1 pr-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  {t('modelsPage.providerModels.tierRange', 'Tier {{num}}', { num: idx + 1 })}
                </span>
                <span className="text-sm leading-snug font-medium text-foreground">
                  {tier.startTokens}K&nbsp;&ndash;&nbsp;{tier.maxTokens}K
                </span>
                <span className="text-xs text-muted-foreground/70">/ 1M Tokens</span>
              </div>

              <div className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-foreground">
                  {t('modelsPage.providerModels.inputPrice', 'Input')}{' '}
                  <span className="text-[10px] text-muted-foreground/50">/ 1M</span>
                </FormLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                    <span className="text-[13px] text-muted-foreground text-muted-foreground/70">¥</span>
                  </div>
                  <Input
                    type="number"
                    step="0.000001"
                    min={0}
                    {...form.register(`pricing_tiers.${idx}.inputPrice` as Parameters<typeof form.register>[0], {
                      valueAsNumber: true,
                    })}
                    placeholder="0.000000"
                    className="h-8 border-input bg-background pl-6 text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-foreground">
                  {t('modelsPage.providerModels.outputPrice', 'Output')}{' '}
                  <span className="text-[10px] text-muted-foreground/50">/ 1M</span>
                </FormLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                    <span className="text-[13px] text-muted-foreground text-muted-foreground/70">¥</span>
                  </div>
                  <Input
                    type="number"
                    step="0.000001"
                    min={0}
                    {...form.register(`pricing_tiers.${idx}.outputPrice` as Parameters<typeof form.register>[0], {
                      valueAsNumber: true,
                    })}
                    placeholder="0.000000"
                    className="h-8 border-input bg-background pl-6 text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <FormLabel className="text-xs font-medium text-foreground">
                    {t('modelsPage.providerModels.cachePrice', 'Cache')}{' '}
                    <span className="text-[10px] text-muted-foreground/50">/ 1M</span>
                  </FormLabel>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                      <span className="text-[13px] text-muted-foreground text-muted-foreground/70">¥</span>
                    </div>
                    <Input
                      type="number"
                      step="0.000001"
                      min={0}
                      {...form.register(`pricing_tiers.${idx}.cachePrice` as Parameters<typeof form.register>[0], {
                        valueAsNumber: true,
                      })}
                      placeholder="0.000000"
                      className="h-8 border-input bg-background pl-6 text-sm shadow-sm focus-visible:ring-primary"
                    />
                  </div>
                </div>
                {idx > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      onRemoveSplit(idx);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── 导出 usePricingTiersLogic Hook，供父组件管理 Slider 状态
// eslint-disable-next-line react-refresh/only-export-components
export function usePricingTiersLogic<T extends FormWithPricing>({
  currentMaxTokens,
  currentPricingTiers,
  setValue,
}: {
  currentMaxTokens: number;
  currentPricingTiers: PricingTier[];
  setValue: UseFormSetValue<T>;
}): {
  splitPoints: number[];
  handleSliderChange: (newSplits: number[]) => void;
  addSplit: () => void;
  removeSplit: (indexToRemove: number) => void;
} {
  const splitPoints = useMemo(() => {
    if (currentPricingTiers.length <= 1) {
      return [];
    }
    return currentPricingTiers.slice(0, -1).map((tier) => tier.maxTokens || 0);
  }, [currentPricingTiers]);

  const handleSliderChange = useCallback(
    (newSplits: number[]): void => {
      const newTiers = [];
      const sortedSplits = newSplits.toSorted((a, b) => a - b);

      for (let i = 0; i <= sortedSplits.length; i++) {
        const start = i === 0 ? 0 : sortedSplits[i - 1];
        const max = i === sortedSplits.length ? currentMaxTokens : sortedSplits[i];

        const defaultPricing = { inputPrice: 0, outputPrice: 0, cachePrice: 0 };
        const oldPrices = currentPricingTiers[i] ?? currentPricingTiers.at(-1) ?? defaultPricing;

        newTiers.push({
          startTokens: start ?? 0,
          maxTokens: Math.max(start ?? 0, max ?? 1),
          inputPrice: oldPrices.inputPrice,
          outputPrice: oldPrices.outputPrice,
          cachePrice: oldPrices.cachePrice,
        });
      }
      setValue('pricing_tiers' as Path<T>, newTiers as PathValue<T, Path<T>>, {
        shouldDirty: true,
        shouldValidate: false,
      });
    },
    [currentMaxTokens, currentPricingTiers, setValue],
  );

  // 1K self-adaptive clamp guard
  useEffect(() => {
    if (currentPricingTiers.length === 0) {
      setValue(
        'pricing_tiers' as Path<T>,
        [{ startTokens: 0, maxTokens: currentMaxTokens, inputPrice: 0, outputPrice: 0, cachePrice: 0 }] as PathValue<
          T,
          Path<T>
        >,
      );
      return;
    }

    const lastTier = currentPricingTiers.at(-1);
    if (lastTier && lastTier.maxTokens !== currentMaxTokens) {
      const validSplits = splitPoints.filter((p) => p < currentMaxTokens);
      const uniqueSplits = [...new Set(validSplits)];
      handleSliderChange(uniqueSplits);
    }
  }, [
    currentMaxTokens,
    currentPricingTiers.length,
    splitPoints.filter,
    setValue,
    handleSliderChange,
    currentPricingTiers.at,
  ]);

  const addSplit = (): void => {
    const lastPoint = splitPoints.length > 0 ? (splitPoints.at(-1) ?? 0) : 0;
    const newPoint = Math.floor((lastPoint + currentMaxTokens) / 2);
    if (newPoint <= lastPoint || newPoint >= currentMaxTokens) {
      return;
    }
    handleSliderChange([...splitPoints, newPoint]);
  };

  const removeSplit = (indexToRemove: number): void => {
    if (splitPoints.length === 0 || indexToRemove === 0) {
      return;
    }
    const newSplits = [...splitPoints];
    newSplits.splice(indexToRemove - 1, 1);
    handleSliderChange(newSplits);
  };

  return { splitPoints, handleSliderChange, addSplit, removeSplit };
}
