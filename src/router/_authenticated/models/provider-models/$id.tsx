import { createFileRoute } from '@tanstack/react-router';
import { getProviderModel } from '@/api/model/provider-models';
import { ProviderModelDetailPage } from '@/views/models/provider-models/provider-model-detail-page';

export const Route = createFileRoute('/_authenticated/models/provider-models/$id')({
  loader: async ({ params }) => {
    const result = await getProviderModel(params.id);
    if (!result.ok) {
      throw new Error(result.error.message);
    }
    return { providerModel: result.data };
  },
  component: ProviderModelDetailPage,
});
