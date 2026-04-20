// src/components/CodeViewer.tsx
// 通用代码块查看组件：语法高亮 + 一键复制

import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/Button';

interface CodeViewerProps {
  /** 代码内容 */
  readonly code: string;
  /** 可选：如果不传则 fallback 到渲染 code 字符串；传了则渲染自定义的 ReactNode */
  readonly renderCode?: React.ReactNode;
  /** 语言标签（仅展示用，如 "bash" / "json"） */
  readonly language?: string;
  /** 额外 className */
  readonly className?: string;
}

export function CodeViewer({ code, renderCode, language, className }: CodeViewerProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (copied) {
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // clipboard API 偶发异常，静默忽略
    }
  }, [code, copied]);

  return (
    <div className={cn('relative rounded-md border bg-muted/50 text-sm', className)}>
      {/* 顶部语言标签 + 复制按钮 */}
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">{language ?? 'text'}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => void handleCopy()}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* 代码内容 */}
      <pre className="overflow-x-auto p-3 font-mono font-light text-xs leading-relaxed text-foreground whitespace-pre">
        {renderCode ?? code}
      </pre>
    </div>
  );
}
