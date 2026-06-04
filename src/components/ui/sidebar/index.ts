// src/components/ui/sidebar/index.ts
// Unified barrel export for the sidebar module

export { useSidebar } from './context';
export {
  Sidebar,
  SidebarInput,
  SidebarInset,
  SidebarRail,
  SidebarTrigger,
} from './Sidebar';
export {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from './SidebarLayout';
export {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from './SidebarMenu';
export { SidebarProvider } from './SidebarProvider';
