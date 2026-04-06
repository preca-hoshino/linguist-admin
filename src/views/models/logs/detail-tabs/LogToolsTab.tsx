import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Wrench, Copy, Check, Zap, X, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogClose,
  DialogTitle,
} from '@/components/ui/Dialog'
import type {
  GatewayContextSnapshot,
  AuditToolDefinition,
  AuditUserChatRequest,
  AuditUserChatResponse,
} from '@/types'

// ── 辅助

function extractToolName(isFunc: boolean, obj: Record<string, unknown>, funcObj: Record<string, unknown> | null): string {
  if (isFunc && funcObj != null && typeof funcObj.name === 'string') {
    return funcObj.name
  }
  if (typeof obj.name === 'string' && obj.name !== '') return obj.name
  if (typeof obj.type === 'string' && obj.type !== '') return obj.type
  return 'Unknown Tool'
}
function asUserChatReq(body: unknown): AuditUserChatRequest | undefined {
  if (typeof body === 'object' && body !== null) {
    return body as AuditUserChatRequest
  }
  return undefined
}
function asUserChatResp(body: unknown): AuditUserChatResponse | undefined {
  if (typeof body === 'object' && body !== null && 'choices' in body) {
    return body as AuditUserChatResponse
  }
  return undefined
}

function formatToolChoiceObject(obj: Record<string, unknown>): string | undefined {
  const typeStr = typeof obj.type === 'string' ? obj.type : ''
  if (typeStr === 'function') {
    const fn = obj.function as Record<string, unknown> | undefined | null
    if (fn != null && typeof fn === 'object') {
      return typeof fn.name === 'string' && fn.name !== '' ? `function: ${fn.name}` : undefined
    }
  }
  if (typeStr !== '') return `tool: ${typeStr}`
  return typeof obj.name === 'string' && obj.name !== '' ? `function: ${obj.name}` : undefined
}

function formatToolChoice(tc: unknown): string | undefined {
  if (typeof tc === 'string' && tc !== '') return tc
  if (typeof tc === 'object' && tc !== null) return formatToolChoiceObject(tc as Record<string, unknown>)
  return undefined
}

// ── 一键复制
function useCopy(): { copied: boolean; copy: (text: string) => Promise<void> } {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => { setCopied(false); }, 2000)
    } catch { /* ignore */ }
  }, [])
  return { copied, copy }
}

function extractToolDesc(isFunc: boolean, obj: Record<string, unknown>, funcObj: Record<string, unknown> | null): string | undefined {
  if (isFunc && funcObj?.description != null && funcObj.description !== '') {
    return typeof funcObj.description === 'string' ? funcObj.description : ''
  }
  if (obj.description != null && obj.description !== '') {
    return typeof obj.description === 'string' ? obj.description : ''
  }
  if (obj.type != null && obj.type !== '') {
    return typeof obj.type === 'string' ? `Built-in Tool: ${obj.type}` : 'Built-in Tool'
  }
  return undefined
}

function getToolInfo(tool: unknown): { name: string; desc?: string | undefined; schema: unknown } {
  const obj = typeof tool === 'object' && tool !== null ? (tool as Record<string, unknown>) : {}
  const funcObj = typeof obj.function === 'object' && obj.function !== null ? (obj.function as Record<string, unknown>) : null

  const isFunction = obj.type === 'function' && funcObj != null
  const name = extractToolName(isFunction, obj, funcObj)
  const desc = extractToolDesc(isFunction, obj, funcObj)
  const schema = isFunction ? funcObj.parameters : (obj.input_schema ?? {})
  return { name, desc, schema }
}

// ── 单个工具卡片
function ToolCard({ tool, index }: { readonly tool: unknown; readonly index: number }): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const { copied, copy } = useCopy()
  
  const { name: toolName, desc: toolDesc, schema: schemaObj } = getToolInfo(tool)
  
  const schemaText = JSON.stringify(schemaObj ?? {}, null, 2)

  return (
    <div className='rounded-lg border bg-card overflow-hidden'>
      <button
        type='button'
        onClick={() => { setOpen((v) => !v); }}
        className='flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors'
      >
        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-50 border border-amber-200/60 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 font-mono text-[10px] font-bold'>
          {index + 1}
        </span>
        <span className='flex-1 min-w-0'>
          <span className='block font-mono text-sm font-semibold text-foreground truncate'>
            {toolName}
          </span>
          {toolDesc != null && toolDesc !== '' && (
            <span className='block text-xs text-muted-foreground mt-0.5 truncate'>
              {toolDesc}
            </span>
          )}
          {(toolDesc == null || toolDesc === '') && (
            <span className='block text-xs text-muted-foreground/50 italic mt-0.5'>
              无描述
            </span>
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className='border-t bg-muted/20'>
          <div className='flex items-center justify-between px-4 py-2'>
            <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
              参数 Schema
            </span>
            <button
              type='button'
              onClick={() => void copy(schemaText)}
              className='flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
            >
              {copied ? <Check className='h-3 w-3' /> : <Copy className='h-3 w-3' />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <pre className='px-4 pb-4 font-mono text-xs leading-relaxed text-foreground overflow-auto max-h-80'>
            {schemaText}
          </pre>
        </div>
      )}
    </div>
  )
}

