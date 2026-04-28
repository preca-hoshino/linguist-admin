import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { type ChartPoint, formatTooltipTime, getTickInterval, type TimeRange } from '@/composables/use-usage-chart';
import { renderIsolatedDot } from './ChartDot';

// GenerationRateMetric 类型保留，供外部可能的引用兼容
export type GenerationRateMetric = 'avg' | 'p50' | 'p90' | 'p99';

interface GenerationRateChartProps {
  readonly data: ChartPoint[];
  readonly loading: boolean;
  readonly timeRange: TimeRange;
}

const LINES: { key: GenerationRateMetric; dataKey: keyof ChartPoint; color: string; label: string }[] = [
  { key: 'avg', dataKey: 'tok_s_avg', color: 'hsl(150, 60%, 45%)', label: 'Avg' },
  { key: 'p50', dataKey: 'tok_s_p50', color: 'hsl(220, 90%, 56%)', label: 'P50' },
  { key: 'p90', dataKey: 'tok_s_p90', color: 'hsl(35, 92%, 50%)', label: 'P90' },
  { key: 'p99', dataKey: 'tok_s_p99', color: 'hsl(0, 84%, 60%)', label: 'P99' },
];

function formatValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(1);
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ dataKey?: string | number; value?: number | null; color?: string; payload?: ChartPoint }>;
  readonly timeRange: TimeRange;
}

function CustomTooltip({ active, payload, timeRange }: CustomTooltipProps): React.JSX.Element | null {
  if (!active) {
    return null;
  }
  // filterNull=false 时 payload 始终存在，但 point 可能为空（不应发生）
  const point = payload?.[0]?.payload;
  if (!point) {
    return null;
  }

  const title = formatTooltipTime(point.isoTime, timeRange);

  return (
    <div className="min-w-[140px] rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1.5 font-medium text-muted-foreground">{title}</p>
      <div className="space-y-1">
        {LINES.map((line) => {
          const entry = payload.find((p) => p.dataKey === line.dataKey);
          const val = entry?.value;
          return (
            <div key={line.key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                <span>{line.label}</span>
              </div>
              <span className="font-mono font-medium">
                {val === undefined || val === null ? '—' : `${val.toFixed(1)} tok/s`}
              </span>
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
  fillOpacity: 0.08,
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

export function GenerationRateChart({ data, loading, timeRange }: GenerationRateChartProps): React.JSX.Element {
  const tickInterval = useMemo(() => getTickInterval(timeRange, data.length), [timeRange, data.length]);

  // 稳定 dot 渲染函数引用，data 变化时才重建，避免每帧新建箭头函数
  const dotRenderers = useMemo(() => {
    const dataRef = data as unknown as Record<string, unknown>[];
    const renderers: Record<string, (props: Record<string, unknown>) => React.JSX.Element | null> = {};
    for (const line of LINES) {
      renderers[line.key] = makeDotRenderer(dataRef, line.dataKey as string);
    }
    return renderers;
  }, [data]);

  if (loading) {
    return <Skeleton className="h-[280px] w-full rounded-lg" />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      {/* XAxis padding.right=30 确保最后数据点与热区右边缘保持缓冲距离，修复最后列 hover 失效 */}
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          {LINES.map((line) => (
            <linearGradient key={line.key} id={`colorRate_${line.key}`} x1="0" y1="0" x2="0" y2="1">
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
          padding={{ right: 30 }}
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
          content={<CustomTooltip timeRange={timeRange} />}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          isAnimationActive={false}
          filterNull={false}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        {LINES.map((line) => (
          <Area
            key={line.key}
            {...SHARED_AREA_PROPS}
            dot={dotRenderers[line.key] ?? false}
            dataKey={line.dataKey as string}
            name={line.label}
            stroke={line.color}
            fill={`url(#colorRate_${line.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
