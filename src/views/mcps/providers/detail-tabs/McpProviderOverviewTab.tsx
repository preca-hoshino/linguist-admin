import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { McpProvider } from '@/types/mcp';

export function McpProviderOverviewTab({ provider }: { readonly provider: McpProvider }): React.JSX.Element {
  return (
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
  );
}
