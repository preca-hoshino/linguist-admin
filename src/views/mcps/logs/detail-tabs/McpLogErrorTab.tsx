import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { McpLog } from '@/types/mcp';

export function McpLogErrorTab({ log }: { readonly log: McpLog }): React.JSX.Element | null {
  if (!log.error) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive">Error Details</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="p-4 bg-destructive/10 rounded-lg overflow-x-auto text-xs font-mono text-destructive whitespace-pre-wrap max-h-[600px] overflow-y-auto">
          {JSON.stringify(log.error, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
