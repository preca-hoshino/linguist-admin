import type {
  ApiResult,
  StatsBreakdown,
  StatsBreakdownGroupBy,
  StatsDimension,
  StatsErrors,
  StatsOverview,
  StatsRange,
  StatsToday,
  StatsTokens,
  TimeSeriesResult,
} from '../../types';
import { request } from '../client';

export interface StatsParams {
  range?: StatsRange;
  dimension?: StatsDimension;
  id?: string;
  interval?: string;
  from?: string;
  to?: string;
}

function buildStatsQuery(params?: StatsParams): string {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') {
        qs.set(k, String(v));
      }
    }
  }
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export const getStatsOverview = async (params?: StatsParams): Promise<ApiResult<StatsOverview>> =>
  await request<StatsOverview>('GET', `/model/stats/overview${buildStatsQuery(params)}`);

export const getStatsTimeSeries = async (params?: StatsParams): Promise<ApiResult<TimeSeriesResult>> =>
  await request<TimeSeriesResult>('GET', `/model/stats/time-series${buildStatsQuery(params)}`);

export const getStatsErrors = async (params?: StatsParams): Promise<ApiResult<StatsErrors>> =>
  await request<StatsErrors>('GET', `/model/stats/errors${buildStatsQuery(params)}`);

export const getStatsTokens = async (params?: StatsParams): Promise<ApiResult<StatsTokens>> =>
  await request<StatsTokens>('GET', `/model/stats/tokens${buildStatsQuery(params)}`);

export const getStatsToday = async (params?: {
  dimension?: StatsDimension;
  id?: string;
}): Promise<ApiResult<StatsToday>> =>
  await request<StatsToday>('GET', `/model/stats/today${buildStatsQuery(params as StatsParams)}`);

export const getStatsBreakdown = async (
  params: StatsParams & { group_by: StatsBreakdownGroupBy },
  signal?: AbortSignal,
): Promise<ApiResult<StatsBreakdown>> => {
  const { group_by, ...rest } = params;
  const qs = buildStatsQuery(rest);
  const sep = qs ? '&' : '?';
  return await request<StatsBreakdown>(
    'GET',
    `/model/stats/breakdown${qs}${sep}group_by=${group_by}`,
    undefined,
    signal ? { signal } : undefined,
  );
};
