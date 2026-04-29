import { Server, Cpu } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DashboardMode } from '@/types/dashboard';

interface DashboardModeSwitcherProps {
  readonly mode: DashboardMode;
  readonly onChange: (mode: DashboardMode) => void;
}

export function DashboardModeSwitcher({ mode, onChange }: DashboardModeSwitcherProps): React.JSX.Element {
  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm font-medium text-muted-foreground hidden sm:block">模式</div>
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(val) => {
          if (val !== '' && val !== mode) {
            onChange(val as DashboardMode);
          }
        }}
        size="sm"
        className="bg-muted p-1 rounded-md"
      >
        <ToggleGroupItem value="model" className="gap-2 px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm">
          <Cpu className="h-4 w-4" />
          <span className="hidden sm:inline">大模型聚合</span>
          <span className="sm:hidden">模型</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="mcp" className="gap-2 px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm">
          <Server className="h-4 w-4" />
          <span className="hidden sm:inline">MCP 网络</span>
          <span className="sm:hidden">MCP</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
