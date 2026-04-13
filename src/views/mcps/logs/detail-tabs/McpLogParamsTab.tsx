import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { McpLog } from '@/types/mcp';

export function McpLogParamsTab({ log }: { readonly log: McpLog }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(log.params).length > 0 ? (
          <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-[600px] overflow-y-auto">
            {JSON.stringify(log.params, null, 2)}
          </pre>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No Parameters</div>
        )}
      </CardContent>
    </Card>
  );
}
