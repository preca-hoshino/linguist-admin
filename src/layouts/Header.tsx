import { useCallback, useEffect, useRef, useState } from 'react';
import { LangSwitch } from '@/components/LangSwitch';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { Search } from '@/components/Search';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { ConnectDrawer } from '@/components/connect-drawer';
import { Separator } from '@/components/ui/Separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useHeaderSlotContent } from '@/providers/HeaderSlotProvider';
import { cn } from '@/utils/utils';

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
};

export function Header({ className, fixed, children, ...props }: HeaderProps): React.JSX.Element {
  const [offset, setOffset] = useState(0);
  const slot = useHeaderSlotContent();
  const rafRef = useRef(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    });
  }, []);

  useEffect(() => {
    document.addEventListener('scroll', handleScroll, { passive: true });
    return (): void => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

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
        {slot ?? children}

        {/* 右侧工具栏组件集成 */}
        <div className="ml-auto flex items-center space-x-2">
          <Search />
          <ConnectDrawer />
          <LangSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
