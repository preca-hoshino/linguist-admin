import { Link, useLoaderData, useRouter } from '@tanstack/react-router';
import { ArrowRight, ChevronLeft, Clock, Cloud, Code2, Database, FileText, Trash2, User, Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteMcpLog } from '@/api/mcp/logs';
import { CopyableId } from '@/components/CopyableId';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import type { McpLog } from '@/types/mcp';
import { cn } from '@/utils/utils';
import { McpLogContentTab } from './detail-tabs/McpLogContentTab';
import { McpLogRawDataTab } from './detail-tabs/McpLogRawDataTab';
import { McpLogMetadataTab } from './detail-tabs/McpLogMetadataTab';

const LOG_TABS = ['content', 'payload', 'metadata'] as const;
type LogTab = (typeof LOG_TABS)[number];

function relativeTime(dateStr: string, t: ReturnType<typeof useTranslation>['t']): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60_000);
  const hr = Math.floor(diff / 3_600_000);
  const day = Math.floor(diff / 86_400_000);
  if (min < 1) {
    return t('mcpsPage.logs.justNow', { defaultValue: 'Just now' });
  }
  if (min < 60) {
    return t('mcpsPage.logs.minutesAgo', { count: min, defaultValue: '{{count}} minutes ago' });
  }
  if (hr < 24) {
    return t('mcpsPage.logs.hoursAgo', { count: hr, defaultValue: '{{count}} hours ago' });
  }
  return t('mcpsPage.logs.daysAgo', { count: day, defaultValue: '{{count}} days ago' });
}

function LogPageHeader({ log }: { readonly log: McpLog }): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();

  const handleDelete = async (): Promise<void> => {
    try {
      await deleteMcpLog(log.id);
      toast.success(t('mcpsPage.logs.deleteSuccess', 'MCP 日志已删除'));
      void router.navigate({ to: '/mcps/logs' });
    } catch {
      toast.error(t('mcpsPage.logs.deleteError', '删除失败'));
    }
  };

  const renderNode = (icon: React.ReactNode, title: string, desc1?: string | null): React.JSX.Element => (
    <div className="flex flex-col items-center gap-2 shrink-0 z-10 w-24">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm">
        {icon}
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {desc1 != null && desc1 !== '' && (
          <span className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate max-w-[100px]" title={desc1}>
            {desc1}
          </span>
        )}
      </div>
    </div>
  );

  const renderEdge = (label: string, isError?: boolean): React.JSX.Element => (
    <div
      className="flex flex-col items-center justify-center relative shrink-0 mx-6 -mt-6"
      style={{ minWidth: '160px' }}
    >
      <div
        className={cn(
          'absolute w-full h-[1px] left-0 top-1/2 -translate-y-1/2',
          isError ? 'bg-destructive/40 border-dashed border-t border-destructive/40 bg-transparent' : 'bg-border',
        )}
      />
      <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 text-border">
        <ArrowRight className={cn('h-4 w-4', isError && 'text-destructive/50')} />
      </div>
      <Badge
        variant="outline"
        className={cn(
          'z-10 bg-background shadow-sm truncate max-w-full text-[10px]',
          isError && 'border-destructive/50 text-destructive',
        )}
      >
        {label}
      </Badge>
    </div>
  );

  const isError = log.error != null;
  const isCompleted = !isError;

  return (
    <div className="flex flex-col gap-6 mb-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" asChild>
          <Link to="/mcps/logs">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('common.backToList', 'Back to List')}
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-foreground">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">{log.id.slice(0, 8)}</h1>
              <CopyableId id={log.id} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  isCompleted &&
                    'border-green-300 text-green-700 bg-green-50/50 dark:border-green-900 dark:text-green-400 dark:bg-green-900/20',
                  isError && 'border-destructive/40 text-destructive bg-destructive/5',
                )}
              >
                {isCompleted ? t('common.success', 'Success') : t('common.error', 'Error')}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs font-mono text-blue-600/90 border-blue-400 dark:text-blue-400 dark:border-blue-900"
              >
                {log.method}
              </Badge>
              <Badge
                variant="outline"
                className={cn('text-[11px] font-mono', log.duration_ms > 2000 && 'border-amber-400 text-amber-600')}
              >
                {log.duration_ms}ms
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{relativeTime(log.created_at, t)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => void handleDelete()}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {t('common.delete', '删除')}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-8 relative max-w-full overflow-x-auto">
        {renderNode(<User className="h-5 w-5" />, t('mcpsPage.logs.clientNode', 'Client'), log.app_id ?? 'Unknown')}
        {renderEdge(log.method, isError)}
        {renderNode(
          <Database className="h-5 w-5" />,
          t('mcpsPage.logs.virtualMcpNode', 'Virtual MCP'),
          log.virtual_mcp_id ?? 'Unknown',
        )}
        {renderEdge(log.method, isError)}
        {renderNode(
          <Cloud className="h-5 w-5" />,
          t('mcpsPage.logs.mcpServerNode', 'MCP Server'),
          log.mcp_provider_id ?? 'Unknown',
        )}
      </div>
    </div>
  );
}

export function McpLogDetailPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { log } = useLoaderData({
    from: '/_authenticated/mcps/logs/$id',
  });

  usePageTitle(`MCP Logs - ${log.id.slice(0, 8)}`);

  const [activeTab, setActiveTab] = useState<LogTab>('content');

  return (
    <Main className="flex flex-1 flex-col gap-6">
      <LogPageHeader log={log} />

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as LogTab);
        }}
        className="space-y-6"
      >
        <div className="scrollbar-hide -mb-1 flex items-center justify-between overflow-x-auto pb-1">
          <TabsList className="h-9 w-auto justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="content"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t('modelsPage.logs.detail.content', 'Content')}
            </TabsTrigger>

            <TabsTrigger
              value="payload"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Code2 className="mr-2 h-4 w-4" />
              {t('modelsPage.logs.detail.rawData', 'Payload')}
            </TabsTrigger>

            <TabsTrigger
              value="metadata"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Info className="mr-2 h-4 w-4" />
              {t('modelsPage.logs.detail.metadata', 'Metadata')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="content" className="outline-none">
          <McpLogContentTab log={log} />
        </TabsContent>

        <TabsContent value="payload" className="outline-none">
          <McpLogRawDataTab log={log} />
        </TabsContent>

        <TabsContent value="metadata" className="outline-none">
          <McpLogMetadataTab log={log} />
        </TabsContent>
      </Tabs>
    </Main>
  );
}
