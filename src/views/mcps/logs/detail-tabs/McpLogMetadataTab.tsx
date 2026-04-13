import { Terminal, Clock, Copy, Check, Server, RouterIcon, Box } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { McpLog } from '@/types/mcp';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@tanstack/react-router';

// Helper hook for copying text
function useCopy(): { copied: boolean; copy: (text: string) => Promise<void> } {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      /* ignore */
    }
  }, []);
  return { copied, copy };
}

function MetadataItem({
  label,
  value,
  icon,
  copyable = false,
  linkTo,
}: {
  readonly label: string;
  readonly value: string | undefined | null;
  readonly icon?: React.ReactNode;
  readonly copyable?: boolean | undefined;
  readonly linkTo?: string | undefined;
}): React.JSX.Element {
  const { copied, copy } = useCopy();

  const valueDisplay =
    value == null || value === '' ? (
      <span className="text-muted-foreground opacity-50 italic">未提供 / Unknown</span>
    ) : (
      value
    );

  const contentBase = (
    <div className="flex items-center gap-2 max-w-full">
      {icon != null && <div className="text-muted-foreground shrink-0">{icon}</div>}
      <span className="truncate font-mono grow text-sm font-medium">{valueDisplay}</span>
      {copyable && value != null && value !== '' && (
        <button
          type="button"
          onClick={() => void copy(value)}
          className="ml-2 flex items-center justify-center h-6 w-6 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0 transition-colors"
          title="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b last:border-0 border-border/40 gap-1.5 sm:gap-4">
      <div className="text-sm font-medium text-muted-foreground sm:w-1/4 shrink-0 px-2 pl-4">{label}</div>
      <div className="flex-1 min-w-0 px-2 sm:px-0">
        {linkTo != null && value != null && value !== '' ? (
          <Link to={linkTo} className="text-primary hover:underline underline-offset-4 decoration-primary/30">
            {contentBase}
          </Link>
        ) : (
          contentBase
        )}
      </div>
    </div>
  );
}

interface McpLogMetadataTabProps {
  readonly log: McpLog;
}

export function McpLogMetadataTab({ log }: McpLogMetadataTabProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 w-full pb-6">
      <Card className="rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/30 px-5 py-3 border-b">
          <h3 className="font-semibold text-sm tracking-tight flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            {t('modelsPage.logs.detail.mcpBasicInfo', '基础请求信息 (Basic Info)')}
          </h3>
        </div>
        <CardContent className="p-0">
          <MetadataItem label="Log ID" value={log.id} copyable />
          <MetadataItem label="Session ID" value={log.session_id} copyable />
          <MetadataItem label="Direction" value={log.direction.toUpperCase()} />
          <MetadataItem label="Protocol Method" value={log.method} copyable />
        </CardContent>
      </Card>

      <Card className="rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/30 px-5 py-3 border-b">
          <h3 className="font-semibold text-sm tracking-tight flex items-center gap-2">
            <RouterIcon className="h-4 w-4" />
            {t('modelsPage.logs.detail.mcpRoutingInfo', '路由资源信息 (Routing)')}
          </h3>
        </div>
        <CardContent className="p-0">
          <MetadataItem label="App ID (Client)" value={log.app_id} copyable icon={<Box className="h-4 w-4" />} />
          <MetadataItem
            label="Virtual MCP"
            value={log.virtual_mcp_id}
            copyable
            linkTo={
              log.virtual_mcp_id != null && log.virtual_mcp_id !== ''
                ? `/mcps/virtual-mcps/${log.virtual_mcp_id}`
                : undefined
            }
            icon={<RouterIcon className="h-4 w-4" />}
          />
          <MetadataItem
            label="MCP Provider"
            value={log.mcp_provider_id}
            copyable
            linkTo={
              log.mcp_provider_id != null && log.mcp_provider_id !== ''
                ? `/mcps/providers/${log.mcp_provider_id}`
                : undefined
            }
            icon={<Server className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/30 px-5 py-3 border-b">
          <h3 className="font-semibold text-sm tracking-tight flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('modelsPage.logs.detail.mcpTimingInfo', '时延跟踪 (Timing)')}
          </h3>
        </div>
        <CardContent className="p-0">
          <MetadataItem label="Created At" value={new Date(log.created_at).toLocaleString()} />
          <MetadataItem
            label="Duration"
            value={`${log.duration_ms} ms`}
            icon={
              <Badge
                variant="outline"
                className={log.duration_ms > 2000 ? 'border-amber-400 text-amber-600' : 'border-muted'}
              >
                {log.duration_ms > 2000 ? 'Slow' : 'Fast'}
              </Badge>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
