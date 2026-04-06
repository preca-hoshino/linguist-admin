import { useTranslation } from 'react-i18next';
import { ContentSection } from '../components/content-section';
import { ProfileForm } from './profile-form';

export function SettingsProfile(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <ContentSection title={t('settings.profile.title')} desc={t('settings.profile.desc')}>
      <ProfileForm />
    </ContentSection>
  );
}
