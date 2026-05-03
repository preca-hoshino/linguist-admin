import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatsTimeSeries } from '@/api/model/stats';
import type { StatsDimension, StatsRange, TimeSeriesPoint } from '@/types';

/** 时间范围选项 */
export type TimeRange = 'today' | '7d' | '30d';

/** 图表数据点 */
export interface ChartPoint {
  /** XAxis 显示的简短标签 (HH:MM / M.DD) */
  tickLabel: string;
  /** 原始 ISO 时间戳（Tooltip 完整展示用） */
  isoTime: string;
  /** 单线指标 */
  requests: number | null;
  total_tokens: number | null;
  rpm: number | null;
  tpm: number | null;
  /** Tokens 多线指标 */
  prompt_tokens: number | null;
  completion_tokens: number | null;
  cached_tokens: number | null;
  /** 错误指标 */
  error_count: number | null;
  timeout_count: number | null;
  rate_limit_count: number | null;
  /** 延迟指标 (E2E) */
  avg_latency_ms: number | null;
  p50_latency_ms: number | null;
  p90_latency_ms: number | null;
  p99_latency_ms: number | null;
  /** 首字延迟 (TTFT) */
  ttft_avg_ms: number | null;
  ttft_p50_ms: number | null;
  ttft_p90_ms: number | null;
  ttft_p99_ms: number | null;
  /** 字间延迟 (ITL) */
  itl_avg_ms: number | null;
  itl_p50_ms: number | null;
  itl_p90_ms: number | null;
  itl_p99_ms: number | null;
  /** 生成速率 (tok/s)，基于 1000 / ITL 计算 */
  tok_s_avg: number | null;
  tok_s_p50: number | null;
  tok_s_p90: number | null;
  tok_s_p99: number | null;
}

/** 时间范围 → API 参数映射 */
const RANGE_CONFIG: Record<TimeRange, { range: StatsRange; interval: string }> = {
  today: { range: '24h', interval: '10m' },
  '7d': { range: '7d', interval: '1h' },
  '30d': { range: '30d', interval: '6h' },
};

/**
 * XAxis dataKey 值：所有时间粒度下均保持唯一（含 HH:MM），
 * 确保 recharts 能为每个数据点生成独立的 tooltip snap 位置。
 * 显示标签由 formatTickDisplay / XAxis tickFormatter 控制。
 */
