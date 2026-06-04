import { Link, useLoaderData, useRouter } from '@tanstack/react-router';
import { AlertTriangle, AppWindow, ChevronLeft, KeyRound, RefreshCw, Settings } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { rotateAppKey } from '@/api/apps';
import { CopyableId } from '@/components/CopyableId';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { cn } from '@/utils/utils';
import { AppsMutateDialog } from './apps-mutate-dialog';

export function AppDetailPage(): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();

  const { app }: { app: import('@/types/app').App } = useLoaderData({
    from: '/_authenticated/apps/$id',
  }) as unknown as { app: import('@/types/app').App };

  usePageTitle(`${t('apps.title', 'Applications')} - ${app.name}`);

  const [editOpen, setEditOpen] = useState(false);
  const [rotateOpen, setRotateOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleRotate = async (): Promise<void> => {
    try {
      setIsRotating(true);
      await rotateAppKey(app.id);
      toast.success(t('apps.rotateSuccess', 'API Key rotated successfully'));
      setRotateOpen(false);
      void router.invalidate();
    } catch {
      toast.error(t('apps.rotateFailed', 'Failed to rotate API Key'));
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <Main className="flex flex-1 flex-col gap-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" asChild>
          <Link to="/apps">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('apps.backToList', 'Back to List')}
          </Link>
        </Button>
      </div>

      {/* 页头 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-foreground text-2xl">
            <AppWindow className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{app.name}</h1>
              <CopyableId id={app.id} />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(app.is_active ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground')}
              >
                {app.is_active ? t('apps.active', 'Active') : t('apps.inactive', 'Inactive')}
              </Badge>
            </div>
          </div>
        </div>

        {/* 右侧操作区 */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditOpen(true);
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t('common.settings', 'Settings')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <div className="scrollbar-hide -mb-1 flex items-center justify-between overflow-x-auto pb-1">
          <TabsList className="h-9 w-auto justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="settings"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {t('common.settings', 'Settings')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="settings" className="space-y-6 outline-none">
          {/* API Key 卡片 */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 border-b">
              <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                {t('apps.apiKey', 'API Key')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  'apps.apiKeyDesc',
                  'The single API key used for authentication. If compromised, rotate it immediately.',
                )}
              </p>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono bg-muted px-2 py-1 rounded text-sm select-all">{app.api_key}</span>
                <CopyableId id={app.api_key} />
              </div>

              <Dialog open={rotateOpen} onOpenChange={setRotateOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('apps.rotateKey', 'Rotate Key')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      {t('apps.rotateConfirmTitle', 'Rotate API Key?')}
                    </DialogTitle>
                    <DialogDescription>
                      {t(
                        'apps.rotateConfirmDesc',
                        'Rotating the API key will immediately invalidate the current key. All existing integrations using the old key will stop working until they are updated with the new key. This action cannot be undone.',
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRotateOpen(false);
                      }}
                      disabled={isRotating}
                    >
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button variant="destructive" onClick={handleRotate} disabled={isRotating}>
                      {isRotating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      {t('apps.rotateConfirmBtn', 'Yes, Rotate Key')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 设置卡片 */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 border-b">
              <h3 className="font-semibold leading-none tracking-tight">
                {t('apps.allowlist', 'App Security & Settings')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('apps.settingsDesc', 'Configure models available and fundamental properties for this application.')}
              </p>
            </div>
            <div className="p-6">
              <dl className="mb-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t('apps.allowedModels', 'Allowed Models')}
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {app.allowed_model_ids.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {app.allowed_model_ids.map((id) => (
                          <Badge key={id} variant="secondary" className="font-mono text-xs font-normal">
                            {id}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{t('apps.noneAllowed', 'None Allowed')}</span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-muted-foreground">{t('apps.virtualMcps', 'Virtual MCPs')}</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {app.allowed_mcp_ids && app.allowed_mcp_ids.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {app.allowed_mcp_ids.map((id) => (
                          <Badge key={id} variant="secondary" className="font-mono text-xs font-normal">
                            {id}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{t('apps.noneAllowed', 'None Allowed')}</span>
                    )}
                  </dd>
                </div>
              </dl>
              <Button
                variant="default"
                onClick={() => {
                  setEditOpen(true);
                }}
              >
                {t('common.edit', 'Edit Settings')}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AppsMutateDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        currentRow={app}
        onSuccess={() => {
          void router.invalidate();
        }}
      />
    </Main>
  );
}
