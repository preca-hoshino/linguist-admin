import { Box, Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import type { DashboardMode } from '@/types/dashboard';

interface DashboardModeSwitcherProps {
  readonly mode: DashboardMode;
  readonly onChange: (mode: DashboardMode) => void;
}

export function DashboardModeSwitcher({ mode, onChange }: DashboardModeSwitcherProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex items-center">
      <Tabs
        value={mode}
        onValueChange={(val) => {
          if (val !== '' && val !== mode) {
            onChange(val as DashboardMode);
          }
        }}
      >
        <TabsList className="h-9">
          <TabsTrigger value="model" className="flex items-center gap-2 text-xs">
            <Box className="h-3.5 w-3.5" />
            <span>{t('dashboard.mode.model', 'Models')}</span>
          </TabsTrigger>
          <TabsTrigger value="mcp" className="flex items-center gap-2 text-xs">
            <Network className="h-3.5 w-3.5" />
            <span>{t('dashboard.mode.mcp', 'MCPs')}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
