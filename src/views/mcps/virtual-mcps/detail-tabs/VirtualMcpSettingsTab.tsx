import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { VirtualMcp } from '@/types/mcp';

export function VirtualMcpSettingsTab({ virtualMcp }: { readonly virtualMcp: VirtualMcp }): React.JSX.Element {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Raw Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto text-xs font-mono text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(virtualMcp.config, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
