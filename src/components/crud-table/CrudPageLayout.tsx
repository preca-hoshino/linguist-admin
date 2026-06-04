import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';

interface CrudPageLayoutProps {
  /** 页面标题 i18n key */
  readonly titleKey: string;
  /** 页面标题 fallback */
  readonly titleFallback: string;
  /** 页面描述 i18n key */
  readonly descKey: string;
  /** 页面描述 fallback */
  readonly descFallback: string;
  /** 右上角操作区（新建按钮等） */
  readonly primaryButton?: React.ReactNode;
  /** 错误信息 */
  readonly error?: string;
  /** 表格内容 */
  readonly children: React.ReactNode;
}

/**
 * 通用 CRUD 页面布局 — 替代所有 index.tsx 中重复的页面骨架。
 *
 * 内置:
 * - usePageTitle
 * - Main 布局
 * - 标题 + 描述 + PrimaryButton 区域
 * - 错误提示
 */
export function CrudPageLayout({
  titleKey,
  titleFallback,
  descKey,
  descFallback,
  primaryButton,
  error,
  children,
}: CrudPageLayoutProps): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t(titleKey, titleFallback));

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t(titleKey, titleFallback)}</h2>
          <p className="text-muted-foreground">{t(descKey, descFallback)}</p>
        </div>
        {primaryButton}
      </div>

      {error != null && error !== '' ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {children}
    </Main>
  );
}
