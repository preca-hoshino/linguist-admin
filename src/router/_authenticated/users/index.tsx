import { createFileRoute } from '@tanstack/react-router';
import { UsersPage } from '@/views/users';

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
});
