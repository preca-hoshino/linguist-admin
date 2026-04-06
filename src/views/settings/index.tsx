import { Outlet } from '@tanstack/react-router';
import { Bell, Info, Monitor, Palette, UserCog, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/Separator';
import { Main } from '@/layouts/Main';
import { SidebarNav } from './components/sidebar-nav';

export function Settings(): React.JSX.Element {
  const { t } = useTranslation();

  const sidebarNavItems = [
    {
      title: t('settings.profile.title'),
      href: '/settings',
      icon: <UserCog size={18} />,
    },
    {
      title: t('settings.account.title'),
      href: '/settings/account',
      icon: <Wrench size={18} />,
    },
    {
      title: t('settings.appearance.title'),
      href: '/settings/appearance',
      icon: <Palette size={18} />,
    },
    {
      title: t('settings.notifications.title'),
      href: '/settings/notifications',
      icon: <Bell size={18} />,
    },
    {
      title: t('settings.display.title'),
      href: '/settings/display',
      icon: <Monitor size={18} />,
    },
    {
      title: t('settings.about.title'),
      href: '/settings/about',
      icon: <Info size={18} />,
    },
  ];

  return (
    <Main fixed>
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.desc')}</p>
      </div>
      <Separator className="my-4 lg:my-6" />
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="top-0 lg:sticky lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex w-full overflow-y-auto p-1">
          <Outlet />
        </div>
      </div>
    </Main>
  );
}
