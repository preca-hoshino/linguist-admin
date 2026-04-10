import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { ApiKeysProvider, useApiKeys } from './api-keys-context';
import { ApiKeysDialogs } from './api-keys-dialogs';
import { ApiKeysPrimaryButtons } from './api-keys-primary-buttons';
import { ApiKeysTable } from './api-keys-table';

function ApiKeysContent(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('apiKeys.title', 'API Keys'));
  const { error } = useApiKeys();

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('apiKeys.title', 'API Keys')}</h2>
          <p className="text-muted-foreground">{t('apiKeys.desc', 'Manage your API keys for programmatic access.')}</p>
        </div>
        <ApiKeysPrimaryButtons />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <ApiKeysTable />
    </Main>
  );
}

export function ApiKeysPage({ appId }: { readonly appId?: string }): React.JSX.Element {
  return (
    <ApiKeysProvider appId={appId ?? ''}>
      <ApiKeysContent />
      <ApiKeysDialogs />
    </ApiKeysProvider>
  );
}
