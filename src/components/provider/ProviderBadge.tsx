import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/utils';
import { ProviderLogo } from './ProviderLogo';

export interface ProviderBadgeProps {
  /** 指定提供商标识（用于渲染 Logo，如果不填则没有 Logo） */
  readonly provider?: string | null | undefined;
  /** 显示的文字。如果不填，默认取 provider 作为文字 */
  readonly label?: string | null | undefined;
  /** 自定义外层样式 */
  readonly className?: string | undefined;
  /** 当有特定标识时改变外观 (例如告警) */
  readonly isError?: boolean | undefined;
}

export function ProviderBadge({ provider, label, className, isError }: ProviderBadgeProps): React.JSX.Element {
  const displayLabel = label ?? provider ?? '';

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5',
        isError && 'border-destructive/40 bg-destructive/5 text-destructive',
        className,
      )}
    >
      {Boolean(provider) && (
        <ProviderLogo
          provider={provider}
          size={14}
          type="mono"
          className={cn('fill-current', isError && 'text-destructive')}
        />
      )}
      {Boolean(displayLabel) && <span className="font-medium capitalize">{displayLabel}</span>}
    </Badge>
  );
}
