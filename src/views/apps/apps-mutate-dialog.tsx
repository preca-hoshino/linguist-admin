import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import { Box, Braces, Fingerprint, ListFilter, MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { type UseFormReturn, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { createApp, updateApp } from '@/api/apps';
import { listVirtualModels } from '@/api/model/virtual-models';
import { listVirtualMcps } from '@/api/mcp/virtual-mcps';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import type { App } from '@/types/app';

interface AppsMutateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentRow?: App | null;
  readonly onSuccess?: () => void | Promise<void>;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  allowed_model_ids: z.array(z.object({ id: z.string().min(1, 'ID is required') })),
  allowed_mcp_ids: z.array(z.object({ id: z.string().min(1, 'ID is required') })),
});

type AppForm = z.infer<typeof formSchema>;

interface AppAllowedListProps {
  readonly form: UseFormReturn<AppForm>;
  readonly name: 'allowed_model_ids' | 'allowed_mcp_ids';
  readonly options?: { id: string; name: string; type?: string }[];
  readonly isSelect?: boolean;
  readonly t: TFunction<'translation', undefined>;
  readonly itemName: string;
}

const MODEL_TYPE_ICON: Record<string, typeof Box> = {
  chat: MessageSquare,
  embedding: Braces,
};

function AppAllowedList({ form, name, options, isSelect, t, itemName }: AppAllowedListProps): React.JSX.Element {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  return (
    <div className="flex flex-col gap-3 py-2">
      {fields.length === 0 && (
        <div className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          {name === 'allowed_model_ids'
            ? t('apps.noAllowedModels', 'No specific models configured. API keys will have no access to models.')
            : t('apps.noAllowedMcps', 'No specific MCPs configured. API keys will have no access to MCPs.')}
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-3 rounded-md border bg-background p-2.5 shadow-sm">
          <div className="min-w-0 flex-1">
            <FormField
              control={form.control}
              name={`${name}.${index}.id`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  {isSelect && options ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${itemName}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.map((opt) => {
                          const IconComp = (opt.type ?? '') === '' ? Box : (MODEL_TYPE_ICON[opt.type as string] ?? Box);
                          return (
                            <SelectItem key={opt.id} value={opt.id}>
                              <div className="flex items-center gap-2">
                                <IconComp className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="block w-full truncate">{opt.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl>
                      <Input {...field} placeholder={`Enter ${itemName} ID`} />
                    </FormControl>
                  )}
                  <FormMessage className="mt-1 text-xs" />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive/90"
            onClick={() => {
              remove(index);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="mt-1 h-9 w-full border-dashed text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        onClick={() => {
          append({ id: '' });
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        {name === 'allowed_model_ids'
          ? t('apps.addAllowedModel', 'Add Allowed Model')
          : t('apps.addAllowedMcp', 'Add Allowed MCP')}
      </Button>
    </div>
  );
}

export function AppsMutateDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: AppsMutateDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const isUpdate = !!currentRow;

  const { data: virtualModels = [] } = useQuery({
    queryKey: ['virtual-models-list'],
    queryFn: async () => {
      const res = await listVirtualModels();
      if (!res.ok) {
        throw new Error('Failed to load virtual models');
      }
      return res.data.data;
    },
    enabled: open,
    staleTime: 60_000,
  });

  const { data: virtualMcps = [] } = useQuery({
    queryKey: ['virtual-mcps-list'],
    queryFn: async () => {
      const res = await listVirtualMcps();
      if (!res.ok) {
        throw new Error('Failed to load virtual MCPs');
      }
      return res.data.data;
    },
    enabled: open,
    staleTime: 60_000,
  });

  const form = useForm<AppForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      allowed_model_ids: [],
      allowed_mcp_ids: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          name: currentRow.name,
          allowed_model_ids: currentRow.allowed_model_ids.map((id) => ({ id })),
          allowed_mcp_ids: currentRow.allowed_mcp_ids?.map((id) => ({ id })) ?? [],
        });
      } else {
        form.reset({
          name: '',
          allowed_model_ids: [],
          allowed_mcp_ids: [],
        });
      }
    }
  }, [open, currentRow, form]);

  const onSubmit = async (values: AppForm): Promise<void> => {
    try {
      const allowedModelsArray = values.allowed_model_ids.map((m) => m.id.trim()).filter((id) => id !== '');
      const allowedMcpsArray = values.allowed_mcp_ids.map((m) => m.id.trim()).filter((id) => id !== '');

      if (currentRow) {
        const res = await updateApp(currentRow.id, {
          name: values.name,
          allowed_model_ids: allowedModelsArray,
          allowed_mcp_ids: allowedMcpsArray,
        });
        if (!res.ok) {
          throw new Error(res.error.message || 'Update failed');
        }
      } else {
        const res = await createApp({
          name: values.name,
          allowed_model_ids: allowedModelsArray,
          allowed_mcp_ids: allowedMcpsArray,
        });
        if (!res.ok) {
          throw new Error(res.error.message || 'Creation failed');
        }
      }

      await onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Operation failed',
      });
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
        className="flex h-[85vh] max-h-[850px] flex-col overflow-hidden p-0 sm:max-w-[700px] lg:h-[700px] lg:max-w-[1000px] xl:max-w-[1200px]"
      >
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b bg-background px-8 py-5">
          <div className="flex flex-col gap-1.5 text-left">
            <DialogTitle>{isUpdate ? t('apps.edit', 'Edit App') : t('apps.create', 'New App')}</DialogTitle>
            <DialogDescription>
              {isUpdate
                ? t('apps.editDesc', 'Update settings for this application.')
                : t('apps.createDesc', 'Create a new application to hold API Keys and configuration.')}
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

        <Form {...form}>
          <form
            id="apps-form"
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 py-6"
          >
            <div className="flex h-full min-h-0 w-full flex-col gap-6">
              {form.formState.errors.root && (
                <div className="shrink-0 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-10 lg:grid-cols-[360px_1fr]">
                {/* 基础配置区 */}
                <div className="-mr-4 flex flex-col gap-6 overflow-y-auto pt-1 pr-4 pb-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                          <Fingerprint className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">{t('apps.name', 'Name')}</span>
                        </FormLabel>
                        <div className="space-y-1.5">
                          <FormControl>
                            <Input {...field} placeholder={t('apps.namePlaceholder', 'e.g. Production App')} />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* 右侧手风琴区: 准入列表 */}
                <div className="mt-1 -mr-4 flex flex-col gap-3 overflow-y-auto pt-1 pr-4 pb-4">
                  <Accordion type="multiple" defaultValue={['models', 'mcps']} className="w-full">
                    <AccordionItem value="models" className="border-none">
                      <AccordionTrigger className="rounded-md bg-muted/40 px-4 py-3 text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-2">
                          <ListFilter className="h-4 w-4" />
                          {t('apps.allowedModels', 'Allowed Models')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-1 pt-4 pb-2">
                        <AppAllowedList
                          form={form}
                          name="allowed_model_ids"
                          isSelect={true}
                          options={virtualModels.map((vm) => ({ id: vm.id, name: vm.name, type: vm.model_type }))}
                          t={t}
                          itemName="Model"
                        />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="mcps" className="mt-4 border-none">
                      <AccordionTrigger className="rounded-md bg-muted/40 px-4 py-3 text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-2">
                          <ListFilter className="h-4 w-4" />
                          {t('apps.allowedMcps', 'Allowed MCPs')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-1 pt-4 pb-2">
                        <AppAllowedList
                          form={form}
                          name="allowed_mcp_ids"
                          isSelect={true}
                          options={virtualMcps.map((vmcp) => ({ id: vmcp.id, name: vmcp.name }))}
                          t={t}
                          itemName="MCP"
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </form>
        </Form>

        {/* 底部按钮 */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-muted/30 px-8 py-4">
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
          <Button type="submit" form="apps-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {isUpdate ? t('common.save', 'Save') : t('common.create', 'Create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
