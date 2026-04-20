import { useTranslation } from 'react-i18next';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { useLayout } from '@/providers/LayoutProvider';
import { getSidebarData } from '../data/sidebar-data';
import { NavGroup } from './NavGroup';
import { NavUser } from './NavUser';
import { TeamSwitcher } from './TeamSwitcher';

export function AppSidebar(): React.JSX.Element {
  const { collapsible, variant } = useLayout();
  // 订阅语言变化以驱动侧边栏重新生成翻译后的菜单数据
  const { i18n } = useTranslation();
  // 以 i18n.language 为隐式 key，确保语言切换后菜单标题同步刷新
  const sidebarData = getSidebarData(i18n.language);
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
