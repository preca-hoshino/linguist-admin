import { Code, Download, Eye, Search, Wrench, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogTrigger } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type {
  AuditToolCall,
  AuditToolDefinition,
  AuditUserChatRequest,
  AuditUserChatResponse,
  GatewayContextSnapshot,
} from '@/types';
import { cn } from '@/utils/utils';
import { SmartContentViewer } from './components/SmartContentViewer';
import {
  ToolInteractionButton,
  ToolInteractionDialog,
  ToolInteractionTrigger,
} from './components/ToolInteractionDialog';
import 'react18-json-view/src/style.css';
import { useTheme } from '@/providers/ThemeProvider';

// ── 辅助

function extractToolName(
  isFunc: boolean,
  obj: Record<string, unknown>,
  funcObj: Record<string, unknown> | null,
): string {
  if (isFunc && funcObj != null && typeof funcObj.name === 'string') {
    return funcObj.name;
  }
  if (typeof obj.name === 'string' && obj.name !== '') {
    return obj.name;
  }
  if (typeof obj.type === 'string' && obj.type !== '') {
    return obj.type;
  }
  return 'Unknown Tool';
}
function asUserChatReq(body: unknown): AuditUserChatRequest | undefined {
  if (typeof body === 'object' && body !== null) {
    return body as AuditUserChatRequest;
  }
  return undefined;
}
function asUserChatResp(body: unknown): AuditUserChatResponse | undefined {
  if (typeof body === 'object' && body !== null && 'choices' in body) {
    return body as AuditUserChatResponse;
  }
  return undefined;
}

function extractToolDesc(
  isFunc: boolean,
  obj: Record<string, unknown>,
  funcObj: Record<string, unknown> | null,
): string | undefined {
  if (isFunc && funcObj?.description != null && funcObj.description !== '') {
    return typeof funcObj.description === 'string' ? funcObj.description : '';
  }
  if (obj.description != null && obj.description !== '') {
    return typeof obj.description === 'string' ? obj.description : '';
  }
  if (obj.type != null && obj.type !== '') {
    return typeof obj.type === 'string' ? `Built-in Tool: ${obj.type}` : 'Built-in Tool';
  }
  return undefined;
}

function getToolInfo(tool: unknown): { name: string; desc?: string | undefined; schema: unknown } {
  const obj = typeof tool === 'object' && tool !== null ? (tool as Record<string, unknown>) : {};
  const funcObj =
    typeof obj.function === 'object' && obj.function !== null ? (obj.function as Record<string, unknown>) : null;

  const isFunction = obj.type === 'function' && funcObj != null;
  const name = extractToolName(isFunction, obj, funcObj);
  const desc = extractToolDesc(isFunction, obj, funcObj);
  const schema = isFunction ? funcObj.parameters : (obj.input_schema ?? {});
  return { name, desc, schema };
}

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

    // 如果有深层 properties，这里做个简单标记
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

