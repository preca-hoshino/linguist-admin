// src/components/markdown-viewer/md-components.tsx
// Shared ReactMarkdown component map generator

import type { CSSProperties } from 'react';
import type ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/utils/utils';
import { CopyButton } from './CopyButton';

export const getMarkdownComponents = (isDark: boolean): React.ComponentProps<typeof ReactMarkdown>['components'] => ({
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
