import type { ColumnFiltersState } from '@tanstack/react-table';

/**
 * 从 TanStack columnFilters 状态中提取出第一个选中值
 * 常用于将前端多选或单选过滤器降级/转化为服务端的单值查询参数
 *
 * @param filters 表格过滤器状态数组
 * @param id 列/过滤器的标志位 ID
 * @returns 匹配的第一个字符串类型选值或 undefined
 */
export function extractFilterValue(filters: ColumnFiltersState, id: string): string | undefined {
  const f = filters.find((item) => item.id === id);
  if (!f) {
    return undefined;
  }
  const val = f.value;
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
    return val[0];
  }
  return undefined;
}
