import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout';
import { useAuthStore } from '@/stores/auth-store';

/**
 * 路由守卫：仅检查认证状态
 * 权限模型 V2：所有登录用户默认拥有 view 权限，无需按模块拦截路由
 * 写操作由 PermissionGuard 组件在 UI 层控制
 */
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState();
    if (!auth.accessToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});
