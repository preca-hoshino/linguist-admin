import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/utils/utils';

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

  const visibleFields = fields.filter((f, index) => {
    const t = watchData[index]?.type ?? (f as { type?: string }).type;
    return t === activeTab;
  });

  return (
    <div className="space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as 'header' | 'body');
        }}
        className="w-full"
      >
        <TabsList className="h-9 w-full">
          <TabsTrigger value="header" className="flex-1 text-sm">
            Header
          </TabsTrigger>
          <TabsTrigger value="body" className="flex-1 text-sm">
            Body
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {visibleFields.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-8">
          <span className="text-sm text-muted-foreground">
            {t('modelsPage.providerModels.noRequestOverrides', '暂无重写规则，点击下方按钮添加。')}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={() => {
              append({ type: activeTab, key: '', value: '' });
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {activeTab === 'header' ? '添加 Header' : '添加 Body 字段'}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const type = watchData[index]?.type ?? (field as { type?: string }).type;
            const isVisible = type === activeTab;

            return (
              <div
                key={field.id}
                className={cn(
                  'flex items-center gap-2 rounded-lg border bg-background px-3 py-2 transition-colors',
                  isVisible ? 'flex' : 'hidden',
                )}
              >
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
                          placeholder="Key"
                          className="h-8 border-0 bg-transparent px-1 font-mono text-sm shadow-none focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span className="select-none text-xs text-muted-foreground">:</span>
                <FormField
                  control={control}
                  name={`${name}.${index}.value`}
                  render={({ field: vField }) => {
                    return (
                      <FormItem className="flex-[2] space-y-0">
                        <FormControl>
                          <Input
                            {...vField}
                            value={vField.value !== undefined && vField.value !== null ? String(vField.value) : ''}
                            placeholder="Value（留空则删除该字段）"
                            className="h-8 border-0 bg-transparent px-1 font-mono text-sm shadow-none focus-visible:ring-0"
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
                  className="h-7 w-7 shrink-0 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    remove(index);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full border border-dashed text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              append({ type: activeTab, key: '', value: '' });
            }}
          >
            <Plus className="mr-1 h-3 w-3" />
            {activeTab === 'header' ? '添加 Header' : '添加 Body 字段'}
          </Button>
        </div>
      )}
    </div>
  );
}
