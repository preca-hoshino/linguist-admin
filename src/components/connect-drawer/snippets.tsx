// src/components/connect-drawer/snippets.ts
// Code snippet templates for Model and MCP connection configs

import { parseSnippetTemplate } from './snippet-template';
import type { ApiFormat, ClientType, McpClientType } from './types';

// ────────────────────────────────────────────────────────────────────────────
// 代码片段模板：按 apiFormat × clientType 分发
// ────────────────────────────────────────────────────────────────────────────

/**
 * 生成 Model 调用配置。
 * 支持 cURL / Python SDK / Node.js SDK × openaicompat / anthropic / gemini 三种 API 格式。
 */
export function buildModelSnippet(
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
export function buildMcpSnippet(
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
