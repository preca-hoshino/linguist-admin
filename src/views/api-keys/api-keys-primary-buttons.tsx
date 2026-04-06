import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useApiKeys } from './api-keys-context';

export function ApiKeysPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen } = useApiKeys();

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => {
          setOpen('create');
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('apiKeys.createKey', 'Create Key')}
      </Button>
    </div>
  );
}
