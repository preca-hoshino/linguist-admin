import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { type ChartPoint, formatTooltipTime, getTickInterval, type TimeRange } from '@/composables/use-usage-chart';
import { renderIsolatedDot } from './ChartDot';

interface ErrorChartProps {
  readonly data: ChartPoint[];
  readonly loading: boolean;
  readonly timeRange: TimeRange;
}

const ERROR_LINES = [
  { key: 'error_count' as const, label: 'Total Errors', color: 'hsl(0, 84%, 60%)' },
  { key: 'timeout_count' as const, label: 'Timeouts', color: 'hsl(35, 92%, 50%)' },
  { key: 'rate_limit_count' as const, label: 'Rate Limits', color: 'hsl(280, 65%, 55%)' },
];

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ dataKey?: string | number; value?: number | null; color?: string; payload?: ChartPoint }>;
  readonly timeRange: TimeRange;
}

function CustomTooltip({ active, payload, timeRange }: CustomTooltipProps): React.JSX.Element | null {
  if (!active || payload === undefined || payload.length === 0) {
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
      <div className="space-y-1">
        {ERROR_LINES.map((line) => {
          const v = point[line.key];
          return (
            <div key={line.key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
                <span>{line.label}</span>
              </div>
              <span className="font-mono font-medium">{v == null ? '0' : formatValue(v)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SHARED_AREA_PROPS = {
  type: 'monotone' as const,
  strokeWidth: 2,
  activeDot: { r: 4, strokeWidth: 0 },
  connectNulls: false,
  isAnimationActive: false,
  fillOpacity: 0.15,
};

/**
 * 为指定 dataKey 生成稳定的 dot 渲染函数。
 * 在 useMemo 中调用，确保 data 不变时函数引用不变，避免 recharts 全量重绘。
 */
function makeDotRenderer(
  dataRef: Record<string, unknown>[],
  dataKey: string,
): (props: Record<string, unknown>) => React.JSX.Element | null {
  return (props: Record<string, unknown>): React.JSX.Element | null => renderIsolatedDot(props, dataRef, dataKey);
}

export function ErrorChart({ data, loading, timeRange }: ErrorChartProps): React.JSX.Element {
  const tickInterval = useMemo(() => getTickInterval(timeRange, data.length), [timeRange, data.length]);

  // 稳定 dot 渲染函数引用，data 变化时才重建，避免每帧新建箭头函数
  const dotRenderers = useMemo(() => {
    const dataRef = data as unknown as Record<string, unknown>[];
    const renderers: Record<string, (props: Record<string, unknown>) => React.JSX.Element | null> = {};
    for (const line of ERROR_LINES) {
      renderers[line.key] = makeDotRenderer(dataRef, line.key);
    }
    return renderers;
  }, [data]);

  if (loading) {
    return <Skeleton className="h-[280px] w-full rounded-lg" />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      {/* margin.right 扩大到 24 以确保最右侧数据点在 recharts 热区内 */}
      <AreaChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <defs>
          {ERROR_LINES.map((line) => (
            <linearGradient key={line.key} id={`colorError${line.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0} />
            </linearGradient>
          ))}
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
          width={40}
          tickFormatter={formatValue}
          className="fill-muted-foreground"
        />
        <Tooltip
          content={<CustomTooltip timeRange={timeRange} />}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          isAnimationActive={false}
        />
        {ERROR_LINES.map((line) => (
          <Area
            key={line.key}
            {...SHARED_AREA_PROPS}
            dot={dotRenderers[line.key] ?? false}
            dataKey={line.key}
            stroke={line.color}
            fill={`url(#colorError${line.key})`}
            name={line.label}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
