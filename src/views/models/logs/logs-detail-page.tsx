import { Link, useLoaderData, useRouter } from '@tanstack/react-router';
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  Clock,
  Cloud,
  Code2,
  CreditCard,
  FileText,
  MessageSquare,
  RouterIcon,
  Tags,
  Trash2,
  User,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteRequestLog } from '@/api/request-logs';
import { CopyableId } from '@/components/CopyableId';
import { ProviderBadge } from '@/components/ProviderBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import type { RequestLog } from '@/types';
import { cn } from '@/utils/utils';
import { LogBillingTab } from './detail-tabs/LogBillingTab';
import { LogContentTab } from './detail-tabs/LogContentTab';
import { LogMetadataTab } from './detail-tabs/LogMetadataTab';
import { LogPerformanceTab } from './detail-tabs/LogPerformanceTab';
import { LogTagsTab } from './detail-tabs/LogTagsTab';
import { LogToolsTab } from './detail-tabs/LogToolsTab';

type LogTab = 'content' | 'tools' | 'performance' | 'billing' | 'tags' | 'metadata';

// ── 相对时间
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60_000);
  const hr = Math.floor(diff / 3_600_000);
  const day = Math.floor(diff / 86_400_000);
  if (min < 1) {
    return '刚刚';
  }
  if (min < 60) {
    return `${min} 分钟前`;
  }
  if (hr < 24) {
    return `${hr} 小时前`;
  }
  return `${day} 天前`;
}

function mapFormatToProvider(f?: string | null): string | null {
  if (f == null || f === '') {
    return null;
  }
  if (f === 'openaicompat') {
    return 'openai';
  }
  if (f === 'anthropic') {
    return 'anthropic';
  }
  if (f === 'gemini') {
    return 'gemini';
  }
  return f;
}

function formatUserFormat(f?: string | null): string {
  if (f == null || f === '') {
    return 'unknown';
  }
  if (f === 'openaicompat') {
    return 'openai compat';
  }
  return f;
}

