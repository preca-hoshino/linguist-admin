import { Box, Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DashboardMode } from '@/types/dashboard';

interface DashboardModeSwitcherProps {
  readonly mode: DashboardMode;
  readonly onChange: (mode: DashboardMode) => void;
}

export function DashboardModeSwitcher({ mode, onChange }: DashboardModeSwitcherProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex items-center rounded-md border bg-muted/40 p-1">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(val) => {
          if (val !== '' && val !== mode) {
            onChange(val as DashboardMode);
          }
        }}
        className="h-7 gap-1"
      >
        <ToggleGroupItem value="model" aria-label="Toggle model mode" className="h-7 px-3 text-xs">
          <Box className="mr-2 h-3.5 w-3.5" />
          {t('dashboard.mode.model', 'Models')}
        </ToggleGroupItem>
        <ToggleGroupItem value="mcp" aria-label="Toggle mcp mode" className="h-7 px-3 text-xs">
          <Network className="mr-2 h-3.5 w-3.5" />
          {t('dashboard.mode.mcp', 'MCPs')}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
