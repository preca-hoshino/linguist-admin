import { Check, Copy, Wrench, X, Zap, Search } from 'lucide-react';
import { useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type { AuditToolDefinition, AuditUserChatRequest, AuditUserChatResponse, GatewayContextSnapshot } from '@/types';
import { cn } from '@/utils/utils';
import { SmartContentViewer } from './components/SmartContentViewer';

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

function formatToolChoiceObject(obj: Record<string, unknown>): string | undefined {
  const typeStr = typeof obj.type === 'string' ? obj.type : '';
  if (typeStr === 'function') {
    const fn = obj.function as Record<string, unknown> | undefined | null;
    if (fn != null && typeof fn === 'object') {
      return typeof fn.name === 'string' && fn.name !== '' ? `function: ${fn.name}` : undefined;
    }
  }
  if (typeStr !== '') {
    return `tool: ${typeStr}`;
  }
  return typeof obj.name === 'string' && obj.name !== '' ? `function: ${obj.name}` : undefined;
}

function formatToolChoice(tc: unknown): string | undefined {
  if (typeof tc === 'string' && tc !== '') {
    return tc;
  }
  if (typeof tc === 'object' && tc !== null) {
    return formatToolChoiceObject(tc as Record<string, unknown>);
  }
  return undefined;
}

// ── 一键复制
function useCopy(): { copied: boolean; copy: (text: string) => Promise<void> } {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      /* ignore */
    }
  }, []);
  return { copied, copy };
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
  const { copied, copy } = useCopy();
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
            <div className="p-5 border-b bg-muted/5 flex flex-col gap-2 shrink-0">
              <h2 className="text-lg font-bold font-mono tracking-tight flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">{toolName}</span>
              </h2>
            </div>

            {toolDesc != null && toolDesc !== '' && (
              <div className="border-b bg-muted/5 shrink-0 flex flex-col">
                <SmartContentViewer content={toolDesc} exportFileName="tool-description" />
              </div>
            )}

            {toolDesc == null ||
              (toolDesc === '' && (
                <div className="p-5 border-b bg-muted/5 shrink-0">
                  <div className="text-sm text-muted-foreground leading-relaxed italic opacity-50">无描述</div>
                </div>
              ))}

            <div className="flex-1 p-5 flex flex-col gap-4 shrink-0">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.toolParameters', '参数列表')}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowRaw(!showRaw);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  {showRaw ? '隐藏原始 JSON' : '查看原始 JSON'}
                </button>
              </div>

              {properties.length > 0 ? (
                <div className="rounded-md border bg-card overflow-hidden">
                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-[180px]">字段 (Field)</TableHead>
                        <TableHead className="w-[150px]">类型 (Type)</TableHead>
                        <TableHead>描述 (Description)</TableHead>
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
              ) : (
                <div className="p-4 border border-dashed rounded-md text-sm text-muted-foreground text-center bg-muted/10">
                  无参数定义或无法解析为标准属性列表
                </div>
              )}

              {showRaw && (
                <div className="border rounded-md bg-muted/20 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      原始 Schema JSON
                    </span>
                    <button
                      type="button"
                      onClick={() => void copy(schemaText)}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? '已复制' : '复制 JSON'}
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-xs leading-relaxed text-foreground overflow-x-auto max-w-full">
                    {schemaText}
                  </pre>
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
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        {t('modelsPage.logs.detail.thisCallTools', '模型本次调用的工具')}
      </h3>
      <div className="flex flex-col gap-2">
        {(toolCalls as unknown[]).map((tcRaw) => {
          const tc = typeof tcRaw === 'object' && tcRaw !== null ? (tcRaw as Record<string, unknown>) : {};
          const tcId = typeof tc.id === 'string' ? tc.id : '';
          const result = toolResults.find((r) => r.tool_call_id === tcId);
          const funcObj =
            typeof tc.function === 'object' && tc.function !== null ? (tc.function as Record<string, unknown>) : null;
          const isFunc = tc.type === 'function' && funcObj != null;
          const callName = extractToolName(isFunc, tc, funcObj);

          let parsedArgs: unknown = isFunc ? funcObj.arguments : (tc.input ?? tc.arguments ?? '{}');
          try {
            if (isFunc && typeof funcObj.arguments === 'string' && funcObj.arguments !== '') {
              parsedArgs = JSON.parse(funcObj.arguments);
            }
          } catch {
            /* keep string */
          }
          const argsText = typeof parsedArgs === 'string' ? parsedArgs : JSON.stringify(parsedArgs, null, 2);
          let resultText = '';
          if (result != null) {
            resultText = typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2);
          }

          return (
            <div key={tcId} className="rounded-lg border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/20">
                <Wrench className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-sm font-semibold">{callName}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                  {tcId}
                </span>
              </div>
              <div className="px-4 py-3 flex items-center gap-2">
                {/* 查看调用参数弹窗 */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Wrench className="h-3 w-3 text-muted-foreground" />
                      查看调用参数
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    showCloseButton={false}
                    className="flex flex-col h-[85vh] max-h-[850px] min-h-[540px] w-[95vw] sm:max-w-[960px] overflow-hidden p-0 gap-0"
                  >
                    <DialogHeader className="flex flex-row items-start justify-between shrink-0 border-b px-8 py-5 bg-background">
                      <div className="flex flex-col gap-1.5 text-left">
                        <DialogTitle className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-purple-500" />
                          工具调用参数：{callName}
                        </DialogTitle>
                        <DialogDescription className="font-mono text-[11px]">{tcId}</DialogDescription>
                      </div>
                      <DialogClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground -mr-2 mt-0.5 border-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </DialogClose>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 w-full min-w-0 overflow-y-auto px-8 py-6 bg-muted/10">
                      <pre className="whitespace-pre-wrap break-all font-mono text-[13px] text-foreground leading-relaxed bg-background border border-border/50 rounded-md p-5 min-h-full">
                        {argsText}
                      </pre>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* 查看工具返回値弹窗 */}
                {result != null && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                      >
                        <Zap className="h-3 w-3" />
                        查看返回値
                      </button>
                    </DialogTrigger>
                    <DialogContent
                      showCloseButton={false}
                      className="flex flex-col h-[85vh] max-h-[850px] min-h-[540px] w-[95vw] sm:max-w-[960px] overflow-hidden p-0 gap-0"
                    >
                      <DialogHeader className="flex flex-row items-start justify-between shrink-0 border-b px-8 py-5 bg-background">
                        <div className="flex flex-col gap-1.5 text-left">
                          <DialogTitle className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            执行结果：{callName}
                          </DialogTitle>
                          <DialogDescription className="font-mono text-[11px]">{tcId}</DialogDescription>
                        </div>
                        <DialogClose asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground -mr-2 mt-0.5 border-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </DialogClose>
                      </DialogHeader>
                      <div className="flex-1 min-h-0 w-full min-w-0 overflow-y-auto px-8 py-6 bg-emerald-50/30 dark:bg-emerald-950/20">
                        <pre className="whitespace-pre-wrap break-all font-mono text-[13px] text-foreground leading-relaxed bg-emerald-50/60 border border-emerald-200/60 dark:bg-emerald-500/5 dark:border-emerald-500/20 rounded-md p-5 min-h-full">
                          {resultText}
                        </pre>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
  const toolChoice = chatReq?.tool_choice;
  const choiceLabel = formatToolChoice(toolChoice);

  return (
    <div className="flex flex-col gap-5">
      {/* 顶部状态栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            'font-medium text-xs gap-1.5',
            tools.length > 0 ? 'border-primary/20 text-primary bg-primary/10' : 'text-muted-foreground',
          )}
        >
          <Wrench className="h-3 w-3" />
          {tools.length > 0
            ? t('modelsPage.logs.detail.toolCount', '{{count}} 个工具', {
                count: tools.length,
                defaultValue: `${tools.length} 个工具`,
              })
            : t('modelsPage.logs.detail.noTools', '无工具')}
        </Badge>
        {choiceLabel != null && choiceLabel !== '' && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            tool_choice: <span className="ml-1 font-mono font-medium text-foreground">{choiceLabel}</span>
          </Badge>
        )}
      </div>

      {tools.length === 0 ? (
        /* 空状态 */
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
          <Wrench className="h-8 w-8 opacity-20" />
          <span>{t('modelsPage.logs.detail.noToolsDefined', '本次请求未携带工具定义')}</span>
        </div>
      ) : (
        /* 工具列表工作区 */
        <ToolWorkspace tools={tools} />
      )}

      {/* 本次调用结果区 */}
      <ToolCallsResult resp={chatResp} reqBody={chatReq} />
    </div>
  );
}
