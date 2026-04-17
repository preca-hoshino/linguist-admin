import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVirtualMcps } from './virtual-mcps-context';

export function VirtualMcpsPrimaryButtons(): React.JSX.Element {
  const { setDialogState } = useVirtualMcps();

  return (
    <Button
      onClick={() => {
        setDialogState((prev) => ({ ...prev, createOpen: true }));
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Virtual MCP
    </Button>
  );
}
