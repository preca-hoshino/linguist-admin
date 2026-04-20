// src/components/ConnectDrawer.tsx
// 快速接入配置抽屉 — 帮助用户生成 App 对应的 Model/MCP 接入配置（cURL / JSON）
//
// 基础 URL 当前从 window.location.origin 提取，
// 后续可通过"设置"页面提供 Gateway 公网地址覆盖此默认值。

import { useQuery } from '@tanstack/react-query';
import { AppWindow, Box, Plug, X } from 'lucide-react';
import { toast } from 'sonner';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listApps } from '@/api/apps';
import { listVirtualMcps } from '@/api/mcp-virtual-servers';
import { listVirtualModels } from '@/api/virtual-models';
import { CodeViewer } from '@/components/CodeViewer';
import { ProviderLogo } from '@/components/ProviderLogo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import type { VirtualMcp } from '@/types/mcp';
import type { VirtualModel } from '@/types/virtual-model';

type ApiFormat = 'openaicompat' | 'anthropic' | 'gemini';
type ClientType = 'curl' | 'python' | 'nodejs';
type McpClientType = 'claude-desktop' | 'cursor' | 'trae' | 'antigravity' | 'cherry-studio' | 'claude-code';

// ────────────────────────────────────────────────────────────────────────────
// 代码高亮与可复制 Token 逻辑
// ────────────────────────────────────────────────────────────────────────────

function InteractiveToken({ value }: { readonly value: string }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="inline cursor-pointer appearance-none border-none bg-transparent p-0 font-medium text-green-600 underline decoration-green-600/40 underline-offset-4 hover:text-green-700 hover:decoration-green-600/80 focus:outline-none dark:text-green-400 dark:decoration-green-400/40 dark:hover:text-green-300 dark:hover:decoration-green-400/80"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void navigator.clipboard.writeText(value);
        toast.success(t('connectDrawer.copied', { defaultValue: 'Copied to clipboard' }));
      }}
      title={t('connectDrawer.clickToCopy', { defaultValue: 'Click to copy' })}
    >
      {value}
    </button>
  );
}

function parseSnippetTemplate(
  template: string,
  tokens: Record<string, string>,
): { rawCode: string; renderCode: React.ReactNode } {
  // eslint-disable-next-line sonarjs/slow-regex
  const tokenRegex = /\{\{([^}]+)\}\}/g;
  const rawCode = template.replaceAll(tokenRegex, (_, key) => tokens[key as string] ?? '');

  const parts = template.split(tokenRegex);
  const renderCode = (
    <>
      {parts.map((part, index) => {
        const uniqueKey = `${part}-${index}`;
        if (index % 2 === 1) {
          const value = tokens[part] ?? '';
          return <InteractiveToken key={uniqueKey} value={value} />;
        }
        return <Fragment key={uniqueKey}>{part}</Fragment>;
      })}
    </>
  );

  return { rawCode, renderCode };
}

// ────────────────────────────────────────────────────────────────────────────
// 代码片段模板：按 apiFormat × clientType 分发
// ────────────────────────────────────────────────────────────────────────────

/**
 * 生成 Model 调用配置。
 * 支持 cURL / Python SDK / Node.js SDK × openaicompat / anthropic / gemini 三种 API 格式。
 */
function buildModelSnippet(
  apiFormat: ApiFormat,
  clientType: ClientType,
  apiKey: string,
  modelName: string,
  gatewayOrigin: string,
): { rawCode: string; renderCode: React.ReactNode; language: string } {
  const tokens: Record<string, string> = {
    APIKEY: apiKey,
    MODEL: modelName,
  };

  let template = '';
  let language = 'bash';

  // ── openaicompat ──────────────────────────────────────────────────────────
  if (apiFormat === 'openaicompat') {
    tokens.URL = `${gatewayOrigin}/model/openai-compat/v1`;

    if (clientType === 'python') {
      language = 'python';
      template = `from openai import OpenAI

client = OpenAI(
    api_key="{{APIKEY}}",
    base_url="{{URL}}",
)

response = client.chat.completions.create(
    model="{{MODEL}}",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)`;
    } else if (clientType === 'nodejs') {
      language = 'javascript';
      template = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "{{APIKEY}}",
  baseURL: "{{URL}}",
});

const response = await client.chat.completions.create({
  model: "{{MODEL}}",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);`;
    } else {
      // curl (default)
      tokens.ENDPOINT = `${gatewayOrigin}/model/openai-compat/v1/chat/completions`;
      template = String.raw`curl "{{ENDPOINT}}" \
  -H "Authorization: Bearer {{APIKEY}}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{MODEL}}",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ],
    "stream": false
  }'`;
    }
  }

  // ── anthropic ─────────────────────────────────────────────────────────────
  else if (apiFormat === 'anthropic') {
    tokens.URL = `${gatewayOrigin}/model/anthropic/v1`;

    if (clientType === 'python') {
      language = 'python';
      template = `import anthropic

client = anthropic.Anthropic(
    api_key="{{APIKEY}}",
    base_url="{{URL}}",
)

message = client.messages.create(
    model="{{MODEL}}",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
print(message.content[0].text)`;
    } else if (clientType === 'nodejs') {
      language = 'javascript';
      template = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: "{{APIKEY}}",
  baseURL: "{{URL}}",
});

