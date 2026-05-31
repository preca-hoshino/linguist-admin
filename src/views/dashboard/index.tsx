import { RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRouteApi } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useMcpTodayStats } from '@/composables/use-mcp-today-stats';
import { useTodayStats } from '@/composables/use-today-stats';
import { Main } from '@/layouts/Main';
import { useHeaderSlot } from '@/providers/HeaderSlotProvider';
import { usePermissionStore } from '@/stores/permission-store';
import { DASHBOARD_TABS, MCP_DASHBOARD_TABS } from '@/types/dashboard';
import type { DashboardMode, DashboardTab, GlobalTimeRange, McpDashboardTab } from '@/types/dashboard';
import { BillingTabContent } from '@/views/models/shared/BillingTabContent';
import { DashboardModeSwitcher } from './components/DashboardModeSwitcher';
import { TimeRangePicker } from './components/TimeRangePicker';
import { McpErrorTab } from './mcp-tabs/McpErrorTab';
import { McpMethodsTab } from './mcp-tabs/McpMethodsTab';
import { McpOverviewTab } from './mcp-tabs/McpOverviewTab';
import { McpPerformanceTab } from './mcp-tabs/McpPerformanceTab';
import { DistributionTab } from './tabs/DistributionTab';
import { ErrorTab } from './tabs/ErrorTab';
import { OverviewTab } from './tabs/OverviewTab';
import { PerformanceTab } from './tabs/PerformanceTab';

const routeApi = getRouteApi('/_authenticated/');

export function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = routeApi.useNavigate();
  const search = routeApi.useSearch();

  // 权限检查
  const hasModelAccess = usePermissionStore((s) => s.hasPermission('models', 'view'));
  const hasMcpAccess = usePermissionStore((s) => s.hasPermission('mcp', 'view'));

  // 根据可用权限决定可用模式列表和初始模式
  const availableModes: DashboardMode[] = useMemo(() => {
    const modes: DashboardMode[] = [];
    if (hasModelAccess) {
      modes.push('model');
    }
    if (hasMcpAccess) {
      modes.push('mcp');
    }
    return modes;
  }, [hasModelAccess, hasMcpAccess]);

  // 如果 URL 指定的模式不可用，回退到第一个可用模式
  const requestedMode: DashboardMode = search.mode ?? 'model';
  const mode: DashboardMode = availableModes.includes(requestedMode)
    ? requestedMode
    : availableModes[0] ?? 'model';

  const [activeModelTab, setActiveModelTab] = useState<DashboardTab>('overview');
  const [activeMcpTab, setActiveMcpTab] = useState<McpDashboardTab>('overview');
  const [globalRange, setGlobalRange] = useState<GlobalTimeRange>('today');
  const [chartKey, setChartKey] = useState(0);

  // -- 数据获取（条件化） --
  const modelStats = useTodayStats(globalRange, hasModelAccess);
  const mcpStats = useMcpTodayStats(globalRange, hasMcpAccess);

  const isLoading = mode === 'model' ? modelStats.loading : mcpStats.loading;

  /** 刷新按钮：同时刷新 KPI 卡片数据和所有图表数据 */
  function handleRefresh(): void {
    if (mode === 'model') {
      modelStats.refresh();
    } else {
      mcpStats.refresh();
    }
    setChartKey((k) => k + 1);
  }

  const handleModeChange = useCallback(
    (newMode: DashboardMode): void => {
      void navigate({ search: (prev) => ({ ...prev, mode: newMode }) });
    },
    [navigate],
  );

  // 注入模式切换器至顶栏
  const switcherNode = useMemo(
    () => <DashboardModeSwitcher mode={mode} onChange={handleModeChange} availableModes={availableModes} />,
    [mode, handleModeChange, availableModes],
  );
  useHeaderSlot(switcherNode);

  const renderModelTabs = (): React.ReactNode => (
    <Tabs
      value={activeModelTab}
      onValueChange={(v) => {
        setActiveModelTab(v as DashboardTab);
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
          today={modelStats.today}
          overview={modelStats.overview}
          loading={modelStats.loading}
          error={modelStats.error}
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
          <BillingTabContent timeRange={globalRange} today={modelStats.today} overview={modelStats.overview} />
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderMcpTabs = (): React.ReactNode => (
    <Tabs
      value={activeMcpTab}
      onValueChange={(v) => {
        setActiveMcpTab(v as McpDashboardTab);
      }}
      className="space-y-6"
    >
      <div className="scrollbar-hide -mb-1 flex items-center overflow-x-auto pb-1">
        <TabsList className="h-9 w-full justify-start rounded-none border-b bg-transparent p-0">
          {MCP_DASHBOARD_TABS.map((tab) => (
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
        <McpOverviewTab
          timeRange={globalRange}
          today={mcpStats.today}
          overview={mcpStats.overview}
          loading={mcpStats.loading}
          error={mcpStats.error}
          refreshKey={chartKey}
        />
      </TabsContent>

      <TabsContent value="performance" className="outline-none">
        <McpPerformanceTab timeRange={globalRange} refreshKey={chartKey} />
      </TabsContent>

      <TabsContent value="methods" className="outline-none">
        <McpMethodsTab timeRange={globalRange} refreshKey={chartKey} />
      </TabsContent>

      <TabsContent value="errors" className="outline-none">
        <McpErrorTab timeRange={globalRange} refreshKey={chartKey} />
      </TabsContent>
    </Tabs>
  );

  return (
    <Main>
      <div className="relative flex flex-col gap-6">
        {/* 页面标题 + 全局时间选择器 + 刷新按钮 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t('dashboard.title')}
          </h1>
          <div className="flex items-center gap-2">
            <TimeRangePicker value={globalRange} onChange={setGlobalRange} />
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="h-9">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('dashboard.refresh')}
            </Button>
          </div>
        </div>

        {availableModes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <p className="text-lg font-medium">{t('dashboard.noDataAccess.title', 'No Data Access')}</p>
            <p className="mt-1 text-sm">{t('dashboard.noDataAccess.desc', "You don't have permission to view statistics. Contact your administrator.")}</p>
          </div>
        ) : mode === 'model' ? (
          renderModelTabs()
        ) : (
          renderMcpTabs()
        )}
      </div>
    </Main>
  );
}
