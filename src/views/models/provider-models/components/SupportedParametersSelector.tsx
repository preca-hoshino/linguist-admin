import { Settings2 } from 'lucide-react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { cn } from '@/utils/utils';
import { PARAMETERS_MAP, CHAT_PARAMETERS } from '../constants';

interface SupportedParametersSelectorProps<T extends FieldValues> {
  readonly control: Control<T>;
  readonly name: Path<T>;
  readonly modelType: string;
}

export function SupportedParametersSelector<T extends FieldValues>({
  control,
  name,
  modelType,
}: SupportedParametersSelectorProps<T>): React.JSX.Element {
  const { t } = useTranslation();
  const paramList = PARAMETERS_MAP[modelType] ?? CHAT_PARAMETERS;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid grid-cols-[140px_1fr] items-start gap-5 space-y-0">
          <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
            <Settings2 className="h-3.5 w-3.5" />
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
            <p className="text-[0.8rem] text-muted-foreground">
              {t(
                'modelsPage.providerModels.supportedParametersDesc',
                '声明此后端原生支持的调优参数，用于在多模型路由中提升优先级。未声明的参数在其发往该模型时将被静默剥离以防报错。',
              )}
            </p>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
