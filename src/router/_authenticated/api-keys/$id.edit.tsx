import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/api-keys/$id/edit')({
  component: () => <div className="p-4">api-keys/$id.edit.tsx shell</div>,
});
