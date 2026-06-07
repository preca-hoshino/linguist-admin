import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, Fingerprint, Loader2, Route, Type, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { createVirtualModel, updateVirtualModel } from '@/api/model/virtual-models';
import { UnitInput, UnitTabs, useUnitInput } from '@/components/UnitInput';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { usePermission } from '@/stores/permission-store';
import type { VirtualModel } from '@/types';
import { cn } from '@/utils/utils';
import { MODEL_TYPE_OPTIONS } from '@/views/models/provider-models/constants';
import { ThinkingConfigSection } from '@/views/models/provider-models/components/ThinkingConfigSection';
import { type BackendModelInfo, SortableBackendList } from './components/SortableBackendList';

interface VirtualModelsMutateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentRow?: VirtualModel | null;
  readonly onSuccess?: () => void | Promise<void>;
}

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  model_type: z.string().min(1),
  routing_strategy: z.string().min(1),
  backends: z
    .array(
      z.object({
        provider_id: z.string().min(1),
        provider_model_id: z.string().min(1),
        weight: z.number().min(0).optional(),
      }),
    )
    .min(1),
  rpm_limit: z.number().nullable().optional(),
  tpm_limit: z.number().nullable().optional(),
  thinking_config: z
    .object({
      reasoning_content_backfill: z.boolean().optional(),
      levels: z
        .array(
          z.object({
            name: z.string(),
            ratio: z.number().min(0).max(1),
          }),
        )
        .optional(),
    })
    .optional(),
});

export type VirtualModelForm = z.infer<typeof formSchema>;

/** 构建 thinking_config payload，空配置时不发送 */
function buildThinkingConfigPayload(
  tc: VirtualModelForm['thinking_config'],
): { reasoning_content_backfill?: boolean; levels?: Array<{ name: string; ratio: number }> } | undefined {
  if (!tc) {
    return undefined;
  }
  const payload: Record<string, unknown> = {};
  if (tc.reasoning_content_backfill) {
    payload.reasoning_content_backfill = true;
  }
  if (tc.levels && tc.levels.length > 0) {
    payload.levels = tc.levels;
  }
  return Object.keys(payload).length > 0 ? (payload as ReturnType<typeof buildThinkingConfigPayload>) : undefined;
}

