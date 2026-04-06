import type { ReactElement } from 'react';

export function renderIsolatedDot(
  props: Record<string, unknown>,
  data: Record<string, unknown>[],
  dataKey: string,
): ReactElement | null {
  const cx = props.cx as number;
  const cy = props.cy as number;
  const payload = props.payload as Record<string, unknown> | undefined;
  const index = props.index as number;
  const stroke = props.stroke as string;

  // Recharts 中 Area 的 value 可能是一个 [base, target] 数组
  // 所以绝对不能用 value === null 来判断空值点。
  // 必须直接读原始数据载荷 payload[dataKey]
  const pureValue = payload?.[dataKey];
  if (pureValue === null || pureValue === undefined || Number.isNaN(pureValue)) {
    return null;
  }

  // 防止 SVG 坐标爆炸导致乱飘
  if (typeof cx !== 'number' || typeof cy !== 'number' || Number.isNaN(cx) || Number.isNaN(cy)) {
    return null;
  }

  const prev = data[index - 1];
  const next = data[index + 1];

  const prevNull = prev === undefined || prev[dataKey] === null || prev[dataKey] === undefined;
  const nextNull = next === undefined || next[dataKey] === null || next[dataKey] === undefined;

  // 只要两端有一端是断开的（孤立点或线段边缘点），我们就画个小圆点
  if (prevNull || nextNull) {
    return <circle cx={cx} cy={cy} r={2.5} fill={stroke} stroke="none" key={`dot-${index}`} />;
  }

  return null;
}
