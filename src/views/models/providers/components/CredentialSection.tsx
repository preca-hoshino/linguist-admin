import { Eye, EyeOff, Key } from 'lucide-react';
import { Github } from '@lobehub/icons';

import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import type { Provider } from '@/types';
import type { ProviderForm } from '../providers-mutate-dialog';
import { CopilotOAuthPanel } from './CopilotOAuthPanel';

interface CredentialSectionProps {
  readonly form: UseFormReturn<ProviderForm>;
  readonly selectedKind: string;
  readonly isUpdate: boolean;
  readonly currentRow?: Provider | undefined;
  readonly showApiKey: boolean;
  readonly setShowApiKey: (val: boolean) => void;
  readonly setCopilotAuthData: (
    data: {
      accessToken: string;
      user?: { login: string; avatarUrl: string; htmlUrl: string };
    } | null,
  ) => void;
}

export function CredentialSection({
  form,
  selectedKind,
  isUpdate,
  currentRow,
  showApiKey,
  setShowApiKey,
  setCopilotAuthData,
}: CredentialSectionProps): React.JSX.Element {
  const { t } = useTranslation();

  if (selectedKind === 'copilot') {
    return (
      <div className="grid grid-cols-[140px_1fr] items-center gap-5">
        <div className="flex items-center justify-start gap-2 text-sm text-muted-foreground">
          <Github className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{t('modelsPage.copilot.authorization', 'Authorization')}</span>
        </div>
        <CopilotOAuthPanel
          providerId={currentRow?.id}
          currentCredential={currentRow?.credential}
          githubInfo={
            currentRow?.config.github_info as undefined | { login: string; avatarUrl: string; htmlUrl: string }
          }
          isUpdate={isUpdate}
          onCredentialChange={setCopilotAuthData}
        />
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="api_key"
      render={({ field }) => (
        <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
          <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
            <Key className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{t('modelsPage.providers.apiKey', 'API Key')}</span>
          </FormLabel>
          <div className="space-y-1.5">
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={isUpdate ? '••••••••  (leave blank to keep current)' : 'sk-...'}
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setShowApiKey(!showApiKey);
                  }}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
