import { Link, useLocation } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { UI_BASE } from '@/config/runtime';
import type { NavCollapsible, NavGroup as NavGroupProps, NavItem, NavLink } from './types';

export function NavGroup({ title, items }: Readonly<NavGroupProps>): React.JSX.Element {
  const { state, isMobile } = useSidebar();
  const href = useLocation({ select: (location) => location.href });
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.items ? 'group' : String(item.url)}`;

          if (!item.items) {
            return <SidebarMenuLink key={key} item={item} href={href} />;
          }

          if (state === 'collapsed' && !isMobile) {
            return <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />;
          }

          return <SidebarMenuCollapsible key={key} item={item} href={href} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavBadge({ children }: { readonly children: ReactNode }): React.JSX.Element {
  return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>;
}

function SidebarMenuLink({ item, href }: Readonly<{ item: NavLink; href: string }>): React.JSX.Element {
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={checkIsActive(href, item)} tooltip={item.title}>
        <Link
          to={item.url as string}
          onClick={() => {
            setOpenMobile(false);
          }}
        >
          {Icon != null && <Icon />}
          <span>{item.title}</span>
          {Boolean(item.badge) && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuCollapsible({ item, href }: Readonly<{ item: NavCollapsible; href: string }>): React.JSX.Element {
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon;
  return (
    <Collapsible asChild defaultOpen={checkIsActive(href, item, true)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {Icon != null && <Icon />}
            <span>{item.title}</span>
            {Boolean(item.badge) && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const SubIcon = subItem.icon;
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild isActive={checkIsActive(href, subItem)}>
                    <Link
                      to={subItem.url as string}
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      {SubIcon != null && <SubIcon />}
                      <span>{subItem.title}</span>
                      {Boolean(subItem.badge) && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarMenuCollapsedDropdown({
  item,
  href,
}: Readonly<{ item: NavCollapsible; href: string }>): React.JSX.Element {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={checkIsActive(href, item)}>
            {Icon != null && <Icon />}
            <span>{item.title}</span>
            {Boolean(item.badge) && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge != null && item.badge !== '' ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => {
            const SubIcon = sub.icon;
            return (
              <DropdownMenuItem key={`${sub.title}-${String(sub.url)}`} asChild>
                <Link to={sub.url as string} className={checkIsActive(href, sub) ? 'bg-secondary' : ''}>
                  {SubIcon != null && <SubIcon />}
                  <span className="max-w-52 text-wrap">{sub.title}</span>
                  {Boolean(sub.badge) && <span className="ms-auto text-xs">{sub.badge}</span>}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function checkIsActive(href: string, item: NavItem, mainNav = false): boolean {
  const normalizedHref = href.startsWith(UI_BASE) ? href.slice(UI_BASE.length - 1) || '/' : href;
  const cleanHref = normalizedHref.split('?')[0] ?? '/';
  const itemUrl = 'url' in item ? (item.url as string) : undefined;

  const firstHrefSegment = cleanHref.split('/')[1] ?? '';
  const firstItemSegment = itemUrl?.split('/')[1] ?? '';

  return (
    cleanHref === itemUrl ||
    (itemUrl != null && itemUrl !== '' && itemUrl !== '/' && cleanHref.startsWith(`${itemUrl}/`)) ||
    (('items' in item ? item.items : undefined)?.some((i) => i.url === cleanHref) ?? false) ||
    (mainNav && firstHrefSegment !== '' && firstHrefSegment === firstItemSegment)
  );
}
