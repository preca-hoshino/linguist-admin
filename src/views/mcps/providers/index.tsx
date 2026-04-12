import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { ProvidersProvider, useProviders } from './providers-context';
import { ProvidersDialogs } from './providers-dialogs';
import { ProvidersPrimaryButtons } from './providers-primary-buttons';
import { ProvidersTable } from './providers-table';

function ProvidersContent(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('mcpsPage.providers.title', 'MCP Providers'));
  const { error } = useProviders();

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('mcpsPage.providers.title', 'MCP Providers')}</h2>
          <p className="text-muted-foreground">
            {t(
              'mcpsPage.providers.desc',
              'Configure and manage MCP providers like local stdio commands or HTTP SSE endpoints.',
            )}
          </p>
        </div>
        <ProvidersPrimaryButtons />
      </div>

      {error != null && error !== '' ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <ProvidersTable />
    </Main>
  );
}

export function McpProvidersPage(): React.JSX.Element {
  return (
    <ProvidersProvider>
      <ProvidersContent />
      <ProvidersDialogs />
    </ProvidersProvider>
  );
}
