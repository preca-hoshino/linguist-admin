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

import type { TFunction } from 'i18next';
import { GripVertical, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import type { ProviderModel } from '@/types';
import type { VirtualModelForm } from '../virtual-models-mutate-dialog';
import { ModelIdentityBlock } from './ModelIdentityBlock';
import { ModelSearchPalette } from './ModelSearchPalette';

/** 已选后端模型的展示信息 */
export interface BackendModelInfo {
  name: string;
  provider_name: string;
  provider_kind: string;
}

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

// ── 拖拽项组件（只读展示） ──
interface SortableBackendItemProps {
  readonly id: string;
  readonly index: number;
  readonly form: UseFormReturn<VirtualModelForm>;
  readonly remove: (index: number) => void;
  readonly t: TFunction<'translation', undefined>;
  readonly currentStrategy?: string;
  readonly modelInfo: BackendModelInfo | undefined;
}

function SortableBackendItem({
  id,
  index,
  form,
  remove,
  t,
  currentStrategy,
  modelInfo,
}: SortableBackendItemProps): React.ReactNode {
  const strategyConfig = STRATEGY_CONFIG[(currentStrategy ?? 'load_balance') as keyof typeof STRATEGY_CONFIG];
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-md border border-border/60 bg-background p-2.5 shadow-sm transition-all hover:border-border hover:shadow-md"
    >
      <div
        {...attributes}
        {...listeners}
        className="ml-1 shrink-0 cursor-grab text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* 只读展示：ModelIdentityBlock + 模型名 + 提供商名 */}
      <ModelIdentityBlock
        modelName={modelInfo?.name ?? (form.watch(`backends.${index}.provider_model_id`) as string)}
        providerName={modelInfo?.provider_name ?? ''}
        providerKind={modelInfo?.provider_kind ?? ''}
      />

      {strategyConfig.renderField({ form, index, t, remove })}
    </div>
  );
}

export interface SortableBackendListProps {
  readonly form: UseFormReturn<VirtualModelForm>;
  readonly t: TFunction<'translation', undefined>;
  readonly currentStrategy: string;
  /** 编辑模式时从已有 backends 初始化的模型展示信息 */
  readonly initialModelInfo: ReadonlyMap<string, BackendModelInfo>;
}

export function SortableBackendList({
  form,
  t,
  currentStrategy,
  initialModelInfo,
}: SortableBackendListProps): React.ReactNode {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'backends',
  });

  // 维护已选模型的展示信息（用于只读展示行）
  const modelInfoMapRef = useRef<Map<string, BackendModelInfo>>(new Map(initialModelInfo));

  // 已选 provider_model_id 集合（用于搜索面板判断 "已添加"）
  const selectedIds = useMemo(() => new Set(fields.map((f) => f.provider_model_id).filter(Boolean)), [fields]);

  const handleAdd = useCallback(
    (model: ProviderModel) => {
      // 写入展示信息
      modelInfoMapRef.current.set(model.id, {
        name: model.name,
        provider_name: model.provider_name ?? '',
        provider_kind: model.provider_kind ?? '',
      });
      append({
        provider_id: model.provider_id,
        provider_model_id: model.id,
        weight: currentStrategy === 'load_balance' ? 1 : undefined,
      });
    },
    [append, currentStrategy],
  );

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
    <div className="mt-1 -mr-4 flex h-full flex-col overflow-hidden pt-1 pr-4">
      {/* 顶部：搜索面板 */}
      <div className="shrink-0">
        <ModelSearchPalette selectedIds={selectedIds} onAdd={handleAdd} t={t} />
      </div>

      <Separator className="my-3" />

      {/* 下部：已选后端列表 */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
        {fields.length > 0 && (
          <div className="mb-2 flex items-center gap-3 pl-1 pr-12 text-xs font-medium text-muted-foreground">
            <span className="w-4 shrink-0" />
            <span className="flex-1 pl-3 tracking-wide uppercase">
              {t('modelsPage.virtualModels.backends', 'Backend Models')}
              <span className="ml-1.5 font-normal normal-case text-muted-foreground/60">({fields.length})</span>
            </span>
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
                  t={t}
                  currentStrategy={currentStrategy}
                  modelInfo={modelInfoMapRef.current.get(field.provider_model_id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {fields.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {t('modelsPage.virtualModels.noBackends', 'No backend configured.')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {t('modelsPage.virtualModels.noBackendsHint', 'Use the search box above to add models.')}
            </p>
          </div>
        )}

        {form.formState.errors.backends?.root && (
          <div className="mt-1 text-xs text-destructive">{form.formState.errors.backends.root.message}</div>
        )}
      </div>
    </div>
  );
}
