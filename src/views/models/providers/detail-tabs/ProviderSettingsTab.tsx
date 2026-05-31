import { DeepSeek, Gemini, Github, NewAPI, ProviderIcon, Volcengine, XiaomiMiMo } from '@lobehub/icons';
import { useRouter } from '@tanstack/react-router';
import { Globe, Key, Network, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { usePermission } from '@/stores/permission-store';
import type { Provider } from '@/types';
import { ProvidersMutateDialog } from '../providers-mutate-dialog';
import { ProviderModelsProvider, useProviderModelsContext } from './provider-models-context';
import { ProviderModelsTable } from './provider-models-table';

function ProviderModelsCreateButton(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen } = useProviderModelsContext();
  const canEdit = usePermission('models', 'edit');
  return (
    <Button
      className="space-x-1"
      disabled={!canEdit}
      onClick={() => {
        setOpen('create');
      }}
    >
      <Plus className="h-4 w-4" />
      <span>{t('modelsPage.providerModels.create', 'New Model')}</span>
    </Button>
  );
}

function SettingsProviderIcon({ kind }: { readonly kind: string }): React.JSX.Element {
  const props = { size: 14, className: 'fill-current shrink-0' } as const;
  switch (kind) {
    case 'gemini': {
      return <Gemini {...props} />;
    }
    case 'deepseek': {
      return <DeepSeek {...props} />;
    }
    case 'volcengine': {
      return <Volcengine {...props} />;
    }
    case 'mimo': {
      return <XiaomiMiMo {...props} />;
    }
    case 'copilot': {
      return <Github {...props} />;
    }
    case 'newapi': {
      return <NewAPI {...props} />;
    }

    default: {
      return <ProviderIcon provider={kind} size={14} type="mono" className="shrink-0 fill-current" />;
    }
  }
}

interface ProviderSettingsTabProps {
  readonly provider: Provider;
}

function DetailRow({
  label,
  icon: Icon,
  children,
}: {
  readonly label: string;
  readonly icon?: React.ElementType;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-[180px_1fr] items-start gap-4">
      <Label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
        {Icon != null && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}

export function ProviderSettingsTab({ provider }: ProviderSettingsTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const canEdit = usePermission('models', 'edit');
  const [editOpen, setEditOpen] = useState(false);

  const hasCredential = provider.credential_type === 'api_key';

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* 配置区容器 */}
      <div className="flex flex-col gap-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{t('modelsPage.providers.configuration', 'Configuration')}</h3>
          <Button
            variant="outline"
            size="sm"
            disabled={!canEdit}
            onClick={() => {
              setEditOpen(true);
            }}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {t('modelsPage.providers.editConfig', 'Edit Configuration')}
          </Button>
        </div>
        {/* 左右并列配置项 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Section 1: 基础配置 */}
          <div className="h-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="mb-5">
              <h4 className="text-sm font-medium">{t('modelsPage.providers.settingsBasic', 'Basic Configuration')}</h4>
            </div>
            <div className="space-y-4">
              <DetailRow label={t('modelsPage.providers.kind', 'Kind')}>
                <Badge variant="outline" className="flex w-fit items-center gap-1.5 px-2 py-0.5 capitalize">
                  <SettingsProviderIcon kind={provider.kind} />
                  <span>{provider.kind}</span>
                </Badge>
              </DetailRow>
              <DetailRow label={t('modelsPage.providers.name', 'Name')}>
                <span className="text-sm font-medium">{provider.name}</span>
              </DetailRow>
              <DetailRow label={t('modelsPage.providers.baseUrl', 'Base URL')} icon={Globe}>
                <code className="rounded bg-muted px-2 py-1 font-mono text-xs break-all">{provider.base_url}</code>
              </DetailRow>
              <DetailRow label={t('modelsPage.providers.credentialType', 'Auth')} icon={Key}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {provider.credential_type === 'api_key' ? 'API Key' : provider.credential_type}
                  </Badge>
                  {hasCredential ? (
                    <Badge variant="outline" className="border-green-300 px-1.5 py-0 text-[10px] text-green-600">
                      {t('modelsPage.providers.credentialSet', 'Configured')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-300 px-1.5 py-0 text-[10px] text-amber-600">
                      {t('modelsPage.providers.credentialNotSet', 'Not Set')}
                    </Badge>
                  )}
                </div>
              </DetailRow>
              <DetailRow label={t('modelsPage.providers.createdAt', 'Created')}>
                <span className="text-sm text-muted-foreground">{new Date(provider.created_at).toLocaleString()}</span>
              </DetailRow>
              <DetailRow label={t('modelsPage.providers.updatedAt', 'Updated')}>
                <span className="text-sm text-muted-foreground">{new Date(provider.updated_at).toLocaleString()}</span>
              </DetailRow>
            </div>
          </div>

          {/* Section 2: 高级配置 */}
          <div className="h-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="mb-5">
              <h4 className="text-sm font-medium">
                {t('modelsPage.providers.settingsAdvanced', 'Advanced Configuration')}
              </h4>
            </div>
            <div className="space-y-4">
              <DetailRow label={t('modelsPage.providers.httpProxy', 'HTTP Proxy')} icon={Network}>
                {provider.config.http_proxy ? (
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs">{provider.config.http_proxy}</code>
                ) : (
                  <span className="text-sm text-muted-foreground">{t('common.disabled', 'Disabled')}</span>
                )}
              </DetailRow>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 3: 关联模型列表 */}
      <ProviderModelsProvider providerId={provider.id}>
        <div className="flex flex-1 flex-col gap-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{t('modelsPage.providers.settingsModels', 'Associated Models')}</h3>
            <ProviderModelsCreateButton />
          </div>
          <ProviderModelsTable />
        </div>
      </ProviderModelsProvider>

      {/* 编辑弹窗 */}
      <ProvidersMutateDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        currentRow={provider}
        onSuccess={() => {
          void router.invalidate();
        }}
      />
    </div>
  );
}
