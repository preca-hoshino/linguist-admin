import { Check, ChevronDown, Code2, Copy } from 'lucide-react';
import { type CSSProperties, type ReactNode, useCallback, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/utils/utils';

// ═══════════════════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════════════════

/** 内容分段：普通文本 or XML 块 */
type Segment =
  | { type: 'text'; content: string }
  | { type: 'xml'; tagName: string; attrs: string; innerContent: string; raw: string };

// ═══════════════════════════════════════════════════════════════════
// XML 预处理器：将原始文本拆分为「文本段」与「XML 块段」交替序列
// ═══════════════════════════════════════════════════════════════════

interface TagToken {
  tagName: string;
  attrs: string;
  startMatchIndex: number;
  matchLength: number;
  innerStartIndex: number;
}

interface TagPair {
  startTag: TagToken;
  endIndex: number;
  endLength: number;
}

const COMMON_HTML_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
]);

// eslint-disable-next-line sonarjs/cognitive-complexity
function parseSegments(raw: string): Segment[] {
  const segments: Segment[] = [];

  // 匹配三反引号代码块 或 XML 标签
  // eslint-disable-next-line sonarjs/slow-regex, sonarjs/regex-complexity
  const lexRegex = /(```[\s\S]*?```)|(<\/?([a-zA-Z][\w-]*)((?:\s+[^>]*?)?)\s*>)/g;
  let match: RegExpExecArray | null;

  const stack: TagToken[] = [];
  const pairs: TagPair[] = [];

  for (;;) {
    match = lexRegex.exec(raw);
    if (match === null) {
      break;
    }
    if (match[1] !== undefined) {
      // 命中代码块，跳过内部任何结构
      continue;
    }

    const tagStr = match[2] as string;
    const isClosing = tagStr.startsWith('</');
    const isSelfClosing = tagStr.endsWith('/>');
    const tagName = match[3] as string;

    // 忽略标准 HTML 标签，只把未知的自定义标记/大段 XML 提取为折叠块
    if (COMMON_HTML_TAGS.has(tagName.toLowerCase())) {
      continue;
    }

    if (isSelfClosing) {
      continue;
    }

    if (isClosing) {
      if (stack.length > 0) {
        // 从栈顶往下找能闭合的最邻近 open tag
        let foundIndex = -1;
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i]?.tagName === tagName) {
            foundIndex = i;
            break;
          }
        }

        if (foundIndex !== -1) {
          const openTag = stack[foundIndex] as TagToken;
          pairs.push({
            startTag: openTag,
            endIndex: match.index,
            endLength: tagStr.length,
          });
          // 将匹配到的及其上层的未闭合标签全部出栈
          stack.length = foundIndex;
        }
      }
    } else {
      stack.push({
        tagName,
        attrs: (match[4] ?? '').trim(),
        startMatchIndex: match.index,
        matchLength: tagStr.length,
        innerStartIndex: match.index + tagStr.length,
      });
    }
  }

  // 按起始位置进行排序
  pairs.sort((a, b) => a.startTag.startMatchIndex - b.startTag.startMatchIndex);

  // 筛选出最外层的合法区块（不被其他任何区块包裹）
  const outermostPairs: TagPair[] = [];
  let currentMaxEnd = -1;

  for (const pair of pairs) {
    if (pair.startTag.startMatchIndex >= currentMaxEnd) {
      outermostPairs.push(pair);
      currentMaxEnd = pair.endIndex + pair.endLength;
    }
  }

  // 转换为分段输出
  let lastIndex = 0;
  for (const pair of outermostPairs) {
    // 缝隙部分作为普通文本
    if (pair.startTag.startMatchIndex > lastIndex) {
      const text = raw.slice(lastIndex, pair.startTag.startMatchIndex);
      if (text.trim()) {
        segments.push({ type: 'text', content: text });
      }
    }

    // 主体部分作为 XML
    const fullXmlLen = pair.endIndex + pair.endLength - pair.startTag.startMatchIndex;
    segments.push({
      type: 'xml',
      tagName: pair.startTag.tagName,
      attrs: pair.startTag.attrs,
      innerContent: raw.slice(pair.startTag.innerStartIndex, pair.endIndex),
      raw: raw.slice(pair.startTag.startMatchIndex, pair.startTag.startMatchIndex + fullXmlLen),
    });

    lastIndex = pair.endIndex + pair.endLength;
  }

  // 残余尾部
  if (lastIndex < raw.length) {
    const text = raw.slice(lastIndex);
    if (text.trim()) {
      segments.push({ type: 'text', content: text });
    }
  }

  return segments;
}

