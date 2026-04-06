import { useTranslation } from 'react-i18next';
import { ContentSection } from '../components/content-section';

declare const __UI_VERSION__: string;

export function SettingsAbout(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <ContentSection title={t('settings.about.title')} desc={t('settings.about.desc')}>
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('settings.about.linguistVersion')}</span>
          <span className="font-mono">{t('settings.about.unknown')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('settings.about.uiVersion')}</span>
          <span className="font-mono">{__UI_VERSION__}</span>
        </div>
      </div>
    </ContentSection>
  );
}