function formatTickLabel(isoTime: string): string {
  const d = new Date(isoTime);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${month}.${day} ${h}:${m}`;
}

/**
 * XAxis tickFormatter：将唯一的 tickLabel 转换为适合当前时间粒度的简短显示文本。
 * - today  → "HH:MM"
 * - 7d/30d → "M.DD"
 */
export function formatTickDisplay(tickLabel: string, timeRange: TimeRange): string {
  // tickLabel 格式固定为 "MM.DD HH:MM"
  const [datePart, timePart] = tickLabel.split(' ');
  if (timeRange === 'today') {
    return timePart ?? tickLabel;
  }
  // 去掉前导零，例如 "04.28" → "4.28"
  const [month, day] = (datePart ?? '').split('.');
  return `${Number(month)}.${Number(day)}`;
}

/** Tooltip 完整时间格式化 */
export function formatTooltipTime(isoTime: string, timeRange: TimeRange): string {
  const d = new Date(isoTime);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  switch (timeRange) {
    case 'today': {
      return `${h}:${m}`;
    }
    case '7d': {
      return `${month}.${day} ${h}:${m}`;
    }
    case '30d': {
      return `${month}.${day}`;
    }
  }
}

/** 将请求类字段从原始点映射为图表点字段（无请求时全部置 null） */
function buildRequestFields(
  p: TimeSeriesPoint,
  noRequests: boolean,
): Pick<
  ChartPoint,
  | 'requests'
  | 'total_tokens'
  | 'rpm'
  | 'tpm'
  | 'prompt_tokens'
  | 'completion_tokens'
  | 'cached_tokens'
  | 'avg_latency_ms'
  | 'p50_latency_ms'
  | 'p90_latency_ms'
  | 'p99_latency_ms'
  | 'ttft_avg_ms'
  | 'ttft_p50_ms'
  | 'ttft_p90_ms'
  | 'ttft_p99_ms'
  | 'itl_avg_ms'
  | 'itl_p50_ms'
  | 'itl_p90_ms'
  | 'itl_p99_ms'
  | 'tok_s_avg'
  | 'tok_s_p50'
  | 'tok_s_p90'
  | 'tok_s_p99'
> {
  if (noRequests) {
    return {
      requests: null,
      total_tokens: null,
      rpm: null,
      tpm: null,
      prompt_tokens: null,
      completion_tokens: null,
      cached_tokens: null,
      avg_latency_ms: null,
      p50_latency_ms: null,
      p90_latency_ms: null,
      p99_latency_ms: null,
      ttft_avg_ms: null,
      ttft_p50_ms: null,
      ttft_p90_ms: null,
      ttft_p99_ms: null,
      itl_avg_ms: null,
      itl_p50_ms: null,
      itl_p90_ms: null,
      itl_p99_ms: null,
      tok_s_avg: null,
      tok_s_p50: null,
      tok_s_p90: null,
      tok_s_p99: null,
    };
  }
  return {
    requests: p.requests,
    total_tokens: p.total_tokens,
    rpm: p.rpm,
    tpm: p.tpm,
    prompt_tokens: p.prompt_tokens,
    completion_tokens: p.completion_tokens,
    cached_tokens: p.cached_tokens,
    avg_latency_ms: p.avg_latency_ms,
    p50_latency_ms: p.p50_latency_ms,
    p90_latency_ms: p.p90_latency_ms,
    p99_latency_ms: p.p99_latency_ms,
    ttft_avg_ms: p.ttft_avg_ms,
    ttft_p50_ms: p.ttft_p50_ms,
    ttft_p90_ms: p.ttft_p90_ms,
    ttft_p99_ms: p.ttft_p99_ms,
    itl_avg_ms: p.itl_avg_ms,
    itl_p50_ms: p.itl_p50_ms,
    itl_p90_ms: p.itl_p90_ms,
    itl_p99_ms: p.itl_p99_ms,
    // 生成速率：由 ITL 推算，ITL 有效时才计算
    tok_s_avg: p.itl_avg_ms !== null && p.itl_avg_ms > 0 ? 1000 / p.itl_avg_ms : null,
    tok_s_p50: p.itl_p50_ms !== null && p.itl_p50_ms > 0 ? 1000 / p.itl_p50_ms : null,
    tok_s_p90: p.itl_p90_ms !== null && p.itl_p90_ms > 0 ? 1000 / p.itl_p90_ms : null,
    tok_s_p99: p.itl_p99_ms !== null && p.itl_p99_ms > 0 ? 1000 / p.itl_p99_ms : null,
  };
}

/** 将错误类字段从原始点映射为图表点字段（独立于请求数判断，无错误时置 null 断线） */
function buildErrorFields(p: TimeSeriesPoint): Pick<ChartPoint, 'error_count' | 'timeout_count' | 'rate_limit_count'> {
  const noErrors = p.error_count <= 0;
  return {
    error_count: noErrors ? null : p.error_count,
    timeout_count: noErrors ? null : p.timeout_count,
    rate_limit_count: noErrors ? null : p.rate_limit_count,
  };
}

/**
 * 将原始 TimeSeriesPoint 转为图表友好格式，无数据时用 null 断线。
 *
 * 空值处理分为两个维度：
 * - 请求类指标（requests/tokens/rpm/tpm/延迟/生成速率）：requests <= 0 时置 null
 * - 错误类指标（error_count/timeout_count/rate_limit_count）：独立判断，
 *   error_count <= 0 时才置 null，确保有错误但无请求的时间点能在 ErrorChart 上正确显示
 */
function toChartPoints(series: TimeSeriesPoint[], _timeRange: TimeRange): ChartPoint[] {
  return series.map((p) => {
    const tickLabel = formatTickLabel(p.time);
    const isoTime = p.time;
    const noRequests = p.requests <= 0;
    return {
      tickLabel,
      isoTime,
      ...buildRequestFields(p, noRequests),
      ...buildErrorFields(p),
    };
  });
}

/** XAxis tick interval 配置（按 timeRange 控制密度） */
export function getTickInterval(timeRange: TimeRange, dataLength: number): number {
  switch (timeRange) {
    case 'today': {
      // ~144pt → 每 12pt 约 12 labels
      return Math.max(0, Math.floor(dataLength / 12) - 1);
    }
    case '7d': {
      // ~168pt → 每 24pt 约 7 labels
      return Math.max(0, Math.floor(dataLength / 7) - 1);
    }
    case '30d': {
      // ~120pt → 每 15pt 约 8 labels
      return Math.max(0, Math.floor(dataLength / 8) - 1);
    }
  }
}

const POLL_MS = 120_000;

/** 可选的维度过滤参数 */
export interface UsageChartOptions {
  dimension?: StatsDimension;
  id?: string;
}

/**
 * 用量图表数据 Composable
 * 按时间范围自动请求 /api/stats/time-series 并转换为图表数据
 * 可通过 options 参数按 Provider 等维度过滤
 */
export function useUsageChart(
  timeRange: TimeRange,
  options?: UsageChartOptions,
  refreshKey?: number,
): { data: ChartPoint[]; loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const config = RANGE_CONFIG[timeRange];
      const result = await getStatsTimeSeries({
        range: config.range,
        interval: config.interval,
        ...(options?.dimension ? { dimension: options.dimension, id: options.id } : {}),
      });
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      setData(toChartPoints(result.data.data, timeRange));
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : String(error_));
    } finally {
      setLoading(false);
    }
  }, [timeRange, options?.dimension, options?.id]);

  const refresh = useCallback(() => {
    setLoading(true);
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    setLoading(true);
    void fetchData();
    timerRef.current = setInterval((): void => {
      void fetchData();
    }, POLL_MS);
    return (): void => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchData]);

  // 当外部传入 refreshKey 变化时，主动触发一次数据刷新
  useEffect(() => {
    if (refreshKey === undefined || refreshKey === 0) {
      return;
    }
    setLoading(true);
    void fetchData();
  }, [refreshKey, fetchData]);

  return { data, loading, error, refresh };
}