// ═══════════════════════════════════════════════════════════════════
// 小工具组件
// ═══════════════════════════════════════════════════════════════════

function CopyButton({ text }: { readonly text: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // 静默处理
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground ring-1 ring-border/50 transition-colors hover:bg-background hover:text-foreground"
      title="复制代码"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// XML 可折叠块组件
// ═══════════════════════════════════════════════════════════════════

function XmlCollapsibleBlock({
  tagName,
  attrs,
  innerContent,
}: {
  readonly tagName: string;
  readonly attrs: string;
  readonly innerContent: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);

  // 标签展示名
  const displayTag = attrs ? `<${tagName} ${attrs}>` : `<${tagName}>`;

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-border/50 bg-muted/30 dark:bg-muted/10">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-foreground/70 transition-colors hover:bg-muted/50 hover:text-foreground dark:hover:bg-muted/20"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
        <Code2 className="h-3.5 w-3.5 shrink-0 text-primary/60" />
        <span className="truncate font-mono text-foreground/80">{displayTag}</span>
      </button>
      {open && (
        <div className="scrollbar-thin max-h-96 overflow-y-auto border-t border-border/50 bg-background/30 px-4 pt-2 pb-3">
          {/* <MarkdownViewer /> 本身有针对 XML 与 MD 的复合检查，所以递归可以处理嵌套的 XML */}
          <MarkdownViewer content={innerContent} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Markdown 渲染核心（内部复用，不含 XML 预处理）
// ═══════════════════════════════════════════════════════════════════

/** 共享的 ReactMarkdown 自定义 components 映射生成器 */
const getMarkdownComponents = (isDark: boolean): React.ComponentProps<typeof ReactMarkdown>['components'] => ({
  // 拦截代码块进行语法高亮

  code({ className: codeClassName, children, ref: _ref, ...rest }): React.JSX.Element {
    const match = /language-(\w+)/.exec(codeClassName ?? '');
    let childrenStr = '';
    if (Array.isArray(children)) {
      childrenStr = children.join('');
    } else if (typeof children === 'string' || typeof children === 'number') {
      childrenStr = String(children);
    }
    const codeString = childrenStr.replace(/\n$/, '');

    const isBlock = match !== null || codeString.includes('\n');
    let lang = match?.[1] ?? '';

    if (isBlock && !lang) {
      lang = 'text';
    }

    if (lang) {
      const customStyle: CSSProperties = {
        margin: 0,
        padding: '1rem',
        background: 'transparent',
        backgroundColor: 'transparent',
        fontSize: '13px',
        lineHeight: '1.6',
      };

      return (
        <div
          className={cn(
            'group not-prose relative my-3 flex flex-col rounded-md border border-border/50 overflow-hidden',
            isDark ? 'bg-[#282c34]' : 'bg-muted/30',
          )}
        >
          <div className="flex z-10 items-center justify-between border-b border-border/50 bg-muted/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
            <span>{lang.toUpperCase()}</span>
          </div>
          <div className="relative overflow-x-auto">
            <SyntaxHighlighter
              // @ts-expect-error react-syntax-highlighter typings mismatch
              style={isDark ? oneDark : oneLight}
              language={lang}
              PreTag="div"
              customStyle={customStyle}
              {...rest}
            >
              {codeString}
            </SyntaxHighlighter>
            <CopyButton text={codeString} />
          </div>
        </div>
      );
    }

    return (
      <code
        className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground ring-1 ring-border/30 ring-inset"
        {...rest}
      >
        {children}
      </code>
    );
  },

  pre({ children }): React.JSX.Element {
    // Simply render children to let our enhanced `code` block completely manage layout and backgrounds, eliminating the nested double background block problem.
    return <>{children}</>;
  },

  img({ src, alt, ...rest }): React.JSX.Element {
    return (
      <img
        src={src}
        alt={alt ?? 'Image'}
        className="max-w-full rounded-md border border-border/50 shadow-sm max-h-[400px] object-contain my-2 bg-muted/20"
        {...rest}
      />
    );
  },

  h1({ children }): React.JSX.Element {
    return <h1 className="text-xl font-bold text-foreground mt-4 mb-2 first:mt-0">{children}</h1>;
  },
  h2({ children }): React.JSX.Element {
    return <h2 className="text-lg font-semibold text-foreground mt-3.5 mb-1.5 first:mt-0">{children}</h2>;
  },
  h3({ children }): React.JSX.Element {
    return <h3 className="text-base font-semibold text-foreground mt-3 mb-1 first:mt-0">{children}</h3>;
  },

  hr(): React.JSX.Element {
    return <hr className="my-4 border-border/50" />;
  },

  ul({ children }): React.JSX.Element {
    return <ul className="my-2 list-disc pl-5 text-foreground space-y-1">{children}</ul>;
  },
  ol({ children }): React.JSX.Element {
    return <ol className="my-2 list-decimal pl-5 text-foreground space-y-1">{children}</ol>;
  },
  li({ children }): React.JSX.Element {
    return <li className="text-foreground">{children}</li>;
  },

  p({ children }): React.JSX.Element {
    return <p className="my-1.5 text-foreground leading-relaxed first:mt-0 last:mb-0">{children}</p>;
  },

  strong({ children }): React.JSX.Element {
    return <strong className="font-semibold text-foreground">{children}</strong>;
  },

  table({ children }): React.JSX.Element {
    return (
      <div className="not-prose my-3 overflow-x-auto rounded-md border border-border/50">
        <table className="min-w-full text-sm">{children}</table>
      </div>
    );
  },
  th({ children }): React.JSX.Element {
    return (
      <th className="border-b border-border/50 bg-muted/40 px-3 py-2 text-left text-xs font-semibold text-foreground">
        {children}
      </th>
    );
  },
  td({ children }): React.JSX.Element {
    return <td className="border-b border-border/30 px-3 py-2 text-foreground">{children}</td>;
  },

  blockquote({ children }): React.JSX.Element {
    return (
      <blockquote className="my-3 rounded-r-md border-l-3 border-primary/40 bg-primary/5 py-2 pr-2 pl-4 text-muted-foreground italic">
        {children}
      </blockquote>
    );
  },

  a({ children, href, ...rest }): React.JSX.Element {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-primary/80"
        {...rest}
      >
        {children}
      </a>
    );
  },
});

// ═══════════════════════════════════════════════════════════════════
// 对外主组件
// ═══════════════════════════════════════════════════════════════════

interface MarkdownViewerProps {
  /** 原始文本内容 */
  readonly content: string;
  /** 额外的 CSS 类名 */
  readonly className?: string;
  /** 是否启用 XML 折叠块解析（默认启用） */
  readonly enableXmlHighlight?: boolean;
}

export function MarkdownViewer({
  content,
  className,
  enableXmlHighlight = true,
}: MarkdownViewerProps): React.JSX.Element {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const components = useMemo(() => getMarkdownComponents(isDark), [isDark]);

  const segments = useMemo<Segment[]>(() => {
    if (!enableXmlHighlight) {
      return [{ type: 'text', content }];
    }
    const parsed = parseSegments(content);
    // 如果没有匹配到任何 XML 块，退化为纯文本
    return parsed.length > 0 ? parsed : [{ type: 'text', content }];
  }, [content, enableXmlHighlight]);

  const rendered = useMemo<ReactNode[]>(() => {
    return segments.map((seg, i) => {
      if (seg.type === 'xml') {
        // biome-ignore lint/suspicious/noArrayIndexKey: order of parsed markdown segments is stable
        return <XmlCollapsibleBlock key={i} tagName={seg.tagName} attrs={seg.attrs} innerContent={seg.innerContent} />;
      }
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: order of parsed markdown segments is stable
        <div key={i} className="prose prose-sm dark:prose-invert my-2 max-w-none break-words first:mt-0 last:mb-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {seg.content}
          </ReactMarkdown>
        </div>
      );
    });
  }, [segments, components]);

  return <div className={cn('markdown-viewer w-full', className)}>{rendered}</div>;
}
