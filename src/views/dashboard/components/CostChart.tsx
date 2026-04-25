import { useMemo } from 'react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import type { CostChartPoint } from '@/composables/use-cost-trend';
import { type ChartPoint, formatTooltipTime, getTickInterval, type TimeRange } from '@/composables/use-usage-chart';

interface CostChartProps {
  readonly data: CostChartPoint[];
  readonly loading: boolean;
  readonly timeRange: TimeRange;
}

// 柱状图：蓝绿色（teal）
const BAR_COLOR = 'hsl(184, 70%, 42%)';
// 累计折线：橙色（与 rpm 图表保持一致）
const LINE_COLOR = 'hsl(35, 92%, 50%)';

function formatCurrency(val: number): string {
  if (val === 0) {
    return '¥0.00';
  }
  if (val < 0.01) {
    return '<¥0.01';
  }
  return `¥${val.toFixed(2)}`;
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ dataKey?: string | number; value?: number | null; color?: string; payload?: ChartPoint }>;
  readonly timeRange: TimeRange;
}

function CustomTooltip({ active, payload, timeRange }: CustomTooltipProps): React.JSX.Element | null {
  if (active !== true || (payload?.length ?? 0) === 0) {
    return null;
  }
  const point = payload?.[0]?.payload as (CostChartPoint & { cumulative?: number }) | undefined;
  if (point === undefined) {
    return null;
  }

  const title = formatTooltipTime(point.isoTime, timeRange);

  return (
    <div className="min-w-[160px] rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1.5 font-medium text-muted-foreground">{title}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 flex-shrink-0 rounded-sm" style={{ backgroundColor: BAR_COLOR }} />
            <span>当期花费</span>
          </div>
          <span className="font-mono font-medium">{formatCurrency(Number(point.cost ?? 0))}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: LINE_COLOR }} />
            <span>累计金额</span>
          </div>
          <span className="font-mono font-medium">{formatCurrency(point.cumulative ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}

export function CostChart({ data, loading, timeRange }: CostChartProps): React.JSX.Element {
  const tickInterval = useMemo(() => getTickInterval(timeRange, data.length), [timeRange, data.length]);

  const enhancedData = useMemo(() => {
    let running = 0;
    const result: Array<CostChartPoint & { cumulative: number }> = [];
    for (const d of data) {
      running += Number(d.cost ?? 0);
      result.push({ ...d, cumulative: running });
    }
    return result;
  }, [data]);

  if (loading) {
    return <Skeleton className="h-[280px] w-full rounded-lg" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center text-sm text-muted-foreground">
        暂无费用数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      {/* XAxis padding.right=30 确保最后数据点与热区右边缘保持缓冲距离，修复最后列 hover 失效 */}
      <ComposedChart data={enhancedData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCostBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BAR_COLOR} stopOpacity={0.8} />
            <stop offset="95%" stopColor={BAR_COLOR} stopOpacity={0.4} />
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
          padding={{ right: 30 }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v) => `¥${Number(v).toFixed(2)}`}
          className="fill-muted-foreground"
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v) => `¥${Number(v).toFixed(2)}`}
          className="fill-muted-foreground"
        />
        <Tooltip
          content={<CustomTooltip timeRange={timeRange} />}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          isAnimationActive={false}
        />
        <Legend
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(value) => (value === 'cost' ? '当期花费' : '累计金额')}
        />
        <Bar dataKey="cost" name="cost" yAxisId="left" fill="url(#colorCostBar)" isAnimationActive={false} />
        <Line
          type="monotone"
          dataKey="cumulative"
          name="cumulative"
          stroke={LINE_COLOR}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          connectNulls={false}
          animationDuration={0}
          isAnimationActive={false}
          yAxisId="right"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
