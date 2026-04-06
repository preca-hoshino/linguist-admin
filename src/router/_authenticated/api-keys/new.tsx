import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/api-keys/new')({
  component: () => <div className="p-4">api-keys/new.tsx shell</div>,
});
