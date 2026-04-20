// src/components/markdown-viewer/index.tsx
// MarkdownViewer - main public component

import { type ReactNode, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/utils/utils';
import { getMarkdownComponents } from './md-components';
import { parseSegments, type Segment } from './parser';
import { XmlCollapsibleBlock } from './XmlCollapsible';

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
