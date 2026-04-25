import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { type ChartPoint, formatTooltipTime, getTickInterval, type TimeRange } from '@/composables/use-usage-chart';
import { renderIsolatedDot } from './ChartDot';

/** 可视化指标类型 */
export type MetricKey = 'requests' | 'tokens' | 'rpm' | 'tpm';

interface UsageChartProps {
  readonly data: ChartPoint[];
  readonly metric: MetricKey;
  readonly loading: boolean;
  readonly timeRange: TimeRange;
}

/** Tokens 多线配置 */
const TOKEN_LINES = [
  { key: 'prompt_tokens' as const, label: 'Prompt', color: 'hsl(220, 90%, 56%)' },
  { key: 'completion_tokens' as const, label: 'Completion', color: 'hsl(150, 60%, 45%)' },
  { key: 'cached_tokens' as const, label: 'Cached', color: 'hsl(35, 92%, 50%)' },
];

/** 单线 metric 颜色 */
const SINGLE_COLORS: Record<Exclude<MetricKey, 'tokens'>, string> = {
  requests: 'hsl(220, 90%, 56%)',
  rpm: 'hsl(35, 92%, 50%)',
  tpm: 'hsl(280, 65%, 55%)',
};

/** 单线 metric → 数据字段 */
const SINGLE_DATAKEY: Record<Exclude<MetricKey, 'tokens'>, keyof ChartPoint> = {
  requests: 'requests',
  rpm: 'rpm',
  tpm: 'tpm',
};

/** 数字格式化 */
function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

/** 自定义 Tooltip 属性 */
interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ dataKey?: string | number; value?: number | null; color?: string; payload?: ChartPoint }>;
  readonly metric: MetricKey;
  readonly timeRange: TimeRange;
}

function CustomTooltip({ active, payload, metric, timeRange }: CustomTooltipProps): React.JSX.Element | null {
  if (active !== true || payload === undefined || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  const title = formatTooltipTime(point.isoTime, timeRange);

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1.5 font-medium text-muted-foreground">{title}</p>
      {metric === 'tokens' && (
        <div className="space-y-1">
          {TOKEN_LINES.map((line) => {
            const v = point[line.key];
            return (
              <div key={line.key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
                  <span>{line.label}</span>
                </div>
                <span className="font-mono font-medium">{v == null ? '—' : formatValue(v)}</span>
              </div>
            );
          })}
        </div>
      )}
      {metric !== 'tokens' &&
        payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{metric.toUpperCase()}</span>
            </div>
            <span className="font-mono font-medium">{entry.value == null ? '—' : formatValue(entry.value)}</span>
          </div>
        ))}
    </div>
  );
}

/** 公共 Area props（无 dot、无动画） */
const SHARED_AREA_PROPS = {
  type: 'monotone' as const,
  strokeWidth: 2,
  activeDot: { r: 4, strokeWidth: 0 },
  connectNulls: false,
  isAnimationActive: false,
  fillOpacity: 0.2,
};

/**
 * 为指定 dataKey 生成稳定的 dot 渲染函数。
 * 调用方通过 useMemo 缓存，确保每次 render 不产生新函数引用，
 * 避免 recharts 误判 props 变化而触发全量重绘。
 */
function makeDotRenderer(
  dataRef: Record<string, unknown>[],
  dataKey: string,
): (props: Record<string, unknown>) => React.JSX.Element | null {
  return (props: Record<string, unknown>): React.JSX.Element | null => renderIsolatedDot(props, dataRef, dataKey);
}

export function UsageChart({ data, metric, loading, timeRange }: UsageChartProps): React.JSX.Element {
  const tickInterval = useMemo(() => getTickInterval(timeRange, data.length), [timeRange, data.length]);

  // 稳定 dot 渲染函数引用：data 或 metric 变化时才重建，避免每帧新建箭头函数
  const dotRenderers = useMemo(() => {
    const dataRef = data as unknown as Record<string, unknown>[];
    return {
      prompt_tokens: makeDotRenderer(dataRef, 'prompt_tokens'),
      completion_tokens: makeDotRenderer(dataRef, 'completion_tokens'),
      cached_tokens: makeDotRenderer(dataRef, 'cached_tokens'),
      single: makeDotRenderer(dataRef, SINGLE_DATAKEY[metric as Exclude<MetricKey, 'tokens'>] as string),
    };
  }, [data, metric]);

  if (loading) {
    return <Skeleton className="h-[280px] w-full rounded-lg" />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      {/* margin.right 扩大到 24 以确保最右侧数据点在 recharts 热区内 */}
      <AreaChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <defs>
          {TOKEN_LINES.map((line) => (
            <linearGradient key={line.key} id={`color${line.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line.color} stopOpacity={0.5} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0} />
            </linearGradient>
          ))}
          <linearGradient id="colorsingle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={SINGLE_COLORS[metric as Exclude<MetricKey, 'tokens'>]} stopOpacity={0.5} />
            <stop offset="95%" stopColor={SINGLE_COLORS[metric as Exclude<MetricKey, 'tokens'>]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
        <XAxis
          dataKey="tickLabel"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={tickInterval}
          minTickGap={40}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={formatValue}
          className="fill-muted-foreground"
        />
        <Tooltip
          content={<CustomTooltip metric={metric} timeRange={timeRange} />}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          isAnimationActive={false}
        />
        {metric === 'tokens' ? (
          TOKEN_LINES.map((line) => (
            <Area
              key={line.key}
              {...SHARED_AREA_PROPS}
              dot={dotRenderers[line.key]}
              dataKey={line.key}
              stroke={line.color}
              fill={`url(#color${line.key})`}
              name={line.label}
            />
          ))
        ) : (
          <Area
            {...SHARED_AREA_PROPS}
            dot={dotRenderers.single}
            dataKey={SINGLE_DATAKEY[metric]}
            stroke={SINGLE_COLORS[metric]}
            fill="url(#colorsingle)"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
