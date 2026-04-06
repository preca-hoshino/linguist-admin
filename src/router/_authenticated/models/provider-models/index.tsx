import { createFileRoute } from '@tanstack/react-router';
import { ModelProviderModelsPage } from '@/views/models/provider-models';

export const Route = createFileRoute('/_authenticated/models/provider-models/')({
  component: ModelProviderModelsPage,
});
