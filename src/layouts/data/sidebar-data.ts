import {
  AppWindow,
  BarChart,
  Box,
  Command,
  Database,
  LayoutDashboard,
  ScrollText,
  Settings as SettingsIcon,
  Users,
  Wrench,
} from 'lucide-react';
import i18n from '@/i18n';
import type { SidebarData } from '../types';

/**
 * 获取侧边栏数据。
 * 设计为函数而非静态常量，方便未来根据当前用户权限、角色等动态过滤菜单项。
 */
export function getSidebarData(_language?: string): SidebarData {
  return {
    teams: [
      {
        name: 'Linguist',
        logo: Command,
        plan: 'Admin Dashboard',
      },
    ],
    navGroups: [
      {
        title: i18n.t('nav.general'),
        items: [
          {
            title: i18n.t('nav.overview'),
            url: '/',
            icon: LayoutDashboard,
          },
          {
            title: i18n.t('nav.data'),
            url: '/data',
            icon: BarChart,
          },
        ],
      },
      {
        title: i18n.t('nav.models'),
        items: [
          {
            title: i18n.t('nav.models'),
            icon: Database,
            items: [
              {
                title: i18n.t('nav.providers'),
                url: '/models/providers',
                icon: Database,
              },
              {
                title: i18n.t('nav.providerModels'),
                url: '/models/provider-models',
                icon: Box,
              },
              {
                title: i18n.t('nav.virtualModels'),
                url: '/models/virtual-models',
                icon: Box,
              },
              {
                title: i18n.t('nav.logs'),
                url: '/models/logs',
                icon: ScrollText,
              },
            ],
          },
        ],
      },
      {
        title: i18n.t('nav.mcpTools'),
        items: [
          {
            title: i18n.t('nav.mcpTools'),
            icon: Wrench,
            items: [
              {
                title: i18n.t('nav.providers'),
                url: '/mcps/providers',
                icon: Database,
              },
              {
                title: i18n.t('nav.providerMcps'),
                url: '/mcps/provider-mcps',
                icon: Box,
              },
              {
                title: i18n.t('nav.virtualMcps'),
                url: '/mcps/virtual-mcps',
                icon: Box,
              },
              {
                title: i18n.t('nav.logs'),
                url: '/mcps/logs',
                icon: ScrollText,
              },
            ],
          },
        ],
      },
      {
        title: i18n.t('nav.management'),
        items: [
          {
            title: i18n.t('nav.apps'),
            url: '/apps',
            icon: AppWindow,
          },
          {
            title: i18n.t('nav.users'),
            url: '/users',
            icon: Users,
          },
        ],
      },
      {
        title: i18n.t('nav.preferences'),
        items: [
          {
            title: i18n.t('nav.settings'),
            url: '/settings',
            icon: SettingsIcon,
          },
        ],
      },
    ],
  };
}
