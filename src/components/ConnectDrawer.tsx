// src/components/ConnectDrawer.tsx
// 快速接入配置抽屉 — 帮助用户生成 App 对应的 Model/MCP 接入配置（cURL / JSON）
//
// 基础 URL 当前从 window.location.origin 提取，
// 后续可通过"设置"页面提供 Gateway 公网地址覆盖此默认值。

import { Plug } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { listApps } from '@/api/apps';
import { listVirtualModels } from '@/api/virtual-models';
import { listVirtualMcps } from '@/api/mcp-virtual-servers';
import { Button } from '@/components/ui/Button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { CodeViewer } from '@/components/CodeViewer';
import { API_PREFIX } from '@/config/runtime';
import type { App } from '@/types/app';
import type { VirtualModel } from '@/types/virtual-model';
import type { VirtualMcp } from '@/types/mcp';

// ===== 配置片段生成 =====

/**
 * 生成 cURL 形式的 Chat Completions 接入配置。
 *
 * 基础地址使用 window.location.origin + API_PREFIX。
 * 如需使用自定义域名，可在未来的设置页面中通过配置项覆盖。
 */
function buildCurlSnippet(apiKey: string, modelName: string, gatewayOrigin: string): string {
  return String.raw`curl "${gatewayOrigin}${API_PREFIX}/v1/chat/completions" \
  -H "Authorization: Bearer ${apiKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "${modelName}",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ],
    "stream": false
  }'`;
}

/**
 * 生成 MCP 客户端 JSON 配置。
 * 使用 SSE 传输模式（url + headers），兼容 Claude Desktop / Cursor 等支持 HTTP SSE 的客户端。
 *
 * 基础地址使用 window.location.origin。
 * 如需使用自定义域名，可在未来的设置页面中通过配置项覆盖。
 */
function buildMcpJsonSnippet(apiKey: string, mcpName: string, gatewayOrigin: string): string {
  const config = {
    mcpServers: {
      [mcpName]: {
        url: `${gatewayOrigin}/mcp/sse`,
        headers: {
          'X-Mcp-Name': mcpName,
          Authorization: `Bearer ${apiKey}`,
        },
      },
    },
  };
  return JSON.stringify(config, null, 2);
}

// ===== 子组件 =====

interface ModelConfigPanelProps {
  readonly app: App;
  readonly allModels: VirtualModel[];
  readonly gatewayOrigin: string;
}

function ModelConfigPanel({ app, allModels, gatewayOrigin }: ModelConfigPanelProps): React.JSX.Element {
  const { t } = useTranslation();

  // 根据 App 的 allowed_model_ids 过滤可用虚拟模型
  // 若 allowed_model_ids 为空数组，则无权访问任何模型
  const availableModels = useMemo<VirtualModel[]>(() => {
    if (app.allowed_model_ids.length === 0) {
      return [];
    }
    return allModels.filter((m) => app.allowed_model_ids.includes(m.id));
  }, [app.allowed_model_ids, allModels]);

  const [selectedModelId, setSelectedModelId] = useState<string>('');

  const selectedModel = availableModels.find((m) => m.id === selectedModelId);
  const snippet = selectedModel ? buildCurlSnippet(app.api_key, selectedModel.name, gatewayOrigin) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="connect-drawer-model-select" className="text-sm font-medium text-foreground">
          {t('connectDrawer.selectModel')}
        </label>
        {availableModels.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('connectDrawer.noModels')}</p>
        ) : (
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger id="connect-drawer-model-select">
              <SelectValue placeholder={t('connectDrawer.modelPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {snippet !== null && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">{t('connectDrawer.curlConfig')}</p>
          <CodeViewer code={snippet} language="bash" />
        </div>
      )}
    </div>
  );
}

interface McpConfigPanelProps {
  readonly app: App;
  readonly allMcps: VirtualMcp[];
  readonly gatewayOrigin: string;
}

