import { Link, useLoaderData } from '@tanstack/react-router';
import { Braces, ChevronLeft, MessageSquare, RefreshCw } from 'lucide-react';
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
import { BillingTabContent } from '@/views/models/shared/BillingTabContent';
import { ProviderModelDistributionTab } from './detail-tabs/ProviderModelDistributionTab';
import { ProviderModelErrorsTab } from './detail-tabs/ProviderModelErrorsTab';
import { ProviderModelOverviewTab } from './detail-tabs/ProviderModelOverviewTab';
import { ProviderModelPerformanceTab } from './detail-tabs/ProviderModelPerformanceTab';
import { ProviderModelSettingsTab } from './detail-tabs/ProviderModelSettingsTab';

const MODEL_TABS = ['overview', 'performance', 'usage', 'errors', 'billing', 'settings'] as const;
type ModelTab = (typeof MODEL_TABS)[number];

const MODEL_TYPE_ICON: Record<string, React.ElementType> = {
  chat: MessageSquare,
  embedding: Braces,
};

export function ProviderModelDetailPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { providerModel: model } = useLoaderData({
    from: '/_authenticated/models/provider-models/$id',
  });

  usePageTitle(`${t('modelsPage.providerModels.title', 'Provider Models')} - ${model.name}`);

  const [activeTab, setActiveTab] = useState<ModelTab>('overview');
  const [timeRange, setTimeRange] = useState<GlobalTimeRange>('today');

  const filterOptions: StatsFilterOptions = {
    dimension: 'provider_model',
    id: model.id,
  };

  // 复用 provider stats hook，但传入 provider_model 维度
  // useProviderStats 内部调用 getStatsToday({ dimension, id }) 和 getStatsOverview({ range, dimension, id })
  // 因此可以复用，但需确认后端支持 dimension=provider_model
  const { today, overview, loading, error, refresh } = useProviderStats(model.id, timeRange, 'provider_model');

  const TypeIcon = MODEL_TYPE_ICON[model.model_type] ?? MessageSquare;

  return (
    <Main className="flex flex-1 flex-col gap-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" asChild>
          <Link to="/models/provider-models">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('modelsPage.providerModels.detailPage.backToList', 'Back to List')}
          </Link>
        </Button>
      </div>

      {/* 页头：Icon + 名称 + badges */}
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
              <Badge
                variant="outline"
                className={cn(
                  model.is_active ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground',
                )}
              >
                {model.is_active
                  ? t('modelsPage.providerModels.active', 'Active')
                  : t('modelsPage.providerModels.inactive', 'Inactive')}
              </Badge>
            </div>
          </div>
        </div>
        {/* 右侧操作区：时间选择器与刷新 */}
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
          setActiveTab(v as ModelTab);
        }}
        className="space-y-6"
      >
        <div className="scrollbar-hide -mb-1 flex items-center justify-between overflow-x-auto pb-1">
          <TabsList className="h-9 w-auto justify-start rounded-none border-b bg-transparent p-0">
            {MODEL_TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {t(`modelsPage.providerModels.tabs.${tab}`, tab)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <ProviderModelOverviewTab
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
          <ProviderModelPerformanceTab model={model} timeRange={timeRange} filterOptions={filterOptions} />
        </TabsContent>

        <TabsContent value="usage" className="outline-none">
          <ProviderModelDistributionTab model={model} timeRange={timeRange} filterOptions={filterOptions} />
        </TabsContent>

        <TabsContent value="errors" className="outline-none">
          <ProviderModelErrorsTab timeRange={timeRange} filterOptions={filterOptions} />
        </TabsContent>

        <TabsContent value="billing" className="outline-none">
          <BillingTabContent
            timeRange={timeRange}
            dimension="provider_model"
            id={model.id}
            today={today}
            overview={overview}
          />
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <ProviderModelSettingsTab model={model} />
        </TabsContent>
      </Tabs>
    </Main>
  );
}
