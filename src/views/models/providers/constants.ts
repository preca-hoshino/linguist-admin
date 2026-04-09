/** 提供商凭证类型定义 */
export type CredentialType = 'api_key' | 'copilot';

/** 提供商选项 */
export interface KindOption {
  label: string;
  value: string;
  defaultBaseUrl: string;
  exampleEndpoint: string;
  credentialType: CredentialType;
}

export const KIND_OPTIONS: KindOption[] = [
  {
    label: 'DeepSeek',
    value: 'deepseek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    exampleEndpoint: '/chat/completions',
    credentialType: 'api_key',
  },
  {
    label: 'Gemini',
    value: 'gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    exampleEndpoint: '/models/gemini-1.5-pro:generateContent',
    credentialType: 'api_key',
  },
  {
    label: 'Volcengine',
    value: 'volcengine',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    exampleEndpoint: '/chat/completions',
    credentialType: 'api_key',
  },
  {
    label: 'GitHub Copilot',
    value: 'copilot',
    defaultBaseUrl: '',
    exampleEndpoint: '/chat/completions',
    credentialType: 'copilot',
  },
];
