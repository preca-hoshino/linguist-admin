import { Link, useLoaderData, useRouter } from '@tanstack/react-router';
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  Clock,
  Cloud,
  Code2,
  FileText,
  MessageSquare,
  RouterIcon,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteMcpLog } from '@/api/mcp/logs';
import { CopyableId } from '@/components/CopyableId';
import { ProviderBadge } from '@/components/provider/ProviderBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import type { McpLog } from '@/types/mcp';
import { cn } from '@/utils/utils';
import { McpLogContentTab } from './detail-tabs/McpLogContentTab';
import { McpLogMetadataTab } from './detail-tabs/McpLogMetadataTab';
import { McpLogPerformanceTab } from './detail-tabs/McpLogPerformanceTab';

const LOG_TABS = ['content', 'performance', 'metadata'] as const;
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

  const renderNode = (
    icon: React.ReactNode,
    title: string,
    desc1?: string | null,
    desc2?: string | null,
  ): React.JSX.Element => (
    <div className="flex flex-col items-center gap-2 shrink-0 z-10 min-w-24 max-w-[250px]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm">
        {icon}
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {desc1 != null && desc1 !== '' && (
          <span className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate max-w-full" title={desc1}>
            {desc1}
          </span>
        )}
        {desc2 != null && desc2 !== '' && (
          <Badge
            variant="secondary"
            className="text-[10px] mt-1 hover:bg-secondary font-normal truncate max-w-full"
            title={desc2}
          >
            {desc2}
          </Badge>
        )}
      </div>
    </div>
  );

  const renderEdge = (label: string, isError?: boolean): React.JSX.Element => (
    <div
      className="flex flex-col items-center justify-center relative shrink-0 mx-6 -mt-8"
      style={{ minWidth: '240px' }}
    >
      {/* 水平连线 */}
      <div
        className={cn(
          'absolute w-full h-[1px] left-0 top-1/2 -translate-y-1/2',
          isError ? 'bg-destructive/40 border-dashed border-t border-destructive/40 bg-transparent' : 'bg-border',
        )}
      />
      {/* 小箭头 */}
      <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 text-border">
        <ArrowRight className={cn('h-4 w-4', isError && 'text-destructive/50')} />
      </div>
      {/* 线中标签 (统一采用 Provider 小胶囊样式) */}
      <ProviderBadge provider={null} label={label} isError={isError} className="z-10 bg-background shadow-sm" />
    </div>
  );

  const isCompleted = log.status === 'completed';
  const isError = log.status === 'error';
  const ctx = log.mcp_context as Record<string, unknown> | undefined;
  const appNameFromCtx = ctx ? (ctx as { appName?: string }).appName : undefined;
  const virtualMcpName = ctx ? (ctx as { virtualMcpName?: string }).virtualMcpName : undefined;
  const providerMcpName = ctx ? (ctx as { mcpProviderName?: string }).mcpProviderName : undefined;

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
                  !isCompleted && !isError && 'text-muted-foreground',
                )}
              >
                {((): string => {
                  if (isCompleted) {
                    return t('modelsPage.logs.statusCompleted', '成功');
                  }
                  if (isError) {
                    return t('modelsPage.logs.statusError', '失败');
                  }
                  return t('modelsPage.logs.statusProcessing', '处理中');
                })()}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs font-mono text-blue-600/90 border-blue-400 dark:text-blue-400 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20"
              >
                {log.method}
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
        {/* Client */}
        {renderNode(
          <User className="h-5 w-5" />,
          appNameFromCtx ?? t('mcpsPage.logs.clientNode', 'Client'),
          null,
          log.app_id,
        )}

        {/* Client -> Virtual MCP */}
        {renderEdge(log.method, false)}

        {/* Virtual MCP (Router) */}
        {renderNode(
          <RouterIcon className="h-5 w-5" />,
          virtualMcpName ?? t('mcpsPage.logs.virtualMcpNode', 'Virtual MCP'),
          null,
          log.virtual_mcp_id,
        )}

        {/* Virtual MCP -> Provider */}
        {renderEdge(log.method, isError)}

        {/* Provider */}
        {renderNode(
          <Cloud className="h-5 w-5" />,
          providerMcpName ?? t('mcpsPage.logs.mcpServerNode', 'MCP Server'),
          null,
          log.mcp_provider_id,
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
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              {t('modelsPage.logs.detail.tabContent', '内容')}
            </TabsTrigger>

            <TabsTrigger
              value="performance"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Activity className="mr-1.5 h-3.5 w-3.5" />
              {t('modelsPage.logs.detail.tabPerformance', '性能')}
            </TabsTrigger>

            <TabsTrigger
              value="metadata"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Code2 className="mr-1.5 h-3.5 w-3.5" />
              {t('modelsPage.logs.detail.tabMetadata', '元数据')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="content" className="outline-none">
          <McpLogContentTab log={log} />
        </TabsContent>

        <TabsContent value="performance" className="outline-none">
          <McpLogPerformanceTab log={log} />
        </TabsContent>

        <TabsContent value="metadata" className="outline-none">
          <McpLogMetadataTab log={log} />
        </TabsContent>
      </Tabs>
    </Main>
  );
}
