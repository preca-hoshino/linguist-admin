import { useTranslation } from 'react-i18next';
import { CreateButton } from '@/components/crud-table';
import { useProviders } from './providers-context';

export function ProvidersPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useProviders();

  return (
    <div className="flex gap-2">
      <CreateButton
        module="mcp"
        label={t('mcpsPage.providers.create', 'Add MCP Provider')}
        onClick={() => {
          setCurrentRow(null);
          setOpen('create');
        }}
      />
    </div>
  );
}
