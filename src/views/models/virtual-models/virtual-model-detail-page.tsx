import { Link, useLoaderData, useRouter } from '@tanstack/react-router';
import { Braces, ChevronLeft, GitMerge, MessageSquare, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyableId } from '@/components/CopyableId';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePageTitle } from '@/composables/use-page-title';
import { useProviderStats } from '@/composables/use-provider-stats';
import { Main } from '@/layouts/Main';
import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { cn } from '@/utils/utils';
import { TimeRangePicker } from '@/views/dashboard/components/TimeRangePicker';
import { BillingTabContent } from '@/views/models/shared/billing-tab-content';
import { VirtualModelDistributionTab } from './detail-tabs/VirtualModelDistributionTab';
import { VirtualModelErrorsTab } from './detail-tabs/VirtualModelErrorsTab';
// Tab 组件
import { VirtualModelOverviewTab } from './detail-tabs/VirtualModelOverviewTab';
import { VirtualModelPerformanceTab } from './detail-tabs/VirtualModelPerformanceTab';
import { VirtualModelSettingsTab } from './detail-tabs/VirtualModelSettingsTab';
import { VirtualModelsMutateDialog } from './virtual-models-mutate-dialog';

const VM_TABS = ['overview', 'performance', 'usage', 'errors', 'billing', 'settings'] as const;
type VmTab = (typeof VM_TABS)[number];

const MODEL_TYPE_ICON: Record<string, React.ElementType> = {
  chat: MessageSquare,
  embedding: Braces,
};

export function VirtualModelDetailPage(): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const { virtualModel: model } = useLoaderData({
    from: '/_authenticated/models/virtual-models/$id',
  });

  usePageTitle(`${t('modelsPage.virtualModels.title', 'Virtual Models')} - ${model.name}`);

  const [activeTab, setActiveTab] = useState<VmTab>('overview');
  const [timeRange, setTimeRange] = useState<GlobalTimeRange>('today');
  const [editOpen, setEditOpen] = useState(false);

  const filterOptions: StatsFilterOptions = {
    dimension: 'virtual_model',
    id: model.id,
  };

  const { today, overview, loading, error, refresh } = useProviderStats(model.id, timeRange, 'virtual_model');

  const TypeIcon = MODEL_TYPE_ICON[model.model_type] ?? MessageSquare;

  return (
    <Main className="flex flex-1 flex-col gap-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" asChild>
          <Link to="/models/virtual-models">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('modelsPage.virtualModels.backToList', 'Back to List')}
          </Link>
        </Button>
      </div>

      {/* 页头 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-foreground">
            <TypeIcon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{model.name}</h1>
              <CopyableId id={model.id} />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {t(`modelsPage.modelType.${model.model_type}`)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <GitMerge className="h-3 w-3" />
                <span className="font-mono text-xs">{model.routing_strategy}</span>
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  model.is_active ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground',
                )}
              >
                {model.is_active
                  ? t('modelsPage.virtualModels.active', 'Active')
                  : t('modelsPage.virtualModels.inactive', 'Inactive')}
              </Badge>
            </div>
          </div>
        </div>

        {/* 右侧操作区 */}
        <div className="flex shrink-0 items-center gap-2">
          <TimeRangePicker value={timeRange} onChange={setTimeRange} />
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="h-9">
            <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
            {t('dashboard.refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* Tab 导航 */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as VmTab);
        }}
        className="space-y-6"
      >
        <div className="scrollbar-hide -mb-1 flex items-center justify-between overflow-x-auto pb-1">
          <TabsList className="h-9 w-auto justify-start rounded-none border-b bg-transparent p-0">
            {VM_TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {t(`modelsPage.virtualModels.tabs.${tab}`, tab)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <VirtualModelOverviewTab
            model={model}
            timeRange={timeRange}
            filterOptions={filterOptions}
            today={today}
            overview={overview}
            loading={loading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="performance" className="outline-none">
          <VirtualModelPerformanceTab model={model} timeRange={timeRange} filterOptions={filterOptions} />
        </TabsContent>

        <TabsContent value="usage" className="outline-none">
          <VirtualModelDistributionTab model={model} timeRange={timeRange} filterOptions={filterOptions} />
        </TabsContent>

        <TabsContent value="errors" className="outline-none">
          <VirtualModelErrorsTab timeRange={timeRange} filterOptions={filterOptions} />
        </TabsContent>

        <TabsContent value="billing" className="outline-none">
          <BillingTabContent
            timeRange={timeRange}
            dimension="virtual_model"
            id={model.id}
            today={today}
            overview={overview}
          />
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <VirtualModelSettingsTab
            model={model}
            onEdit={() => {
              setEditOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* 编辑弹窗（在页面顶层挂载，避免 Tab 卸载时关闭） */}
      <VirtualModelsMutateDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        currentRow={model}
        onSuccess={() => {
          void router.invalidate();
        }}
      />
    </Main>
  );
}
