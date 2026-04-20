import { DeepSeek, Gemini, Github, ProviderIcon, Volcengine } from '@lobehub/icons';
import { Link } from '@tanstack/react-router';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyableId } from '@/components/CopyableId';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePageTitle } from '@/composables/use-page-title';
import { useProviderStats } from '@/composables/use-provider-stats';
import { Main } from '@/layouts/Main';
import type { Provider } from '@/types';
import type { GlobalTimeRange } from '@/types/dashboard';
import { cn } from '@/utils/utils';
import { TimeRangePicker } from '@/views/dashboard/components/TimeRangePicker';
import { BillingTabContent } from '@/views/models/shared/BillingTabContent';
import { ProviderUsageTab } from './detail-tabs/ProviderDistributionTab';
import { ProviderErrorsTab } from './detail-tabs/ProviderErrorsTab';
import { ProviderOverviewTab } from './detail-tabs/ProviderOverviewTab';
import { ProviderPerformanceTab } from './detail-tabs/ProviderPerformanceTab';
import { ProviderSettingsTab } from './detail-tabs/ProviderSettingsTab';

const PROVIDER_TABS = ['overview', 'performance', 'usage', 'errors', 'billing', 'settings'] as const;
type ProviderTab = (typeof PROVIDER_TABS)[number];

/** Provider Icon 渲染 */
function ProviderIconBlock({ kind }: { readonly kind: string }): React.JSX.Element {
  const iconProps = { size: 28, className: 'fill-current' } as const;
  switch (kind) {
    case 'gemini': {
      return <Gemini {...iconProps} />;
    }
    case 'deepseek': {
      return <DeepSeek {...iconProps} />;
    }
    case 'volcengine': {
      return <Volcengine {...iconProps} />;
    }
    case 'copilot': {
      return <Github {...iconProps} />;
    }
    default: {
      return <ProviderIcon provider={kind as 'openai'} size={28} type="mono" className="fill-current" />;
    }
  }
}

export function ProviderDetailPage({ provider }: { readonly provider: Provider }): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(`${t('modelsPage.providers.title', 'Model Providers')} - ${provider.name}`);

  const [activeTab, setActiveTab] = useState<ProviderTab>('overview');
  const [timeRange, setTimeRange] = useState<GlobalTimeRange>('today');

  const { today, overview, loading, error, refresh } = useProviderStats(provider.id, timeRange);

  return (
    <Main className="flex flex-1 flex-col gap-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" asChild>
          <Link to="/models/providers">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('modelsPage.providers.backToList', 'Back to List')}
          </Link>
        </Button>
      </div>

      {/* 页头：Icon + 名称 + badges */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-foreground">
            <ProviderIconBlock kind={provider.kind} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{provider.name}</h1>
              <CopyableId id={provider.id} />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground capitalize">{provider.kind}</span>
              <Badge variant="outline">
                {provider.credential_type === 'api_key' ? 'API Key' : provider.credential_type}
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
          setActiveTab(v as ProviderTab);
        }}
        className="space-y-6"
      >
        <div className="scrollbar-hide -mb-1 flex items-center justify-between overflow-x-auto pb-1">
          <TabsList className="h-9 w-auto justify-start rounded-none border-b bg-transparent p-0">
            {PROVIDER_TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {t(`modelsPage.providers.tabs.${tab}`, tab)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <ProviderOverviewTab
            provider={provider}
            timeRange={timeRange}
            today={today}
            overview={overview}
            loading={loading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="performance" className="outline-none">
          <ProviderPerformanceTab provider={provider} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="usage" className="outline-none">
          <ProviderUsageTab provider={provider} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="errors" className="outline-none">
          <ProviderErrorsTab provider={provider} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="billing" className="outline-none">
          <BillingTabContent
            timeRange={timeRange}
            dimension="provider"
            id={provider.id}
            today={today}
            overview={overview}
          />
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <ProviderSettingsTab provider={provider} />
        </TabsContent>
      </Tabs>
    </Main>
  );
}
