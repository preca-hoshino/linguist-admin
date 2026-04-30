import { useTranslation } from 'react-i18next';
import type { GlobalTimeRange } from '@/types/dashboard';
import { McpDistributionBarChart } from './components/McpDistributionBarChart';
import { McpDistributionCard } from './components/McpDistributionCard';

interface McpMethodsTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}

export function McpMethodsTab({ timeRange, refreshKey }: McpMethodsTabProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="h-[380px]">
        <McpDistributionBarChart timeRange={timeRange} refreshKey={refreshKey} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <McpDistributionCard
          title={t('dashboard.mcp.top_methods', 'Top Methods')}
          description={t('dashboard.mcp.top_methods_desc', 'Top MCP methods by request volume.')}
          groupBy="method"
          timeRange={timeRange}
          refreshKey={refreshKey}
        />
        <McpDistributionCard
          title={t('dashboard.mcp.top_virtual_mcps', 'Top Virtual MCPs')}
          description={t('dashboard.mcp.top_virtual_mcps_desc', 'Top Virtual MCPs by request volume.')}
          groupBy="virtual_mcp"
          timeRange={timeRange}
          refreshKey={refreshKey}
        />
        <McpDistributionCard
          title={t('dashboard.mcp.top_providers', 'Top Providers')}
          description={t('dashboard.mcp.top_providers_desc', 'Top MCP Providers by request volume.')}
          groupBy="mcp_provider"
          timeRange={timeRange}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
}
