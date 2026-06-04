import type React from 'react';
import { useEffect, useState } from 'react';
import { listVirtualMcps } from '@/api/mcp/virtual-mcps';
import { createCrudContext } from '@/composables/create-crud-context';
import type { VirtualMcp } from '@/types/mcp';
import { extractFilterValue } from '@/utils/table';

export type VirtualMcpsDialogType = 'create' | 'update' | 'delete' | 'batch-delete';

/**
 * 创建 virtual-mcps 的 CRUD Context。
 * providerId 通过 Provider 组件的 prop 传入，内部通过 ref 捕获。
 */
function createVirtualMcpsCrud() {
  const factory = createCrudContext<VirtualMcp, VirtualMcpsDialogType>({
    displayName: 'VirtualMcpsContext',
    fetchList: (params) => {
      const payload = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== ''),
      ) as Parameters<typeof listVirtualMcps>[0];
      return listVirtualMcps(payload);
    },
    buildParams: ({ pagination, search, columnFilters }) => {
      const providerIdFilter = extractFilterValue(columnFilters, 'mcp_provider_id');
      return {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        search: search || undefined,
        mcp_provider_id: providerIdFilter !== undefined && providerIdFilter !== '' ? providerIdFilter : undefined,
      };
    },
    defaultPageSize: 10,
  });

  // 带 debounce 的 Provider — 用 ref 捕获 providerId
  function VirtualMcpsProvider({
    children,
    providerId,
  }: {
    readonly children: React.ReactNode;
    readonly providerId?: string;
  }): React.JSX.Element {
    // 用 state 包装 factory 的 buildParams，注入 providerId fallback
    const [providerIdState] = useState(providerId);

    return (
      <factory.Provider>
        <VirtualMcpsInner providerIdState={providerIdState}>{children}</VirtualMcpsInner>
      </factory.Provider>
    );
  }

  // 内部组件：在 Provider 内部注入 providerId 到 columnFilters
  function VirtualMcpsInner({
    children,
    providerIdState,
  }: {
    readonly children: React.ReactNode;
    readonly providerIdState: string | undefined;
  }): React.JSX.Element {
    const ctx = factory.useContext();
    const { columnFilters } = ctx;

    // 如果有外部 providerId 且 columnFilters 中没有 mcp_provider_id，自动注入
    // biome-ignore lint/correctness/useExhaustiveDependencies: only run on mount + providerIdState change
    useEffect(() => {
      if (providerIdState) {
        const hasFilter = columnFilters.some((f) => f.id === 'mcp_provider_id');
        if (!hasFilter) {
          ctx.setColumnFilters([{ id: 'mcp_provider_id', value: providerIdState }]);
        }
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <>{children}</>;
  }

  return {
    ...factory,
    Provider: VirtualMcpsProvider,
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const virtualMcpsCrud = createVirtualMcpsCrud();

/** 向后兼容：Provider */
export const VirtualMcpsProvider = virtualMcpsCrud.Provider;

/** 向后兼容：Hook */
// eslint-disable-next-line react-refresh/only-export-components
export function useVirtualMcps(): ReturnType<typeof virtualMcpsCrud.useContext> {
  return virtualMcpsCrud.useContext();
}
