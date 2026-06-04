import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Box, Braces, Fingerprint, MessageSquare, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { createApp, updateApp } from '@/api/apps';
import { listVirtualMcps } from '@/api/mcp/virtual-mcps';
import { listVirtualModels } from '@/api/model/virtual-models';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePermission } from '@/stores/permission-store';
import type { App } from '@/types/app';
import { AllowedResourcePanel } from './components/AllowedResourcePanel';

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

// ── 模型类型图标 ──────────────────────────────────────────────────────────
const MODEL_TYPE_ICON: Record<string, typeof Box> = {
  chat: MessageSquare,
  embedding: Braces,
};

export function AppsMutateDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: AppsMutateDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const isUpdate = !!currentRow;
  const canEdit = usePermission('apps', 'edit');

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

  // ── 准入资源选择的派生状态 ─────────────────────────────────────────────
  const selectedModelIds = form
    .watch('allowed_model_ids')
    .map((m) => m.id)
    .filter((id) => id !== '');

  const selectedMcpIds = form
    .watch('allowed_mcp_ids')
    .map((m) => m.id)
    .filter((id) => id !== '');

  const handleToggleModel = (id: string): void => {
    const current = form.getValues('allowed_model_ids');
    const idx = current.findIndex((m) => m.id === id);
    if (idx >= 0) {
      form.setValue(
        'allowed_model_ids',
        current.filter((_, i) => i !== idx),
      );
    } else {
      form.setValue('allowed_model_ids', [...current, { id }]);
    }
  };

  const handleToggleMcp = (id: string): void => {
    const current = form.getValues('allowed_mcp_ids');
    const idx = current.findIndex((m) => m.id === id);
    if (idx >= 0) {
      form.setValue(
        'allowed_mcp_ids',
        current.filter((_, i) => i !== idx),
      );
    } else {
      form.setValue('allowed_mcp_ids', [...current, { id }]);
    }
  };

  // ── 模型类型图标渲染器 ─────────────────────────────────────────────────
  const renderModelIcon = (item: { type?: string }): React.JSX.Element => {
    const IconComp = MODEL_TYPE_ICON[item.type ?? ''] ?? Box;
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm">
        <IconComp className="h-3.5 w-3.5" />
      </span>
    );
  };

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

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-10 lg:grid-cols-2">
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

                {/* 右侧 Tab 区: 准入虚拟模型 / 虚拟MCP */}
                <div className="mt-1 -mr-4 flex flex-col overflow-hidden pt-1 pr-4 pb-4">
                  <Tabs defaultValue="models" className="flex h-full flex-col">
                    <TabsList className="w-full shrink-0">
                      <TabsTrigger value="models">{t('apps.tabModels', 'Virtual Models')}</TabsTrigger>
                      <TabsTrigger value="mcps">{t('apps.tabMcps', 'Virtual MCPs')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="models" className="flex-1 overflow-hidden pt-3">
                      <AllowedResourcePanel
                        items={virtualModels.map((vm) => ({
                          id: vm.id,
                          name: vm.name,
                          type: vm.model_type,
                        }))}
                        selectedIds={selectedModelIds}
                        onToggle={handleToggleModel}
                        t={t}
                        renderIcon={renderModelIcon}
                      />
                    </TabsContent>
                    <TabsContent value="mcps" className="flex-1 overflow-hidden pt-3">
                      <AllowedResourcePanel
                        items={virtualMcps.map((vmcp) => ({ id: vmcp.id, name: vmcp.name }))}
                        selectedIds={selectedMcpIds}
                        onToggle={handleToggleMcp}
                        t={t}
                      />
                    </TabsContent>
                  </Tabs>
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
          <Button type="submit" form="apps-form" disabled={form.formState.isSubmitting || !canEdit}>
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
