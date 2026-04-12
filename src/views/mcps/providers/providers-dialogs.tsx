import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash, Plus, X, Key, Terminal, Network, Fingerprint, Info, Globe, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

import { cn } from '@/utils/utils';
import { useProviders } from './providers-context';
import type { McpProvider, McpProviderCreateInput, McpProviderUpdateInput } from '@/types/mcp';

// -------------------------
// Zod Schema
// -------------------------
const providerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  transport_type: z.enum(['stdio', 'streamable_http', 'sse'] as const),
  endpoint_url: z.string().optional(),
  headers: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  stdio_command: z.string().optional(),
  stdio_args: z.array(z.object({ value: z.string() })).optional(),
  api_keys: z.array(z.object({ value: z.string() })).optional(),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

const TRANSPORT_OPTIONS = [
  { id: 'stdio' as const, label: 'stdio', desc: 'Local Command', icon: Terminal },
  { id: 'streamable_http' as const, label: 'HTTP', desc: 'Streamable HTTP', icon: Network },
  { id: 'sse' as const, label: 'SSE', desc: 'Server-Sent Events', icon: Network },
];

/** 显示 {{APIKEY}} 替换说明的提示条 */
function ApikeyHint(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="space-y-0.5 text-amber-700 dark:text-amber-400">
        <p className="font-semibold leading-none tracking-tight">
          {t('mcpsPage.providers.apiKeyHintTitle', '支持 {{APIKEY}} 占位符', { interpolation: { escapeValue: false } })}
        </p>
        <p className="text-xs text-amber-600/80 dark:text-amber-400/70">
          {t(
            'mcpsPage.providers.apiKeyHintDesc',
            '在 URL / 命令 / 参数等任意字段中写入此标记，网关会在每次连接时自动从右侧凭证池中轮换注入实际 API Key。',
            { interpolation: { escapeValue: false } },
          )}
        </p>
      </div>
    </div>
  );
}

