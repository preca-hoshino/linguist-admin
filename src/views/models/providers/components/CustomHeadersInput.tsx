import { FileCode, Plus, Trash2 } from 'lucide-react';
import { type ArrayPath, type FieldValues, type Path, type UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';

interface CustomHeadersInputProps<T extends FieldValues> {
  readonly form: UseFormReturn<T>;
  readonly name: ArrayPath<T>; // Example: "custom_headers"
}

export function CustomHeadersInput<T extends FieldValues>({
  form,
  name,
}: CustomHeadersInputProps<T>): React.JSX.Element {
  const { t } = useTranslation();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-5">
      <div className="flex items-center justify-start gap-2 text-left text-sm leading-9 text-muted-foreground">
        <FileCode className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t('modelsPage.providers.customHeaders', 'Custom Headers')}</span>
      </div>
      <div className="min-w-0 space-y-3 pt-1">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name={`${name}.${index}.key` as Path<T>}
              render={({ field: f }) => (
                <FormItem className="min-w-0 flex-1 space-y-0">
                  <FormControl>
                    <Input
                      {...f}
                      placeholder={t('modelsPage.providers.headerKeyPlaceholder', 'Key (e.g. X-Tenant-Id)')}
                      className="h-9 w-full font-mono text-sm shadow-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${name}.${index}.value` as Path<T>}
              render={({ field: f }) => (
                <FormItem className="min-w-0 flex-1 space-y-0">
                  <FormControl>
                    <Input
                      {...f}
                      placeholder={t('common.value', 'Value')}
                      className="h-9 w-full font-mono text-sm shadow-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
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
          size="sm"
          className="h-8 w-full border-dashed text-muted-foreground hover:text-foreground"
          onClick={() => {
            append({ key: '', value: '' } as unknown as Parameters<typeof append>[0]);
          }}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          {t('modelsPage.providers.addHeader', 'Add Header')}
        </Button>
      </div>
    </div>
  );
}
