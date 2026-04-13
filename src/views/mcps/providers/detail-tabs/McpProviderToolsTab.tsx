import { useQuery } from '@tanstack/react-query';
import { Code, Download, Eye, Loader2, Search, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

import { listMcpProviderTools } from '@/api/mcp-providers';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useTheme } from '@/providers/ThemeProvider';
import type { McpToolInfo } from '@/types/mcp';
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

function ToolWorkspace({ tools }: { readonly tools: McpToolInfo[] }): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q === '') {
      return tools;
    }
    return tools.filter((tInfo) => {
      return tInfo.name.toLowerCase().includes(q) || (tInfo.description?.toLowerCase().includes(q) ?? false);
    });
  }, [tools, searchQuery]);

  const selectedToolInfo = filteredTools[selectedIdx] ?? filteredTools[0];
  const [showRaw, setShowRaw] = useState(false);

  if (filteredTools.length === 0 && searchQuery !== '') {
    return (
      <div className="flex h-64 flex-col border rounded-lg bg-card overflow-hidden">
        <div className="p-3 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search', '搜索')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="pl-9 h-9"
            />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          {t('common.noResults', '未搜到相关内容')}
        </div>
      </div>
    );
  }

  const { name: toolName, description: toolDesc, inputSchema: schemaObj } = selectedToolInfo ?? {};
  const schemaText = schemaObj == null ? '{}' : JSON.stringify(schemaObj, null, 2);
  const { properties } = parseToolProperties(schemaObj);

  return (
    <div className="flex flex-col sm:flex-row h-[600px] border rounded-xl bg-card overflow-hidden shadow-sm">
      {/* 左侧列表 */}
      <div className="w-full sm:w-[340px] shrink-0 border-r flex flex-col bg-muted/10 h-full overflow-hidden">
        <div className="p-3 border-b bg-background sticky top-0 z-10">
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
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {filteredTools.map((tInfo, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: idx is fine here
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
                )}
              >
                <div className="shrink-0 mt-0.5">
                  <Wrench className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
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
                      <span className="italic opacity-50">无描述</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 右侧详情 */}
      {selectedToolInfo != null && (
        <div className="flex-1 min-w-0 bg-background overflow-y-auto scrollbar-thin h-full relative">
          <div className="flex flex-col min-h-full">
            <div className="px-5 border-b bg-background/95 backdrop-blur sticky top-0 z-10 flex items-center shrink-0 h-[61px]">
              <h2 className="text-lg font-bold font-mono tracking-tight flex items-center gap-2 w-full">
                <Wrench className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">{toolName}</span>
              </h2>
            </div>

            <div className="px-5 pt-5 pb-1 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.toolDescription', '工具描述')}</h3>
            </div>

            {toolDesc != null && toolDesc !== '' && (
              <div className="border-b bg-muted/5 shrink-0 flex flex-col">
                <SmartContentViewer content={toolDesc} exportFileName="tool-description" />
              </div>
            )}

            {(toolDesc == null || toolDesc === '') && (
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
                      const blob = new Blob([schemaText], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${toolName ?? 'tool'}-schema.json`;
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
                    src={schemaObj as object}
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

              {!showRaw && properties.length > 0 && (
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
                      {properties.map((prop) => (
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

              {!showRaw && properties.length === 0 && (
                <div className="p-4 border border-dashed rounded-md text-sm text-muted-foreground text-center bg-muted/10">
                  无参数定义或无法解析为标准属性列表
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function McpProviderToolsTab({ providerId }: { readonly providerId: string }): React.JSX.Element {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['mcp-provider-tools', providerId],
    queryFn: async () => {
      const res = await listMcpProviderTools(providerId);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data.data;
    },
  });

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
        Failed to load tools: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const tools = data ?? [];

  if (tools.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Wrench className="h-8 w-8 opacity-20" />
          <span>{t('modelsPage.logs.detail.noToolsDefined', 'No tools are provided by this MCP server.')}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="pt-4 pb-6 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.availableTools', '工具定义')}</h3>
        </div>
        <ToolWorkspace tools={tools} />
      </div>
    </div>
  );
}
