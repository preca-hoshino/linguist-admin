import { useTranslation } from 'react-i18next';
import type { DashboardMode } from '@/types/dashboard';
import { cn } from '@/utils/utils';

interface DashboardModeSwitcherProps {
  readonly mode: DashboardMode;
  readonly onChange: (mode: DashboardMode) => void;
  readonly availableModes?: DashboardMode[];
}

const MODE_LABELS: Record<DashboardMode, { i18nKey: string; fallback: string }> = {
  model: { i18nKey: 'dashboard.mode.model', fallback: 'Models' },
  mcp: { i18nKey: 'dashboard.mode.mcp', fallback: 'MCPs' },
};

export function DashboardModeSwitcher({
  mode,
  onChange,
  availableModes = ['model', 'mcp'],
}: DashboardModeSwitcherProps): React.JSX.Element {
  const { t } = useTranslation();

  // 仅一个可用模式时不渲染切换器
  if (availableModes.length <= 1) {
    return <></>;
  }

  return (
    <nav className="mx-4 flex items-center space-x-4 lg:space-x-6">
      {availableModes.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => {
            onChange(m);
          }}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            mode === m ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {t(MODE_LABELS[m].i18nKey, MODE_LABELS[m].fallback)}
        </button>
      ))}
    </nav>
  );
}
