import { ProviderLogo } from './ProviderLogo';

/**
 * ProviderCell
 *
 * 在表格"提供商"列和详情行中统一渲染提供商图标 + 名称。
 *
 * 图标标识（icon key）优先级：kind → id
 * 显示名称优先级：name → id
 *
 * size:
 *   - "md"（默认）: h-6 w-6 容器，图标 14px —— 用于详情行 / 宽表格列
 *   - "sm"         : h-5 w-5 容器，图标 12px —— 用于紧凑表格列
 */
export interface ProviderCellProps {
  /** 用于渲染图标的标识符（通常是 provider_kind / providerKind / userFormat） */
  readonly kind?: string | null | undefined;
  /** 提供商实例 ID（图标和名称双重 fallback） */
  readonly id?: string | null | undefined;
  /** 对人类友好的显示名称（通常是 provider_name / providerName） */
  readonly name?: string | null | undefined;
  /** 容器尺寸规格。默认 "md" */
  readonly size?: 'sm' | 'md';
}

export function ProviderCell({ kind, id, name, size = 'md' }: ProviderCellProps): React.JSX.Element {
  const iconKey = kind != null && kind !== '' ? kind : (id ?? '');
  const label = name != null && name !== '' ? name : (id ?? '');

  const isSm = size === 'sm';
  const containerClass = isSm
    ? 'flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border bg-background text-muted-foreground shadow-sm'
    : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-muted-foreground shadow-sm';
  const textClass = isSm ? 'truncate text-xs text-foreground max-w-[200px]' : 'text-sm text-foreground';
  const iconSize = isSm ? 12 : 14;

  return (
    <div className="flex items-center gap-2">
      <span className={containerClass}>
        <ProviderLogo provider={iconKey} size={iconSize} type="mono" className="fill-current" />
      </span>
      <span className={textClass}>{label}</span>
    </div>
  );
}
