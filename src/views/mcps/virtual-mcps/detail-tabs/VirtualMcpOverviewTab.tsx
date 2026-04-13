import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { VirtualMcp } from '@/types/mcp';

export function VirtualMcpOverviewTab({ virtualMcp }: { readonly virtualMcp: VirtualMcp }): React.JSX.Element {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Description</dt>
              <dd className="font-medium">{virtualMcp.description || 'N/A'}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Provider ID</dt>
              <dd className="font-medium">
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{virtualMcp.mcp_provider_id}</code>
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Created At</dt>
              <dd className="font-medium">{new Date(virtualMcp.created_at).toLocaleString()}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Updated At</dt>
              <dd className="font-medium">{new Date(virtualMcp.updated_at).toLocaleString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