const message = await client.messages.create({
  model: "{{MODEL}}",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(message.content[0].text);`;
    } else {
      tokens.ENDPOINT = `${gatewayOrigin}/model/anthropic/v1/messages`;
      template = String.raw`curl "{{ENDPOINT}}" \
  -H "x-api-key: {{APIKEY}}" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{MODEL}}",
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
  }

  // ── gemini ────────────────────────────────────────────────────────────────
  else {
    tokens.URL = `${gatewayOrigin}/model/gemini/v1beta`;

    if (clientType === 'python') {
      language = 'python';
      template = `from google import genai
from google.genai import types

client = genai.Client(
    api_key="{{APIKEY}}",
    http_options=types.HttpOptions(base_url="{{URL}}"),
)

response = client.models.generate_content(
    model="{{MODEL}}",
    contents="Hello!",
)
print(response.text)`;
    } else if (clientType === 'nodejs') {
      language = 'javascript';
      template = `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "{{APIKEY}}",
  httpOptions: { baseUrl: "{{URL}}" },
});

const response = await ai.models.generateContent({
  model: "{{MODEL}}",
  contents: "Hello!",
});
console.log(response.text);`;
    } else {
      tokens.ENDPOINT = `${gatewayOrigin}/model/gemini/v1beta/models/${modelName}:generateContent`;
      template = String.raw`curl "{{ENDPOINT}}" \
  -H "x-goog-api-key: {{APIKEY}}" \
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
  }

  const { rawCode, renderCode } = parseSnippetTemplate(template, tokens);
  return { rawCode, renderCode, language };
}

/**
 * 生成 MCP 客户端配置。
 */
function buildMcpSnippet(
  clientType: McpClientType,
  apiKey: string,
  mcpName: string,
  gatewayOrigin: string,
): { rawCode: string; renderCode: React.ReactNode; language: string } {
  const tokens: Record<string, string> = {
    URL: `${gatewayOrigin}/mcp/sse`,
    MCP_NAME: mcpName,
    APIKEY: apiKey,
  };

  let template = '';
  let language = 'json';

  const mcpServerJson = `"mcpServers": {
    "{{MCP_NAME}}": {
      "url": "{{URL}}",
      "headers": {
        "X-Mcp-Name": "{{MCP_NAME}}",
        "Authorization": "Bearer {{APIKEY}}"
      }
    }
  }`;

  if (clientType === 'cherry-studio') {
    language = 'text';
    template = `Type: SSE
URL: {{URL}}
Headers: 
  X-Mcp-Name: {{MCP_NAME}}
  Authorization: Bearer {{APIKEY}}`;
  } else if (clientType === 'claude-code') {
    language = 'bash';
    template = `claude mcp add --transport sse "{{MCP_NAME}}" "{{URL}}"\n# 注意: claude code 暂时不支持为 sse 连接添加自定义 Header 鉴权凭证。\n# 请在此配置外围通过代理服务器处理认证，或等待官方后续支持。`;
  } else {
    // Other JSON based clients (claude-desktop, cursor, trae, antigravity)
    template = `{\n  ${mcpServerJson}\n}`;
  }

  const { rawCode, renderCode } = parseSnippetTemplate(template, tokens);
  return { rawCode, renderCode, language };
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
  const [clientType, setClientType] = useState<ClientType>('curl');
  const [mcpClientType, setMcpClientType] = useState<McpClientType>('claude-desktop');

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

  let generatedConfig: { rawCode: string; renderCode: React.ReactNode; language: string } | null = null;
  if (selectedApp && selectedVirtualModel) {
    generatedConfig = buildModelSnippet(
      apiFormat,
      clientType,
      selectedApp.api_key,
      selectedVirtualModel.name,
      gatewayOrigin,
    );
  } else if (selectedApp && selectedVirtualMcp) {
    generatedConfig = buildMcpSnippet(mcpClientType, selectedApp.api_key, selectedVirtualMcp.name, gatewayOrigin);
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
                <div className="grid grid-cols-2 gap-3">
                  {/* 第一列：API 格式 */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="connect-drawer-format-select" className="text-xs font-medium text-muted-foreground">
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
                        <SelectItem value="openaicompat">
                          <div className="flex items-center gap-2">
                            <ProviderLogo provider="openaicompat" className="h-4 w-4" />
                            <span>OpenAI Compat</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="anthropic">
                          <div className="flex items-center gap-2">
                            <ProviderLogo provider="anthropic" className="h-4 w-4" />
                            <span>Anthropic</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gemini">
                          <div className="flex items-center gap-2">
                            <ProviderLogo provider="gemini" className="h-4 w-4" />
                            <span>Google</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 第二列：调用路径（SDK / cURL） */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="connect-drawer-client-select" className="text-xs font-medium text-muted-foreground">
                      {t('connectDrawer.clientType', { defaultValue: 'Client / SDK' })}
                    </label>
                    <Select
                      value={clientType}
                      onValueChange={(v) => {
                        setClientType(v as ClientType);
                      }}
                    >
                      <SelectTrigger id="connect-drawer-client-select" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="curl">cURL</SelectItem>
                        <SelectItem value="python">Python SDK</SelectItem>
                        <SelectItem value="nodejs">Node.js SDK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {resourceType === 'mcp' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label
                      htmlFor="connect-drawer-mcp-client-select"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {t('connectDrawer.clientType', { defaultValue: 'Client / IDE' })}
                    </label>
                    <Select
                      value={mcpClientType}
                      onValueChange={(v) => {
                        setMcpClientType(v as McpClientType);
                      }}
                    >
                      <SelectTrigger id="connect-drawer-mcp-client-select" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude-desktop">
                          <div className="flex items-center gap-2">
                            <ProviderLogo provider="claude-desktop" className="h-4 w-4" />
                            <span>Claude Desktop</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cursor">
                          <div className="flex items-center gap-2">
                            <ProviderLogo provider="cursor" className="h-4 w-4" />
                            <span>Cursor</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="trae">
                          <div className="flex items-center gap-2">
                            <ProviderLogo provider="trae" className="h-4 w-4" />
                            <span>Trae</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="antigravity">
                          <div className="flex items-center gap-2">
                            <ProviderLogo provider="antigravity" className="h-4 w-4" />
                            <span>Antigravity</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cherry-studio">
                          <div className="flex items-center gap-2">
                            <ProviderLogo provider="cherry-studio" className="h-4 w-4" />
                            <span>Cherry Studio</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="claude-code">
                          <div className="flex items-center gap-2">
                            <ProviderLogo provider="claude-code" className="h-4 w-4" />
                            <span>Claude Code</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {generatedConfig !== null &&
                ((): React.ReactNode => {
                  const mcpNotes: Record<McpClientType, string> = {
                    'claude-desktop':
                      '配置保存至: %APPDATA%/Claude/claude_desktop_config.json 或 ~/Library/Application Support/Claude/claude_desktop_config.json',
                    cursor: '配置保存至当前项目根目录: .cursor/mcp.json',
                    trae: '配置保存至当前项目根目录: .trae/mcp.json',
                    antigravity: '配置保存为系统支持的标准 MCP 结构',
                    'cherry-studio': '在 Cherry Studio 中添加 MCP Server 时填入以下参数',
                    'claude-code': '在终端执行以下命令直接添加',
                  };

                  return (
                    <div className="flex flex-col gap-1.5">
                      {resourceType !== 'model' && (
                        <p className="text-sm font-medium text-foreground">{t('connectDrawer.mcpConfig')}</p>
                      )}
                      {resourceType === 'mcp' && (
                        <p className="text-xs text-muted-foreground">{mcpNotes[mcpClientType]}</p>
                      )}
                      <CodeViewer
                        code={generatedConfig.rawCode}
                        renderCode={generatedConfig.renderCode}
                        language={generatedConfig.language}
                      />
                    </div>
                  );
                })()}
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
          variant="ghost"
          size="icon"
          className="scale-95 rounded-full"
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
