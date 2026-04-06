import { DialogTrigger } from '@radix-ui/react-dialog';
import { Blocks, ChevronDown, FileText, Image as ImageIcon, Settings2, Wrench, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { useTheme } from '@/providers/ThemeProvider';
import type { AuditToolCall } from '@/types';
import { cn } from '@/utils/utils';
import { detectResponseType, type ChatItem } from '../utils';
import { ToolInteractionButton, ToolInteractionDialog, ToolInteractionTrigger } from './ToolInteractionDialog';
import 'react18-json-view/src/style.css';

// ── 组件：思维链推理块
export function ReasoningBlock({ content }: { readonly content: string }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-amber-200/60 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5 text-foreground">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        <span>思维链 / Reasoning</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 max-h-80 overflow-y-auto scrollbar-thin">
          <MarkdownViewer content={content} className="text-[13px] text-amber-900 dark:text-amber-200" />
        </div>
      )}
    </div>
  );
}

// ── 组件：系统提示词横幅（弹窗）
export function SystemBanner({ msg }: { readonly msg: ChatItem }): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();

  const { responseType, parsedJson } = useMemo(() => {
    if (msg.content == null || msg.content === '') {
      return { responseType: 'markdown' as const, parsedJson: undefined };
    }
    const result = detectResponseType(msg.content);
    return { responseType: result.type, parsedJson: result.parsed };
  }, [msg.content]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="mb-4 overflow-hidden rounded-xl border border-amber-200/60 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5 shadow-sm cursor-pointer hover:bg-amber-100/40 dark:hover:bg-amber-500/10 transition-colors">
          <div className="flex w-full items-center justify-between px-4 py-3 text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-wide uppercase">
              <Settings2 className="h-4 w-4" />
              System Prompt
            </div>
            <span className="text-[10px] opacity-60">点击查看</span>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col h-[85vh] max-h-[850px] min-h-[540px] w-[95vw] sm:max-w-[960px] overflow-hidden p-0 gap-0"
      >
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 border-b px-8 py-5 bg-background relative min-h-[72px]">
          <div className="flex items-center gap-3 z-10 w-full min-w-0 pr-8">
            <Settings2 className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5 text-left justify-center min-w-0 flex-1">
              <DialogTitle className="leading-tight flex items-center break-all sm:break-normal truncate sm:whitespace-normal sm:line-clamp-2 text-[15px] text-amber-700 dark:text-amber-400">
                系统提示词 / System Prompt
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80 text-[11px] truncate">
                模型请求在发起时被注入的核心骨架设定。
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center z-10 h-full shrink-0">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground -mr-2 border-0">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-muted/10">
          {msg.content == null || msg.content === '' ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground/50 italic">
              暂无内容
            </div>
          ) : (
            <>
              <div className="px-8 pt-6 pb-3 flex items-center gap-3 shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono text-[11px] px-2 py-0 h-5 gap-1.5',
                    responseType === 'json' && 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5',
                    responseType === 'xml' &&
                      'border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/5',
                    responseType === 'markdown' && 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      responseType === 'json' && 'bg-amber-500',
                      responseType === 'xml' && 'bg-violet-500',
                      responseType === 'markdown' && 'bg-blue-500',
                    )}
                  />
                  {responseType.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                  {((): string => {
                    const content = msg.content ?? '';
                    const len = content.length;
                    const cjk = (content.match(/[\u4E00-\u9FFF\u3400-\u4DBF\u{20000}-\u{2A6DF}]/gu) ?? []).length;
                    const words = cjk + Math.round((len - cjk) / 5);
                    let sizeStr = `${len} B`;
                    if (len >= 1024 * 1024) {
                      sizeStr = `${(len / 1024 / 1024).toFixed(2)} MB`;
                    } else if (len >= 1024) {
                      sizeStr = `${(len / 1024).toFixed(1)} KB`;
                    }
                    return `~${words.toLocaleString()} ${t('common.words', '词')} · ${sizeStr}`;
                  })()}
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-6 scrollbar-thin">
                <div className="w-full rounded-md border border-border/40 bg-card px-6 py-4">
                  {responseType === 'json' && parsedJson !== undefined ? (
                    <JsonView
                      src={parsedJson}
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
                  ) : (
                    <MarkdownViewer
                      content={msg.content}
                      enableXmlHighlight={responseType === 'xml'}
                      className="text-[13px] leading-relaxed"
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unit = sizes[i] ?? 'GB';
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${unit}`;
}

function getBase64SizeBytes(base64Str: string): number {
  let padding = 0;
  if (base64Str.endsWith('==')) {
    padding = 2;
  } else if (base64Str.endsWith('=')) {
    padding = 1;
  }
  return Math.floor((base64Str.length * 3) / 4) - padding;
}

function BubbleMeta({ item }: { readonly item: ChatItem }): React.JSX.Element | null {
  const [imgDim, setImgDim] = useState<string>('');

  const sizeText = useMemo(() => {
    if (item.imageUrl != null && item.imageUrl !== '') {
      const src = item.imageUrl;
      if (src.startsWith('data:')) {
        const base64Str = src.split(',')[1];
        if (base64Str !== undefined && base64Str !== '') {
          return formatBytes(getBase64SizeBytes(base64Str));
        }
      }
      return 'URL';
    }

    let combinedText = '';
    if (item.content != null) {
      combinedText += item.content;
    }
    if (item.reasoning_content != null) {
      combinedText += item.reasoning_content;
    }

    if (combinedText !== '') {
      const bytes = new globalThis.Blob([combinedText]).size;
      const charCount = combinedText.length;
      return `${charCount} 字 • ${formatBytes(bytes)}`;
    }
    return '';
  }, [item]);

  useEffect(() => {
    let unmounted = false;
    if (item.imageUrl != null && item.imageUrl !== '') {
      const img = new globalThis.Image();
      img.addEventListener('load', (): void => {
        if (unmounted) {
          return;
        }
        setImgDim(`${img.naturalWidth}x${img.naturalHeight}`);
      });
      img.src = item.imageUrl;
    }
    return (): void => {
      unmounted = true;
    };
  }, [item]);

  if (!sizeText && !imgDim) {
    return null;
  }

  let finalStr = '';
  if (imgDim !== '') {
    finalStr = sizeText !== '' && sizeText !== 'URL' ? `${imgDim} • ${sizeText}` : imgDim;
  } else if (sizeText === 'URL') {
    finalStr = 'URL';
  } else {
    finalStr = sizeText;
  }

  if (!finalStr) {
    return null;
  }

  return (
    <div className="text-[11px] text-muted-foreground/60 font-mono tracking-tight shrink-0 mt-0.5">{finalStr}</div>
  );
}

function BubbleContent({
  item,
  isPureImage,
  toolCallMap,
  toolResponseMap,
}: {
  readonly item: ChatItem;
  readonly isPureImage: boolean;
  readonly toolCallMap: Map<string, AuditToolCall>;
  readonly toolResponseMap: Map<string, string>;
}): React.JSX.Element {
  const hasExtraContent =
    (item.content != null && item.content !== '') || (item.reasoning_content != null && item.reasoning_content !== '');

  return (
    <>
      {item.reasoning_content != null && item.reasoning_content !== '' && (
        <ReasoningBlock content={item.reasoning_content} />
      )}
      {item.role === 'tool' && (
        <Dialog>
          <div className="flex w-full items-center justify-between">
            <ToolInteractionTrigger
              toolName={item.toolName ?? '工具响应'}
              callId={item.tool_call_id}
              defaultTab="response"
            />
            <DialogTrigger asChild>
              <ToolInteractionButton defaultTab="response" className="ml-2 shrink-0" />
            </DialogTrigger>
          </div>
          <ToolInteractionDialog
            toolName={item.toolName ?? '工具响应'}
            toolCall={item.tool_call_id == null ? undefined : toolCallMap.get(item.tool_call_id)}
            toolResponse={item.content}
            callId={item.tool_call_id}
            defaultTab="response"
          />
        </Dialog>
      )}
      {item.role !== 'tool' && item.content != null && item.content !== '' && (
        <MarkdownViewer content={item.content} className="text-[13px] leading-relaxed" />
      )}
      {item.role === 'user' && item.imageUrl != null && item.imageUrl !== '' && (
        <img
          src={item.imageUrl}
          alt="Message content"
          className={cn(
            'max-w-full object-contain',
            isPureImage
              ? 'rounded-lg max-h-[500px]'
              : 'rounded-md border border-border/50 shadow-sm max-h-[400px] my-2 bg-muted/20',
          )}
        />
      )}
      {item.tool_calls != null && item.tool_calls.length > 0 && (
        <div className={cn('flex flex-col gap-1', hasExtraContent ? 'mt-1' : 'mt-0')}>
          {item.tool_calls.map((tc) => (
            <Dialog key={tc.id}>
              <div className="flex w-full items-center justify-between">
                <ToolInteractionTrigger toolName={tc.function.name} callId={tc.id} defaultTab="request" />
                <DialogTrigger asChild>
                  <ToolInteractionButton defaultTab="request" className="ml-2 shrink-0" />
                </DialogTrigger>
              </div>
              <ToolInteractionDialog
                toolName={tc.function.name}
                toolCall={tc}
                toolResponse={toolResponseMap.get(tc.id)}
                callId={tc.id}
                defaultTab="request"
              />
            </Dialog>
          ))}
        </div>
      )}
    </>
  );
}

function getBubbleType(item: ChatItem): { TypeIcon: React.ElementType; typeLabel: string; typeColor: string } {
  if (item.role === 'tool') {
    return {
      TypeIcon: Wrench,
      typeLabel: '工具',
      typeColor: 'text-amber-600 dark:text-amber-500 bg-amber-500/10 border-amber-500/20',
    };
  }
  if (item.role === 'assistant' && item.tool_calls && item.tool_calls.length > 0) {
    return {
      TypeIcon: Blocks,
      typeLabel: '工具',
      typeColor: 'text-purple-600 dark:text-purple-500 bg-purple-500/10 border-purple-500/20',
    };
  }
  if (item.role === 'user' && item.imageUrl != null && item.imageUrl !== '') {
    return {
      TypeIcon: ImageIcon,
      typeLabel: '图片',
      typeColor: 'text-blue-600 dark:text-blue-500 bg-blue-500/10 border-blue-500/20',
    };
  }
  return { TypeIcon: FileText, typeLabel: '文本', typeColor: 'text-muted-foreground bg-muted/30 border-border/50' };
}

// ── 组件：IM 聊天气泡
export function ChatBubble({
  item,
  isMerged,
  isFirst,
  toolCallMap,
  toolResponseMap,
}: {
  readonly item: ChatItem;
  readonly isMerged: boolean;
  readonly isFirst: boolean;
  readonly toolCallMap: Map<string, AuditToolCall>;
  readonly toolResponseMap: Map<string, string>;
}): React.JSX.Element {
  const Icon = item.icon;
  const isRight = item.isRight;

  const { TypeIcon, typeLabel, typeColor } = getBubbleType(item);

  const TypeBadge = (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium shadow-sm transition-colors',
        typeColor,
      )}
    >
      <TypeIcon className="h-3 w-3" />
      <span>{typeLabel}</span>
    </div>
  );

  const isToolBubble = typeLabel === '工具';

  const isPureImage =
    item.role === 'user' &&
    item.imageUrl != null &&
    item.imageUrl !== '' &&
    (item.content == null || item.content === '');
  const bubbleBg = 'bg-card border border-border/60 shadow-sm text-foreground';
  const paddingClass = isPureImage ? 'p-1.5' : 'px-3 py-2';
  const borderRadius = 'rounded-xl';

  let marginTopStr = '40px';
  if (isMerged) {
    marginTopStr = '8px';
  } else if (isFirst) {
    marginTopStr = '16px';
  }

  return (
    <div
      className={cn('flex w-full relative gap-5 shrink-0', isRight ? 'justify-end' : 'justify-start')}
      style={{ marginTop: marginTopStr }}
    >
      {!isRight && (
        <div className="flex flex-col items-center mt-1 shrink-0">
          {isMerged ? (
            <div className="w-8 h-8" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border shadow-sm text-foreground overflow-hidden">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      <div
        className={cn('flex flex-col shrink-0 flex-none', isRight ? 'items-end' : 'items-start')}
        style={{ width: isToolBubble ? '35%' : '70%' }}
      >
        {!isMerged && (
          <div className="mb-1.5 flex items-center">
            <span className="text-xs font-semibold text-foreground opacity-80 pl-1 pr-1">{item.nameLabel}</span>
          </div>
        )}

        <div className={cn('mb-1.5 flex items-center gap-2', isRight ? 'flex-row-reverse' : 'flex-row')}>
          {TypeBadge}
          {!isToolBubble && <BubbleMeta item={item} />}
        </div>

        <div
          className={cn(
            'text-[13px] text-left leading-relaxed break-words transition-all flex-none',
            isPureImage ? 'w-fit max-w-full' : 'w-full',
            paddingClass,
            bubbleBg,
            borderRadius,
          )}
        >
          <BubbleContent
            item={item}
            isPureImage={isPureImage}
            toolCallMap={toolCallMap}
            toolResponseMap={toolResponseMap}
          />
        </div>
      </div>

      {isRight && (
        <div className="flex flex-col items-center mt-1 shrink-0">
          {isMerged ? (
            <div className="w-8 h-8" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm overflow-hidden">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
