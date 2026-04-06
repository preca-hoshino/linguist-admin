export const DASHBOARD_TABS = ['overview', 'performance', 'distribution', 'errors', 'billing'] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export const GLOBAL_TIME_RANGES = ['today', '7d', '30d'] as const;
export type GlobalTimeRange = (typeof GLOBAL_TIME_RANGES)[number];

/** 全局配置的时间选择器映射 (与 UI 显示字典挂钩) */
export interface TimeRangeOption {
  value: GlobalTimeRange;
  labelKey: string;
  fallback: string;
}

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 'today', labelKey: 'dashboard.range.today', fallback: 'Today' },
  { value: '7d', labelKey: 'dashboard.range.7d', fallback: '7 Days' },
  { value: '30d', labelKey: 'dashboard.range.30d', fallback: '30 Days' },
];

/**
 * 转换全局的 GlobalTimeRange (today) 为某些后端接口或特定 hook 所需的时间格式 (如 24h)
 * 这里提供一个统一的映射入口
 */
export function mapGlobalRangeToApi(range: GlobalTimeRange): string {
  if (range === 'today') {
    return '24h';
  }
  return range;
}

/** 统计数据筛选维度（用于图表组件通用 prop） */
export interface StatsFilterOptions {
  dimension: 'global' | 'provider' | 'provider_model' | 'virtual_model' | 'api_key';
  id: string;
}
