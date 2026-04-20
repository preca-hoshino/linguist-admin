// src/components/ConnectDrawer.tsx
// 快速接入配置抽屉 — 帮助用户生成 App 对应的 Model/MCP 接入配置（cURL / JSON）
//
// 基础 URL 当前从 window.location.origin 提取，
// 后续可通过"设置"页面提供 Gateway 公网地址覆盖此默认值。

import { useQuery } from '@tanstack/react-query';
import { AppWindow, Box, Plug, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listApps } from '@/api/apps';
import { listVirtualMcps } from '@/api/mcp-virtual-servers';
import { listVirtualModels } from '@/api/virtual-models';
import { CodeViewer } from '@/components/CodeViewer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import type { VirtualMcp } from '@/types/mcp';
import type { VirtualModel } from '@/types/virtual-model';

type ApiFormat = 'openaicompat' | 'anthropic' | 'gemini';

/**
 * 生成 cURL 形式的接入配置。
 *
 * 基础地址使用 window.location.origin。
 * 如需使用自定义域名，可在未来的设置页面中通过配置项覆盖。
 */
function buildCurlSnippet(apiFormat: ApiFormat, apiKey: string, modelName: string, gatewayOrigin: string): string {
  if (apiFormat === 'anthropic') {
    return String.raw`curl "${gatewayOrigin}/model/anthropic/v1/messages" \
  -H "x-api-key: ${apiKey}" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "${modelName}",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ],
    "stream": false
  }'`;
  }

  if (apiFormat === 'gemini') {
    return String.raw`curl "${gatewayOrigin}/model/gemini/v1beta/models/${modelName}:generateContent" \
  -H "x-goog-api-key: ${apiKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Hello!"
          }
        ]
      }
    ]
  }'`;
  }

  // 默认为 openai-compat
  return String.raw`curl "${gatewayOrigin}/model/openai-compat/v1/chat/completions" \
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

interface ConnectDrawerContentProps {
  readonly gatewayOrigin: string;
}

function ConnectDrawerContent({ gatewayOrigin }: ConnectDrawerContentProps): React.JSX.Element {
  const { t } = useTranslation();

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['apps', 'connect-drawer'],
    queryFn: async () => {
      const res = await listApps({ limit: 100, is_active: true });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
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
    staleTime: 30_000,
  });

  // ========== 状态控制 ==========
  const [step, setStep] = useState<string>('step-1');
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  const [resourceType, setResourceType] = useState<'model' | 'mcp'>('model');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [apiFormat, setApiFormat] = useState<ApiFormat>('openaicompat');

  const apps = appsData?.data ?? [];
  const allModels = modelsData?.data ?? [];
  const allMcps = mcpsData?.data ?? [];

  // 获取当前选中的 App
  const selectedApp = apps.find((a) => a.id === selectedAppId);

  // 根据选中的 App 过滤可选资源
  const availableModels = useMemo<VirtualModel[]>(() => {
    const allowed = selectedApp?.allowed_model_ids;
    if (!allowed) {
      return [];
    }
    return allModels.filter((m) => allowed.includes(m.id));
  }, [selectedApp, allModels]);

  const availableMcps = useMemo<VirtualMcp[]>(() => {
    const allowed = selectedApp?.allowed_mcp_ids;
    if (!allowed) {
      return [];
    }
    return allMcps.filter((m) => allowed.includes(m.id));
  }, [selectedApp, allMcps]);

  const currentAvailableResources = resourceType === 'model' ? availableModels : availableMcps;

  const selectedVirtualModel =
    resourceType === 'model' ? availableModels.find((x) => x.id === selectedResourceId) : undefined;
  const selectedVirtualMcp =
    resourceType === 'mcp' ? availableMcps.find((x) => x.id === selectedResourceId) : undefined;

  let snippet: string | null = null;
  if (selectedApp && selectedVirtualModel) {
    snippet = buildCurlSnippet(apiFormat, selectedApp.api_key, selectedVirtualModel.name, gatewayOrigin);
  } else if (selectedApp && selectedVirtualMcp) {
    snippet = buildMcpJsonSnippet(selectedApp.api_key, selectedVirtualMcp.name, gatewayOrigin);
  }

  // ========== 步骤跳转处理 ==========
  const handleAppChange = (appId: string): void => {
    setSelectedAppId(appId);
    setSelectedResourceId(''); // 清空下级缓存
    setStep('step-2');
  };

  const handleResourceTypeChange = (type: 'model' | 'mcp'): void => {
    setResourceType(type);
    setSelectedResourceId('');
  };

  const handleResourceChange = (resId: string): void => {
    setSelectedResourceId(resId);
    setStep('step-3');
  };

  const isLoading = appsLoading || modelsLoading || mcpsLoading;

  let placeholderText = t('connectDrawer.modelPlaceholder');
  if (currentAvailableResources.length === 0) {
    placeholderText = resourceType === 'model' ? t('connectDrawer.noModels') : t('connectDrawer.noMcps');
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-2">
      <Accordion
        type="single"
        value={step}
        onValueChange={(val) => {
          if (val) {
            setStep(val);
          }
        }}
        className="w-full"
      >
        {/* ================= STEP 1 ================= */}
        <AccordionItem value="step-1" className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-foreground">{t('connectDrawer.step1')}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2">
              <Select value={selectedAppId} onValueChange={handleAppChange} disabled={isLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('connectDrawer.appPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {apps.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      <div className="flex items-center gap-2">
                        <AppWindow className="h-4 w-4 text-muted-foreground" />
                        <span>{app.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ================= STEP 2 ================= */}
        <AccordionItem value="step-2" disabled={!selectedAppId} className="border-b">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-foreground">{t('connectDrawer.step2')}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2">
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <Select
                  value={resourceType}
                  onValueChange={(v) => {
                    handleResourceTypeChange(v as 'model' | 'mcp');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="model">{t('connectDrawer.tabModel')}</SelectItem>
                    <SelectItem value="mcp">{t('connectDrawer.tabMcp')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedResourceId}
                  onValueChange={handleResourceChange}
                  disabled={currentAvailableResources.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={placeholderText} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentAvailableResources.map((res) => (
                      <SelectItem key={res.id} value={res.id}>
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-muted-foreground" />
                          <span>{res.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ================= STEP 3 ================= */}
        <AccordionItem value="step-3" disabled={!selectedResourceId} className="border-0">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-foreground">{t('connectDrawer.step3')}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-5 pt-2">
              {resourceType === 'model' && (
                <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                  <label
                    htmlFor="connect-drawer-format-select"
                    className="text-sm font-medium text-foreground whitespace-nowrap"
                  >
                    {t('connectDrawer.apiFormat')}
                  </label>
                  <Select
                    value={apiFormat}
                    onValueChange={(v) => {
                      setApiFormat(v as ApiFormat);
                    }}
                  >
                    <SelectTrigger id="connect-drawer-format-select" className="w-full">
                      <SelectValue placeholder={t('connectDrawer.apiFormatPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openaicompat">OpenAI Compatible</SelectItem>
                      <SelectItem value="anthropic">Anthropic Messages</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {snippet !== null && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium text-foreground">
                    {resourceType === 'model' ? t('connectDrawer.curlConfig') : t('connectDrawer.mcpConfig')}
                  </p>
                  {resourceType === 'mcp' && (
                    <p className="text-xs text-muted-foreground">{t('connectDrawer.mcpConfigNote')}</p>
                  )}
                  <CodeViewer code={snippet} language={resourceType === 'model' ? 'bash' : 'json'} />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ===== 主组件 =====

export function ConnectDrawer(): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // 延迟挂载内部内容，避免重渲染打断抽屉推入动画
  const [renderContent, setRenderContent] = useState(false);

  // Gateway 基础地址：当前使用运行时 origin。
  // 后续可通过"设置"页面提供公网地址覆盖，此处留注释做标记。
  const gatewayOrigin = globalThis.location.origin;

  useEffect(() => {
    if (open) {
      // 延迟 150ms 挂载，错开动画渲染期
      const timer = setTimeout(() => {
        setRenderContent(true);
      }, 150);
      return (): void => {
        clearTimeout(timer);
      };
    }
    // 等待面板关闭动画结束（约 300ms）后卸载内层组件和重置状态
    const timer = setTimeout(() => {
      setRenderContent(false);
    }, 300);
    return (): void => {
      clearTimeout(timer);
    };
  }, [open]);

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

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[550px] lg:max-w-[680px]"
        showCloseButton={false}
      >
        <SheetHeader className="flex shrink-0 flex-row items-start justify-between border-b px-6 py-4">
          <div className="flex flex-col gap-1.5 text-left">
            <SheetTitle className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              {t('connectDrawer.title')}
            </SheetTitle>
            <SheetDescription>{t('connectDrawer.desc')}</SheetDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-0.5 -mr-2 h-8 w-8 text-muted-foreground"
            onClick={() => {
              setOpen(false);
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetHeader>

        {renderContent ? (
          <ConnectDrawerContent gatewayOrigin={gatewayOrigin} />
        ) : (
          <div className="flex flex-1 items-center justify-center">{/* 动画期间的占位，保持视觉平滑过渡 */}</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
