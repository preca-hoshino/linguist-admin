import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Banknote, Box, BrainCircuit, Sparkles, Type, Wrench, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createProviderModel, updateProviderModel } from '@/api/model/provider-models';
import { listProviders } from '@/api/model/providers';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePermission } from '@/stores/permission-store';
import { CapabilitiesSelector } from './components/CapabilitiesSelector';
import { PricingTiersSection, usePricingTiersLogic } from './components/PricingTiersSection';
import { ThinkingConfigSection } from './components/ThinkingConfigSection';
import { ProviderSelector } from './components/ProviderSelector';
import { RateLimitSection } from './components/RateLimitSection';
import { RequestOverridesEditor } from './components/RequestOverridesEditor';
import { SupportedParametersSelector } from './components/SupportedParametersSelector';
import { MODEL_TYPE_OPTIONS } from './constants';
import { buildFormValuesFromRow, buildSubmitPayload } from './helpers';
import { type FormValues, formSchema, type ProviderModelsMutateDialogProps } from './schema';

const DEFAULT_VALUES: FormValues = {
  id: '',
  name: '',
  type: 'chat',
  max_tokens: 128,
  provider_id: '',
  capabilities: [],
  supported_parameters: [],
  pricing_tiers: [{ start_tokens: 0, max_tokens: 128, input_price: 0, output_price: 0, cache_price: 0 }],
  rpm_limit: null,
  tpm_limit: null,
  timeout_ms: null,
  request_overrides_ui: [],
  model_config: { reasoning_content_backfill: false },
};

