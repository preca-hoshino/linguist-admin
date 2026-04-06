import { useTranslation } from 'react-i18next';
import { ContentSection } from '../components/content-section';

export function SettingsNotifications(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <ContentSection title={t('settings.notifications.title')} desc={t('settings.notifications.desc')}>
      <p className="text-sm text-muted-foreground">{t('settings.notifications.comingSoon')}</p>
    </ContentSection>
  );
}