export function VirtualModelsMutateDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: VirtualModelsMutateDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const isUpdate = !!currentRow;
  const canEdit = usePermission('models', 'edit');

  // 编辑模式：从已有 backends 构建初始展示信息 Map
  const initialModelInfo = useMemo(() => {
    const map = new Map<string, BackendModelInfo>();
    if (currentRow) {
      for (const b of currentRow.backends) {
        map.set(b.provider_model_id, {
          name: b.provider_model_name ?? b.provider_model_id,
          provider_name: b.provider_name ?? '',
          provider_kind: b.provider_kind ?? '',
        });
      }
    }
    return map;
  }, [currentRow]);

  const form = useForm<VirtualModelForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      model_type: 'chat',
      routing_strategy: 'load_balance',
      backends: [],
      rpm_limit: null,
      tpm_limit: null,
      thinking_config: { reasoning_content_backfill: false, levels: [] },
    },
  });

  const currentStrategy = form.watch('routing_strategy');

  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          name: currentRow.name,
          description: currentRow.description || '',
          model_type: currentRow.model_type,
          routing_strategy: currentRow.routing_strategy || 'load_balance',
          backends: currentRow.backends.map((b) => ({
            provider_id: b.provider_id ?? '',
            provider_model_id: b.provider_model_id,
            weight: b.weight,
          })),
          rpm_limit: currentRow.rpm_limit,
          tpm_limit: currentRow.tpm_limit,
          thinking_config: {
            reasoning_content_backfill: currentRow.thinking_config?.reasoning_content_backfill ?? false,
            levels: currentRow.thinking_config?.levels ?? [],
          },
        });
      } else {
        form.reset({
          name: '',
          description: '',
          model_type: 'chat',
          routing_strategy: 'load_balance',
          backends: [],
          rpm_limit: null,
          tpm_limit: null,
          thinking_config: { reasoning_content_backfill: false, levels: [] },
        });
      }
    }
  }, [open, currentRow, form]);

  const onSubmit = async (values: VirtualModelForm): Promise<void> => {
    try {
      if (currentRow) {
        const payload: Parameters<typeof updateVirtualModel>[1] = {
          name: values.name,
          routing_strategy: values.routing_strategy,
          backends: values.backends.map((b, index) => ({
            provider_model_id: b.provider_model_id,
            weight: values.routing_strategy === 'load_balance' ? (b.weight ?? 1) : 1,
            priority: index,
          })),
          ...(values.description === undefined ? {} : { description: values.description }),
          rpm_limit: values.rpm_limit,
          tpm_limit: values.tpm_limit,
          thinking_config: buildThinkingConfigPayload(values.thinking_config),
        };
        const res = await updateVirtualModel(currentRow.id, payload);
        if (!res.ok) {
          throw new Error(res.error.message || 'Update failed');
        }
      } else {
        const payload: Parameters<typeof createVirtualModel>[0] = {
          name: values.name,
          model_type: values.model_type,
          routing_strategy: values.routing_strategy,
          backends: values.backends.map((b, index) => ({
            provider_model_id: b.provider_model_id,
            weight: values.routing_strategy === 'load_balance' ? (b.weight ?? 1) : 1,
            priority: index,
          })),
          ...(values.description === undefined ? {} : { description: values.description }),
          rpm_limit: values.rpm_limit,
          tpm_limit: values.tpm_limit,
          thinking_config: buildThinkingConfigPayload(values.thinking_config),
        };
        const res = await createVirtualModel(payload);
        if (!res.ok) {
          throw new Error(res.error.message || 'Creation failed');
        }
      }

      await onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Operation failed',
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          form.reset();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex h-[85vh] max-h-[850px] flex-col overflow-hidden p-0 sm:max-w-[700px] lg:h-[700px] lg:max-w-[1000px] xl:max-w-[1200px]"
      >
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b border-border/60 bg-background px-8 py-5">
          <div className="flex flex-col gap-1.5 text-left">
            <DialogTitle>
              {isUpdate
                ? t('modelsPage.virtualModels.edit', 'Edit Virtual Model')
                : t('modelsPage.virtualModels.create', 'New Virtual Model')}
            </DialogTitle>
            <DialogDescription>
              {isUpdate
                ? t('modelsPage.virtualModels.editDesc', 'Update settings and routing targets for this virtual model.')
                : t(
                    'modelsPage.virtualModels.createDesc',
                    'Create a new virtual model wrapping one or more provider models.',
                  )}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 h-8 w-8 text-muted-foreground"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form
            id="virtual-models-form"
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 py-6"
          >
            <div className="flex h-full min-h-0 w-full flex-col gap-6">
              {form.formState.errors.root && (
                <div className="shrink-0 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-10 lg:grid-cols-[520px_1fr]">
                {/* 基础配置区 */}
                <div className="-mr-4 flex flex-col gap-6 overflow-y-auto pt-1 pr-4 pb-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                          <Fingerprint className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">
                            {t('modelsPage.virtualModels.name', 'Name / ID')}
                          </span>
                        </FormLabel>
                        <div className="space-y-1.5">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t('modelsPage.virtualModels.namePlaceholder', 'global-gpt-4o')}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                          <Type className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">{t('common.description', 'Description')}</span>
                        </FormLabel>
                        <div className="space-y-1.5">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder={t('common.descriptionPlaceholder', 'Optional details about this model...')}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model_type"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                          <Type className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">
                            {t('modelsPage.virtualModels.type', 'Type')}
                          </span>
                        </FormLabel>
                        <div className="space-y-1.5">
                          <div className="flex h-9 w-full flex-nowrap items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                            {MODEL_TYPE_OPTIONS.map((opt) => {
                              const isSelected = field.value === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  disabled={isUpdate}
                                  onClick={() => {
                                    if (!isUpdate && field.value !== opt.id) {
                                      field.onChange(opt.id);
                                    }
                                  }}
                                  className={cn(
                                    'inline-flex flex-1 items-center justify-center rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                    isSelected ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground',
                                    isUpdate && 'cursor-not-allowed opacity-50',
                                  )}
                                >
                                  <opt.icon
                                    className={cn(
                                      'mr-1.5 h-4 w-4',
                                      isSelected ? 'text-foreground' : 'text-muted-foreground',
                                    )}
                                  />
                                  {t(opt.i18nLabel, opt.label)}
                                </button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* ── 手风琴面板 ── */}
                  <Accordion type="multiple" className="w-full space-y-3">
                    {/* 路由策略 */}
                    <Card className="gap-0 py-0">
                      <AccordionItem value="routing-strategy" className="border-b-0">
                        <AccordionTrigger className="px-5 hover:no-underline">
                          <span className="inline-flex items-center gap-2.5">
                            <Route className="h-4 w-4 text-muted-foreground" />
                            {t('modelsPage.virtualModels.accordionRouting', '路由策略')}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-5 px-5 pt-1 pb-4">
                            <FormDescription>
                              {t('modelsPage.virtualModels.accordionRoutingDesc', '选择多后端之间的流量分配策略。')}
                            </FormDescription>

                            <FormField
                              control={form.control}
                              name="routing_strategy"
                              render={({ field }) => (
                                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                                  <FormLabel className="text-left text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                      {t('modelsPage.virtualModels.routingStrategy', 'Routing Strategy')}
                                    </span>
                                  </FormLabel>
                                  <div className="space-y-1.5">
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue
                                            placeholder={t(
                                              'modelsPage.virtualModels.routingStrategyPlaceholder',
                                              'Select Strategy',
                                            )}
                                          />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="load_balance">
                                          {t('modelsPage.virtualModels.strategyLoadBalance', 'Load Balance')}
                                        </SelectItem>
                                        <SelectItem value="failover">
                                          {t('modelsPage.virtualModels.strategyFailover', 'Failover')}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Card>

                    {/* 速率限制 */}
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
                              {t(
                                'modelsPage.providerModels.accordionRateLimitDesc',
                                '控制该模型的请求频率与单次调用超时上限。',
                              )}
                            </FormDescription>

                            <FormField
                              control={form.control}
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
                                          const val =
                                            e.target.value === '' ? null : Number.parseInt(e.target.value, 10);
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

                            <FormField
                              control={form.control}
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
                                      <span className="font-medium text-foreground">
                                        {t('modelsPage.providerModels.tpmLimit', 'TPM 限制')}
                                      </span>
                                    </FormLabel>
                                    <div className="space-y-1.5">
                                      <FormControl>
                                        <div className="flex items-center gap-2">
                                          <UnitInput
                                            value={unit.displayValue}
                                            onChange={unit.onInputChange}
                                            placeholder={unit.placeholder}
                                          />
                                          <UnitTabs
                                            units={unit.units}
                                            selected={unit.unitLabel}
                                            onSelect={unit.onUnitChange}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormDescription>
                                        {t('modelsPage.providerModels.tpmLimitHint', '留空或 0 = 无限制')}
                                      </FormDescription>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Card>

                    {/* 思考能力配置 */}
                    <ThinkingConfigSection control={form.control} watch={form.watch} setValue={form.setValue} />
                  </Accordion>
                </div>

                {/* 后端模型绑定区 */}
                <SortableBackendList
                  form={form}
                  t={t}
                  currentStrategy={currentStrategy}
                  initialModelInfo={initialModelInfo}
                />
              </div>
            </div>
          </form>
        </Form>

        {/* 底部按钮栏 */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border/60 bg-muted/30 px-8 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={form.formState.isSubmitting}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" form="virtual-models-form" disabled={form.formState.isSubmitting || !canEdit}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdate ? t('common.save', 'Save') : t('common.create', 'Create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
