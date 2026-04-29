import { useTranslation } from 'react-i18next';
import type { DashboardMode } from '@/types/dashboard';
import { cn } from '@/utils/utils';

interface DashboardModeSwitcherProps {
  readonly mode: DashboardMode;
  readonly onChange: (mode: DashboardMode) => void;
}

export function DashboardModeSwitcher({ mode, onChange }: DashboardModeSwitcherProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <nav className="mx-4 flex items-center space-x-4 lg:space-x-6">
      <button
        type="button"
        onClick={() => {
          onChange('model');
        }}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          mode === 'model' ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {t('dashboard.mode.model', 'Models')}
      </button>
      <button
        type="button"
        onClick={() => {
          onChange('mcp');
        }}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          mode === 'mcp' ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {t('dashboard.mode.mcp', 'MCPs')}
      </button>
    </nav>
  );
}
