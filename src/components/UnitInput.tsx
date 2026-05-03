import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/utils/utils';

export interface UnitOption {
  /** 单位标签（如 K, M, B, ms, s） */
  readonly label: string;
  /** 换算倍数：1 单位 = multiplier 基本单位 */
  readonly multiplier: number;
}

// ============================================================================
// 1. UnitInput — 纯数字输入框
// ============================================================================

interface UnitInputProps {
  readonly value: string;
  readonly onChange: (raw: string) => void;
  readonly placeholder?: string;
  readonly min?: number;
  readonly className?: string;
  readonly disabled?: boolean;
}

export function UnitInput({ value, onChange, placeholder, min, className, disabled }: UnitInputProps): React.JSX.Element {
  return (
    <Input
      type="number"
      min={min}
      step="any"
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      className={cn(
        'h-9 w-28 font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        className,
      )}
    />
  );
}

// ============================================================================
// 2. UnitTabs — 基于 shadcn Tabs 的单位切换
// ============================================================================

interface UnitTabsProps {
  readonly units: readonly UnitOption[];
  readonly selected: string;
  readonly onSelect: (label: string) => void;
  readonly className?: string;
  readonly disabled?: boolean;
}

export function UnitTabs({ units, selected, onSelect, className, disabled }: UnitTabsProps): React.JSX.Element {
  return (
    <Tabs
      value={selected}
      onValueChange={(v) => {
        if (v) onSelect(v);
      }}
      className={className}
    >
      <TabsList className="h-9 rounded-lg">
        {units.map((u) => (
          <TabsTrigger
            key={u.label}
            value={u.label}
            disabled={disabled}
            className="px-2.5 text-xs"
          >
            {u.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

// ============================================================================
// 3. useUnitInput — Hook：单位状态 + 换算逻辑
// ============================================================================

const DEFAULT_TOKEN_UNITS: readonly UnitOption[] = [
  { label: 'K', multiplier: 1_000 },
  { label: 'M', multiplier: 1_000_000 },
  { label: 'B', multiplier: 1_000_000_000 },
];

const DEFAULT_TIME_UNITS: readonly UnitOption[] = [
  { label: 'ms', multiplier: 1 },
  { label: 's', multiplier: 1_000 },
];

export const TOKEN_UNITS = DEFAULT_TOKEN_UNITS;
export const TIME_UNITS = DEFAULT_TIME_UNITS;

interface UseUnitInputOptions {
  readonly baseValue: number | null;
  readonly onChange: (value: number | null) => void;
  readonly units?: readonly UnitOption[] | undefined;
  readonly defaultUnit?: string | undefined;
  readonly min?: number;
}

interface UseUnitInputReturn {
  displayValue: string;
  onInputChange: (raw: string) => void;
  unitLabel: string;
  onUnitChange: (label: string) => void;
  units: readonly UnitOption[];
  /** 自动生成的 placeholder 文本 */
  placeholder: string;
}

export function useUnitInput({
  baseValue,
  onChange,
  units: rawUnits,
  defaultUnit,
  min = 0,
}: UseUnitInputOptions): UseUnitInputReturn {
  const units = rawUnits ?? DEFAULT_TOKEN_UNITS;
  const initialLabel = defaultUnit !== undefined && units.some((u) => u.label === defaultUnit)
    ? defaultUnit
    : (units[0]?.label ?? '');

  const [unitLabel, setUnitLabel] = useState(initialLabel);
  const activeUnit = units.find((u) => u.label === unitLabel) ?? units[0];
  const multiplier = activeUnit?.multiplier ?? 1;

  const displayValue = baseValue !== null && baseValue !== undefined ? String(baseValue / multiplier) : '';

  // 自动生成 placeholder：显式带有单位提示
  const placeholder = `0 ${unitLabel}`;

  const onInputChange = (raw: string): void => {
    if (raw === '' || raw === '-') {
      onChange(null);
      return;
    }
    const num = Number.parseFloat(raw);
    if (Number.isNaN(num)) {
      return;
    }
    const actual = Math.round(num * multiplier);
    onChange(actual < (min ?? 0) ? null : actual);
  };

  const onUnitChange = (label: string): void => {
    setUnitLabel(label);
  };

  return { displayValue, onInputChange, unitLabel, onUnitChange, units, placeholder };
}

