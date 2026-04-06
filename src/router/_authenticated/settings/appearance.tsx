import { createFileRoute } from '@tanstack/react-router';
import { SettingsAppearance } from '@/views/settings/appearance';

export const Route = createFileRoute('/_authenticated/settings/appearance')({
  component: SettingsAppearance,
});
