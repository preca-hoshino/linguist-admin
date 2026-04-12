import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useProviders } from './providers-context';

export function ProvidersPrimaryButtons(): React.JSX.Element {
  const { setDialogState } = useProviders();

  return (
    <Button
      onClick={() => {
        setDialogState((prev) => ({ ...prev, createOpen: true }));
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add MCP Provider
    </Button>
  );
}
