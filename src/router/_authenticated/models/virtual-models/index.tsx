import { createFileRoute } from '@tanstack/react-router';
import { ModelVirtualModelsPage } from '@/views/models/virtual-models';

export const Route = createFileRoute('/_authenticated/models/virtual-models/')({
  component: ModelVirtualModelsPage,
});
