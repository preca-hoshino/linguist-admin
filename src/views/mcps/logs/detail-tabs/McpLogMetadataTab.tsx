import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useTheme } from '@/providers/ThemeProvider';
import type { GatewayContextSnapshot } from '@/types';
import type { McpLog } from '@/types/mcp';
import { formatBytes } from '@/utils/format-number';

// ── Body Card -> Message Card (For JSON-RPC)
function MessageCard({ data, title }: { readonly data: unknown; readonly title: string }): React.JSX.Element {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isEmpty = data == null || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0);

  const sizeAnnotation = isEmpty ? null : formatBytes(new Blob([JSON.stringify(data)]).size);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center px-0.5">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-foreground/90">{title}</div>
          {sizeAnnotation != null && (
            <span className="text-[11px] font-semibold text-muted-foreground">· {sizeAnnotation}</span>
          )}
        </div>
        {!isEmpty && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-1 text-muted-foreground hover:text-foreground shrink-0"
            title={t('common.download', '下载')}
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'payload.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border/60 bg-zinc-50/50 p-4 shadow-sm dark:bg-zinc-900/50">
        {isEmpty ? (
          <span className="text-sm text-muted-foreground italic">{t('common.empty', '空')}</span>
        ) : (
          <JsonView
            src={data as object}
            collapsed={2}
            enableClipboard
            displaySize
            theme={resolvedTheme === 'dark' ? 'a11y' : 'default'}
            style={{
              fontSize: '13px',
              lineHeight: '1.6',
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              backgroundColor: 'transparent',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── 主组件
interface McpLogMetadataTabProps {
  readonly log: McpLog;
}

export function McpLogMetadataTab({ log }: McpLogMetadataTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = log.mcp_context as unknown as GatewayContextSnapshot | undefined | null;
  const audit = ctx?.audit;

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6 w-full">
      <Tabs defaultValue="userRequest" className="w-full">
        <div className="overflow-x-auto pb-1 mb-2">
          <TabsList className="grid w-[600px] sm:w-full grid-cols-5 h-auto py-1">
            <TabsTrigger value="userRequest" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.userRequest', '用户请求')}
            </TabsTrigger>
            <TabsTrigger value="providerRequest" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.providerRequest', '提供商请求')}
            </TabsTrigger>
            <TabsTrigger value="providerResponse" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.providerResponse', '提供商响应')}
            </TabsTrigger>
            <TabsTrigger value="userResponse" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.userResponse', '用户响应')}
            </TabsTrigger>
            <TabsTrigger value="context" className="text-xs py-1.5">
              {t('modelsPage.logs.detail.context', '内部上下文')}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. 用户请求 */}
        <TabsContent value="userRequest" className="flex flex-col gap-4 focus-visible:outline-none">
          <MessageCard data={audit?.userRequest?.body} title={t('mcpsPage.logs.jsonRpcMessage', 'JSON-RPC Message')} />
        </TabsContent>

        {/* 2. 提供商请求 */}
        <TabsContent value="providerRequest" className="flex flex-col gap-4 focus-visible:outline-none">
          <MessageCard
            data={audit?.providerRequest?.body}
            title={t('mcpsPage.logs.jsonRpcMessage', 'JSON-RPC Message')}
          />
        </TabsContent>

        {/* 3. 提供商响应 */}
        <TabsContent value="providerResponse" className="flex flex-col gap-4 focus-visible:outline-none">
          <MessageCard
            data={audit?.providerResponse?.body}
            title={t('mcpsPage.logs.jsonRpcMessage', 'JSON-RPC Message')}
          />
        </TabsContent>

        {/* 4. 用户响应 */}
        <TabsContent value="userResponse" className="flex flex-col gap-4 focus-visible:outline-none">
          <MessageCard data={audit?.userResponse?.body} title={t('mcpsPage.logs.jsonRpcMessage', 'JSON-RPC Message')} />
        </TabsContent>

        {/* 5. Context */}
        <TabsContent value="context" className="focus-visible:outline-none">
          <MessageCard
            data={ctx}
            title={t('modelsPage.logs.detail.gatewayContextSnapshot', 'Gateway Context Snapshot')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
