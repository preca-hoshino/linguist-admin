import { createFileRoute } from '@tanstack/react-router';
import { SettingsAbout } from '@/views/settings/about';

export const Route = createFileRoute('/_authenticated/settings/about')({
  component: SettingsAbout,
});