// ── 工具展示工作区（左右分栏）
function ToolWorkspace({ tools }: { readonly tools: unknown[] }): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const toolsInfo = useMemo(() => {
    return tools.map((tool) => {
      const { name, desc, schema } = getToolInfo(tool);
      return { tool, name, desc, schema };
    });
  }, [tools]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q === '') {
      return toolsInfo;
    }
    return toolsInfo.filter((tInfo) => {
      return tInfo.name.toLowerCase().includes(q) || (tInfo.desc?.toLowerCase().includes(q) ?? false);
    });
  }, [toolsInfo, searchQuery]);

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

  const { name: toolName, desc: toolDesc, schema: schemaObj } = selectedToolInfo ?? {};
  const schemaText = schemaObj == null ? '{}' : JSON.stringify(schemaObj, null, 2);
  const { properties } = parseToolProperties(schemaObj);

  // 保留全量复制与原始模式的展开状态

  return (
    <div className="flex flex-col sm:flex-row h-[600px] border rounded-lg bg-card overflow-hidden">
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
                setSelectedIdx(0); // 重置选择
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
                // biome-ignore lint/suspicious/noArrayIndexKey: array elements might not be unique
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
                    {tInfo.desc != null && tInfo.desc !== '' ? (
                      tInfo.desc
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

// ── 本次调用结果区
function ToolCallsResult({
  resp,
  reqBody,
}: {
  readonly resp: AuditUserChatResponse | undefined;
  readonly reqBody: AuditUserChatRequest | undefined;
}): React.JSX.Element | null {
  const { t } = useTranslation();
  const toolCalls = resp?.choices?.[0]?.message.tool_calls;
  if (toolCalls == null || toolCalls.length === 0) {
    return null;
  }

  // 从消息历史找工具结果
  const toolResults = reqBody?.messages?.filter((m) => m.role === 'tool') ?? [];

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.thisCallTools', '工具调用')}</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(toolCalls as unknown[]).map((tcRaw) => {
            const tc = typeof tcRaw === 'object' && tcRaw !== null ? (tcRaw as Record<string, unknown>) : {};
            const tcId = typeof tc.id === 'string' ? tc.id : '';
            const result = toolResults.find((r) => r.tool_call_id === tcId);
            const funcObj =
              typeof tc.function === 'object' && tc.function !== null ? (tc.function as Record<string, unknown>) : null;
            const isFunc = tc.type === 'function' && funcObj != null;
            const callName = extractToolName(isFunc, tc, funcObj);

            let resultText: string | undefined;
            if (result != null) {
              resultText =
                typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2);
            }

            return (
              <Dialog key={tcId}>
                <div className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2 shadow-sm text-foreground">
                  <ToolInteractionTrigger toolName={callName} callId={tcId} defaultTab="request" />
                  <DialogTrigger asChild>
                    <ToolInteractionButton defaultTab="request" className="ml-2 shrink-0" />
                  </DialogTrigger>
                </div>
                <ToolInteractionDialog
                  toolName={callName}
                  toolCall={tc as unknown as AuditToolCall}
                  toolResponse={resultText}
                  callId={tcId}
                  defaultTab="request"
                />
              </Dialog>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── 组件：工具用量卡片
function ToolStatItem({
  label,
  value,
  accent,
  icon: Icon,
}: {
  readonly label: string;
  readonly value: number;
  readonly accent?: 'emerald' | 'amber' | 'primary' | undefined;
  readonly icon?: React.ElementType;
}): React.JSX.Element {
  let color = 'text-foreground';
  let iconColor = 'text-muted-foreground';
  switch (accent) {
    case 'emerald': {
      color = 'text-emerald-600 dark:text-emerald-400';
      iconColor = color;
      break;
    }
    case 'amber': {
      color = 'text-amber-600 dark:text-amber-400';
      iconColor = color;
      break;
    }
    case 'primary': {
      color = 'text-primary';
      iconColor = color;
      break;
    }
    // No default
  }
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 min-w-[80px]">
      <div className="flex items-center justify-center gap-1.5">
        {Icon != null && <Icon className={cn('h-4 w-4', iconColor)} />}
        <span className={cn('font-mono text-xl font-bold leading-none', color)}>{value.toLocaleString()}</span>
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function ToolUsageBar({
  definedCount,
  invokedCount,
}: {
  readonly definedCount: number;
  readonly invokedCount: number;
}): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-10 rounded-xl border bg-card px-8 py-4 shadow-sm w-fit shrink-0 items-center justify-center">
      <ToolStatItem
        label={t('modelsPage.logs.detail.totalToolsDefined', '总可选工具')}
        value={definedCount}
        icon={Wrench}
      />
      <ToolStatItem
        label={t('modelsPage.logs.detail.toolsInvoked', '本次调用并发')}
        value={invokedCount}
        accent={invokedCount > 0 ? 'primary' : undefined}
        icon={Zap}
      />
    </div>
  );
}

// ── 主组件
interface LogToolsTabProps {
  readonly ctx: GatewayContextSnapshot;
}

export function LogToolsTab({ ctx }: LogToolsTabProps): React.JSX.Element {
  const { t } = useTranslation();

  // 直接从网关已经适配并清洗完毕的上下文 request 中提取工具结构
  //（不读取 audit.userRequest.body，因为那里面可能是各种混乱的原始提供商特化格式）
  const chatReq = asUserChatReq(ctx.request);
  const chatResp = asUserChatResp(ctx.response);

  const tools: AuditToolDefinition[] = chatReq?.tools ?? [];
  const toolCalls = chatResp?.choices?.[0]?.message.tool_calls;
  const invokedCount = toolCalls == null ? 0 : toolCalls.length;

  return (
    <div className="flex flex-1 flex-col gap-6 pb-6 pt-4 px-4 overflow-x-hidden">
      <div className="shrink-0 flex">
        <ToolUsageBar definedCount={tools.length} invokedCount={invokedCount} />
      </div>
      {tools.length === 0 ? (
        /* 空状态 */
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
          <Wrench className="h-8 w-8 opacity-20" />
          <span>{t('modelsPage.logs.detail.noToolsDefined', '本次请求未携带工具定义')}</span>
        </div>
      ) : (
        /* 工具列表工作区 */
        <div className="flex flex-col gap-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.availableTools', '工具定义')}</h3>
          </div>
          <ToolWorkspace tools={tools} />
        </div>
      )}

      {/* 本次调用结果区 (内部自带 Separator 且为空时自动不渲染) */}
      <ToolCallsResult resp={chatResp} reqBody={chatReq} />
    </div>
  );
}
