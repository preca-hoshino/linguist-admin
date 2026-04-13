import { Link, useLoaderData } from '@tanstack/react-router';
import { ChevronLeft, Database, Settings } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyableId } from '@/components/CopyableId';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { cn } from '@/utils/utils';
import { VirtualMcpOverviewTab } from './detail-tabs/VirtualMcpOverviewTab';
import { VirtualMcpSettingsTab } from './detail-tabs/VirtualMcpSettingsTab';
import { VirtualMcpToolsTab } from './detail-tabs/VirtualMcpToolsTab';
import { Wrench } from 'lucide-react';

const VMCP_TABS = ['overview', 'tools', 'settings'] as const;
type VmcpTab = (typeof VMCP_TABS)[number];

export function VirtualMcpDetailPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { virtualMcp } = useLoaderData({
    from: '/_authenticated/mcps/virtual-mcps/$id',
  });

  usePageTitle(`Virtual MCPs - ${virtualMcp.name}`);

  const [activeTab, setActiveTab] = useState<VmcpTab>('overview');

  return (
    <Main className="flex flex-1 flex-col gap-6">
      {/* 顶层返回按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" asChild>
          <Link to="/mcps/virtual-mcps">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('common.backToList', 'Back to List')}
          </Link>
        </Button>
      </div>

      {/* 页头：Icon + 名称 + badges */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-foreground">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{virtualMcp.name}</h1>
              <CopyableId id={virtualMcp.id} />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  virtualMcp.is_active ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground',
                )}
              >
                {virtualMcp.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 导航 */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as VmcpTab);
        }}
        className="space-y-6"
      >
        <div className="scrollbar-hide -mb-1 flex items-center justify-between overflow-x-auto pb-1">
          <TabsList className="h-9 w-auto justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Database className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Wrench className="mr-2 h-4 w-4" />
              Tools
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <VirtualMcpOverviewTab virtualMcp={virtualMcp} />
        </TabsContent>

        <TabsContent value="tools" className="space-y-6 outline-none">
          <VirtualMcpToolsTab virtualMcp={virtualMcp} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 outline-none">
          <VirtualMcpSettingsTab virtualMcp={virtualMcp} />
        </TabsContent>
      </Tabs>
    </Main>
  );
}
