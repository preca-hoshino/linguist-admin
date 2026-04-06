import { useTranslation } from 'react-i18next';
import { Main } from '@/layouts/Main';

interface PlaceholderPageProps {
  readonly titleKey: string;
  readonly descKey: string;
}

/**
 * 通用占位页面组件。
 * 用于尚未完成开发的视图，显示标题、描述和"开发中"横幅。
 *
 * @example
 * <PlaceholderPage titleKey='dashboard.title' descKey='dashboard.desc' />
 */
export function PlaceholderPage({ titleKey, descKey }: PlaceholderPageProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <Main>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{t(titleKey)}</h1>
        <p className="text-muted-foreground">{t(descKey)}</p>
      </div>
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
        <span className="text-sm text-muted-foreground">{t('common.comingSoon')}</span>
      </div>
    </Main>
  );
}
