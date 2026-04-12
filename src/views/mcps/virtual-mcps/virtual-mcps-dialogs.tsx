import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { X, Wrench, Server, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
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
  tool_filter_mode: z.enum(['all', 'allow', 'deny'] as const),
});

type VirtualMcpFormValues = z.infer<typeof virtualMcpSchema>;

export function VirtualMcpsDialogs(): React.JSX.Element {
  const { dialogState, setDialogState, createServer, updateServer, deleteServer } = useVirtualMcps();
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
            toast.success('Virtual MCP created');
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
            toast.success('Virtual MCP updated');
            closeEdit();
          }
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={closeDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Virtual MCP</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">{selectedServer?.name}</strong>?
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedServer) {
                  return;
                }
                const success = await deleteServer(selectedServer.id);
                if (success) {
                  toast.success('Virtual MCP deleted');
                  closeDelete();
                }
              }}
            >
              Delete
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
  const [providers, setProviders] = useState<McpProvider[]>([]);
  const [toolFilterList, setToolFilterList] = useState<string[]>([]);
  const [tools, setTools] = useState<McpToolInfo[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);

  const form = useForm<VirtualMcpFormValues>({
    resolver: zodResolver(virtualMcpSchema),
    defaultValues: {
      name: '',
      description: '',
      mcp_provider_id: '',
      tool_filter_mode: 'all',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const filterMode = form.watch('tool_filter_mode');
   
  const providerId = form.watch('mcp_provider_id');

  useEffect(() => {
    if (open) {
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
          tool_filter_mode: initialData.tool_filter_mode,
        });
        setToolFilterList([...initialData.tool_filter_list]);
      } else {
        form.reset({
          name: '',
          description: '',
          mcp_provider_id: '',
          tool_filter_mode: 'all',
        });
        setToolFilterList([]);
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

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: Partial<McpVirtualServerCreateInput> = {
      name: values.name,
      mcp_provider_id: values.mcp_provider_id,
      tool_filter_mode: values.tool_filter_mode,
    };
    if (values.description != null && values.description !== '') {
      payload.description = values.description;
    }
    if (values.tool_filter_mode !== 'all') {
      payload.tool_filter_list = toolFilterList;
    }
    await onSubmit(payload as McpVirtualServerCreateInput | McpVirtualServerUpdateInput);
  });

  const toggleTool = (toolName: string): void => {
    if (filterMode === 'all') {
      return;
    }
    setToolFilterList((prev) => {
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
        className="flex h-[85vh] max-h-[820px] flex-col overflow-hidden p-0 sm:max-w-[700px] lg:max-w-[1000px]"
      >
        {/* 固定头部 */}
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b bg-background px-8 py-5">
          <div className="flex flex-col gap-1.5 text-left">
            <DialogTitle>{isEdit ? 'Edit Virtual MCP' : 'Add Virtual MCP'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update settings and tool filters for this virtual MCP server.'
                : 'Create a new virtual MCP server to route to a backend provider and filter its tools.'}
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
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* 左栏：基础配置 */}
          <div className="flex w-[55%] flex-col gap-5 overflow-y-auto border-r px-8 py-6">
            <Form {...form}>
              <form id="virtual-mcp-form" onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Frontend Tools" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional description" {...field} />
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
                      <FormLabel>Backend Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
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

                <FormField
                  control={form.control}
                  name="tool_filter_mode"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>Tool Filter Mode</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select filter mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All (No filtering)</SelectItem>
                          <SelectItem value="allow">Allow (Whitelist)</SelectItem>
                          <SelectItem value="deny">Deny (Blacklist)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {filterMode !== 'all' && (
                  <div className="space-y-2">
                    <FormLabel>{filterMode === 'allow' ? 'Allowed Tools' : 'Denied Tools'}</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {toolFilterList.map((tool) => (
                        <Badge
                          key={tool}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            toggleTool(tool);
                          }}
                        >
                          {tool} <span className="ml-1 text-muted-foreground">×</span>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type unknown tool name and press Enter"
                        className="h-8 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.currentTarget;
                            const value = target.value.trim();
                            if (value !== '' && !toolFilterList.includes(value)) {
                              setToolFilterList((prev) => [...prev, value]);
                              target.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      You can click tools in the right panel to toggle them instantly.
                    </p>
                  </div>
                )}
              </form>
            </Form>
          </div>

          {/* 右栏：凭证 / Tools List */}
          <div className="flex w-[45%] flex-col gap-4 overflow-y-auto bg-muted/10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" />
                Available Tools
              </div>
              {tools.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tools.length} tool{tools.length === 1 ? '' : 's'}
                </Badge>
              )}
            </div>

            {((): React.JSX.Element => {
              if (providerId === '') {
                return (
                  <div className="flex shrink-0 flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Server className="mb-2 h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No Provider Selected</p>
                    <p className="text-xs opacity-70">Select a provider to view its tools.</p>
                  </div>
                );
              }
              if (toolsLoading) {
                return (
                  <div className="flex shrink-0 flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin opacity-50" />
                    <p className="text-sm">Loading tools...</p>
                  </div>
                );
              }
              if (tools.length === 0) {
                return (
                  <div className="flex shrink-0 flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Wrench className="mb-2 h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No Tools Found</p>
                    <p className="text-xs opacity-70">This provider does not expose any tools.</p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-3 pb-4">
                  {tools.map((t) => {
                    const isSelected = filterMode !== 'all' && toolFilterList.includes(t.name);
                    let badgeText = 'Unselected';
                    if (isSelected) {
                      badgeText = filterMode === 'allow' ? 'Allowed' : 'Denied';
                    }

                    return (
                      <button
                        key={t.name}
                        type="button"
                        disabled={filterMode === 'all'}
                        className={cn(
                          'flex w-full flex-col gap-1.5 rounded-lg border bg-background p-3 text-left shadow-sm transition-all disabled:opacity-100 disabled:cursor-default',
                          filterMode === 'all' ? '' : 'cursor-pointer hover:border-primary/50',
                          isSelected ? 'border-primary/40 bg-primary/5 shadow-md' : '',
                        )}
                        onClick={() => {
                          toggleTool(t.name);
                        }}
                      >
                        <div className="flex w-full items-start justify-between gap-2">
                          <code className="text-xs font-bold text-foreground break-all">{t.name}</code>
                          {filterMode !== 'all' && (
                            <Badge
                              variant={isSelected ? 'default' : 'outline'}
                              className={cn(
                                'shrink-0 text-[10px] uppercase font-semibold',
                                isSelected ? 'bg-primary text-primary-foreground shadow-none' : 'text-muted-foreground',
                              )}
                            >
                              {badgeText}
                            </Badge>
                          )}
                        </div>
                        {t.description != null && t.description !== '' ? (
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{t.description}</p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* 固定底部按钮栏 */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-muted/30 px-8 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="virtual-mcp-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Virtual MCP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
