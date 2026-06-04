import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDialogState } from '@/composables/use-dialog-state';
import type { ListResponse } from '@/types';

// ── 公开类型 ────────────────────────────────────────────────────────────────

/** 构建 API 查询参数的函数 — 由每个页面提供 */
export type BuildParamsFn = (state: {
  pagination: PaginationState;
  search: string;
  columnFilters: ColumnFiltersState;
}) => Record<string, unknown>;

/** CRUD 列表数据的 Context 状态（不含 Dialog 状态） */
export interface CrudDataContext<T> {
  /** 当前页数据 */
  readonly data: T[];
  /** 是否正在加载 */
  readonly loading: boolean;
  /** 错误信息 */
  readonly error: string;
  /** 是否有下一页 */
  readonly hasMore: boolean;
  /** 服务端返回的总条数 */
  readonly total: number;
  /** TanStack Table 分页状态 */
  readonly pagination: PaginationState;
  readonly setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  /** 全局搜索（映射到 globalFilter） */
  readonly search: string;
  readonly setSearch: React.Dispatch<React.SetStateAction<string>>;
  /** 列筛选状态（直接映射到 TanStack Table columnFilters） */
  readonly columnFilters: ColumnFiltersState;
  readonly setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  /** 手动触发数据加载 */
  readonly loadData: () => Promise<void>;
}

/** CRUD Dialog 状态 */
export interface CrudDialogState<D extends string> {
  readonly open: D | null;
  readonly setOpen: (value: D | null) => void;
  readonly currentRow: unknown | null;
  readonly setCurrentRow: React.Dispatch<React.SetStateAction<unknown | null>>;
  readonly selectedIds: string[];
  readonly setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

// ── 工厂函数 ────────────────────────────────────────────────────────────────

export interface CreateCrudContextOptions<T, D extends string> {
  /** 上下文显示名（用于 React DevTools） */
  readonly displayName: string;
  /** 调用 API list 接口的函数 */
  readonly fetchList: (
    params: Record<string, unknown>,
  ) => Promise<{ ok: boolean; data?: ListResponse<T>; error?: { message: string } }>;
  /** 将 pagination / search / columnFilters 映射为 API 查询参数 */
  readonly buildParams: BuildParamsFn;
  /** 默认每页条数 */
  readonly defaultPageSize?: number;
}

export interface CrudContextBundle<T, D extends string> {
  /** Context Provider 组件 — 在页面根部使用 */
  readonly Provider: React.FC<{ readonly children: React.ReactNode }>;
  /** 自定义 Hook — 在子组件中获取 CRUD 状态 */
  readonly useContext: () => CrudDataContext<T> & CrudDialogState<D> & { readonly loadData: () => Promise<void> };
}

/**
 * 创建一套 CRUD Context + Provider + Hook。
 *
 * @example
 * const appsCrud = createCrudContext<App, 'create' | 'update' | 'delete'>({
 *   displayName: 'AppsContext',
 *   fetchList: listApps,
 *   buildParams: ({ pagination, search }) => ({
 *     limit: pagination.pageSize,
 *     offset: pagination.pageIndex * pagination.pageSize,
 *     search: search || undefined,
 *   }),
 * });
 *
 * // 在页面中使用
 * <appsCrud.Provider>
 *   <AppsContent />
 *   <AppsDialogs />
 * </appsCrud.Provider>
 *
 * // 在子组件中
 * const { data, loading, setOpen } = appsCrud.useContext();
 */
export function createCrudContext<T, D extends string>(
  options: CreateCrudContextOptions<T, D>,
): CrudContextBundle<T, D> {
  const { displayName, fetchList, buildParams, defaultPageSize = 10 } = options;

  // ── Context 定义 ────────────────────────────────────────────────────

  interface FullContext extends CrudDataContext<T>, CrudDialogState<D> {}

  const CrudContext = createContext<FullContext | undefined>(undefined);

  // ── Provider 组件 ───────────────────────────────────────────────────

  function CrudProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
    const { t } = useTranslation();

    // Dialog 状态
    const [open, setOpen] = useDialogState<D>(null);
    const [currentRow, setCurrentRow] = useState<unknown | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // 数据状态
    const [data, setData] = useState<T[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    // 表格状态
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: defaultPageSize,
    });
    const [search, setSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    // 加载状态
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ── 数据加载 ──────────────────────────────────────────────────────

    // biome-ignore lint/correctness/useExhaustiveDependencies: buildParams & fetchList are stable (defined at factory call site)
    const loadData = useCallback(async () => {
      try {
        setLoading(true);
        setError('');

        const params = buildParams({ pagination, search, columnFilters });
        const res = await fetchList(params);

        if (!res.ok) {
          throw new Error(res.error?.message || t('common.loadFailed', 'Failed to load data'));
        }

        setData(res.data.data);
        setHasMore(res.data.has_more);
        setTotal(res.data.total);
      } catch (error_) {
        setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load data'));
      } finally {
        setLoading(false);
      }
    }, [t, pagination, search, columnFilters, buildParams, fetchList]);

    // 数据加载
    useEffect(() => {
      void loadData();
    }, [loadData]);

    // search / columnFilters 变化时重置到第一页
    // biome-ignore lint/correctness/useExhaustiveDependencies: reset pagination on search/filter change
    useEffect(() => {
      setPagination((prev) => {
        if (prev.pageIndex === 0) {
          return prev;
        }
        return { ...prev, pageIndex: 0 };
      });
    }, [search, columnFilters]);

    // ── Context Value（稳定引用） ─────────────────────────────────────

    const value = useMemo<FullContext>(
      () => ({
        data,
        loading,
        error,
        hasMore,
        total,
        pagination,
        setPagination,
        search,
        setSearch,
        columnFilters,
        setColumnFilters,
        loadData,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        selectedIds,
        setSelectedIds,
      }),
      [
        data,
        loading,
        error,
        hasMore,
        total,
        pagination,
        search,
        columnFilters,
        loadData,
        open,
        setOpen,
        currentRow,
        selectedIds,
      ],
    );

    return <CrudContext.Provider value={value}>{children}</CrudContext.Provider>;
  }

  // ── Hook ──────────────────────────────────────────────────────────

  function useCrudContext(): FullContext {
    const ctx = useContext(CrudContext);
    if (ctx === undefined) {
      throw new Error(`useContext must be used within a ${displayName}`);
    }
    return ctx;
  }

  CrudProvider.displayName = displayName;

  return {
    Provider: CrudProvider,
    useContext: useCrudContext,
  } as CrudContextBundle<T, D>;
}
