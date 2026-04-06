import { Code, Download, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/utils/utils';
import { detectJsonContent, exportContent } from '../utils';

import 'react18-json-view/src/style.css';

interface SmartContentViewerProps {
  /** The content to render */
  readonly content?: string | null | undefined;
  /** File name for exporting the content */
  readonly exportFileName?: string;
}

export function SmartContentViewer({
  content,
  exportFileName = 'content',
}: SmartContentViewerProps): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [isRawView, setIsRawView] = useState(false);

  const { isJson, parsed: parsedJson } = useMemo(() => {
    if (content == null || content === '') {
      return { isJson: false, parsed: undefined };
    }
    return detectJsonContent(content);
  }, [content]);

  const handleExport = (): void => {
    if (content == null || content === '') {
      return;
    }
    const ext = isJson ? '.json' : '.md';
    exportContent(content, `${exportFileName}${ext}`);
  };

  if (content == null || content === '') {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground/50 italic flex-1 min-h-0">
        {t('modelsPage.logs.detail.noContent', '暂无内容')}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 shrink-0 mb-3 px-8 pt-6">
        <Badge
          variant="outline"
          className={cn(
            'font-mono text-[11px] px-2 py-0 h-5 gap-1.5',
            isJson
              ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', isJson ? 'bg-amber-500' : 'bg-blue-500')} />
          {isJson ? 'JSON' : 'MARKDOWN'}
        </Badge>
        <span className="text-[11px] text-muted-foreground/60 tabular-nums">
          {((): string => {
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
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => {
            setIsRawView(!isRawView);
          }}
          title={
            isRawView
              ? t('modelsPage.logs.detail.markdownView', '预览视图')
              : t('modelsPage.logs.detail.rawView', '原始视图')
          }
        >
          {isRawView ? <Eye className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
          onClick={handleExport}
          title={t('modelsPage.logs.detail.export', '导出')}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-6 scrollbar-thin">
        <div className="w-full rounded-md border border-border/40 bg-card px-6 py-4">
          {((): React.JSX.Element => {
            if (isRawView) {
              return (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-words text-foreground/90 overflow-x-auto">
                  {content}
                </pre>
              );
            }
            if (isJson && parsedJson !== undefined) {
              return (
                <JsonView
                  src={parsedJson as object}
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
              );
            }
            return (
              <MarkdownViewer content={content} enableXmlHighlight={true} className="text-[13px] leading-relaxed" />
            );
          })()}
        </div>
      </div>
    </>
  );
}
