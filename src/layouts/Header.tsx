import { useEffect, useState } from 'react';
import { LangSwitch } from '@/components/LangSwitch';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { Search } from '@/components/Search';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { ConnectDrawer } from '@/components/ConnectDrawer';
import { Separator } from '@/components/ui/Separator';
import { SidebarTrigger } from '@/components/ui/Sidebar';
import { cn } from '@/utils/utils';

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
};

export function Header({ className, fixed, children, ...props }: HeaderProps): React.JSX.Element {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = (): void => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    document.addEventListener('scroll', onScroll, { passive: true });
    return (): void => {
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg',
        )}
      >
        <SidebarTrigger variant="outline" className="max-md:scale-125" />
        <Separator orientation="vertical" className="h-6" />
        {children}

        {/* 右侧工具栏组件集成 */}
        <div className="ml-auto flex items-center space-x-2">
          <ConnectDrawer />
          <Search />
          <LangSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
