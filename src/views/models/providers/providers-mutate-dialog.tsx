import { zodResolver } from '@hookform/resolvers/zod';
import { DeepSeek, Gemini, ProviderIcon, Volcengine } from '@lobehub/icons';
import { Eye, EyeOff, Globe, Key, Network, Type, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { createProvider, updateProvider } from '@/api/providers';
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
import { CustomHeadersInput } from './components/CustomHeadersInput';
import { type KindOption, ProviderKindSelector } from './components/ProviderKindSelector';
import { KIND_OPTIONS } from './constants';

interface ProvidersMutateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentRow?: Provider;
  readonly onSuccess?: () => void | Promise<void>;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  kind: z.string().min(1, 'Kind is required'),
  base_url: z.string().min(1, 'Base URL is required'),
  api_key: z.string().optional(),
  // 高级配置
  http_proxy: z.string().optional(),
  custom_headers: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});

type ProviderForm = z.infer<typeof formSchema>;

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

  const [proxyMode, setProxyMode] = useState<'off' | 'custom'>(
    (currentRow?.config.http_proxy ?? '') === '' ? 'off' : 'custom',
  );
  const [showApiKey, setShowApiKey] = useState(false);

  const form = useForm<ProviderForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      kind: KIND_OPTIONS[0]?.value ?? '',
      base_url: KIND_OPTIONS[0]?.defaultBaseUrl ?? '',
      api_key: '',
      http_proxy: '',
      custom_headers: [],
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
          custom_headers:
            Object.keys(currentRow.config.custom_headers).length > 0
              ? Object.entries(currentRow.config.custom_headers).map(([k, v]) => ({ key: k, value: v }))
              : [],
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
          custom_headers: [],
        });
        setTimeout(() => {
          setProxyMode('off');
        }, 0);
      }
      setTimeout(() => {
        setShowApiKey(false);
        setSearchQuery('');
      }, 0);
    }
  }, [open, currentRow, form]);

  const onSubmit = async (data: ProviderForm): Promise<void> => {
    try {
      // 解析 custom_headers 数组到 Record
      const customHeaders = Object.fromEntries(
        (data.custom_headers ?? []).filter((h) => h.key.trim() !== '').map((h) => [h.key.trim(), h.value]),
      );

      const config = {
        http_proxy: proxyMode === 'custom' ? (data.http_proxy ?? '') : '',
        custom_headers: customHeaders,
      };

      if (currentRow) {
        const payload: Record<string, unknown> = {
          name: data.name,
          kind: data.kind,
          base_url: data.base_url,
          config,
        };
        // 仅在有新 key 时才更新凭证
        if ((data.api_key ?? '') !== '') {
          payload.credential_type = 'api_key';
          payload.credential = { key: data.api_key };
        }
        await updateProvider(currentRow.id, payload as Parameters<typeof updateProvider>[1]);
      } else {
        await createProvider({
          name: data.name,
          kind: data.kind,
          base_url: data.base_url,
          credential_type: 'api_key',
          credential: { key: data.api_key ?? '' },
          config,
        });
      }
      onOpenChange(false);
      form.reset();
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
    if (!isUpdate) {
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
                                    {val !== 'gemini' && val !== 'deepseek' && val !== 'volcengine' && (
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
                    let u = displayUrl;
                    while (u.endsWith('/')) {
                      u = u.slice(0, -1);
                    }
                    const curlUrl = u + endpoint;

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
                            <Input {...field} placeholder={fallbackUrl} className="h-9 w-full" />
                          </FormControl>
                          <p className="truncate px-1 text-xs text-muted-foreground">{curlUrl}</p>
                          <FormMessage />
                        </div>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="api_key"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                      <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                        <Key className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">
                          {t('modelsPage.providers.apiKey', 'API Key')}
                        </span>
                      </FormLabel>
                      <div className="space-y-1.5">
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showApiKey ? 'text' : 'password'}
                              placeholder={isUpdate ? '••••••••  (leave blank to keep current)' : 'sk-...'}
                              className="pr-10 font-mono"
                            />
                            <button
                              type="button"
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setShowApiKey(!showApiKey);
                              }}
                            >
                              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
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

                {/* Custom Headers 抽离后的组件 */}
                <CustomHeadersInput form={form} name="custom_headers" />
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
