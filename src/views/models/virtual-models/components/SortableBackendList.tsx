import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DeepSeek, Gemini, Github, ProviderIcon, Volcengine } from '@lobehub/icons';
import type { TFunction } from 'i18next';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import type { ProviderModel } from '@/types';
import type { VirtualModelForm } from '../virtual-models-mutate-dialog';

// ── 策略配置 ──
interface RenderFieldOptions {
  form: UseFormReturn<VirtualModelForm>;
  index: number;
  remove: (index: number) => void;
  t: TFunction<'translation', undefined>;
}

interface StrategyConfig {
  columnTitle: string | null;
  columnWidth: string;
  renderField: (options: RenderFieldOptions) => React.ReactNode;
}

export const STRATEGY_CONFIG = {
  load_balance: {
    columnTitle: 'modelsPage.virtualModels.backendWeight',
    columnWidth: 'w-[80px]',
    renderField: ({ form, index, t, remove }): React.ReactNode => (
      <>
        <FormField
          control={form.control}
          name={`backends.${index}.weight`}
          render={({ field }) => (
            <FormItem className="w-[80px] shrink-0 space-y-0">
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder={t('modelsPage.virtualModels.backendWeight', 'Weight')}
                  {...field}
                  value={field.value ?? 1}
                  onChange={(e) => {
                    field.onChange(Number.parseInt(e.target.value, 10) || 0);
                  }}
                  className="text-center shadow-sm"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-ml-1 h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive/90"
          onClick={() => {
            remove(index);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </>
    ),
  },
  failover: {
    columnTitle: null,
    columnWidth: 'w-0', // Hidden
    renderField: ({ remove, index }): React.ReactNode => (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="-ml-1 h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive/90"
        onClick={() => {
          remove(index);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  },
} satisfies Record<string, StrategyConfig>;

// ── 工具函数 ──
function renderProviderLogo(kind?: string): React.ReactNode {
  if ((kind ?? '') === '') {
    return null;
  }
  if (kind === 'gemini') {
    return <Gemini size={14} className="fill-current" />;
  }
  if (kind === 'deepseek') {
    return <DeepSeek size={14} className="fill-current" />;
  }
  if (kind === 'volcengine') {
    return <Volcengine size={14} className="fill-current" />;
  }
  if (kind === 'copilot') {
    return <Github size={14} className="fill-current" />;
  }
  return <ProviderIcon provider={kind as 'openai'} size={14} type="mono" className="fill-current" />;
}

// ── 拖拽项组件 ──
interface SortableBackendItemProps {
  readonly id: string;
  readonly index: number;
  readonly form: UseFormReturn<VirtualModelForm>;
  readonly remove: (index: number) => void;
  readonly isLoadingProviderModels: boolean;
  readonly providerModels: ProviderModel[];
  readonly uniqueProviders: { readonly id: string; readonly name: string; readonly kind?: string | undefined }[];
  readonly t: TFunction<'translation', undefined>;
  readonly currentStrategy?: string;
}

function SortableBackendItem({
  id,
  index,
  form,
  remove,
  isLoadingProviderModels,
  providerModels,
  uniqueProviders,
  t,
  currentStrategy,
}: SortableBackendItemProps): React.ReactNode {
  const strategyConfig = STRATEGY_CONFIG[(currentStrategy ?? 'load_balance') as keyof typeof STRATEGY_CONFIG];
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentProviderId = form.watch(`backends.${index}.provider_id`);
  const filteredModels = useMemo(() => {
    return providerModels.filter((pm) => pm.provider_id === currentProviderId);
  }, [providerModels, currentProviderId]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-md border bg-background p-2.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        {...attributes}
        {...listeners}
        className="ml-1 shrink-0 cursor-grab text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="relative flex min-w-0 flex-1 -space-x-px rounded-md shadow-sm">
        <FormField
          control={form.control}
          name={`backends.${index}.provider_id`}
          render={({ field }) => (
            <FormItem className="relative w-[35%] min-w-0 space-y-0">
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue(`backends.${index}.provider_model_id`, '');
                }}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="relative w-full overflow-hidden rounded-r-none bg-background focus:z-10">
                    <SelectValue placeholder={t('modelsPage.virtualModels.backendProvider', 'Provider')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingProviderModels ? (
                    <div className="p-2 text-center text-sm">{t('common.loading', 'Loading...')}</div>
                  ) : (
                    uniqueProviders.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex w-full items-center gap-2 overflow-hidden">
                          {(p.kind ?? p.id) !== '' && (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm">
                              {renderProviderLogo(p.kind ?? p.id)}
                            </span>
                          )}
                          <span className="truncate">{p.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`backends.${index}.provider_model_id`}
          render={({ field }) => (
            <FormItem className="relative w-[65%] min-w-0 space-y-0">
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={!currentProviderId}
              >
                <FormControl>
                  <SelectTrigger className="relative w-full overflow-hidden rounded-l-none bg-background focus:z-10">
                    <SelectValue placeholder={t('modelsPage.virtualModels.backendModel', 'Model')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currentProviderId === '' && (
                    <div className="p-2 text-center text-xs text-muted-foreground">
                      {t('common.selectProviderFirst', 'Select Provider First')}
                    </div>
                  )}
                  {currentProviderId !== '' && filteredModels.length === 0 && (
                    <div className="p-2 text-center text-xs text-muted-foreground">
                      {t('common.noModels', 'No models available')}
                    </div>
                  )}
                  {currentProviderId !== '' &&
                    filteredModels.length > 0 &&
                    filteredModels.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        <span className="block w-full truncate">{pm.name}</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {strategyConfig.renderField({ form, index, t, remove })}
    </div>
  );
}

export interface SortableBackendListProps {
  readonly form: UseFormReturn<VirtualModelForm>;
  readonly t: TFunction<'translation', undefined>;
  readonly providerModels: ProviderModel[];
  readonly isLoadingProviderModels: boolean;
  readonly uniqueProviders: { readonly id: string; readonly name: string; readonly kind?: string | undefined }[];
  readonly currentStrategy: string;
}

export function SortableBackendList({
  form,
  t,
  providerModels,
  isLoadingProviderModels,
  uniqueProviders,
  currentStrategy,
}: SortableBackendListProps): React.ReactNode {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'backends',
  });

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (active.id !== over?.id && over != null) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  }

  const strategyConfig = STRATEGY_CONFIG[currentStrategy as keyof typeof STRATEGY_CONFIG];

  return (
    <div className="mt-1 -mr-4 flex flex-col gap-3 overflow-y-auto pt-1 pr-4 pb-4">
      {fields.length > 0 && (
        <div className="flex gap-3 px-4 pr-12 text-xs font-medium text-muted-foreground uppercase">
          <span className="w-6 shrink-0"></span>
          <span className="flex-1 px-1">{t('modelsPage.virtualModels.providerModel', 'Provider Model')}</span>
          {((): React.ReactNode => {
            const title = strategyConfig.columnTitle;
            if ((title ?? '') !== '') {
              return (
                <span className={`${strategyConfig.columnWidth} text-center`}>
                  {t(title as string, (title as string).split('.').pop() ?? 'Weight')}
                </span>
              );
            }
            return null;
          })()}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <SortableBackendItem
                key={field.id}
                id={field.id}
                index={index}
                form={form}
                remove={remove}
                isLoadingProviderModels={isLoadingProviderModels}
                providerModels={providerModels}
                uniqueProviders={uniqueProviders}
                t={t}
                currentStrategy={currentStrategy}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {fields.length === 0 && (
        <div className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          {t('modelsPage.virtualModels.noBackends', 'No backend configured.')}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="mt-1 h-9 w-full border-dashed text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        onClick={() => {
          append({
            provider_id: '',
            provider_model_id: '',
            weight: currentStrategy === 'load_balance' ? 1 : undefined,
          });
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('modelsPage.virtualModels.addBackend', 'Add Backend')}
      </Button>

      {form.formState.errors.backends?.root && (
        <div className="mt-1 text-xs text-destructive">{form.formState.errors.backends.root.message}</div>
      )}
    </div>
  );
}
