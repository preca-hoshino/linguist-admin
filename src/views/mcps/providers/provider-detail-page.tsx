import { Link, useLoaderData } from '@tanstack/react-router';
import { ChevronLeft, Cloud, BarChart2, Server, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyableId } from '@/components/CopyableId';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';

import { cn } from '@/utils/utils';
import { McpProviderOverviewTab } from './detail-tabs/McpProviderOverviewTab';
import { McpProviderToolsTab } from './detail-tabs/McpProviderToolsTab';
import { McpPerformanceTab } from '../shared/McpPerformanceTab';

const PROVIDER_TABS = ['overview', 'performance', 'tools'] as const;
type ProviderTab = (typeof PROVIDER_TABS)[number];

export function McpProviderDetailPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { provider } = useLoaderData({
    from: '/_authenticated/mcps/providers/$id',
  });
  usePageTitle(`MCP Providers - ${provider.name}`);

  const [activeTab, setActiveTab] = useState<ProviderTab>('overview');

  return (
    <Main className="flex flex-1 flex-col gap-6">
      {/* 顶层返回按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" asChild>
          <Link to="/mcps/providers">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('common.backToList', 'Back to List')}
          </Link>
        </Button>
      </div>

      {/* 页头：Icon + 名称 + badges */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-foreground">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{provider.name}</h1>
              <CopyableId id={provider.id} />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {provider.kind}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  provider.is_active ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground',
                )}
              >
                {provider.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </Badge>
            </div>
          </div>
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
            <TabsTrigger
              value="overview"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Cloud className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Wrench className="mr-2 h-4 w-4" />
              Tools
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <McpProviderOverviewTab provider={provider} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 outline-none">
          <McpPerformanceTab dimension="mcp_provider" id={provider.id} />
        </TabsContent>

        <TabsContent value="tools" className="space-y-6 outline-none">
          <McpProviderToolsTab providerId={provider.id} />
        </TabsContent>
      </Tabs>
    </Main>
  );
}
