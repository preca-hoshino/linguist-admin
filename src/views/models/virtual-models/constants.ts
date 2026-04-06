import { Layers, MessageSquare } from 'lucide-react';

export const MODEL_TYPE_OPTIONS = [
  { id: 'chat', icon: MessageSquare, label: 'Chat', i18nLabel: 'modelsPage.modelType.chat' },
  { id: 'embedding', icon: Layers, label: 'Embedding', i18nLabel: 'modelsPage.modelType.embedding' },
];
