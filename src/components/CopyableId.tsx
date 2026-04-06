import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/utils/utils';

interface CopyableIdProps {
  readonly id: string;
  readonly prefix?: string;
  readonly className?: string;
  readonly iconOnly?: boolean;
}

export function CopyableId({ id, prefix = '', className, iconOnly }: CopyableIdProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (copied) {
      return;
    }
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // 忽略 clipboard API 偶尔的异常
    }
  }, [id, copied]);

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          void handleCopy();
        }}
        className={cn(
          'flex items-center justify-center rounded-md p-1 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground',
          className,
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        void handleCopy();
      }}
      className={cn(
        'group flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground transition-all hover:bg-muted hover:text-foreground',
        className,
      )}
    >
      <span>
        {prefix && <span className="mr-0.5 opacity-40 select-none">{prefix}</span>}
        {id}
      </span>
      <span
        className={cn(
          'flex items-center justify-center transition-all duration-200',
          copied ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100',
        )}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </span>
    </button>
  );
}
