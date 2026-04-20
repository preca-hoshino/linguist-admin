import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useTodayStats } from '@/composables/use-today-stats';
import { Main } from '@/layouts/Main';
import { DASHBOARD_TABS, type DashboardTab, type GlobalTimeRange } from '@/types/dashboard';
import { BillingTabContent } from '@/views/models/shared/BillingTabContent';
import { TimeRangePicker } from './components/TimeRangePicker';
import { DistributionTab } from './tabs/DistributionTab';
import { ErrorTab } from './tabs/ErrorTab';
import { OverviewTab } from './tabs/OverviewTab';
import { PerformanceTab } from './tabs/PerformanceTab';

export function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [globalRange, setGlobalRange] = useState<GlobalTimeRange>('today');
  const [chartKey, setChartKey] = useState(0);
  const { today, overview, loading, error, refresh } = useTodayStats();

  /** 刷新按钮：同时刷新 KPI 卡片数据和所有图表数据 */
  function handleRefresh(): void {
    refresh();
    setChartKey((k) => k + 1);
  }

  return (
    <Main>
      <div className="relative flex flex-col gap-6">
        {/* 页面标题 + 全局时间选择器 + 刷新按钮 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t('dashboard.title')}</h1>
          <div className="flex items-center gap-2">
            <TimeRangePicker value={globalRange} onChange={setGlobalRange} />
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="h-9">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t('dashboard.refresh')}
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as DashboardTab);
          }}
          className="space-y-6"
        >
          <div className="scrollbar-hide -mb-1 flex items-center overflow-x-auto pb-1">
            <TabsList className="h-9 w-full justify-start rounded-none border-b bg-transparent p-0">
              {DASHBOARD_TABS.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {t(`dashboard.tabs.${tab}`, tab)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 outline-none">
            <OverviewTab
              timeRange={globalRange}
              today={today}
              overview={overview}
              loading={loading}
              error={error}
              refreshKey={chartKey}
            />
          </TabsContent>

          <TabsContent value="performance" className="outline-none">
            <PerformanceTab timeRange={globalRange} refreshKey={chartKey} />
          </TabsContent>

          <TabsContent value="distribution" className="outline-none">
            <DistributionTab timeRange={globalRange} refreshKey={chartKey} />
          </TabsContent>

          <TabsContent value="errors" className="outline-none">
            <ErrorTab timeRange={globalRange} refreshKey={chartKey} />
          </TabsContent>

          <TabsContent value="billing" className="outline-none">
            <div className="mt-2">
              <BillingTabContent timeRange={globalRange} today={today} overview={overview} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Main>
  );
}
