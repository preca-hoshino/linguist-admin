const UNITS: readonly [number, string][] = [
  [1_000_000_000, 'B'],
  [1_000_000, 'M'],
  [1000, 'K'],
];

/**
 * 将数字格式化为带单位后缀的紧凑形式。
 * @example formatCompact(1234)    → "1.2K"
 * @example formatCompact(5600000) → "5.6M"
 */
export function formatCompact(value?: number | null, decimals = 1): string {
  if (value == null) {
    return '0';
  }
  const abs = Math.abs(value);
  for (const [threshold, suffix] of UNITS) {
    if (abs >= threshold) {
      return (value / threshold).toFixed(decimals) + suffix;
    }
  }
  return value.toLocaleString();
}

/**
 * 将毫秒延迟格式化为人类可读形式。
 * @example formatLatency(350)  → "350ms"
 * @example formatLatency(1250) → "1.3s"
 * @example formatLatency(null) → "—"
 */
export function formatLatency(ms?: number | null): string {
  if (ms == null) {
    return '—';
  }
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * 将百分比格式化为字符串（保留 1 位小数）。
 * @example formatPercent(0.957) → "95.7%"
 * @example formatPercent(null)  → "—"
 */
export function formatPercent(ratio?: number | null): string {
  if (ratio == null) {
    return '—';
  }
  return `${(ratio * 100).toFixed(1)}%`;
}
