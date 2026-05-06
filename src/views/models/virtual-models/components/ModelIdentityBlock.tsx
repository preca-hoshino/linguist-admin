import { ProviderLogo } from '@/components/provider/ProviderLogo';
import { cn } from '@/utils/utils';

export interface ModelIdentityBlockProps {
  /** 提供商模型名称（主标识） */
  readonly modelName: string;
  /** 提供商名称（副标识） */
  readonly providerName: string;
  /** 提供商 kind，用于渲染图标 */
  readonly providerKind: string;
  /** 可选额外 class */
  readonly className?: string;
}

/**
 * ModelIdentityBlock
 *
 * 统一的模型身份展示块：提供商图标 + 模型名（主行） + 提供商名（副行）。
 * 在虚拟模型配置的搜索列表和已选列表中共用，保证视觉一致。
 */
export function ModelIdentityBlock({
  modelName,
  providerName,
  providerKind,
  className,
}: ModelIdentityBlockProps): React.JSX.Element {
  return (
    <div className={cn('flex min-w-0 flex-1 items-center gap-3', className)}>
      {/* 图标 */}
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm">
        <ProviderLogo provider={providerKind} size={14} type="mono" className="fill-current" />
      </span>
      {/* 文字区：模型名（主） → 提供商名（副） */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-sm font-medium leading-tight">{modelName}</div>
        {providerName !== '' && (
          <div className="truncate text-xs leading-tight text-muted-foreground">{providerName}</div>
        )}
      </div>
    </div>
  );
}
