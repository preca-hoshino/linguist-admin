import { Settings2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';

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

  const [activeTab, setActiveTab] = useState<'header' | 'body'>('header');
  const watchData = (useWatch({ control, name }) as Array<{ type?: string }> | undefined) ?? [];

  const visibleCount = fields.filter((f, index) => {
    const t = watchData[index]?.type ?? (f as { type?: string }).type;
    return t === activeTab;
  }).length;

  return (
    <FormItem className="grid grid-cols-[140px_1fr] items-start gap-5 space-y-0">
      <div className="mt-2 space-y-2">
        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
          <Settings2 className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">
            {t('modelsPage.providerModels.requestOverrides', '请求覆写')}
          </span>
        </FormLabel>
        <p className="mr-2 text-xs leading-normal text-muted-foreground">
          {t(
            'modelsPage.providerModels.requestOverridesDesc',
            '发起模型请求时强制覆写 Header 或 JSON Body。将值留空将在发出前彻底移除该字段。对于 Body，其键和值均支持原生的 JSON 语法的反序列化。',
          )}
        </p>
      </div>
      <div className="space-y-3">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as 'header' | 'body');
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>
        </Tabs>

        {visibleCount === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            {t('modelsPage.providerModels.noRequestOverrides', '暂无重写规则，点击下方按钮添加。')}
          </div>
        )}
        {fields.map((field, index) => {
          const type = watchData[index]?.type ?? (field as { type?: string }).type;
          const isVisible = type === activeTab;

          return (
            <div key={field.id} className={isVisible ? 'flex items-center gap-2' : 'hidden'}>
              <FormField
                control={control}
                name={`${name}.${index}.type`}
                render={({ field: vField }) => <input type="hidden" {...vField} value={vField.value as string} />}
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
                name={`${name}.${index}.value`}
                render={({ field: vField }) => {
                  return (
                    <FormItem className="flex-1 space-y-0">
                      <FormControl>
                        <Input
                          {...vField}
                          value={vField.value !== undefined && vField.value !== null ? String(vField.value) : ''}
                          placeholder={t('common.value', '留空代表删除该字段')}
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
          );
        })}
        <Button
          type="button"
          variant="outline"
          className="mt-2 w-full border-dashed"
          onClick={() => {
            append({ type: activeTab, key: '', value: '' });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('modelsPage.providerModels.addOverride', '添加规则')}
        </Button>
      </div>
    </FormItem>
  );
}
