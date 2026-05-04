/* eslint-disable sonarjs/cognitive-complexity */
import { zodResolver } from '@hookform/resolvers/zod';
import { DeepSeek, Gemini, Github, NewAPI, ProviderIcon, Volcengine, XiaomiMiMo } from '@lobehub/icons';
import { Activity, Globe, Network, Timer, Type, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { createProvider, updateProvider } from '@/api/model/providers';
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
import type { Provider } from '@/types';
import { cn } from '@/utils/utils';
import { CredentialSection } from './components/CredentialSection';
import { type KindOption, ProviderKindSelector } from './components/ProviderKindSelector';
import { KIND_OPTIONS } from './constants';
import { UnitInput, UnitTabs, useUnitInput } from '@/components/UnitInput';

interface ProvidersMutateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentRow?: Provider;
  readonly onSuccess?: () => void | Promise<void>;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  kind: z.string().min(1, 'Kind is required'),
  // base_url 对 copilot 可为空
  base_url: z.string().optional(),
  api_key: z.string().optional(),
  // 高级配置
  http_proxy: z.string().optional(),
  // 并发限制（原始 Token 数，null = 无限制）
  rpm_limit: z.number().int().positive().nullable().optional(),
  tpm_limit: z.number().int().positive().nullable().optional(),
});

export type ProviderForm = z.infer<typeof formSchema>;

