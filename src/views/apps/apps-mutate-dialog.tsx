import { zodResolver } from '@hookform/resolvers/zod';
import { Fingerprint, ImageIcon, ListFilter, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { createApp, updateApp } from '@/api/apps';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import type { App } from '@/types/app';

interface AppsMutateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentRow?: App | null;
  readonly onSuccess?: () => void | Promise<void>;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().optional(),
  allowed_models_raw: z.string().optional(),
});

type AppForm = z.infer<typeof formSchema>;

export function AppsMutateDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: AppsMutateDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const isUpdate = !!currentRow;

  const form = useForm<AppForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      icon: '',
      allowed_models_raw: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          name: currentRow.name,
          icon: currentRow.icon ?? '',
          allowed_models_raw: currentRow.allowed_model_ids.join(', '),
        });
      } else {
        form.reset({
          name: '',
          icon: '',
          allowed_models_raw: '',
        });
      }
    }
  }, [open, currentRow, form]);

  const onSubmit = async (values: AppForm): Promise<void> => {
    try {
      // Parse allowed models
      const allowedModelsArray =
        values.allowed_models_raw !== undefined && values.allowed_models_raw !== ''
          ? values.allowed_models_raw
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s !== '')
          : [];

      if (currentRow !== null && currentRow !== undefined) {
        const res = await updateApp(currentRow.id, {
          name: values.name,
          icon: values.icon ?? null,
          allowed_model_ids: allowedModelsArray,
        });
        if (!res.ok) {
          throw new Error(res.error.message || 'Update failed');
        }
      } else {
        const res = await createApp({
          name: values.name,
          icon: values.icon ?? null,
          allowed_model_ids: allowedModelsArray,
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
      <DialogContent showCloseButton={false} className="flex flex-col overflow-hidden p-0 sm:max-w-[500px]">
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b bg-background px-6 py-5">
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
            className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-6"
          >
            <div className="flex h-full min-h-0 w-full flex-col gap-6">
              {form.formState.errors.root && (
                <div className="shrink-0 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5 space-y-0">
                    <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                      <Fingerprint className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">{t('apps.name', 'Name')}</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('apps.namePlaceholder', 'e.g. Production App')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5 space-y-0">
                    <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">{t('apps.icon', 'Icon (Emoji/URL)')}</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('apps.iconPlaceholder', '📱')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowed_models_raw"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5 space-y-0">
                    <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">{t('apps.allowedModels', 'Allowed Models')}</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('apps.allowedModelsPlaceholder', 'gpt-4, claude-3-opus')} />
                    </FormControl>
                    <p className="text-[13px] text-muted-foreground">
                      {t('apps.allowedModelsHelp', 'Comma separated list of model IDs. Leave blank for all.')}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        {/* 底部按钮栏 */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4">
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
