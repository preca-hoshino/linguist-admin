import { Settings2, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface RequestOverridesEditorProps {
  readonly name?: string;
}

export function RequestOverridesEditor({
  name = 'request_overrides_ui',
}: RequestOverridesEditorProps): React.JSX.Element {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const watchData = (useWatch({ control, name }) as Array<{ action?: string }> | undefined) ?? [];

  return (
    <FormItem className="grid grid-cols-[140px_1fr] items-start gap-5 space-y-0">
      <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground mt-2">
        <Settings2 className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">
          {t('modelsPage.providerModels.requestOverrides', '请求覆写')}
        </span>
      </FormLabel>
      <div className="space-y-3">
        {fields.length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            {t('modelsPage.providerModels.noRequestOverrides', '暂无重写规则，点击下方按钮添加。')}
          </div>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <FormField
              control={control}
              name={`${name}.${index}.type`}
              render={({ field: vField }) => (
                <FormItem className="w-32 shrink-0 space-y-0">
                  <FormControl>
                    <Tabs value={vField.value as string} onValueChange={vField.onChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-9 p-1">
                        <TabsTrigger value="header" className="text-xs">
                          Header
                        </TabsTrigger>
                        <TabsTrigger value="body" className="text-xs">
                          Body
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.key`}
              render={({ field: vField }) => (
                <FormItem className="flex-1 space-y-0">
                  <FormControl>
                    <Input
                      {...vField}
                      value={vField.value as string}
                      placeholder={t('common.key', '键名')}
                      className="h-9"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.action`}
              render={({ field: vField }) => (
                <FormItem className="w-24 shrink-0 space-y-0">
                  <Select onValueChange={vField.onChange} value={vField.value as string}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="override">{t('common.override', '覆盖')}</SelectItem>
                      <SelectItem value="delete">{t('common.delete', '删除')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.value`}
              render={({ field: vField }) => {
                const action = watchData[index]?.action ?? 'override';
                if (action === 'delete') {
                  return <div className="flex-1" />;
                }
                return (
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        {...vField}
                        value={vField.value !== undefined && vField.value !== null ? String(vField.value) : ''}
                        placeholder={t('common.value', '值')}
                        className="h-9"
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
          className="mt-2"
          onClick={() => {
            append({ type: 'header', key: '', action: 'override', value: '' });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('modelsPage.providerModels.addOverride', '添加规则')}
        </Button>
      </div>
    </FormItem>
  );
}
