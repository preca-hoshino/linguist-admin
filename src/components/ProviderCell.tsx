import { ProviderLogo } from '@/components/ProviderLogo';

/**
 * ProviderCell
 *
 * 在表格"提供商"列和详情行中统一渲染提供商图标 + 名称。
 * 图标优先使用 providerKind（如 'volcengine'），fallback 为 providerId。
 * 名称优先显示 providerName，fallback 为 providerId。
 */
export interface ProviderCellProps {
  /** 用于渲染图标的标识符（通常是 provider_kind / providerKind） */
  readonly kind?: string | null | undefined;
  /** 提供商实例 ID（fallback 图标 & 名称） */
  readonly id?: string | null | undefined;
  /** 对人类友好的显示名称（通常是 provider_name / providerName） */
  readonly name?: string | null | undefined;
}

export function ProviderCell({ kind, id, name }: ProviderCellProps): React.JSX.Element {
  const iconKey = kind !== '' && kind != null ? kind : (id ?? '');
  const label = name !== '' && name != null ? name : (id ?? '');

  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-muted-foreground shadow-sm">
        <ProviderLogo provider={iconKey} size={14} type="mono" className="fill-current" />
      </span>
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
}