function McpConfigPanel({ app, allMcps, gatewayOrigin }: McpConfigPanelProps): React.JSX.Element {
  const { t } = useTranslation();

  // 根据 App 的 allowed_mcp_ids 过滤可用虚拟 MCP
  // allowed_mcp_ids 为 undefined 或空数组均表示无权限
  const availableMcps = useMemo<VirtualMcp[]>(() => {
    const allowedIds = app.allowed_mcp_ids;
    if (!allowedIds || allowedIds.length === 0) {
      return [];
    }
    return allMcps.filter((m) => allowedIds.includes(m.id));
  }, [app.allowed_mcp_ids, allMcps]);

  const [selectedMcpId, setSelectedMcpId] = useState<string>('');

  const selectedMcp = availableMcps.find((m) => m.id === selectedMcpId);
  const snippet = selectedMcp ? buildMcpJsonSnippet(app.api_key, selectedMcp.name, gatewayOrigin) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="connect-drawer-mcp-select" className="text-sm font-medium text-foreground">
          {t('connectDrawer.selectMcp')}
        </label>
        {availableMcps.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('connectDrawer.noMcps')}</p>
        ) : (
          <Select value={selectedMcpId} onValueChange={setSelectedMcpId}>
            <SelectTrigger id="connect-drawer-mcp-select">
              <SelectValue placeholder={t('connectDrawer.mcpPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableMcps.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {snippet !== null && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">{t('connectDrawer.mcpConfig')}</p>
          <p className="text-xs text-muted-foreground">{t('connectDrawer.mcpConfigNote')}</p>
          <CodeViewer code={snippet} language="json" />
        </div>
      )}
    </div>
  );
}

// ===== 主组件 =====

export function ConnectDrawer(): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  // Gateway 基础地址：当前使用运行时 origin。
  // 后续可通过"设置"页面提供公网地址覆盖，此处留注释做标记。
  const gatewayOrigin = globalThis.location.origin;

  // 只在抽屉打开时加载数据
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['apps', 'connect-drawer'],
    queryFn: async () => {
      const res = await listApps({ limit: 100, is_active: true });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    enabled: open,
    staleTime: 30_000,
  });

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['virtual-models', 'connect-drawer'],
    queryFn: async () => {
      const res = await listVirtualModels({ limit: 200, is_active: true });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    enabled: open,
    staleTime: 30_000,
  });

  const { data: mcpsData, isLoading: mcpsLoading } = useQuery({
    queryKey: ['virtual-mcps', 'connect-drawer'],
    queryFn: async () => {
      const res = await listVirtualMcps({ limit: 200, is_active: true });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    enabled: open,
    staleTime: 30_000,
  });

  const apps = appsData?.data ?? [];
  const allModels = modelsData?.data ?? [];
  const allMcps = mcpsData?.data ?? [];

  const isLoadingAny = appsLoading || modelsLoading || mcpsLoading;
  const selectedApp = apps.find((a) => a.id === selectedAppId);

  // 重置下游选择（换 App 时清空）
  const handleAppChange = (appId: string): void => {
    setSelectedAppId(appId);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          id="connect-drawer-trigger"
          variant="outline"
          size="icon"
          className="relative h-8 w-8"
          title={t('connectDrawer.title')}
        >
          <Plug className="h-4 w-4" />
          <span className="sr-only">{t('connectDrawer.title')}</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            {t('connectDrawer.title')}
          </SheetTitle>
          <SheetDescription>{t('connectDrawer.desc')}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          {/* Step 1: 选择应用 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="connect-drawer-app-select" className="text-sm font-medium text-foreground">
              {t('connectDrawer.selectApp')}
            </label>
            {isLoadingAny ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : (
              <Select value={selectedAppId} onValueChange={handleAppChange}>
                <SelectTrigger id="connect-drawer-app-select">
                  <SelectValue placeholder={t('connectDrawer.appPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {apps.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Step 2 & 3: 选择类型 + 生成配置 */}
          {selectedApp !== undefined && (
            <Tabs defaultValue="model" className="flex flex-col gap-4">
              <TabsList className="w-full">
                <TabsTrigger value="model" className="flex-1">
                  {t('connectDrawer.tabModel')}
                </TabsTrigger>
                <TabsTrigger value="mcp" className="flex-1">
                  {t('connectDrawer.tabMcp')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="model">
                <ModelConfigPanel app={selectedApp} allModels={allModels} gatewayOrigin={gatewayOrigin} />
              </TabsContent>

              <TabsContent value="mcp">
                <McpConfigPanel app={selectedApp} allMcps={allMcps} gatewayOrigin={gatewayOrigin} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
