// src/components/markdown-viewer/CopyButton.tsx

import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';

export function CopyButton({ text }: { readonly text: string }): React.JSX.Element {
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
