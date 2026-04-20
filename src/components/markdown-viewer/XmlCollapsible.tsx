// src/components/markdown-viewer/XmlCollapsible.tsx

import { ChevronDown, Code2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/utils';
import { MarkdownViewer } from '.';

export function XmlCollapsibleBlock({
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
