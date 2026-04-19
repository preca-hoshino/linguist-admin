import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { X, Wrench, Server, Loader2, Fingerprint, Info, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/utils';
import { useVirtualMcps } from './virtual-mcps-context';
import type {
  McpProvider,
  VirtualMcp,
  VirtualMcpCreateInput,
  VirtualMcpUpdateInput,
  McpToolInfo,
  VirtualMcpConfig,
} from '@/types/mcp';
import { listMcpProviders, listMcpProviderTools } from '@/api/mcp-providers';

const virtualMcpSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'Name must not contain spaces. Only letters, numbers, hyphens (-), underscores (_), and dots (.) are allowed.',
    ),
  description: z.string().optional(),
  mcp_provider_id: z.string().min(1, 'Provider is required'),
});

type VirtualMcpFormValues = z.infer<typeof virtualMcpSchema>;

export function VirtualMcpsDialogs(): React.JSX.Element {
  const { dialogState, setDialogState, createServer, updateServer, deleteServer } = useVirtualMcps();
  const { t } = useTranslation();
  const { createOpen, editOpen, deleteOpen, selectedServer } = dialogState;

  const closeCreate = (): void => {
    setDialogState((p) => ({ ...p, createOpen: false }));
  };
  const closeEdit = (): void => {
    setDialogState((p) => ({ ...p, editOpen: false, selectedServer: null }));
  };
  const closeDelete = (): void => {
    setDialogState((p) => ({ ...p, deleteOpen: false, selectedServer: null }));
  };

  return (
    <>
      <MutateVirtualMcpDialog
        open={createOpen}
        onOpenChange={(open): void => {
          if (!open) {
            closeCreate();
          }
        }}
        mode="create"
        onSubmit={async (data) => {
          const success = await createServer(data as VirtualMcpCreateInput);
          if (success) {
            toast.success(t('mcpsPage.virtualMcps.createdSuccess', 'Virtual MCP created'));
            closeCreate();
          }
        }}
      />

      <MutateVirtualMcpDialog
        open={editOpen}
        onOpenChange={(open): void => {
          if (!open) {
            closeEdit();
          }
        }}
        mode="edit"
        initialData={selectedServer}
        onSubmit={async (data) => {
          if (!selectedServer) {
            return;
          }
          const success = await updateServer(selectedServer.id, data as VirtualMcpUpdateInput);
          if (success) {
            toast.success(t('mcpsPage.virtualMcps.updatedSuccess', 'Virtual MCP updated'));
            closeEdit();
          }
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={closeDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('mcpsPage.virtualMcps.deleteTitle', 'Delete Virtual MCP')}</DialogTitle>
            <DialogDescription>{t('common.cannotBeUndone', 'This action cannot be undone.')}</DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            {t('mcpsPage.virtualMcps.deleteConfirm', 'Are you sure you want to delete this virtual MCP?')}
            <br />
            <strong className="text-foreground">{selectedServer?.name}</strong>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeDelete}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedServer) {
                  return;
                }
                const success = await deleteServer(selectedServer.id);
                if (success) {
                  toast.success(t('mcpsPage.virtualMcps.deletedSuccess', 'Virtual MCP deleted'));
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

export function MutateVirtualMcpDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mode: 'create' | 'edit';
  readonly initialData?: VirtualMcp | null;
  readonly onSubmit: (data: VirtualMcpCreateInput | VirtualMcpUpdateInput) => Promise<void>;
}): React.JSX.Element {
  const { t } = useTranslation();
  const [providers, setProviders] = useState<McpProvider[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [tools, setTools] = useState<McpToolInfo[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<VirtualMcpFormValues>({
    resolver: zodResolver(virtualMcpSchema),
    defaultValues: {
      name: '',
      description: '',
      mcp_provider_id: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const providerId = form.watch('mcp_provider_id');

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      void listMcpProviders({ limit: 100 }).then((res) => {
        if (res.ok) {
          setProviders(res.data.data);
        }
      });

      if (mode === 'edit' && initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description,
          mcp_provider_id: initialData.mcp_provider_id,
        });
        setSelectedTools([...((initialData.config as VirtualMcpConfig | undefined)?.tools ?? [])]);
      } else {
        form.reset({
          name: '',
          description: '',
          mcp_provider_id: '',
        });
        setSelectedTools([]);
      }
    }
  }, [open, mode, initialData, form]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (providerId === '') {
      setTools([]);
    } else {
      setToolsLoading(true);
      void listMcpProviderTools(providerId)
        .then((res) => {
          if (res.ok) {
            setTools(res.data.data);
          } else {
            setTools([]);
          }
        })
        .finally(() => {
          setToolsLoading(false);
        });
    }
  }, [providerId, open]);

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return tools;
    }
    return tools.filter((t) => t.name.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
  }, [tools, searchQuery]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: Partial<VirtualMcpCreateInput> = {
      name: values.name,
      mcp_provider_id: values.mcp_provider_id,
      config: { tools: selectedTools },
    };
    if (values.description != null && values.description !== '') {
      payload.description = values.description;
    }
    await onSubmit(payload as VirtualMcpCreateInput | VirtualMcpUpdateInput);
  });

  const toggleTool = (toolName: string): void => {
    setSelectedTools((prev) => {
      if (prev.includes(toolName)) {
        return prev.filter((t) => t !== toolName);
      }
      return [...prev, toolName];
    });
  };

  const isEdit = mode === 'edit';

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
        className="flex h-[85vh] max-h-[850px] flex-col overflow-hidden p-0 sm:max-w-[700px] lg:h-[700px] lg:max-w-[1000px] xl:max-w-[1100px]"
      >
        {/* 固定头部 */}
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b bg-background px-8 py-5">
          <div className="flex flex-col gap-1.5 text-left">
            <DialogTitle>
              {isEdit
                ? t('mcpsPage.virtualMcps.edit', 'Edit Virtual MCP')
                : t('mcpsPage.virtualMcps.create', 'Add Virtual MCP')}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t('mcpsPage.virtualMcps.editDesc', 'Update settings and tool filters for this virtual MCP server.')
                : t(
                    'mcpsPage.virtualMcps.createDesc',
                    'Create a new virtual MCP server to route to a backend provider and filter its tools.',
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

        {/* 可滚动内容区双列 */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
          {/* 左栏：基础配置 */}
          <div className="flex w-full lg:w-1/2 flex-col gap-6 overflow-y-auto border-b lg:border-r lg:border-b-0 px-8 py-6 pt-5">
            <div className="text-sm font-semibold text-foreground pb-2">
              {t('mcpsPage.providers.basicConfig', '基础配置')}
            </div>
            <Form {...form}>
              <form id="virtual-mcp-form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                      <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                        <Fingerprint className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">
                          {t('mcpsPage.virtualMcps.name', 'Name / ID')}
                        </span>
                      </FormLabel>
                      <div className="space-y-1.5">
                        <FormControl>
                          <Input
                            placeholder={t('mcpsPage.virtualMcps.namePlaceholder', 'e.g. frontend-tools')}
                            {...field}
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
                        <Info className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">
                          {t('mcpsPage.virtualMcps.description', 'Description')}
                        </span>
                      </FormLabel>
                      <div className="space-y-1.5">
                        <FormControl>
                          <Input
                            placeholder={t('mcpsPage.virtualMcps.descPlaceholder', 'Optional description')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mcp_provider_id"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                      <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                        <Server className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">
                          {t('mcpsPage.virtualMcps.backendProvider', 'Backend Provider')}
                        </span>
                      </FormLabel>
                      <div className="space-y-1.5">
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('mcpsPage.virtualMcps.selectProvider', 'Select a provider')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providers.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          {/* 右栏：Tools Selection List */}
          <div className="flex w-full lg:w-1/2 flex-col overflow-hidden h-full">
            <div className="px-8 pt-5 pb-2 bg-background sticky top-0 z-10 shrink-0">
              <div className="text-sm font-semibold text-foreground pb-4">
                {t('mcpsPage.virtualMcps.toolsManagement', '工具管理')}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9 bg-background"
                  placeholder={t('common.search', 'Search tools...')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  disabled={providerId === '' || tools.length === 0}
                />
              </div>
            </div>

            {tools.length > 0 && providerId !== '' && (
              <div className="flex items-center justify-between px-8 py-2 bg-background text-sm shrink-0">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all-tools"
                    checked={tools.length > 0 && selectedTools.length === tools.length}
                    onCheckedChange={(checked) => {
                      if (checked === true) {
                        setSelectedTools(tools.map((t) => t.name));
                      } else {
                        setSelectedTools([]);
                      }
                    }}
                  />
                  <label htmlFor="select-all-tools" className="font-medium cursor-pointer select-none">
                    {t('common.selectAll', 'Select All')}
                  </label>
                </div>
                <div className="text-muted-foreground">
                  {selectedTools.length} / {tools.length} {t('common.selected', 'Selected')}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto scrollbar-thin px-8 pb-4 space-y-1">
              {((): React.JSX.Element => {
                if (providerId === '') {
                  return (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <Server className="mb-3 h-10 w-10 opacity-20" />
                      <p className="text-[15px] font-medium">
                        {t('mcpsPage.virtualMcps.noProviderSelected', 'No Provider Selected')}
                      </p>
                      <p className="text-sm opacity-70 mt-1">
                        {t(
                          'mcpsPage.virtualMcps.selectProviderHint',
                          'Select a provider on the left to securely configure its tools.',
                        )}
                      </p>
                    </div>
                  );
                }
                if (toolsLoading) {
                  return (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <Loader2 className="mb-3 h-10 w-10 animate-spin opacity-50" />
                      <p className="text-[15px] font-medium">{t('common.loading', 'Loading...')}</p>
                    </div>
                  );
                }
                if (tools.length === 0) {
                  return (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <Wrench className="mb-3 h-10 w-10 opacity-20" />
                      <p className="text-[15px] font-medium">
                        {t('mcpsPage.virtualMcps.noToolsFound', 'No Tools Exposed')}
                      </p>
                      <p className="text-sm opacity-70 mt-1">
                        {t('mcpsPage.virtualMcps.noToolsFoundHint', 'This backend does not advertise any MCP tools.')}
                      </p>
                    </div>
                  );
                }

                if (filteredTools.length === 0) {
                  return (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <Search className="mb-3 h-10 w-10 opacity-20" />
                      <p className="text-[15px] font-medium">{t('common.noResults', 'No Results')}</p>
                    </div>
                  );
                }

                return (
                  <>
                    {filteredTools.map((tInfo) => {
                      const isSelected = selectedTools.includes(tInfo.name);

                      return (
                        <button
                          type="button"
                          key={tInfo.name}
                          onClick={() => {
                            toggleTool(tInfo.name);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-3 rounded-md transition-colors text-sm flex items-center gap-3',
                            isSelected
                              ? 'bg-accent text-accent-foreground shadow-sm border border-border/50'
                              : 'text-foreground hover:bg-muted/50 border border-transparent',
                          )}
                        >
                          <div className="shrink-0 mt-0.5">
                            <Checkbox checked={isSelected} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-mono text-[15px] font-bold tracking-tight">{tInfo.name}</div>
                            <div
                              className={cn(
                                'text-[11px] mt-1 line-clamp-1 font-normal leading-relaxed',
                                isSelected ? 'text-accent-foreground/80' : 'text-muted-foreground',
                              )}
                            >
                              {tInfo.description != null && tInfo.description !== '' ? (
                                tInfo.description
                              ) : (
                                <span className="italic opacity-50">
                                  {t('mcpsPage.virtualMcps.noDescription', 'No description available')}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

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
          <Button type="submit" form="virtual-mcp-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? t('common.save', 'Save Changes') : t('common.create', 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
