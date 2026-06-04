// src/views/models/provider-models/components/RateLimitSection.tsx — 速率限制手风琴面板

import { Activity } from 'lucide-react';
import type { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TIME_UNITS, UnitInput, UnitTabs, useUnitInput } from '@/components/UnitInput';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Card } from '@/components/ui/Card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import type { FormValues } from '../schema';

interface RateLimitSectionProps {
  readonly control: Control<FormValues>;
}

export function RateLimitSection({ control }: RateLimitSectionProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Card className="gap-0 py-0">
      <AccordionItem value="rate-limit" className="border-b-0">
        <AccordionTrigger className="px-5 hover:no-underline">
          <span className="inline-flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-muted-foreground" />
            {t('modelsPage.providerModels.accordionRateLimit', '速率限制')}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-5 px-5 pt-1 pb-4">
            <FormDescription>
              {t('modelsPage.providerModels.accordionRateLimitDesc', '控制该模型的请求频率与单次调用超时上限。')}
            </FormDescription>

            <FormField
              control={control}
              name="rpm_limit"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                  <FormLabel className="text-left text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {t('modelsPage.providerModels.rpmLimit', 'RPM 限制')}
                    </span>
                  </FormLabel>
                  <div className="space-y-1.5">
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number.parseInt(e.target.value, 10);
                          field.onChange(val);
                        }}
                        className="h-9 w-40 font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('modelsPage.providerModels.rpmLimitHint', '留空或 0 = 无限制')}
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <TpmLimitField control={control} />
            <TimeoutField control={control} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}

function TpmLimitField({ control }: { readonly control: Control<FormValues> }): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name="tpm_limit"
      render={({ field }) => {
        const unit = useUnitInput({
          baseValue: field.value ?? null,
          onChange: field.onChange,
          min: 0,
        });
        return (
          <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
            <FormLabel className="text-left text-muted-foreground">
              <span className="font-medium text-foreground">{t('modelsPage.providerModels.tpmLimit', 'TPM 限制')}</span>
            </FormLabel>
            <div className="space-y-1.5">
              <FormControl>
                <div className="flex items-center gap-2">
                  <UnitInput value={unit.displayValue} onChange={unit.onInputChange} placeholder={unit.placeholder} />
                  <UnitTabs units={unit.units} selected={unit.unitLabel} onSelect={unit.onUnitChange} />
                </div>
              </FormControl>
              <FormDescription>{t('modelsPage.providerModels.tpmLimitHint', '留空或 0 = 无限制')}</FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        );
      }}
    />
  );
}

function TimeoutField({ control }: { readonly control: Control<FormValues> }): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name="timeout_ms"
      render={({ field }) => {
        const unit = useUnitInput({
          baseValue: field.value ?? null,
          onChange: field.onChange,
          units: TIME_UNITS,
          defaultUnit: 's',
          min: 1,
        });
        return (
          <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
            <FormLabel className="text-left text-muted-foreground">
              <span className="font-medium text-foreground">{t('modelsPage.providerModels.timeoutMs', '超时')}</span>
            </FormLabel>
            <div className="space-y-1.5">
              <FormControl>
                <div className="flex items-center gap-2">
                  <UnitInput value={unit.displayValue} onChange={unit.onInputChange} placeholder={unit.placeholder} />
                  <UnitTabs units={unit.units} selected={unit.unitLabel} onSelect={unit.onUnitChange} />
                </div>
              </FormControl>
              <FormDescription>{t('modelsPage.providerModels.timeoutMsHint', '留空 = 系统默认')}</FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        );
      }}
    />
  );
}
