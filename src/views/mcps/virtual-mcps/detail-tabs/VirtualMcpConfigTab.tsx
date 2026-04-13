import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { VirtualMcp } from '@/types/mcp';

export function VirtualMcpConfigTab({ virtualMcp }: { readonly virtualMcp: VirtualMcp }): React.JSX.Element {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Whitelisted Tools</CardTitle>
        </CardHeader>
        <CardContent>
          {virtualMcp.config.tools != null && virtualMcp.config.tools.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {virtualMcp.config.tools.map((tool) => (
                <div key={tool} className="bg-muted px-2 py-1 rounded text-sm text-foreground">
                  {tool}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No tools are configured. All tools from the provider might be denied or accessible depending on backend
              policy.
            </p>
          )}
        </CardContent>
      </Card>

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