// -------------------------
// Main Entry
// -------------------------
export function ProvidersDialogs(): React.JSX.Element {
  const { dialogState, setDialogState, createProvider, updateProvider, deleteProvider } = useProviders();
  const { t } = useTranslation();
  const { createOpen, editOpen, deleteOpen, selectedProvider } = dialogState;

  const closeCreate = (): void => {
    setDialogState((p) => ({ ...p, createOpen: false }));
  };
  const closeEdit = (): void => {
    setDialogState((p) => ({ ...p, editOpen: false, selectedProvider: null }));
  };
  const closeDelete = (): void => {
    setDialogState((p) => ({ ...p, deleteOpen: false, selectedProvider: null }));
  };

  return (
    <>
      <MutateProviderDialog
        open={createOpen}
        onOpenChange={(open): void => {
          if (!open) {
            closeCreate();
          }
        }}
        mode="create"
        onSubmit={async (data) => {
          const success = await createProvider(data as McpProviderCreateInput);
          if (success) {
            toast.success(t('mcpsPage.providers.createdSuccess', 'Provider created successfully'));
            closeCreate();
          }
        }}
      />

      <MutateProviderDialog
        open={editOpen}
        onOpenChange={(open): void => {
          if (!open) {
            closeEdit();
          }
        }}
        mode="edit"
        initialData={selectedProvider}
        onSubmit={async (data) => {
          if (!selectedProvider) {
            return;
          }
          const success = await updateProvider(selectedProvider.id, data as McpProviderUpdateInput);
          if (success) {
            toast.success(t('mcpsPage.providers.updatedSuccess', 'Provider updated successfully'));
            closeEdit();
          }
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={closeDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('mcpsPage.providers.deleteTitle', 'Delete MCP Provider')}</DialogTitle>
            <DialogDescription>{t('common.cannotBeUndone', 'This action cannot be undone.')}</DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            {t(
              'mcpsPage.providers.deleteConfirm',
              'Are you sure you want to delete this provider? All associated connections will be terminated.',
            )}
            <br />
            <strong className="text-foreground">{selectedProvider?.name}</strong>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeDelete}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedProvider) {
                  return;
                }
                const success = await deleteProvider(selectedProvider.id);
                if (success) {
                  toast.success(t('mcpsPage.providers.deletedSuccess', 'Provider deleted'));
                  closeDelete();
                }
              }}
            >
              {t('common.delete', 'Delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------------------------
// Form Dialog
// -------------------------
function MutateProviderDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mode: 'create' | 'edit';
  readonly initialData?: McpProvider | null;
  readonly onSubmit: (data: McpProviderCreateInput | McpProviderUpdateInput) => Promise<void>;
}): React.JSX.Element {
  const { t } = useTranslation();
  const isEdit = mode === 'edit';

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: '',
      transport_type: 'stdio',
      endpoint_url: '',
      headers: [],
      stdio_command: '',
      stdio_args: [],
      api_keys: [],
    },
  });

  const {
    fields: apiKeys,
    append: appendApiKey,
    remove: removeApiKey,
  } = useFieldArray({
    control: form.control,
    name: 'api_keys',
  });

  const {
    fields: stdioArgs,
    append: appendStdioArg,
    remove: removeStdioArg,
  } = useFieldArray({
    control: form.control,
    name: 'stdio_args',
  });

  const {
    fields: headerFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control: form.control,
    name: 'headers',
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const transportType = form.watch('transport_type');

  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        form.reset({
          name: initialData.name,
          transport_type: initialData.transport_type,
          endpoint_url: initialData.endpoint_url || '',
          headers: Object.entries(initialData.headers).map(([k, v]) => ({ key: k, value: v })),
          stdio_command: initialData.stdio_command || '',
          stdio_args: initialData.stdio_args.map((v: string) => ({ value: v })),
          api_keys: initialData.api_keys.map((k: string) => ({ value: k })),
        });
      } else {
        form.reset({
          name: '',
          transport_type: 'stdio',
          endpoint_url: '',
          headers: [],
          stdio_command: '',
          stdio_args: [],
          api_keys: [],
        });
      }
    }
  }, [open, isEdit, initialData, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const isStdio = values.transport_type === 'stdio';
    const parsedArgs = (values.stdio_args ?? []).map((a) => a.value).filter((v) => v !== '');
    
    const parsedHeaders: Record<string, string> = {};
    for (const h of values.headers ?? []) {
      if (h.key !== '' && h.value !== '') {
        parsedHeaders[h.key] = h.value;
      }
    }

    const payload: Partial<McpProviderCreateInput> = {
      name: values.name,
      transport_type: values.transport_type,
      api_keys: (values.api_keys ?? []).map((k) => k.value).filter((v) => v !== ''),
    };

    if (isStdio) {
      payload.stdio_command = (values.stdio_command ?? '') === '' ? undefined : values.stdio_command;
      payload.stdio_args = parsedArgs.length > 0 ? parsedArgs : undefined;
    } else {
      payload.endpoint_url = (values.endpoint_url ?? '') === '' ? undefined : values.endpoint_url;
      payload.headers = Object.keys(parsedHeaders).length > 0 ? parsedHeaders : undefined;
    }

    await onSubmit(payload as McpProviderCreateInput | McpProviderUpdateInput);
  });

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
        className="flex h-[85vh] max-h-[820px] flex-col overflow-hidden p-0 sm:max-w-[700px] lg:max-w-[960px] xl:max-w-[1200px]"
      >
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b bg-background px-8 py-5">
          <div className="flex flex-col gap-1.5 text-left">
            <DialogTitle>
              {isEdit
                ? t('mcpsPage.providers.edit', 'Edit MCP Provider')
                : t('mcpsPage.providers.create', 'Add MCP Provider')}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t(
                    'mcpsPage.providers.editDesc',
                    'Update transport settings and API key credentials for this provider.',
                  )
                : t(
                    'mcpsPage.providers.createDesc',
                    'Configure a new MCP backend. Use {{APIKEY}} in fields to enable automatic key rotation.',
                    { interpolation: { escapeValue: false } },
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
            id="mcp-provider-form"
            onSubmit={(e) => void handleSubmit(e)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
              {/* 左栏：基础配置 */}
              <div className="flex w-full lg:w-1/2 flex-col gap-6 overflow-y-auto border-b lg:border-r lg:border-b-0 px-8 py-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {t('mcpsPage.providers.basicConfig', '基础配置')}
                  </h3>
                </div>

                {form.formState.errors.root != null && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {/* Provider Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                          <Fingerprint className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">{t('mcpsPage.providers.name', 'Name')}</span>
                        </FormLabel>
                        <div className="space-y-1.5">
                          <FormControl>
                            <Input
                              placeholder={t('mcpsPage.providers.namePlaceholder', 'e.g. Local Search Tools')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Transport Type */}
                  <FormField
                    control={form.control}
                    name="transport_type"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                          <Network className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">
                            {t('mcpsPage.providers.transportType', 'Transport')}
                          </span>
                        </FormLabel>
                        <div className="space-y-1.5">
                          <div className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                            {TRANSPORT_OPTIONS.map((opt) => {
                              const isSelected = field.value === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    field.onChange(opt.id);
                                  }}
                                  className={cn(
                                    'inline-flex flex-1 items-center justify-center rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                    isSelected ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground',
                                  )}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* 动态字段：stdio */}
                  {transportType === 'stdio' ? (
                    <>
                      <FormField
                        control={form.control}
                        name="stdio_command"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                            <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                              <Terminal className="h-3.5 w-3.5" />
                              <span className="font-medium text-foreground">
                                {t('mcpsPage.providers.command', 'Command')}
                              </span>
                            </FormLabel>
                            <div className="space-y-1.5">
                              <FormControl>
                                <Input
                                  placeholder={t(
                                    'mcpsPage.providers.commandPlaceholder',
                                    'e.g. npx or /usr/bin/python3',
                                  )}
                                  className="font-mono text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-[140px_1fr] items-start gap-5">
                        <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                          <Settings2 className="h-3.5 w-3.5" />
                          <span className="text-sm font-medium text-foreground">
                            {t('mcpsPage.providers.arguments', 'Arguments')}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {stdioArgs.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`stdio_args.${index}.value`}
                                render={({ field: subField }) => (
                                  <FormItem className="flex-1 space-y-0">
                                    <FormControl>
                                      <Input
                                        placeholder={index === 0 ? '-y' : `@org/server`}
                                        className="font-mono text-xs shadow-none"
                                        {...subField}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => { removeStdioArg(index); }}
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full border-dashed bg-transparent mt-1"
                            onClick={() => { appendStdioArg({ value: '' }); }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {t('mcpsPage.providers.addArgument', 'Add Argument')}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* HTTP Endpoint */}
                      <FormField
                        control={form.control}
                        name="endpoint_url"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                            <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                              <Globe className="h-3.5 w-3.5" />
                              <span className="font-medium text-foreground">
                                {t('mcpsPage.providers.endpointUrl', 'Endpoint URL')}
                              </span>
                            </FormLabel>
                            <div className="space-y-1.5">
                              <FormControl>
                                <Input
                                  placeholder={t(
                                    'mcpsPage.providers.endpointPlaceholder',
                                    'https://api.example.com/mcp?key={{APIKEY}}',
                                  )}
                                  className="font-mono text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* HTTP Headers */}
                      <div className="grid grid-cols-[140px_1fr] items-start gap-5">
                        <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                          <Settings2 className="h-3.5 w-3.5" />
                          <span className="text-sm font-medium text-foreground">
                            {t('mcpsPage.providers.headersRow', 'Headers')}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {headerFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`headers.${index}.key`}
                                render={({ field: subField }) => (
                                  <FormItem className="flex-[0.4] space-y-0">
                                    <FormControl>
                                      <Input
                                        placeholder="Key"
                                        className="font-mono text-xs shadow-none"
                                        {...subField}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`headers.${index}.value`}
                                render={({ field: subField }) => (
                                  <FormItem className="flex-[0.6] space-y-0">
                                    <FormControl>
                                      <Input
                                        placeholder="Value"
                                        className="font-mono text-xs shadow-none"
                                        {...subField}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => { removeHeader(index); }}
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full border-dashed bg-transparent mt-1"
                            onClick={() => { appendHeader({ key: '', value: '' }); }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {t('mcpsPage.providers.addHeader', 'Add Header')}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 右栏：凭证池 */}
              <div className="flex w-full lg:w-1/2 flex-col gap-6 overflow-y-auto px-8 py-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {t('mcpsPage.providers.apiKeyManagement', 'API KEY 管理')}
                  </h3>
                </div>

                <ApikeyHint />

                <div className="flex flex-col gap-3 mt-2">
                  {apiKeys.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`api_keys.${index}.value`}
                        render={({ field: subField }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormControl>
                              <Input
                                placeholder={`${t('mcpsPage.providers.key', 'Key')} ${String(index + 1)}`}
                                className="font-mono text-xs shadow-none border-border"
                                {...subField}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => { removeApiKey(index); }}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed bg-transparent mt-1"
                  onClick={() => {
                    appendApiKey({ value: '' });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('mcpsPage.providers.addKey', 'Add API Key')}
                </Button>

                {apiKeys.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/10 py-8 text-center text-sm text-muted-foreground">
                    <Key className="mb-2 h-8 w-8 opacity-20" />
                    <p className="font-medium">{t('mcpsPage.providers.noCredentials', 'No credentials yet')}</p>
                    <p className="text-xs opacity-70">
                      {t('mcpsPage.providers.noCredentialsDesc', 'Required if you use {{APIKEY}} in config', {
                        interpolation: { escapeValue: false },
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>

        {/* 固定底部按钮栏 */}
        <DialogFooter className="flex shrink-0 items-center justify-end gap-3 border-t bg-muted/30 px-8 py-4 sm:justify-end">
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
          <Button type="submit" form="mcp-provider-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {isEdit ? t('common.save', 'Save Changes') : t('common.create', 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