// ── 页头
function LogPageHeader({ log }: { readonly log: RequestLog }): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const ctx = log.gateway_context;

  const handleDelete = async (): Promise<void> => {
    try {
      await deleteRequestLog(log.id);
      toast.success(t('modelsPage.logs.deleteSuccess', '日志已删除'));
      void router.navigate({ to: '/models/logs' });
    } catch {
      toast.error(t('modelsPage.logs.deleteError', '删除失败'));
    }
  };

  const getStrategyName = (s?: string | null): string => {
    if (s === 'load_balance') {
      return t('modelsPage.virtualModels.strategyLoadBalance', 'Load Balance');
    }
    if (s === 'failover') {
      return t('modelsPage.virtualModels.strategyFailover', 'Failover');
    }
    if (s === 'fallback') {
      return t('modelsPage.virtualModels.strategyFailback', 'Failback');
    }
    return s == null || s === '' ? 'N/A' : s;
  };

  // 避免在组件内部重复定义子组件，提取为渲染函数以提升性能 (React Best Practices)
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
          <span className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate max-w-full">{desc1}</span>
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

  const renderEdge = (label: string, providerKind?: string | null, isError?: boolean): React.JSX.Element => (
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
      <ProviderBadge provider={providerKind} label={label} isError={isError} className="z-10 bg-background shadow-sm" />
    </div>
  );

  const isCompleted = log.status === 'completed';
  const isError = log.status === 'error';
  const appNameFromCtx = ctx ? (ctx as unknown as { appName?: string }).appName : undefined;

  return (
    <div className="flex flex-col gap-6 mb-2">
      {/* 顶层返回按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" asChild>
          <Link to="/models/logs">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('modelsPage.logs.backToList', '返回日志列表')}
          </Link>
        </Button>
      </div>

      {/* 新版页头区 (Standard SaaS Layout) */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* 大图标 */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-foreground">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            {/* 主标题行 */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">{log.id.slice(0, 8)}</h1>
              <CopyableId id={log.id} />
            </div>
            {/* 副标题行 (多个标签) */}
            <div className="mt-1.5 flex items-center gap-2">
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
              {ctx?.stream != null && (
                <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
                  {ctx.stream ? 'Stream' : 'Non-Stream'}
                </Badge>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{relativeTime(log.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧全局操作区 */}
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

      {/* 拓扑连线图层 (居中，短横线紧凑阵型) */}
      <div className="flex items-center justify-center px-4 py-8 relative max-w-full overflow-x-auto">
        {/* Client */}
        {renderNode(
          <User className="h-5 w-5" />,
          appNameFromCtx ?? ctx?.apiKeyName ?? 'Unknown Client',
          null,
          ctx?.requestModel,
        )}

        {/* Client -> Linguist */}
        {renderEdge(
          formatUserFormat(ctx?.userFormat),
          mapFormatToProvider(ctx?.userFormat), // format 对应的图表
          false,
        )}

        {/* Linguist */}
        {renderNode(<RouterIcon className="h-5 w-5" />, 'Linguist', null, getStrategyName(ctx?.route?.strategy))}

        {/* Linguist -> Provider */}
        {renderEdge(ctx?.route?.providerKind ?? 'unknown', ctx?.route?.providerKind, !ctx?.route)}

        {/* Provider */}
        {renderNode(
          <Cloud className="h-5 w-5" />,
          ctx?.route?.providerName ?? 'Unknown Provider',
          null,
          ctx?.route?.model,
        )}
      </div>
    </div>
  );
}

// ── 主页面
export function ModelLogDetailPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { log } = useLoaderData({
    from: '/_authenticated/models/logs/$id',
  });

  usePageTitle(`${t('modelsPage.logs.title', 'Model Logs')} - ${log.id.slice(0, 8)}`);

  const [activeTab, setActiveTab] = useState<LogTab>('content');

  const ctx = log.gateway_context;
  const modelType = ctx?.route?.modelType ?? 'chat';

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
        <div className="overflow-x-auto -mb-1 pb-1 scrollbar-hide">
          <TabsList className="h-9 w-auto justify-start bg-transparent p-0 border-b rounded-none">
            <TabsTrigger
              value="content"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              {t('modelsPage.logs.detail.tabContent', '内容')}
            </TabsTrigger>

            {modelType !== 'embedding' && (
              <TabsTrigger
                value="tools"
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <Wrench className="mr-1.5 h-3.5 w-3.5" />
                {t('modelsPage.logs.detail.tabTools', '工具')}
              </TabsTrigger>
            )}

            <TabsTrigger
              value="performance"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Activity className="mr-1.5 h-3.5 w-3.5" />
              {t('modelsPage.logs.detail.tabPerformance', '性能')}
            </TabsTrigger>

            <TabsTrigger
              value="billing"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              {t('modelsPage.logs.detail.tabBilling', '成本')}
            </TabsTrigger>

            <TabsTrigger
              value="tags"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Tags className="mr-1.5 h-3.5 w-3.5" />
              {t('modelsPage.logs.detail.tabTags', '标记')}
            </TabsTrigger>

            <TabsTrigger
              value="metadata"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Code2 className="mr-1.5 h-3.5 w-3.5" />
              {t('modelsPage.logs.detail.tabMetadata', '元数据')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="content" className="outline-none">
          {ctx ? (
            <LogContentTab ctx={ctx} />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              {t('modelsPage.logs.detail.noContext', '暂无上下文数据')}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools" className="outline-none">
          {ctx ? (
            <LogToolsTab ctx={ctx} />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              {t('modelsPage.logs.detail.noContext', '暂无上下文数据')}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="outline-none">
          <LogPerformanceTab log={log} />
        </TabsContent>

        <TabsContent value="billing" className="outline-none">
          <LogBillingTab log={log} />
        </TabsContent>

        <TabsContent value="tags" className="outline-none">
          <LogTagsTab log={log} />
        </TabsContent>

        <TabsContent value="metadata" className="outline-none">
          <LogMetadataTab log={log} />
        </TabsContent>
      </Tabs>
    </Main>
  );
}
