import {
  BrainCircuit,
  DatabaseZap,
  Eye,
  Globe,
  Images,
  Layers,
  MessageSquare,
  Network,
  Wrench,
  FileCode,
  PlayCircle,
  Minimize2,
  Languages,
  Combine,
  Paintbrush,
  Scaling,
  Sparkles,
  Mic,
  AudioLines,
  Settings2,
} from 'lucide-react';

export const MODEL_TYPE_OPTIONS = [
  { id: 'chat', icon: MessageSquare, label: '对话', i18nLabel: 'modelsPage.providerModels.typeChat' },
  { id: 'embedding', icon: Layers, label: '嵌入', i18nLabel: 'modelsPage.providerModels.typeEmbedding' },
  { id: 'rerank', icon: Combine, label: '重排', i18nLabel: 'modelsPage.providerModels.typeRerank' },
  { id: 'image', icon: Images, label: '图像', i18nLabel: 'modelsPage.providerModels.typeImage' },
  { id: 'audio', icon: Mic, label: '音频', i18nLabel: 'modelsPage.providerModels.typeAudio' },
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
  {
    id: 'structured_output',
    icon: FileCode,
    i18nLabel: 'modelsPage.providerModels.capStructuredOutput',
    label: '结构化输出',
    activeClass:
      'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100 hover:text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
    iconClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'stream',
    icon: PlayCircle,
    i18nLabel: 'modelsPage.providerModels.capStream',
    label: '流式输出',
    activeClass:
      'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100 hover:text-orange-900 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
    iconClass: 'text-orange-600 dark:text-orange-400',
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
  {
    id: 'dynamic_dim',
    icon: Minimize2,
    i18nLabel: 'modelsPage.providerModels.capDynamicDim',
    label: '动态维度',
    activeClass:
      'bg-lime-50 border-lime-300 text-lime-800 hover:bg-lime-100 hover:text-lime-900 dark:bg-lime-500/10 dark:text-lime-300 dark:border-lime-500/30',
    iconClass: 'text-lime-600 dark:text-lime-400',
  },
];

export const RERANK_CAPABILITIES = [
  {
    id: 'multilingual',
    icon: Languages,
    i18nLabel: 'modelsPage.providerModels.capMultilingual',
    label: '多语言',
    activeClass:
      'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100 hover:text-blue-900 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'cross_lingual',
    icon: Network,
    i18nLabel: 'modelsPage.providerModels.capCrossLingual',
    label: '跨语言检索',
    activeClass:
      'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100 hover:text-cyan-900 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30',
    iconClass: 'text-cyan-600 dark:text-cyan-400',
  },
];

export const IMAGE_CAPABILITIES = [
  {
    id: 'inpaint',
    icon: Paintbrush,
    i18nLabel: 'modelsPage.providerModels.capInpaint',
    label: '局部重绘',
    activeClass:
      'bg-pink-50 border-pink-300 text-pink-800 hover:bg-pink-100 hover:text-pink-900 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/30',
    iconClass: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'upscale',
    icon: Scaling,
    i18nLabel: 'modelsPage.providerModels.capUpscale',
    label: '高清放大',
    activeClass:
      'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100 hover:text-purple-900 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30',
    iconClass: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'style_transfer',
    icon: Sparkles,
    i18nLabel: 'modelsPage.providerModels.capStyleTransfer',
    label: '风格迁移',
    activeClass:
      'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/30',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
  },
];

export const AUDIO_CAPABILITIES = [
  {
    id: 'asr',
    icon: Mic,
    i18nLabel: 'modelsPage.providerModels.capAsr',
    label: '语音识别',
    activeClass:
      'bg-stone-50 border-stone-300 text-stone-800 hover:bg-stone-100 hover:text-stone-900 dark:bg-stone-500/10 dark:text-stone-300 dark:border-stone-500/30',
    iconClass: 'text-stone-600 dark:text-stone-400',
  },
  {
    id: 'tts',
    icon: AudioLines,
    i18nLabel: 'modelsPage.providerModels.capTts',
    label: '文本转语音',
    activeClass:
      'bg-zinc-50 border-zinc-300 text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-zinc-500/30',
    iconClass: 'text-zinc-600 dark:text-zinc-400',
  },
  {
    id: 'voice_clone',
    icon: Sparkles,
    i18nLabel: 'modelsPage.providerModels.capVoiceClone',
    label: '声音克隆',
    activeClass:
      'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 hover:text-rose-900 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
    iconClass: 'text-rose-600 dark:text-rose-400',
  },
];

export const CAPABILITIES_MAP: Record<string, typeof CHAT_CAPABILITIES> = {
  chat: CHAT_CAPABILITIES,
  embedding: EMBEDDING_CAPABILITIES,
  rerank: RERANK_CAPABILITIES,
  image: IMAGE_CAPABILITIES,
  audio: AUDIO_CAPABILITIES,
};

const defaultParameterIconClass = 'text-slate-600 dark:text-slate-400';
const defaultParameterActiveClass =
  'bg-slate-50 border-slate-300 text-slate-800 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';

interface ParameterOption {
  id: string;
  label: string;
  icon: typeof Settings2;
  activeClass: string;
  iconClass: string;
}

const createParameter = (id: string, label: string): ParameterOption => ({
  id,
  label,
  icon: Settings2,
  activeClass: defaultParameterActiveClass,
  iconClass: defaultParameterIconClass,
});

export const CHAT_PARAMETERS = [
  createParameter('temperature', 'Temperature'),
  createParameter('top_p', 'Top P'),
  createParameter('top_k', 'Top K'),
  createParameter('frequency_penalty', 'Frequency Penalty'),
  createParameter('presence_penalty', 'Presence Penalty'),
  createParameter('stop', 'Stop Sequences'),
  createParameter('logprobs', 'Logprobs'),
];

export const EMBEDDING_PARAMETERS = [
  createParameter('dimensions', 'Dimensions'),
  createParameter('encoding_format', 'Encoding Format'),
  createParameter('truncation', 'Truncation'),
];

export const RERANK_PARAMETERS = [
  createParameter('top_n', 'Top N'),
  createParameter('return_documents', 'Return Documents'),
];

export const IMAGE_PARAMETERS = [
  createParameter('steps', 'Steps'),
  createParameter('guidance_scale', 'Guidance Scale'),
  createParameter('width', 'Width'),
  createParameter('height', 'Height'),
  createParameter('seed', 'Seed'),
];

export const AUDIO_PARAMETERS = [
  createParameter('speed', 'Speed'),
  createParameter('pitch', 'Pitch'),
  createParameter('sample_rate', 'Sample Rate'),
];

export const PARAMETERS_MAP: Record<string, typeof CHAT_PARAMETERS> = {
  chat: CHAT_PARAMETERS,
  embedding: EMBEDDING_PARAMETERS,
  rerank: RERANK_PARAMETERS,
  image: IMAGE_PARAMETERS,
  audio: AUDIO_PARAMETERS,
};

// 注意：Sparkles 图标用于能力 section 标题，保留导出供外部引用

export { Sparkles } from 'lucide-react';
