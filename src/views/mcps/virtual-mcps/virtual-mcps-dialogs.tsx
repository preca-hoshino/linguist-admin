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
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/utils';
import { useVirtualMcps } from './virtual-mcps-context';
import type {
  McpProvider,
  McpVirtualServer,
  McpVirtualServerCreateInput,
  McpVirtualServerUpdateInput,
  McpToolInfo,
} from '@/types/mcp';
import { listMcpProviders, listMcpProviderTools } from '@/api/mcp-providers';

const virtualMcpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
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
          const success = await createServer(data as McpVirtualServerCreateInput);
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
          const success = await updateServer(selectedServer.id, data as McpVirtualServerUpdateInput);
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

function MutateVirtualMcpDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mode: 'create' | 'edit';
  readonly initialData?: McpVirtualServer | null;
  readonly onSubmit: (data: McpVirtualServerCreateInput | McpVirtualServerUpdateInput) => Promise<void>;
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
        setSelectedTools([...initialData.tools]);
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
    const payload: Partial<McpVirtualServerCreateInput> = {
      name: values.name,
      mcp_provider_id: values.mcp_provider_id,
      tools: selectedTools,
    };
    if (values.description != null && values.description !== '') {
      payload.description = values.description;
    }
    await onSubmit(payload as McpVirtualServerCreateInput | McpVirtualServerUpdateInput);
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
        <div className="flex min-h-0 flex-1 overflow-hidden lg:grid lg:grid-cols-[360px_1fr]">
          {/* 左栏：基础配置 */}
          <div className="flex flex-col gap-6 overflow-y-auto border-r px-8 py-6">
            <Form {...form}>
              <form id="virtual-mcp-form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex items-center gap-2 text-muted-foreground">
                        <Fingerprint className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">
                          {t('mcpsPage.virtualMcps.name', 'Name / ID')}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('mcpsPage.virtualMcps.namePlaceholder', 'e.g. Frontend Tools')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex items-center gap-2 text-muted-foreground">
                        <Info className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">
                          {t('mcpsPage.virtualMcps.description', 'Description')}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('mcpsPage.virtualMcps.descPlaceholder', 'Optional description')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mcp_provider_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="flex items-center gap-2 text-muted-foreground">
                        <Server className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">
                          {t('mcpsPage.virtualMcps.backendProvider', 'Backend Provider')}
                        </span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('mcpsPage.virtualMcps.selectProvider', 'Select a provider')} />
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
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t('mcpsPage.virtualMcps.toolsEnabledCount', 'Enabled Tools')}
                    </span>
                    <Badge variant="secondary">{selectedTools.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTools.map((tool) => (
                      <Badge
                        key={tool}
                        variant="default"
                        className="cursor-pointer pr-1 hover:bg-destructive hover:text-destructive-foreground flex items-center gap-1"
                        onClick={() => {
                          toggleTool(tool);
                        }}
                      >
                        {tool}
                        <span className="rounded-full bg-background/20 p-0.5">
                          <X className="h-3 w-3" />
                        </span>
                      </Badge>
                    ))}
                    {selectedTools.length === 0 && (
                      <span className="text-xs text-muted-foreground italic my-1">
                        {t('mcpsPage.virtualMcps.noToolsSelected', 'No tools active')}
                      </span>
                    )}
                  </div>

                  <div className="border-t border-border/40 my-1 pt-3">
                    <Input
                      placeholder={t('mcpsPage.virtualMcps.manualToolEntry', 'Type unknown tool name & press Enter...')}
                      className="h-8 text-xs bg-background"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const target = e.currentTarget;
                          const value = target.value.trim();
                          if (value !== '' && !selectedTools.includes(value)) {
                            setSelectedTools((prev) => [...prev, value]);
                            target.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* 右栏：Tools Selection List */}
          <div className="flex flex-col overflow-hidden bg-muted/10 h-full">
            <div className="flex items-center justify-between border-b px-6 py-4 bg-background sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground w-1/2">
                <Wrench className="h-4 w-4" />
                {t('mcpsPage.virtualMcps.availableTools', 'Tool Configuration')}
              </div>
              <div className="relative w-1/2">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="h-8 pl-8 text-xs bg-muted/30"
                  placeholder={t('common.search', 'Search...')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  disabled={providerId === '' || tools.length === 0}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
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
                  <div className="flex flex-col gap-2.5 pb-4">
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
                            'group flex w-full items-start gap-4 rounded-xl border bg-background p-4 text-left shadow-sm transition-all focus-visible:outline-none focusEnd-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isSelected
                              ? 'border-primary/40 bg-primary/5 shadow-md'
                              : 'hover:border-border hover:bg-muted/30 hover:shadow-md',
                          )}
                        >
                          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <code className="text-sm font-bold text-foreground truncate">{tInfo.name}</code>
                            {tInfo.description != null && tInfo.description !== '' ? (
                              <p
                                className={cn(
                                  'text-xs line-clamp-2 leading-relaxed transition-colors',
                                  isSelected ? 'text-primary/70' : 'text-muted-foreground',
                                )}
                              >
                                {tInfo.description}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground/50 italic">
                                {t('mcpsPage.virtualMcps.noDescription', 'No description available')}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 flex items-center pt-0.5">
                            <Switch
                              checked={isSelected}
                              // We let the parent button's onClick handle the toggle, but we also bind it here
                              // to ensure explicit interaction on the switch works immediately
                              onCheckedChange={(checked) => {
                                // To avoid double firing since button propagates, we don't necessarily need this if the button holds it.
                                // But if we want native Switch handling:
                                if ((checked && !isSelected) || (!checked && isSelected)) {
                                  toggleTool(tInfo.name);
                                }
                              }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
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
