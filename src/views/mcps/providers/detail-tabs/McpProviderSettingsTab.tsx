import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import type { McpProvider } from '@/types/mcp';
import { VirtualMcpsProvider } from '../../virtual-mcps/virtual-mcps-context';
import { VirtualMcpsTable } from '../../virtual-mcps/virtual-mcps-table';

export function McpProviderSettingsTab({ provider }: { readonly provider: McpProvider }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Kind</dt>
                <dd className="font-medium">{provider.kind}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Base URL</dt>
                <dd className="font-medium">{provider.base_url || 'N/A'}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Credential Type</dt>
                <dd className="font-medium">{provider.credential_type}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Created At</dt>
                <dd className="font-medium">{new Date(provider.created_at).toLocaleString()}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Updated At</dt>
                <dd className="font-medium">{new Date(provider.updated_at).toLocaleString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transport Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(provider.config, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* 关联虚拟 MCP */}
      <VirtualMcpsProvider providerId={provider.id}>
        <div className="flex flex-1 flex-col gap-4">
          <h3 className="text-sm font-semibold">
            {t('mcpsPage.providers.settingsVirtualMcps', 'Associated Virtual MCPs')}
          </h3>
          <VirtualMcpsTable />
        </div>
      </VirtualMcpsProvider>
    </div>
  );
}