export function ProviderModelsMutateDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
  title,
  description,
  fixedProviderId,
}: ProviderModelsMutateDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const mode = currentRow ? 'edit' : 'create';
  const canEdit = usePermission('models', 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: providerRes, isLoading: providersLoading } = useQuery({
    queryKey: ['admin_providers_all'],
    queryFn: async () => await listProviders({ limit: 500 }),
    enabled: open,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...DEFAULT_VALUES, provider_id: fixedProviderId ?? '' },
  });

  // Watch fields
  const currentProviderId = useWatch({ control: form.control, name: 'provider_id' });
  const currentMaxTokens = useWatch({ control: form.control, name: 'max_tokens' });
  const currentPricingTiers = useWatch({ control: form.control, name: 'pricing_tiers' });
  const modelType = useWatch({ control: form.control, name: 'type' });

  const providers = providerRes?.ok === true ? providerRes.data.data : [];
  const selectedProvider = providers.find((p) => p.id === currentProviderId);
  const rawAllowed = selectedProvider?.supported_model_types ?? [];
  const allowedTypes: string[] = rawAllowed.length > 0 ? rawAllowed : MODEL_TYPE_OPTIONS.map((o) => o.id);
  const visibleTypeOptions = MODEL_TYPE_OPTIONS.filter((o) => allowedTypes.includes(o.id));

  // Initialize form on open
  useEffect(() => {
    if (!open) {
      return;
    }
    if (!currentRow) {
      form.reset({ ...DEFAULT_VALUES, provider_id: fixedProviderId ?? '' });
      setSearchQuery('');
      return;
    }
    form.reset(buildFormValuesFromRow(currentRow));
  }, [open, currentRow, form, fixedProviderId]);

  // Auto-reset model type when provider changes
  useEffect(() => {
    if (!currentProviderId || allowedTypes.includes(modelType)) {
      return;
    }
    const firstAllowed = visibleTypeOptions[0]?.id;
    if (firstAllowed !== undefined) {
      form.setValue('type', firstAllowed, { shouldValidate: true });
      form.setValue('capabilities', []);
      form.setValue('supported_parameters', []);
    }
  }, [currentProviderId, allowedTypes, modelType, visibleTypeOptions, form]);

  // Pricing Hook logic
  const { splitPoints, handleSliderChange, addSplit, removeSplit } = usePricingTiersLogic({
    currentMaxTokens,
    currentPricingTiers,
    setValue: form.setValue,
  });

  const handleSubmit = async (values: FormValues): Promise<void> => {
    setIsSubmitting(true);
    try {
      const payload = buildSubmitPayload(values);
      await (mode === 'edit' && currentRow
        ? updateProviderModel(currentRow.id, payload)
        : createProviderModel({ ...payload, id: values.id || values.name, provider_id: values.provider_id }));
      if (onSuccess) {
        await onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      form.setError('root', { message: error instanceof Error ? error.message : 'Operation failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOpts = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleProviderSelect = (id: string): void => {
    form.setValue('provider_id', id, { shouldValidate: true });
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
        className="flex h-[85vh] max-h-[850px] min-h-[540px] w-[95vw] flex-row gap-0 overflow-hidden p-0 sm:max-w-[1024px]"
      >
        <ProviderSelector
          providers={filteredOpts}
          isLoading={providersLoading}
          selectedProviderId={currentProviderId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={handleProviderSelect}
          disabled={mode === 'edit'}
        />

        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b px-8 py-5">
            <div className="flex flex-col gap-1.5 text-left">
              <DialogTitle>
                {title ??
                  (mode === 'edit'
                    ? t('modelsPage.providerModels.edit', '编辑提供商模型')
                    : t('modelsPage.providerModels.create', '添加提供商模型'))}
              </DialogTitle>
              <DialogDescription>
                {description ??
                  (mode === 'edit'
                    ? t('modelsPage.providerModels.editDesc', '配置并更新该模型的核心参数与定价属性。')
                    : t('modelsPage.providerModels.createDesc', '在选定提供商下层配置新的可用模型。'))}
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-0.5 -mr-2 h-8 w-8 text-muted-foreground"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {currentProviderId ? (
            <>
              <Form {...form}>
                <form
                  id="provider-models-form"
                  onSubmit={(e) => {
                    void form.handleSubmit(handleSubmit)(e);
                  }}
                  className="flex-1 overflow-y-auto px-8 py-6"
                >
                  <div className="w-full space-y-6">
                    {form.formState.errors.root && (
                      <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {form.formState.errors.root.message}
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="provider_id"
                      render={() => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input type="hidden" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input type="hidden" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* ── 基础配置 ── */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                          <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                            <Type className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">
                              {t('modelsPage.providerModels.name', '展示名称')}
                            </span>
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <div className="space-y-1.5">
                            <FormControl>
                              <Input {...field} placeholder="e.g., GPT-4o" className="bg-muted/10" />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                          <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                            <Box className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">
                              {t('modelsPage.providerModels.modelType', '模型类型')}
                            </span>
                          </FormLabel>
                          <div className="space-y-1.5">
                            <Tabs
                              onValueChange={(val) => {
                                field.onChange(val);
                                form.setValue('capabilities', []);
                                form.setValue('supported_parameters', []);
                              }}
                              value={field.value}
                              className="w-full sm:max-w-[420px]"
                            >
                              <TabsList className="flex h-9 w-full">
                                {visibleTypeOptions.map((opt) => (
                                  <TabsTrigger
                                    key={opt.id}
                                    value={opt.id}
                                    className="flex-1 px-3 text-sm"
                                    disabled={mode === 'edit'}
                                  >
                                    <opt.icon className="mr-1.5 h-4 w-4" />
                                    {t(opt.i18nLabel, opt.label)}
                                  </TabsTrigger>
                                ))}
                              </TabsList>
                            </Tabs>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="max_tokens"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                          <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                            <BrainCircuit className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">
                              {t('modelsPage.providerModels.maxTokens', '最大上下文 (K)')}
                            </span>
                          </FormLabel>
                          <div className="space-y-1.5">
                            <div className="relative w-full sm:max-w-[280px]">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min={1}
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10))}
                                  className="pr-10 font-mono"
                                />
                              </FormControl>
                              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-muted-foreground/60">
                                K
                              </div>
                            </div>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* ── 手风琴面板 ── */}
                    <Accordion type="multiple" className="w-full space-y-3">
                      <RateLimitSection control={form.control} />

                      {/* 能力参数 */}
                      <Card className="gap-0 py-0">
                        <AccordionItem value="capabilities" className="border-b-0">
                          <AccordionTrigger className="px-5 hover:no-underline">
                            <span className="inline-flex items-center gap-2.5">
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                              {t('modelsPage.providerModels.accordionCapabilities', '能力参数')}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-5 px-5 pt-1 pb-4">
                              <FormDescription>
                                {t(
                                  'modelsPage.providerModels.accordionCapabilitiesDesc',
                                  '声明模型原生支持的能力与调优参数，用于路由调度与参数过滤。',
                                )}
                              </FormDescription>
                              <CapabilitiesSelector control={form.control} name="capabilities" modelType={modelType} />
                              <SupportedParametersSelector
                                control={form.control}
                                name="supported_parameters"
                                modelType={modelType}
                                providerKind={selectedProvider?.kind}
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Card>

                      {/* 请求覆写 */}
                      <Card className="gap-0 py-0">
                        <AccordionItem value="overrides" className="border-b-0">
                          <AccordionTrigger className="px-5 hover:no-underline">
                            <span className="inline-flex items-center gap-2.5">
                              <Wrench className="h-4 w-4 text-muted-foreground" />
                              {t('modelsPage.providerModels.accordionRequestOverrides', '请求覆写')}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="px-5 pt-1 pb-4">
                              <FormDescription className="mb-4">
                                {t(
                                  'modelsPage.providerModels.accordionRequestOverridesDesc',
                                  '自定义发往该模型的 HTTP 请求头与 Body 字段。',
                                )}
                              </FormDescription>
                              <RequestOverridesEditor name="request_overrides_ui" />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Card>

                      {/* 计费阶梯 */}
                      <Card className="gap-0 py-0">
                        <AccordionItem value="pricing" className="border-b-0">
                          <AccordionTrigger className="px-5 hover:no-underline">
                            <span className="inline-flex items-center gap-2.5">
                              <Banknote className="h-4 w-4 text-muted-foreground" />
                              {t('modelsPage.providerModels.accordionPricing', '计费阶梯')}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="px-5 pt-1 pb-4">
                              <FormDescription className="mb-4">
                                {t(
                                  'modelsPage.providerModels.accordionPricingDesc',
                                  '按 Token 区间分段配置输入、输出与缓存的每百万 Token 单价。',
                                )}
                              </FormDescription>
                              <PricingTiersSection
                                form={form}
                                currentMaxTokens={currentMaxTokens}
                                currentPricingTiers={currentPricingTiers}
                                splitPoints={splitPoints}
                                onSliderChange={handleSliderChange}
                                onAddSplit={addSplit}
                                onRemoveSplit={removeSplit}
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Card>

                      {/* 思考能力配置 */}
                      <ThinkingConfigSection
                        control={form.control}
                        watch={form.watch}
                        setValue={form.setValue}
                        maxTokensK={currentMaxTokens}
                      />
                    </Accordion>
                  </div>
                </form>
              </Form>

              <DialogFooter className="shrink-0 border-t bg-muted/30 px-6 py-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  {t('common.cancel', '取消')}
                </Button>
                <Button
                  form="provider-models-form"
                  type="submit"
                  disabled={isSubmitting || !currentProviderId || !canEdit}
                >
                  {isSubmitting && (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t('common.saving', '保存中...')}
                    </span>
                  )}
                  {!isSubmitting && mode === 'edit' && t('common.save', '保存更改')}
                  {!isSubmitting && mode !== 'edit' && t('common.create', '确认添加')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
              <Box className="mb-4 h-12 w-12 opacity-20" />
              <p>{t('modelsPage.providerModels.pleaseSelectProvider', '请先在左侧选择对应提供商')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
