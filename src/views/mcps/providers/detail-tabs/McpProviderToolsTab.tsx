import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { listMcpProviderTools } from '@/api/mcp-providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function McpProviderToolsTab({ providerId }: { readonly providerId: string }): React.JSX.Element {
  const { data, isLoading, error } = useQuery({
    queryKey: ['mcp-provider-tools', providerId],
    queryFn: async () => {
      const res = await listMcpProviderTools(providerId);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        Failed to load tools: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const tools = data ?? [];

  if (tools.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          No tools are provided by this MCP server.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tools.map((tool) => (
        <Card key={tool.name}>
          <CardHeader>
            <CardTitle>{tool.name}</CardTitle>
            {tool.description != null && tool.description !== '' && (
              <CardDescription>{tool.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {tool.inputSchema && (
              <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-60 overflow-y-auto">
                {JSON.stringify(tool.inputSchema, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
