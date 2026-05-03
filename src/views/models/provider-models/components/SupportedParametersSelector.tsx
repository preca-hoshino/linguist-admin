import type { Control, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { cn } from '@/utils/utils';
import { PARAMETERS_MAP, CHAT_PARAMETERS, getProviderSupportedParamIds } from '../constants';

interface SupportedParametersSelectorProps<T extends FieldValues> {
  readonly control: Control<T>;
  readonly name: Path<T>;
  readonly modelType: string;
  /** 提供商 kind，用于过滤只显示该提供商原生支持的参数。不传则显示全部。 */
  readonly providerKind?: string | undefined;
}

export function SupportedParametersSelector<T extends FieldValues>({
  control,
  name,
  modelType,
  providerKind,
}: SupportedParametersSelectorProps<T>): React.JSX.Element {
  const { t } = useTranslation();
  // 优先按 providerKind 过滤，否则回退到按 modelType 显示所有参数
  let paramList = PARAMETERS_MAP[modelType] ?? CHAT_PARAMETERS;

  if (providerKind !== undefined && providerKind !== '') {
    const supportedIds = getProviderSupportedParamIds(providerKind, modelType);
    if (supportedIds !== null) {
      // 只保留该提供商原生支持的参数
      paramList = paramList.filter((p) => supportedIds.has(p.id));
    }
    // 若 supportedIds === null（未知 providerKind 或无定义），则不过滤，沿用默认全部列表
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid grid-cols-[140px_1fr] items-start gap-5 space-y-0">
          <FormLabel className="text-left text-muted-foreground">
            <span className="font-medium text-foreground">
              {t('modelsPage.providerModels.supportedParameters', '支持参数')}
            </span>
          </FormLabel>
          <div className="mt-0 space-y-1.5">
            <div className="flex flex-wrap gap-2">
              {paramList.map((param) => {
                const isSelected = (field.value as string[] | undefined)?.includes(param.id);
                return (
                  <Button
                    key={param.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = new Set<string>(field.value as string[] | undefined);
                      if (current.has(param.id)) {
                        current.delete(param.id);
                      } else {
                        current.add(param.id);
                      }
                      field.onChange([...current]);
                    }}
                    className={cn(
                      'h-8 rounded-full border px-4 font-normal shadow-none transition-all',
                      isSelected
                        ? param.activeClass
                        : 'border-input/60 bg-transparent text-muted-foreground hover:bg-muted',
                    )}
                  >
                    <param.icon className={cn('mr-1.5 h-3.5 w-3.5', isSelected ? param.iconClass : '')} />
                    {param.label}
                  </Button>
                );
              })}
            </div>
            <FormDescription>
              {t(
                'modelsPage.providerModels.supportedParametersDesc',
                '声明此后端原生支持的调优参数，用于在多模型路由中提升优先级。未声明的参数在其发往该模型时将被静默剥离以防报错。',
              )}
            </FormDescription>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
