export const KIND_OPTIONS = [
  {
    label: 'DeepSeek',
    value: 'deepseek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    exampleEndpoint: '/chat/completions',
  },
  {
    label: 'Gemini',
    value: 'gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    exampleEndpoint: '/models/gemini-1.5-pro:generateContent',
  },
  {
    label: 'Volcengine',
    value: 'volcengine',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    exampleEndpoint: '/chat/completions',
  },
];
