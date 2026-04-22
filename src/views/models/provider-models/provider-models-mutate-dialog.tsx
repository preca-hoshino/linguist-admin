import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Activity, Box, BrainCircuit, Timer, Type, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { createProviderModel, updateProviderModel } from '@/api/provider-models';
import { listProviders } from '@/api/providers';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import type { ProviderModel } from '@/types';
import { CapabilitiesSelector } from './components/CapabilitiesSelector';
import { PricingTiersSection, usePricingTiersLogic } from './components/PricingTiersSection';
import { ProviderSelector } from './components/ProviderSelector';
import { RequestOverridesEditor } from './components/RequestOverridesEditor';
import { SupportedParametersSelector } from './components/SupportedParametersSelector';
import { MODEL_TYPE_OPTIONS } from './constants';

// --- Definitions & Schemas ---
const RequestOverrideUIRowSchema = z.object({
  type: z.enum(['header', 'body']),
  key: z.string().min(1),
  value: z.string().optional(),
});

const PricingTierSchema = z.object({
  start_tokens: z.number().min(0),
  max_tokens: z.number().min(0),
  input_price: z.number().min(0),
  output_price: z.number().min(0),
  cache_price: z.number().min(0),
});

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name required'),
  type: z.string().min(1, 'Type required'),
  max_tokens: z.number().min(1),
  provider_id: z.string().min(1, 'Provider required'),
  capabilities: z.array(z.string()),
  supported_parameters: z.array(z.string()),
  pricing_tiers: z.array(PricingTierSchema),
  rpm_limit: z.number().nullable().optional(),
  tpm_limit: z.number().nullable().optional(),
  /** API 调用超时时间（毫秒），null = 使用系统默认 */
  timeout_ms: z.number().int().positive().nullable().optional(),
  request_overrides_ui: z.array(RequestOverrideUIRowSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProviderModelsMutateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentRow?: ProviderModel | null;
  readonly onSuccess?: () => void | Promise<void>;
  readonly title?: string;
  readonly description?: string;
  readonly fixedProviderId?: string;
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function buildRequestOverridesPayload(
  uiOverrides: Array<{ type: 'header' | 'body'; key: string; value?: string | undefined }> | undefined,
): { headers?: Record<string, string | null>; body?: Record<string, unknown> } | null {
  if (!uiOverrides || uiOverrides.length === 0) {
    return null;
  }
  const headers: Record<string, string | null> = {};
  const body: Record<string, unknown> = {};

  for (const item of uiOverrides) {
    if (item.type === 'header') {
      headers[item.key] = item.value === undefined || item.value.trim() === '' ? null : item.value;
      continue;
    }

    const valIsNull = item.value === undefined || item.value.trim() === '';
    const tempKey = tryParseJson(item.key);
    body[typeof tempKey === 'string' ? tempKey : item.key] = valIsNull ? null : tryParseJson(item.value ?? '');
  }

  const overrides: { headers?: Record<string, string | null>; body?: Record<string, unknown> } = {};
  if (Object.keys(headers).length > 0) {
    overrides.headers = headers;
  }
  if (Object.keys(body).length > 0) {
    overrides.body = body;
  }

  return Object.keys(overrides).length > 0 ? overrides : null;
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: providerRes, isLoading: providersLoading } = useQuery({
    queryKey: ['admin_providers_all'],
    queryFn: async () =>
      await listProviders({
        limit: 500, // fetch all for selection
      }),
    enabled: open,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      type: 'chat',
      max_tokens: 128,
      provider_id: fixedProviderId ?? '',
      capabilities: [],
      supported_parameters: [],
      pricing_tiers: [{ start_tokens: 0, max_tokens: 128, input_price: 0, output_price: 0, cache_price: 0 }],
      rpm_limit: null,
      tpm_limit: null,
      timeout_ms: null,
      request_overrides_ui: [],
    },
  });

  // Watch fields
  const currentProviderId = useWatch({ control: form.control, name: 'provider_id' });
  const currentMaxTokens = useWatch({ control: form.control, name: 'max_tokens' });
  const currentPricingTiers = useWatch({ control: form.control, name: 'pricing_tiers' });
  const modelType = useWatch({ control: form.control, name: 'type' });

  // 提前计算提供商列表（须在 useWatch 之后、useEffect 之前）
  const providers = providerRes?.ok === true ? providerRes.data.data : [];

  // 根据当前选中提供商动态过滤可用模型类型
  const selectedProvider = providers.find((p) => p.id === currentProviderId);
  const rawAllowed = selectedProvider?.supported_model_types ?? [];
  const allowedTypes: string[] = rawAllowed.length > 0 ? rawAllowed : MODEL_TYPE_OPTIONS.map((o) => o.id);
  const visibleTypeOptions = MODEL_TYPE_OPTIONS.filter((o) => allowedTypes.includes(o.id));

  // Initialize form
  useEffect(() => {
    if (!open) {
      return;
    }

    if (!currentRow) {
      form.reset({
        id: '',
        name: '',
        type: 'chat',
        max_tokens: 128,
        provider_id: fixedProviderId ?? '',
        capabilities: [],
        supported_parameters: [],
        pricing_tiers: [{ start_tokens: 0, max_tokens: 128, input_price: 0, output_price: 0, cache_price: 0 }],
        rpm_limit: null,
        tpm_limit: null,
        timeout_ms: null,
        request_overrides_ui: [],
      });
      setSearchQuery('');
      return;
    }

    form.reset({
      id: currentRow.id,
      name: currentRow.name,
      type: (currentRow as { type?: string }).type ?? currentRow.model_type,
      max_tokens: Math.round(currentRow.max_tokens / 1000),
      provider_id: currentRow.provider_id,
      capabilities: currentRow.capabilities,
      supported_parameters: (currentRow as { supported_parameters?: string[] }).supported_parameters ?? [],
      pricing_tiers:
        (currentRow.pricing_tiers?.length ?? 0) > 0
          ? (currentRow.pricing_tiers?.map((p) => ({
              start_tokens: Math.round(p.start_tokens / 1000),
              max_tokens: Math.round((p.max_tokens ?? currentRow.max_tokens) / 1000),
              input_price: p.input_price,
              output_price: p.output_price,
              cache_price: p.cache_price,
            })) ?? [])
          : [
              {
                start_tokens: 0,
                max_tokens: Math.round(currentRow.max_tokens / 1000),
                input_price: 0,
                output_price: 0,
                cache_price: 0,
              },
            ],
      rpm_limit: currentRow.rpm_limit,
      tpm_limit: currentRow.tpm_limit,
      timeout_ms: currentRow.timeout_ms ?? null,
    });

    // Initialize request overrides UI array
    const overridesUi: Array<{
      type: 'header' | 'body';
      key: string;
      value: string;
    }> = [];
    const overrides = currentRow.request_overrides;

    for (const [k, v] of Object.entries(overrides?.headers ?? {})) {
      overridesUi.push({
        type: 'header',
        key: k,
        value: v ?? '',
      });
    }

    for (const [k, v] of Object.entries(overrides?.body ?? {})) {
      let textValue = '';
      if (v !== null && v !== undefined) {
        textValue = typeof v === 'string' ? v : JSON.stringify(v);
      }
      overridesUi.push({
        type: 'body',
        key: k,
        value: textValue,
      });
    }

    form.setValue('request_overrides_ui', overridesUi);
  }, [open, currentRow, form, fixedProviderId]);

  // 当选定提供商变更且当前模型类型不再被支持时，自动重置为首个合法类型
  useEffect(() => {
    if (!currentProviderId) {
      return;
    }
    if (allowedTypes.includes(modelType)) {
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
      type CreationPayload = Omit<
        ProviderModel,
        'id' | 'provider_id' | 'object' | 'created_at' | 'updated_at' | 'is_active'
      >;
      const payload: CreationPayload = {
        name: values.name,
        model_type: values.type as 'chat' | 'embedding',
        max_tokens: values.max_tokens * 1000,
        capabilities: values.capabilities,
        parameters: values.supported_parameters as unknown as Record<string, unknown>,
        pricing_tiers: values.pricing_tiers.map((t, index) => ({
          ...t,
          start_tokens: t.start_tokens * 1000,
          max_tokens: index === values.pricing_tiers.length - 1 ? null : t.max_tokens * 1000,
        })),
        rpm_limit: values.rpm_limit ?? null,
        tpm_limit: values.tpm_limit ?? null,
        timeout_ms: values.timeout_ms ?? null,
      };

      const parsedOverrides = buildRequestOverridesPayload(values.request_overrides_ui);
      payload.request_overrides = parsedOverrides;

      await (mode === 'edit' && currentRow
        ? updateProviderModel(currentRow.id, payload)
        : createProviderModel({
            ...payload,
            id: values.id || values.name,
            provider_id: values.provider_id,
          }));

      if (onSuccess) {
        await onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Operation failed',
      });
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
    const matched = providers.find((p) => p.id === id);
    if (mode === 'create' && matched && form.getValues('id') === '') {
      // auto fill prefix
      // form.setValue('id', `${matched.id}-`, { shouldDirty: false })
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
        className="flex h-[85vh] max-h-[850px] min-h-[540px] w-[95vw] flex-row gap-0 overflow-hidden p-0 sm:max-w-[1024px]"
      >
        {/* 左侧选择栏 */}
        <ProviderSelector
          providers={filteredOpts}
          isLoading={providersLoading}
          selectedProviderId={currentProviderId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={handleProviderSelect}
          disabled={mode === 'edit'}
        />

        {/* 右侧配置区 */}
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
              onClick={() => {
                onOpenChange(false);
              }}
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
                                  onChange={(e) => {
                                    field.onChange(Number.parseInt(e.target.value, 10));
                                  }}
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

                    <FormField
                      control={form.control}
                      name="rpm_limit"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                          <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                            <Activity className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">
                              {t('modelsPage.providerModels.rpmLimit', 'RPM 限制')}
                            </span>
                          </FormLabel>
                          <div className="space-y-1.5">
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder={t('modelsPage.providerModels.unlimited', '留空或 0 代表无限制')}
                                value={field.value === null ? '' : field.value}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : Number.parseInt(e.target.value, 10);
                                  field.onChange(val);
                                }}
                                className="bg-muted/10 font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tpm_limit"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                          <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                            <Activity className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">
                              {t('modelsPage.providerModels.tpmLimit', 'TPM 限制')}
                            </span>
                          </FormLabel>
                          <div className="space-y-1.5">
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder={t('modelsPage.providerModels.unlimited', '留空或 0 代表无限制')}
                                value={field.value === null ? '' : field.value}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : Number.parseInt(e.target.value, 10);
                                  field.onChange(val);
                                }}
                                className="bg-muted/10 font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeout_ms"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                          <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                            <Timer className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">
                              {t('modelsPage.providerModels.timeoutMs', '超时时间 (ms)')}
                            </span>
                          </FormLabel>
                          <div className="space-y-1.5">
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder={t('modelsPage.providerModels.defaultTimeout', '留空则使用系统默认')}
                                value={field.value ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : Number.parseInt(e.target.value, 10);
                                  field.onChange(val);
                                }}
                                className="bg-muted/10 font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <CapabilitiesSelector control={form.control} name="capabilities" modelType={modelType} />

                    <SupportedParametersSelector
                      control={form.control}
                      name="supported_parameters"
                      modelType={modelType}
                    />

                    <RequestOverridesEditor name="request_overrides_ui" />

                    <div className="text-foreground">
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
                  </div>
                </form>
              </Form>

              <DialogFooter className="shrink-0 border-t bg-muted/30 px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                  }}
                  disabled={isSubmitting}
                >
                  {t('common.cancel', '取消')}
                </Button>
                <Button form="provider-models-form" type="submit" disabled={isSubmitting || !currentProviderId}>
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
