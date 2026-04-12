import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useProviders } from './providers-context';
import type { McpProvider, McpProviderCreateInput, McpProviderUpdateInput } from '@/types/mcp';

const providerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  transport_type: z.enum(['stdio', 'streamable_http', 'sse'] as const),
  endpoint_url: z.string().optional(),
  stdio_command: z.string().optional(),
  stdio_args: z.string().optional(), // We'll split this by space later
  api_keys: z.array(z.object({ value: z.string() })).optional(),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

export function ProvidersDialogs(): React.JSX.Element {
  const { dialogState, setDialogState, createProvider, updateProvider, deleteProvider } = useProviders();
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
            toast.success('Provider created');
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
            toast.success('Provider updated');
            closeEdit();
          }
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={closeDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete MCP Provider</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete <strong>{selectedProvider?.name}</strong>?
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedProvider) {
                  return;
                }
                const success = await deleteProvider(selectedProvider.id);
                if (success) {
                  toast.success('Provider deleted');
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
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: '',
      transport_type: 'stdio',
      endpoint_url: '',
      stdio_command: '',
      stdio_args: '',
      api_keys: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'api_keys',
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const transportType = form.watch('transport_type');

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        form.reset({
          name: initialData.name,
          transport_type: initialData.transport_type,
          endpoint_url: initialData.endpoint_url,
          stdio_command: initialData.stdio_command,
          stdio_args: initialData.stdio_args.join(' '),
          api_keys: initialData.api_keys.map((k: string) => ({ value: k })),
        });
      } else {
        form.reset({
          name: '',
          transport_type: 'stdio',
          endpoint_url: '',
          stdio_command: '',
          stdio_args: '',
          api_keys: [],
        });
      }
    }
  }, [open, mode, initialData, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: Partial<McpProviderCreateInput> = {
      name: values.name,
      transport_type: values.transport_type,
      api_keys: values.api_keys?.map((k) => k.value).filter(Boolean) ?? [],
    };
    if (values.transport_type === 'stdio') {
      if (values.stdio_command != null && values.stdio_command !== '') {
        payload.stdio_command = values.stdio_command;
      }
      if (values.stdio_args != null && values.stdio_args !== '') {
        payload.stdio_args = values.stdio_args.split(' ');
      }
    } else {
      if (values.endpoint_url != null && values.endpoint_url !== '') {
        payload.endpoint_url = values.endpoint_url;
      }
    }
    await onSubmit(payload as McpProviderCreateInput | McpProviderUpdateInput);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add MCP Provider' : 'Edit MCP Provider'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6 pt-4">
            <div className="space-y-4 border-r pr-6">
              <h3 className="font-semibold mb-2">Base & Config</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Local Tools" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transport_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transport type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stdio">stdio (Local Command)</SelectItem>
                        <SelectItem value="streamable_http">Streamable HTTP</SelectItem>
                        <SelectItem value="sse">SSE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {transportType === 'stdio' ? (
                <>
                  <FormField
                    control={form.control}
                    name="stdio_command"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Command</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. npx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stdio_args"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arguments (Space separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. -y @modelcontextprotocol/server" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="endpoint_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endpoint URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold mb-2">Credentials Pool</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`api_keys.${index}.value`}
                    render={({ field: subField }) => (
                      <FormItem className="flex-1 space-y-0">
                        <FormControl>
                          <Input placeholder="API Key" {...subField} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive w-10 flex-shrink-0"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => {
                  append({ value: '' });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add API Key
              </Button>
            </div>

            <div className="lg:col-span-2 flex justify-end gap-2 pt-4 border-t">
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
