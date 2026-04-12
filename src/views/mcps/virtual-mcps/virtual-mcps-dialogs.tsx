import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useVirtualMcps } from './virtual-mcps-context';
import type {
  McpProvider,
  McpVirtualServer,
  McpVirtualServerCreateInput,
  McpVirtualServerUpdateInput,
} from '@/types/mcp';
import { listMcpProviders } from '@/api/mcp-providers';

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Virtual MCP</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete <strong>{selectedServer?.name}</strong>?
          </div>
          <div className="flex justify-end gap-2">
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

  useEffect(() => {
    if (open) {
      // 加载可用 Providers 列表
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
    setToolFilterList((prev) => {
      if (prev.includes(toolName)) {
        return prev.filter((t) => t !== toolName);
      }
      return [...prev, toolName];
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Virtual MCP' : 'Edit Virtual MCP'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Search Tools" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
                  <FormLabel>Backend Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormItem>
                  <FormLabel>Tool Filter Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      className="cursor-pointer"
                      onClick={() => {
                        toggleTool(tool);
                      }}
                    >
                      {tool} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type tool name and press Enter"
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
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
