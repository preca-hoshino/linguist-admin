import { AppWindow } from 'lucide-react';

export interface AppCellProps {
  /** 对人类友好的显示名称 */
  readonly name?: string | null | undefined;
  /** 自定义图标组件，若不传则默认使用 AppWindow */
  readonly icon?: React.ElementType;
  /** 容器尺寸规格。默认 "md" */
  readonly size?: 'sm' | 'md';
}

export function AppCell({ name, icon: Icon = AppWindow, size = 'md' }: AppCellProps): React.JSX.Element {
  const label = name != null && name !== '' ? name : '-';

  const isSm = size === 'sm';
  const containerClass = isSm
    ? 'flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border bg-background text-muted-foreground shadow-sm'
    : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-muted-foreground shadow-sm';
  const textClass = isSm ? 'truncate text-xs text-foreground max-w-[110px]' : 'text-sm text-foreground';
  const iconSize = isSm ? 12 : 14;

  return (
    <div className="flex items-center gap-2">
      <span className={containerClass}>
        <Icon size={iconSize} className="opacity-80" strokeWidth={2.5} />
      </span>
      <span className={textClass} title={label === '-' ? undefined : label}>
        {label}
      </span>
    </div>
  );
}
