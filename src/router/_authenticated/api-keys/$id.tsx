import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/api-keys/$id')({
  component: () => <div className="p-4">api-keys/$id.tsx shell</div>,
});
