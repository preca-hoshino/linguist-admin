import { createFileRoute } from '@tanstack/react-router';
import { getProvider } from '@/api/model/providers';
import { ProviderDetailPage } from '@/views/models/providers/provider-detail-page';

export const Route = createFileRoute('/_authenticated/models/providers/$id')({
  loader: async ({ params }) => {
    const res = await getProvider(params.id);
    if (!res.ok) {
      throw new Error(res.error.message);
    }
    return res.data;
  },
  component: function ProviderDetailRoute() {
    const provider = Route.useLoaderData();
    return <ProviderDetailPage provider={provider} />;
  },
});