// ── 本次调用结果区
function ToolCallsResult({ resp, reqBody }: {
  readonly resp: AuditUserChatResponse | undefined;
  readonly reqBody: AuditUserChatRequest | undefined;
}): React.JSX.Element | null {
  const { t } = useTranslation()
  const toolCalls = resp?.choices?.[0]?.message.tool_calls
  if (toolCalls == null || toolCalls.length === 0) return null

  // 从消息历史找工具结果
  const toolResults = reqBody?.messages?.filter((m) => m.role === 'tool') ?? []

  return (
    <div className='flex flex-col gap-3'>
      <h3 className='text-sm font-semibold flex items-center gap-2'>
        <Zap className='h-4 w-4 text-amber-500' />
        {t('modelsPage.logs.detail.thisCallTools', '模型本次调用的工具')}
      </h3>
      <div className='flex flex-col gap-2'>
        {(toolCalls as unknown[]).map((tcRaw) => {
          const tc = typeof tcRaw === 'object' && tcRaw !== null ? (tcRaw as Record<string, unknown>) : {}
          const tcId = typeof tc.id === 'string' ? tc.id : ''
          const result = toolResults.find((r) => r.tool_call_id === tcId)
          const funcObj = typeof tc.function === 'object' && tc.function !== null ? (tc.function as Record<string, unknown>) : null
          const isFunc = tc.type === 'function' && funcObj != null
          const callName = extractToolName(isFunc, tc, funcObj)
          
          let parsedArgs: unknown = isFunc ? funcObj.arguments : (tc.input ?? tc.arguments ?? '{}')
          try { 
            if (isFunc && typeof funcObj.arguments === 'string' && funcObj.arguments !== '') {
              parsedArgs = JSON.parse(funcObj.arguments) 
            }
          } catch { /* keep string */ }
          const argsText = typeof parsedArgs === 'string' ? parsedArgs : JSON.stringify(parsedArgs, null, 2)
          let resultText = ''
          if (result != null) {
            resultText = typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2)
          }
          
          return (
            <div key={tcId} className='rounded-lg border bg-card overflow-hidden'>
              <div className='flex items-center gap-2 px-4 py-2.5 border-b bg-muted/20'>
                <Wrench className='h-3.5 w-3.5 text-amber-500' />
                <span className='font-mono text-sm font-semibold'>{callName}</span>
                <span className='ml-auto font-mono text-[10px] text-muted-foreground truncate max-w-[140px]'>
                  {tcId}
                </span>
              </div>
              <div className='px-4 py-3 flex items-center gap-2'>
                {/* 查看调用参数弹窗 */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type='button'
                      className='flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors'
                    >
                      <Wrench className='h-3 w-3 text-muted-foreground' />
                      查看调用参数
                    </button>
                  </DialogTrigger>
                  <DialogContent showCloseButton={false} className='flex flex-col h-[85vh] max-h-[850px] min-h-[540px] w-[95vw] sm:max-w-[960px] overflow-hidden p-0 gap-0'>
                    <DialogHeader className='flex flex-row items-start justify-between shrink-0 border-b px-8 py-5 bg-background'>
                      <div className='flex flex-col gap-1.5 text-left'>
                        <DialogTitle className='flex items-center gap-2'>
                          <Wrench className='h-4 w-4 text-purple-500' />
                          工具调用参数：{callName}
                        </DialogTitle>
                        <DialogDescription className='font-mono text-[11px]'>{tcId}</DialogDescription>
                      </div>
                      <DialogClose asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground -mr-2 mt-0.5 border-0'>
                          <X className='h-4 w-4' />
                        </Button>
                      </DialogClose>
                    </DialogHeader>
                    <div className='flex-1 min-h-0 w-full min-w-0 overflow-y-auto px-8 py-6 bg-muted/10'>
                      <pre className='whitespace-pre-wrap break-all font-mono text-[13px] text-foreground leading-relaxed bg-background border border-border/50 rounded-md p-5 min-h-full'>
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
                        type='button'
                        className='flex items-center gap-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors'
                      >
                        <Zap className='h-3 w-3' />
                        查看返回値
                      </button>
                    </DialogTrigger>
                    <DialogContent showCloseButton={false} className='flex flex-col h-[85vh] max-h-[850px] min-h-[540px] w-[95vw] sm:max-w-[960px] overflow-hidden p-0 gap-0'>
                      <DialogHeader className='flex flex-row items-start justify-between shrink-0 border-b px-8 py-5 bg-background'>
                        <div className='flex flex-col gap-1.5 text-left'>
                          <DialogTitle className='flex items-center gap-2'>
                            <Zap className='h-4 w-4 text-amber-500' />
                            执行结果：{callName}
                          </DialogTitle>
                          <DialogDescription className='font-mono text-[11px]'>{tcId}</DialogDescription>
                        </div>
                        <DialogClose asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground -mr-2 mt-0.5 border-0'>
                            <X className='h-4 w-4' />
                          </Button>
                        </DialogClose>
                      </DialogHeader>
                      <div className='flex-1 min-h-0 w-full min-w-0 overflow-y-auto px-8 py-6 bg-emerald-50/30 dark:bg-emerald-950/20'>
                        <pre className='whitespace-pre-wrap break-all font-mono text-[13px] text-foreground leading-relaxed bg-emerald-50/60 border border-emerald-200/60 dark:bg-emerald-500/5 dark:border-emerald-500/20 rounded-md p-5 min-h-full'>
                          {resultText}
                        </pre>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 主组件
interface LogToolsTabProps {
  readonly ctx: GatewayContextSnapshot;
}

export function LogToolsTab({ ctx }: LogToolsTabProps): React.JSX.Element {
  const { t } = useTranslation()

  // 直接从网关已经适配并清洗完毕的上下文 request 中提取工具结构
  //（不读取 audit.userRequest.body，因为那里面可能是各种混乱的原始提供商特化格式）
  const chatReq = asUserChatReq(ctx.request)
  const chatResp = asUserChatResp(ctx.response)

  const tools: AuditToolDefinition[] = chatReq?.tools ?? []
  const toolChoice = chatReq?.tool_choice
  const choiceLabel = formatToolChoice(toolChoice)

  return (
    <div className='flex flex-col gap-5'>
      {/* 顶部状态栏 */}
      <div className='flex flex-wrap items-center gap-2'>
        <Badge
          variant='outline'
          className={cn(
            'font-medium text-xs gap-1.5',
            tools.length > 0
              ? 'border-amber-300 text-amber-700 bg-amber-50/60 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
              : 'text-muted-foreground'
          )}
        >
          <Wrench className='h-3 w-3' />
          {tools.length > 0
            ? t('modelsPage.logs.detail.toolCount', '{{count}} 个工具', { count: tools.length, defaultValue: `${tools.length} 个工具` })
            : t('modelsPage.logs.detail.noTools', '无工具')}
        </Badge>
        {choiceLabel != null && choiceLabel !== '' && (
          <Badge variant='outline' className='text-xs text-muted-foreground'>
            tool_choice: <span className='ml-1 font-mono font-medium text-foreground'>{choiceLabel}</span>
          </Badge>
        )}
      </div>

      {tools.length === 0 ? (
        /* 空状态 */
        <div className='flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground'>
          <Wrench className='h-8 w-8 opacity-20' />
          <span>{t('modelsPage.logs.detail.noToolsDefined', '本次请求未携带工具定义')}</span>
        </div>
      ) : (
        /* 工具列表 */
        <div className='flex flex-col gap-2'>
          {tools.map((tool: unknown, i) => {
            const obj = typeof tool === 'object' && tool !== null ? (tool as Record<string, unknown>) : {}
            const funcObj = typeof obj.function === 'object' && obj.function !== null ? (obj.function as Record<string, unknown>) : null
            const isFunc = obj.type === 'function' && funcObj != null
            const toolName = extractToolName(isFunc, obj, funcObj)
            return <ToolCard key={`${toolName}-${i}`} tool={tool} index={i} />
          })}
        </div>
      )}

      {/* 本次调用结果区 */}
      <ToolCallsResult resp={chatResp} reqBody={chatReq} />
    </div>
  )
}
