import type { TFunction } from 'i18next';
import { Box, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';

// ── 资源项类型 ──────────────────────────────────────────────────────────────
export interface ResourceItem {
  readonly id: string;
  readonly name: string;
  readonly type?: string;
}

// ── Props ───────────────────────────────────────────────────────────────────
interface AllowedResourcePanelProps {
  /** 全部可选资源列表 */
  readonly items: ResourceItem[];
  /** 已选中的 ID 列表 */
  readonly selectedIds: string[];
  /** 切换选中状态 */
  readonly onToggle: (id: string) => void;
  readonly t: TFunction<'translation', undefined>;
  /** 每行图标渲染器（可选，默认使用 Box 图标） */
  readonly renderIcon?: (item: ResourceItem) => React.ReactNode;
}

// ── 图标组件 ────────────────────────────────────────────────────────────────
function DefaultIcon(): React.JSX.Element {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm">
      <Box className="h-3.5 w-3.5" />
    </span>
  );
}

// ── 可用资源卡片 ────────────────────────────────────────────────────────────
interface AvailableItemCardProps {
  readonly item: ResourceItem;
  readonly onToggle: (id: string) => void;
  readonly t: TFunction<'translation', undefined>;
  readonly renderIcon?: (item: ResourceItem) => React.ReactNode;
}

function AvailableItemCard({ item, onToggle, t, renderIcon }: AvailableItemCardProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2.5 shadow-sm transition-all hover:border-border hover:shadow-md">
      {renderIcon?.(item) ?? <DefaultIcon />}

      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-sm font-medium leading-tight">{item.name}</div>
        {(item.type ?? '') !== '' && (
          <div className="truncate text-xs capitalize leading-tight text-muted-foreground">{item.type}</div>
        )}
      </div>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 shrink-0 px-2.5 text-xs"
        onClick={() => {
          onToggle(item.id);
        }}
      >
        <Plus className="mr-1 h-3 w-3" />
        {t('apps.add', 'Add')}
      </Button>
    </div>
  );
}

// ── 已选资源卡片 ────────────────────────────────────────────────────────────
interface SelectedItemCardProps {
  readonly item: ResourceItem;
  readonly onToggle: (id: string) => void;
  readonly t: TFunction<'translation', undefined>;
  readonly renderIcon?: (item: ResourceItem) => React.ReactNode;
}

function SelectedItemCard({ item, onToggle, t, renderIcon }: SelectedItemCardProps): React.JSX.Element {
  return (
    <div className="group flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2.5 shadow-sm transition-all hover:border-border hover:shadow-md">
      {renderIcon?.(item) ?? <DefaultIcon />}

      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-sm font-medium leading-tight">{item.name}</div>
        {(item.type ?? '') !== '' && (
          <div className="truncate text-xs capitalize leading-tight text-muted-foreground">{item.type}</div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="-ml-1 h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive/90"
        onClick={() => {
          onToggle(item.id);
        }}
        title={t('apps.remove', 'Remove')}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── 主组件 ──────────────────────────────────────────────────────────────────
export function AllowedResourcePanel({
  items,
  selectedIds,
  onToggle,
  t,
  renderIcon,
}: AllowedResourcePanelProps): React.JSX.Element {
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 防抖 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(rawQuery);
    }, 300);
    return (): void => {
      clearTimeout(timer);
    };
  }, [rawQuery]);

  const handleClear = (): void => {
    setRawQuery('');
    setDebouncedQuery('');
  };

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // 已选资源项（从全部 items 中按 selectedIds 筛选）
  const selectedItems = useMemo(() => items.filter((item) => selectedSet.has(item.id)), [items, selectedSet]);

  // 未选资源项，按搜索词过滤
  const availableItems = useMemo(() => {
    const notSelected = items.filter((item) => !selectedSet.has(item.id));
    const q = debouncedQuery.toLowerCase().trim();
    if (q === '') {
      return notSelected;
    }
    return notSelected.filter(
      (item) => item.name.toLowerCase().includes(q) || (item.type ?? '').toLowerCase().includes(q),
    );
  }, [items, selectedSet, debouncedQuery]);

  return (
    <div className="flex h-full flex-col">
      {/* 搜索框 */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={rawQuery}
          onChange={(e) => {
            setRawQuery(e.target.value);
          }}
          placeholder={t('apps.searchResources', 'Search...')}
          className="h-9 pl-9 pr-8 text-sm"
        />
        {rawQuery !== '' && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 上半部：可添加的搜索结果 */}
      <div className="mt-2 max-h-[45%] min-h-[60px] flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Box className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">{t('apps.noResourcesAvailable', 'No resources available')}</p>
          </div>
        ) : availableItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Search className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">{t('common.noResults', 'No results')}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {availableItems.map((item) => (
              <AvailableItemCard
                key={item.id}
                item={item}
                onToggle={onToggle}
                t={t}
                {...(renderIcon ? { renderIcon } : {})}
              />
            ))}
          </div>
        )}
      </div>

      {/* 分隔线 */}
      <Separator className="my-3 shrink-0" />

      {/* 下半部：已选资源列表 */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {selectedItems.length > 0 && (
          <div className="mb-2 flex items-center gap-3 pl-1 pr-12 text-xs font-medium text-muted-foreground">
            <span className="flex-1 pl-3 tracking-wide uppercase">
              {t('apps.selected', 'Selected')}
              <span className="ml-1.5 font-normal normal-case text-muted-foreground/60">({selectedItems.length})</span>
            </span>
          </div>
        )}
        {selectedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Box className="mb-2 h-8 w-8 opacity-15" />
            <p className="text-xs">{t('apps.noSelected', 'No resources selected yet')}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {selectedItems.map((item) => (
              <SelectedItemCard
                key={item.id}
                item={item}
                onToggle={onToggle}
                t={t}
                {...(renderIcon ? { renderIcon } : {})}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
