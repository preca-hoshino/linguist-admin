import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Fingerprint, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { createApiKey, updateApiKey } from '@/api/api-keys';
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
import type { ApiKey } from '@/types';

interface ApiKeysMutateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentRow?: ApiKey | null;
  readonly onSuccess?: () => void | Promise<void>;
  readonly onKeyGenerated?: (key: string) => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  expires_at: z.string().optional().nullable(),
});

type ApiKeyForm = z.infer<typeof formSchema>;

// Format date to local datetime-local format if present
const formatForInput = (isoDate: string | null | undefined): string => {
  if (isoDate === undefined || isoDate === null || isoDate === '') {
    return '';
  }
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  // Convert to YYYY-MM-DDThh:mm
  const tzOffset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

const parseFromInput = (localStr: string | null | undefined): string | null => {
  if (localStr === undefined || localStr === null || localStr === '') {
    return null;
  }
  const d = new Date(localStr);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export function ApiKeysMutateDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
  onKeyGenerated,
}: ApiKeysMutateDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const isUpdate = !!currentRow;

  const form = useForm<ApiKeyForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      expires_at: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          name: currentRow.name,
          expires_at: formatForInput(currentRow.expires_at),
        });
      } else {
        form.reset({
          name: '',
          expires_at: '',
        });
      }
    }
  }, [open, currentRow, form]);

  const handleUpdate = async (values: ApiKeyForm, expiresAtIso: string | null): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!currentRow?.id) {
      return;
    }
    const res = await updateApiKey(currentRow.id, {
      name: values.name,
      expires_at: expiresAtIso,
    });

    if (!res.ok) {
      throw new Error(res.error.message || 'Update failed');
    }
  };

  const handleCreate = async (values: ApiKeyForm, expiresAtIso: string | null): Promise<void> => {
    const payload: Parameters<typeof createApiKey>[0] = {
      name: values.name,
    };
    if (expiresAtIso !== null && expiresAtIso !== '') {
      payload.expires_at = expiresAtIso;
    }
    const res = await createApiKey(payload);

    if (!res.ok) {
      throw new Error(res.error.message || 'Creation failed');
    }

    if (res.data.key !== undefined && res.data.key !== '' && onKeyGenerated !== undefined) {
      onKeyGenerated(res.data.key);
    }
  };

  const onSubmit = async (values: ApiKeyForm): Promise<void> => {
    try {
      const parsed = parseFromInput(values.expires_at);
      const expiresAtIso = parsed !== null && parsed !== '' ? parsed : null;

      await (isUpdate ? handleUpdate(values, expiresAtIso) : handleCreate(values, expiresAtIso));

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
            <DialogTitle>
              {isUpdate ? t('apiKeys.edit', 'Edit API Key') : t('apiKeys.create', 'New API Key')}
            </DialogTitle>
            <DialogDescription>
              {isUpdate
                ? t('apiKeys.editDesc', 'Update settings for this API Key.')
                : t('apiKeys.createDesc', 'Create a new API Key for integration.')}
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
            id="api-keys-form"
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
                      <span className="font-medium text-foreground">{t('apiKeys.name', 'Name')}</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('apiKeys.namePlaceholder', 'e.g. Production Key')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5 space-y-0">
                    <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">{t('apiKeys.expiresAt', 'Expires At')}</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <p className="text-[13px] text-muted-foreground">
                      {t('apiKeys.expiresAtHelp', 'Leave blank if you want the key to never expire.')}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        {/* 底部按钮栏 */}
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
          <Button type="submit" form="api-keys-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {isUpdate ? t('common.save', 'Save') : t('common.create', 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
