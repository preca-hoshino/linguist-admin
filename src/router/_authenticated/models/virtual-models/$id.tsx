import { createFileRoute } from '@tanstack/react-router';
import { getVirtualModel } from '@/api/virtual-models';
import { VirtualModelDetailPage } from '@/views/models/virtual-models/virtual-model-detail-page';

export const Route = createFileRoute('/_authenticated/models/virtual-models/$id')({
  loader: async ({ params }) => {
    const result = await getVirtualModel(params.id);
    if (!result.ok) {
      throw new Error(result.error.message);
    }
    return { virtualModel: result.data };
  },
  component: VirtualModelDetailPage,
});
