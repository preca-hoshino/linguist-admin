import type { Control, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { cn } from '@/utils/utils';
import { CAPABILITIES_MAP, CHAT_CAPABILITIES } from '../constants';

interface CapabilitiesSelectorProps<T extends FieldValues> {
  readonly control: Control<T>;
  readonly name: Path<T>;
  readonly modelType: string;
}

export function CapabilitiesSelector<T extends FieldValues>({
  control,
  name,
  modelType,
}: CapabilitiesSelectorProps<T>): React.JSX.Element {
  const { t } = useTranslation();
  const capList = CAPABILITIES_MAP[modelType] ?? CHAT_CAPABILITIES;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid grid-cols-[140px_1fr] items-start gap-5 space-y-0">
          <FormLabel className="text-left text-muted-foreground">
            <span className="font-medium text-foreground">
              {t('modelsPage.providerModels.capabilities', '模型能力')}
            </span>
          </FormLabel>
          <div className="mt-0 space-y-1.5">
            <div className="flex flex-wrap gap-2">
              {capList.map((cap) => {
                const isSelected = (field.value as string[] | undefined)?.includes(cap.id);
                return (
                  <Button
                    key={cap.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = new Set<string>(field.value as string[] | undefined);
                      if (current.has(cap.id)) {
                        current.delete(cap.id);
                      } else {
                        current.add(cap.id);
                      }
                      field.onChange([...current]);
                    }}
                    className={cn(
                      'h-8 rounded-full border px-4 font-normal shadow-none transition-all',
                      isSelected
                        ? cap.activeClass
                        : 'border-input/60 bg-transparent text-muted-foreground hover:bg-muted',
                    )}
                  >
                    <cap.icon className={cn('mr-1.5 h-3.5 w-3.5', isSelected ? cap.iconClass : '')} />
                    {t(cap.i18nLabel, cap.label)}
                  </Button>
                );
              })}
            </div>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
