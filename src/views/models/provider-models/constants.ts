import { BrainCircuit, DatabaseZap, Eye, Globe, Images, Layers, MessageSquare, Network, Wrench } from 'lucide-react';

export const MODEL_TYPE_OPTIONS = [
  { id: 'chat', icon: MessageSquare, label: '对话', i18nLabel: 'modelsPage.providerModels.typeChat' },
  { id: 'embedding', icon: Layers, label: '嵌入', i18nLabel: 'modelsPage.providerModels.typeEmbedding' },
];

export const CHAT_CAPABILITIES = [
  {
    id: 'vision',
    icon: Eye,
    i18nLabel: 'modelsPage.providerModels.capVision',
    label: '视觉',
    activeClass:
      'bg-violet-50 border-violet-300 text-violet-800 hover:bg-violet-100 hover:text-violet-900 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30',
    iconClass: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'tools',
    icon: Wrench,
    i18nLabel: 'modelsPage.providerModels.capFunctionCalling',
    label: '工具调用',
    activeClass:
      'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'thinking',
    icon: BrainCircuit,
    i18nLabel: 'modelsPage.providerModels.capReasoning',
    label: '推理',
    activeClass:
      'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'cache',
    icon: DatabaseZap,
    i18nLabel: 'modelsPage.providerModels.capCache',
    label: '缓存',
    activeClass:
      'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 hover:text-rose-900 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
    iconClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'web_search',
    icon: Globe,
    i18nLabel: 'modelsPage.providerModels.capWebSearch',
    label: '联网搜索',
    activeClass:
      'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100 hover:text-sky-900 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
    iconClass: 'text-sky-600 dark:text-sky-400',
  },
];

export const EMBEDDING_CAPABILITIES = [
  {
    id: 'multimodal',
    icon: Images,
    i18nLabel: 'modelsPage.providerModels.capMultimodal',
    label: '多模态',
    activeClass:
      'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-800 hover:bg-fuchsia-100 hover:text-fuchsia-900 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:border-fuchsia-500/30',
    iconClass: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    id: 'sparse_vector',
    icon: Network,
    i18nLabel: 'modelsPage.providerModels.capSparseVector',
    label: '稀疏向量',
    activeClass:
      'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100 hover:text-teal-900 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30',
    iconClass: 'text-teal-600 dark:text-teal-400',
  },
];

// 注意：Sparkles 图标用于能力 section 标题，保留导出供外部引用

export { Sparkles } from 'lucide-react';
