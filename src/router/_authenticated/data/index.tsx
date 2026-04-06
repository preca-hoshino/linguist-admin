import { createFileRoute } from '@tanstack/react-router';
import { DataPage } from '@/views/data';

export const Route = createFileRoute('/_authenticated/data/')({
  component: DataPage,
});