export function ProvidersMutateDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: ProvidersMutateDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const isUpdate = !!currentRow;

  const [searchQuery, setSearchQuery] = useState('');
  const filteredKindOptions = KIND_OPTIONS.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.value.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const [showApiKey, setShowApiKey] = useState(false);
  const [proxyMode, setProxyMode] = useState<'off' | 'custom'>(
    (currentRow?.config.http_proxy ?? '') === '' ? 'off' : 'custom',
  );
  // Copilot OAuth 凭证与附加信息暂存
  const [copilotAuthData, setCopilotAuthData] = useState<{
    accessToken: string;
    user?: { login: string; avatarUrl: string; htmlUrl: string };
  } | null>(null);

  const form = useForm<ProviderForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      kind: KIND_OPTIONS[0]?.value ?? '',
      base_url: KIND_OPTIONS[0]?.defaultBaseUrl ?? '',
      api_key: '',
      http_proxy: '',
      rpm_limit: null,
      tpm_limit: null,
    },
  });

  // Avoid destructuring form.watch logic multiple times via useWatch directly where needed
  const selectedKind = useWatch({ control: form.control, name: 'kind' });

  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          name: currentRow.name,
          kind: currentRow.kind,
          base_url: currentRow.base_url,
          api_key: currentRow.credential_type === 'api_key' ? (currentRow.credential.key as string) || '' : '',
          http_proxy: currentRow.config.http_proxy,
          rpm_limit: currentRow.rpm_limit,
          tpm_limit: currentRow.tpm_limit,
        });
        setTimeout(() => {
          setProxyMode(currentRow.config.http_proxy ? 'custom' : 'off');
        }, 0);
      } else {
        form.reset({
          name: '',
          kind: KIND_OPTIONS[0]?.value ?? '',
          base_url: KIND_OPTIONS[0]?.defaultBaseUrl ?? '',
          api_key: '',
          http_proxy: '',
          rpm_limit: null,
          tpm_limit: null,
        });
        setTimeout(() => {
          setProxyMode('off');
        }, 0);
      }
      setTimeout(() => {
        setShowApiKey(false);
        setSearchQuery('');
        setCopilotAuthData(null);
      }, 0);
    }
  }, [open, currentRow, form]);

  const onSubmit = async (data: ProviderForm): Promise<void> => {
    try {
      const config: Record<string, unknown> = {
        ...currentRow?.config,
        http_proxy: proxyMode === 'custom' ? (data.http_proxy ?? '') : '',
      };

      // 判断当前 kind 是否为 copilot
      const isCopilotKind = KIND_OPTIONS.find((o) => o.value === data.kind)?.credentialType === 'copilot';

      if (isCopilotKind && copilotAuthData?.user) {
        config.github_info = copilotAuthData.user;
      }

      const rpmLimitVal = data.rpm_limit ?? null;
      const tpmLimitVal = data.tpm_limit ?? null;

      if (currentRow) {
        const payload: Record<string, unknown> = {
          name: data.name,
          kind: data.kind,
          config,
          rpm_limit: rpmLimitVal,
          tpm_limit: tpmLimitVal,
        };

        if (isCopilotKind) {
          // Copilot 类型：不提交 base_url，仅当有新凭证时才提交 credential
          // 防止将作为 UI 占位符的 '(saved)' 发送给后端覆盖真实 Token
          if (copilotAuthData !== null && copilotAuthData.accessToken !== '(saved)') {
            payload.credential_type = 'copilot';
            payload.credential = { accessToken: copilotAuthData.accessToken };
          }
        } else {
          // API Key 类型：提交 base_url，仅在有新 key 时才更新凭证
          payload.base_url = data.base_url ?? '';
          if ((data.api_key ?? '') !== '') {
            payload.credential_type = 'api_key';
            payload.credential = { key: data.api_key };
          }
        }

        await updateProvider(currentRow.id, payload as Parameters<typeof updateProvider>[1]);
      } else {
        if (isCopilotKind) {
          // Copilot 创建：必须先完成赋权
          if (copilotAuthData === null) {
            form.setError('root', {
              message: t('modelsPage.copilot.authRequired', 'Please complete GitHub authorization first'),
            });
            return;
          }
          await createProvider({
            name: data.name,
            kind: data.kind,
            base_url: '',
            credential_type: 'copilot',
            credential: { accessToken: copilotAuthData.accessToken },
            config,
            rpm_limit: rpmLimitVal,
            tpm_limit: tpmLimitVal,
          });
        } else {
          // API Key 创建模式：必须有 base_url
          if ((data.base_url ?? '') === '') {
            form.setError('base_url', { message: 'Base URL is required' });
            return;
          }
          await createProvider({
            name: data.name,
            kind: data.kind,
            base_url: data.base_url ?? '',
            credential_type: 'api_key',
            credential: { key: data.api_key ?? '' },
            config,
            rpm_limit: rpmLimitVal,
            tpm_limit: tpmLimitVal,
          });
        }
      }

      onOpenChange(false);
      form.reset();
      setCopilotAuthData(null);
      if (onSuccess) {
        void onSuccess();
      }
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Operation failed',
      });
    }
  };

  const handleSelectOption = (opt: KindOption): void => {
    form.setValue('kind', opt.value, { shouldValidate: true });
    // 创建模式和编辑模式（base_url 为空时）均自动填充默认 base_url
    const currentBaseUrl = form.getValues('base_url') ?? '';
    if (!isUpdate || currentBaseUrl === '') {
      form.setValue('base_url', opt.defaultBaseUrl ?? '', { shouldValidate: true });
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
        className="flex h-[85vh] max-h-[850px] min-h-[540px] w-[95vw] flex-row gap-0 overflow-hidden p-0 sm:max-w-[960px]"
      >
        {/* 左侧提供商类型选择栏 */}
        <ProviderKindSelector
          options={filteredKindOptions}
          searchQuery={searchQuery}
          selectedKind={selectedKind}
          onSearchChange={setSearchQuery}
          onSelect={handleSelectOption}
        />

        {/* 右侧配置区 */}
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b px-8 py-5">
            <div className="flex flex-col gap-1.5 text-left">
              <DialogTitle>
                {isUpdate
                  ? t('modelsPage.providers.edit', 'Edit Provider')
                  : t('modelsPage.providers.create', 'New Provider')}
              </DialogTitle>
              <DialogDescription>
                {isUpdate
                  ? t('modelsPage.providers.editDesc', 'Update settings and configurations for this provider.')
                  : t('modelsPage.providers.createDesc', 'Configure provider settings.')}
              </DialogDescription>
            </div>
            <Button
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

          <Form {...form}>
            <form
              id="providers-form"
              onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
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
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                      <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                        <Type className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{t('modelsPage.providers.name', 'Name')}</span>
                      </FormLabel>
                      <div className="space-y-1.5">
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                              {((): React.JSX.Element => {
                                const selectedOption = KIND_OPTIONS.find((opt) => opt.value === selectedKind) ??
                                  KIND_OPTIONS[0] ?? { label: 'Custom', value: 'custom', defaultBaseUrl: '' };
                                const val = selectedOption.value;
                                return (
                                  <>
                                    {val === 'gemini' && <Gemini size={16} className="fill-current" />}
                                    {val === 'deepseek' && <DeepSeek size={16} className="fill-current" />}
                                    {val === 'volcengine' && <Volcengine size={16} className="fill-current" />}
                                    {val === 'mimo' && <XiaomiMiMo size={16} className="fill-current" />}
                                    {val === 'copilot' && <Github className="h-4 w-4" />}
                                    {val === 'newapi' && <NewAPI size={16} className="fill-current" />}
                                    {val !== 'gemini' &&
                                      val !== 'deepseek' &&
                                      val !== 'volcengine' &&
                                      val !== 'mimo' &&
                                      val !== 'copilot' &&
                                      val !== 'newapi' && (
                                        <ProviderIcon
                                          provider={val as 'openai'}
                                          size={16}
                                          type="mono"
                                          className="fill-current"
                                        />
                                      )}
                                    <span className="font-medium text-foreground">{selectedOption.label}</span>
                                  </>
                                );
                              })()}
                            </div>
                            <Input
                              {...field}
                              placeholder={t('modelsPage.providers.namePlaceholder', 'My Provider')}
                              className="flex-1"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="base_url"
                  render={({ field }) => {
                    const fallbackUrl =
                      KIND_OPTIONS.find((opt) => opt.value === selectedKind)?.defaultBaseUrl ??
                      'https://api.example.com';
                    const displayUrl = field.value === '' ? fallbackUrl : field.value;
                    const endpoint =
                      KIND_OPTIONS.find((opt) => opt.value === selectedKind)?.exampleEndpoint ?? '/chat/completions';
                    let u = displayUrl ?? '';
                    while (u.endsWith('/')) {
                      u = u.slice(0, -1);
                    }
                    const curlUrl = `${u}${endpoint}`;

                    return (
                      <FormItem className="grid grid-cols-[140px_1fr] items-start gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left leading-9 text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">
                            {t('modelsPage.providers.baseUrl', 'Base URL')}
                          </span>
                        </FormLabel>
                        <div className="min-w-0 space-y-2">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={
                                selectedKind === 'copilot'
                                  ? t('modelsPage.copilot.autoDetected', 'Auto-detected')
                                  : fallbackUrl
                              }
                              className="h-9 w-full"
                              disabled={selectedKind === 'copilot'}
                            />
                          </FormControl>
                          {selectedKind !== 'copilot' && (
                            <p className="truncate px-1 text-xs text-muted-foreground">{curlUrl}</p>
                          )}
                          <FormMessage />
                        </div>
                      </FormItem>
                    );
                  }}
                />

                <CredentialSection
                  showApiKey={showApiKey}
                  setShowApiKey={setShowApiKey}
                  form={form}
                  selectedKind={selectedKind}
                  isUpdate={isUpdate}
                  currentRow={currentRow}
                  setCopilotAuthData={setCopilotAuthData}
                />
                {/* Proxy */}
                <div className="grid grid-cols-[140px_1fr] items-start gap-5">
                  <div className="flex items-center justify-start gap-2 text-sm leading-9 text-muted-foreground">
                    <Network className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">
                      {t('modelsPage.providers.httpProxy', 'HTTP Proxy')}
                    </span>
                  </div>
                  <div className="space-y-3 pt-0">
                    <div className="flex w-48 overflow-hidden rounded-lg bg-muted p-1 text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setProxyMode('off');
                        }}
                        className={cn(
                          'flex-1 rounded-md py-1 text-center transition-all',
                          proxyMode === 'off'
                            ? 'bg-background font-medium text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {t('common.disabled', 'Disabled')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProxyMode('custom');
                        }}
                        className={cn(
                          'flex-1 rounded-md py-1 text-center transition-all',
                          proxyMode === 'custom'
                            ? 'bg-background font-medium text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {t('common.custom', 'Custom')}
                      </button>
                    </div>
                    {proxyMode === 'custom' && (
                      <FormField
                        control={form.control}
                        name="http_proxy"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="http://127.0.0.1:7890" className="h-9" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* 并发限制 */}
                <div className="grid grid-cols-[140px_1fr] items-center gap-5">
                  <div className="flex items-center justify-start gap-2 text-sm text-muted-foreground">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">RPM Limit</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="rpm_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : Number.parseInt(e.target.value, 10);
                              field.onChange(val);
                            }}
                            className="h-9 w-40 font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-[140px_1fr] items-center gap-5">
                  <div className="flex items-center justify-start gap-2 text-sm text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">TPM Limit</span>
                  </div>
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
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <UnitInput
                                value={unit.displayValue}
                                onChange={unit.onInputChange}
                                placeholder={unit.placeholder}
                              />
                              <UnitTabs units={unit.units} selected={unit.unitLabel} onSelect={unit.onUnitChange} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
              disabled={form.formState.isSubmitting}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button form="providers-form" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('common.saving', 'Saving...')}
                </span>
              ) : (
                t('common.save', 'Save Changes')
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
