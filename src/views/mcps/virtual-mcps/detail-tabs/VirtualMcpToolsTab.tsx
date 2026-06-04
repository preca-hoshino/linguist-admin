import { useQuery } from '@tanstack/react-query';
import { Code, Download, Eye, Loader2, Search, ShieldAlert, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

import { listMcpProviderTools } from '@/api/mcp/provider-mcps';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { TabsList, TabsTrigger, Tabs as UiTabs } from '@/components/ui/Tabs';
import { useTheme } from '@/providers/ThemeProvider';
import type { McpToolInfo, VirtualMcp } from '@/types/mcp';
import { cn } from '@/utils/utils';
import { SmartContentViewer } from '@/views/models/logs/detail-tabs/components/SmartContentViewer';

// ── Schema 解析
function parseToolProperties(schemaObj: unknown): {
  properties: Array<{ field: string; type: string; description: string; isRequired: boolean }>;
  required: string[];
} {
  if (typeof schemaObj !== 'object' || schemaObj === null) {
    return { properties: [], required: [] };
  }
  const s = schemaObj as Record<string, unknown>;
  const properties =
    s.properties != null && typeof s.properties === 'object' ? (s.properties as Record<string, unknown>) : {};
  const required = (Array.isArray(s.required) ? s.required : []) as string[];

  const resultList = Object.keys(properties).map((key) => {
    const propVal = properties[key];
    const prop = propVal != null && typeof propVal === 'object' ? (propVal as Record<string, unknown>) : {};
    const typeStr = typeof prop.type === 'string' ? prop.type : 'any';
    const descStr = typeof prop.description === 'string' ? prop.description : '';
    const enumVal = prop.enum;
    const enumList = (Array.isArray(enumVal) ? enumVal : []) as unknown[];

    let finalType = typeStr;
    if (enumList.length > 0) {
      finalType = `${typeStr} (enum: ${enumList.map(String).join(' | ')})`;
    }

    if (prop.properties != null && typeof prop.properties === 'object') {
      finalType += ' (object)';
    }
    if (prop.items != null && typeof prop.items === 'object') {
      finalType += ' (array)';
    }

    return {
      field: key,
      type: finalType,
      description: descStr,
      isRequired: required.includes(key),
    };
  });
  return { properties: resultList, required };
}

interface VmcpToolInfo extends McpToolInfo {
  isEnabled: boolean;
}

function VirtualMcpToolWorkspace({ tools }: { readonly tools: VmcpToolInfo[] }): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tools.filter((tInfo) => {
      if (filterMode === 'enabled' && !tInfo.isEnabled) {
        return false;
      }
      if (filterMode === 'disabled' && tInfo.isEnabled) {
        return false;
      }

      if (q === '') {
        return true;
      }
      return tInfo.name.toLowerCase().includes(q) || (tInfo.description?.toLowerCase().includes(q) ?? false);
    });
  }, [tools, searchQuery, filterMode]);

  const selectedToolInfo = filteredTools[selectedIdx] ?? filteredTools[0];
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row h-[700px] border rounded-xl bg-card overflow-hidden shadow-sm">
      {/* 左侧列表 */}
      <div className="w-full sm:w-[360px] shrink-0 border-r flex flex-col bg-muted/10 h-full overflow-hidden">
        <div className="p-3 border-b bg-background sticky top-0 z-10 flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search', '搜索')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIdx(0);
              }}
              className="pl-9 h-9"
            />
          </div>
          <UiTabs
            value={filterMode}
            onValueChange={(v) => {
              setFilterMode(v as 'all' | 'enabled' | 'disabled');
              setSelectedIdx(0);
            }}
            className="w-full"
          >
            <TabsList className="w-full h-8 px-1">
              <TabsTrigger value="all" className="flex-1 text-xs">
                {t('common.all', '全部')}
              </TabsTrigger>
              <TabsTrigger value="enabled" className="flex-1 text-xs">
                <span className="text-emerald-500 mr-1.5 text-[10px]">●</span>
                {t('common.enabled', '已启用')}
              </TabsTrigger>
              <TabsTrigger value="disabled" className="flex-1 text-xs">
                <span className="text-red-500/80 mr-1.5 text-[10px]">●</span>
                {t('common.disabled', '已禁用')}
              </TabsTrigger>
            </TabsList>
          </UiTabs>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {filteredTools.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground text-center">
              {t('common.noResults', '未搜到相关内容')}
            </div>
          ) : (
            filteredTools.map((tInfo, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: idx is fine
                  key={`${tInfo.name}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedIdx(idx);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-3 rounded-md transition-colors text-sm flex items-center gap-3',
                    isSelected
                      ? 'bg-accent text-accent-foreground shadow-sm border border-border/50'
                      : 'text-foreground hover:bg-muted/50 border border-transparent',
                    !tInfo.isEnabled && !isSelected && 'opacity-50 grayscale-[0.8]',
                  )}
                >
                  <div className="shrink-0 mt-0.5 relative">
                    <Wrench className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    {!tInfo.isEnabled && (
                      <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-background" />
                    )}
                    {tInfo.isEnabled && (
                      <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-mono text-[15px] font-bold tracking-tight">{tInfo.name}</div>
                    <div
                      className={cn(
                        'text-[11px] mt-1 line-clamp-1 font-normal leading-relaxed',
                        isSelected ? 'text-accent-foreground/80' : 'text-muted-foreground',
                      )}
                    >
                      {tInfo.description != null && tInfo.description !== '' ? (
                        tInfo.description
                      ) : (
                        <span className="italic opacity-50">{t('common.noDescription', '无描述')}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 右侧详情 */}
      {selectedToolInfo == null ? (
        <div className="flex-1 flex items-center justify-center bg-background">
          <span className="text-muted-foreground">{t('common.noItems', '无可展示项')}</span>
        </div>
      ) : (
        <div className="flex-1 min-w-0 bg-background overflow-y-auto scrollbar-thin h-full relative">
          <div className="flex flex-col min-h-full">
            <div className="px-5 border-b bg-background/95 backdrop-blur sticky top-0 z-10 flex items-center shrink-0 h-[61px] justify-between">
              <h2 className="text-lg font-bold font-mono tracking-tight flex items-center gap-2 max-w-[70%]">
                <Wrench
                  className={cn(
                    'h-5 w-5 shrink-0',
                    selectedToolInfo.isEnabled ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                <span className="truncate" title={selectedToolInfo.name}>
                  {selectedToolInfo.name}
                </span>
              </h2>
              <div className="flex items-center">
                {selectedToolInfo.isEnabled ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-300 text-emerald-600 dark:text-emerald-400 font-mono tracking-tight"
                  >
                    {t('common.enabled', '已启用')}
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="font-mono tracking-tight gap-1 bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0"
                  >
                    <ShieldAlert className="h-3 w-3" />
                    {t('mcpsPage.virtualMcps.disabledInVmcp', '已在此虚拟 MCP 中禁用')}
                  </Badge>
                )}
              </div>
            </div>

            <div className="px-5 pt-5 pb-1 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.toolDescription', '工具描述')}</h3>
            </div>

            {selectedToolInfo.description != null && selectedToolInfo.description !== '' && (
              <div className="border-b bg-muted/5 shrink-0 flex flex-col">
                <SmartContentViewer content={selectedToolInfo.description} exportFileName="tool-description" />
              </div>
            )}

            {(selectedToolInfo.description == null || selectedToolInfo.description === '') && (
              <div className="p-5 border-b bg-muted/5 shrink-0">
                <div className="text-sm text-muted-foreground leading-relaxed italic opacity-50">
                  {t('modelsPage.logs.detail.noDescription', '无描述')}
                </div>
              </div>
            )}

            <div className="flex-1 p-5 flex flex-col gap-4 shrink-0">
              <div className="flex items-center justify-between shrink-0 mb-1">
                <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.toolParameters', '参数列表')}</h3>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={() => {
                      setShowRaw(!showRaw);
                    }}
                    title={
                      showRaw
                        ? t('modelsPage.logs.detail.structuredTable', '查看结构化表格')
                        : t('modelsPage.logs.detail.rawJson', '查看原生 JSON Schema')
                    }
                  >
                    {showRaw ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={() => {
                      const schemaText =
                        selectedToolInfo.inputSchema == null
                          ? '{}'
                          : JSON.stringify(selectedToolInfo.inputSchema, null, 2);
                      const blob = new Blob([schemaText], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedToolInfo.name}-schema.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    title={t('modelsPage.logs.detail.downloadJson', '下载 JSON Schema')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showRaw && (
                <div className="border border-border/40 rounded-md bg-card w-full min-w-0 p-4 pb-5 overflow-x-auto">
                  <JsonView
                    src={selectedToolInfo.inputSchema ?? {}}
                    collapsed={2}
                    enableClipboard
                    displaySize
                    theme={resolvedTheme === 'dark' ? 'a11y' : 'default'}
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                    }}
                  />
                </div>
              )}

              {!showRaw && parseToolProperties(selectedToolInfo.inputSchema).properties.length > 0 && (
                <div className="rounded-md border bg-card flex flex-col overflow-hidden">
                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-[180px]">{t('modelsPage.logs.detail.field', '字段')}</TableHead>
                        <TableHead className="w-[150px]">{t('modelsPage.logs.detail.type', '类型')}</TableHead>
                        <TableHead>{t('modelsPage.logs.detail.description', '描述')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parseToolProperties(selectedToolInfo.inputSchema).properties.map((prop) => (
                        <TableRow key={prop.field}>
                          <TableCell className="font-mono text-sm font-medium">
                            <span className={cn(prop.isRequired ? 'text-primary font-bold' : '')}>{prop.field}</span>
                            {prop.isRequired && <span className="ml-1 text-primary font-bold">*</span>}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground whitespace-normal break-all sm:break-words">
                            {prop.type}
                          </TableCell>
                          <TableCell className="text-sm text-foreground whitespace-normal break-all sm:break-words leading-relaxed">
                            {prop.description === '' ? <span className="italic opacity-30">-</span> : prop.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!showRaw && parseToolProperties(selectedToolInfo.inputSchema).properties.length === 0 && (
                <div className="p-4 border border-dashed rounded-md text-sm text-muted-foreground text-center bg-muted/10">
                  {t('mcpsPage.tools.noParams', '无参数定义或无法解析为标准属性列表')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function VirtualMcpToolsTab({ virtualMcp }: { readonly virtualMcp: VirtualMcp }): React.JSX.Element {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['mcp-provider-tools', virtualMcp.mcp_provider_id],
    queryFn: async () => {
      const res = await listMcpProviderTools(virtualMcp.mcp_provider_id);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data.data;
    },
  });

  const processedTools = useMemo<VmcpToolInfo[]>(() => {
    if (!data) {
      return [];
    }

    // 如果 config.tools 未定义或者为空，可能后端有特定默认策略
    // 假设 whitelist 为 config.tools (string[])
    const whitelist = virtualMcp.config.tools ?? [];

    return data.map((tInfo) => {
      return {
        ...tInfo,
        isEnabled: whitelist.includes(tInfo.name),
      };
    });
  }, [data, virtualMcp.config.tools]);

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        Failed to load provider tools: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (processedTools.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Wrench className="h-8 w-8 opacity-20" />
          <span>{t('modelsPage.logs.detail.noToolsDefined', 'No tools are provided by this MCP provider.')}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="pt-4 pb-6 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{t('mcpsPage.virtualMcps.toolsOverview', '工具概览与启停状态')}</h3>
        </div>
        <VirtualMcpToolWorkspace tools={processedTools} />
      </div>
    </div>
  );
}
