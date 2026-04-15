import { useTheme } from '@/providers/ThemeProvider';
import type { McpLog } from '@/types/mcp';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

interface McpLogRawDataTabProps {
  readonly log: McpLog;
}

export function McpLogRawDataTab({ log }: McpLogRawDataTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.mcpRequestParams', '请求参数 (Params)')}</h3>
        <div className="border border-border/40 rounded-md bg-card w-full min-w-0 p-4 overflow-x-auto">
          {Object.keys(log.params).length > 0 ? (
            <JsonView
              src={log.params}
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
            <span className="text-muted-foreground text-sm italic">{t('common.noParam', '无参数')}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.mcpResponseResult', '返回结果 (Result)')}</h3>
        <div className="border border-border/40 rounded-md bg-card w-full min-w-0 p-4 overflow-x-auto">
          {Object.keys(log.result).length > 0 ? (
            <JsonView
              src={log.result}
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
            <span className="text-muted-foreground text-sm italic">{t('common.noResult', '无返回内容')}</span>
          )}
        </div>
      </div>

      {log.error == null ? null : (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-destructive">
            {t('modelsPage.logs.detail.mcpError', '错误详情 (Error)')}
          </h3>
          <div className="border border-destructive/40 bg-destructive/5 rounded-md w-full min-w-0 p-4 overflow-x-auto">
            <JsonView
              src={log.error}
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
          </div>
        </div>
      )}
    </div>
  );
}
