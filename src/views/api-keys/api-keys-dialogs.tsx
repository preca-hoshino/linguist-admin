/* eslint-disable sonarjs/no-selector-parameter */

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteApiKey, rotateApiKey } from '@/api/api-keys';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { type ApiKeysDialogType, useApiKeys } from './api-keys-context';
import { ApiKeysMutateDialog } from './api-keys-mutate-dialog';

export function ApiKeysDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, loadApiKeys, setCurrentRow, newKeyText, setNewKeyText } = useApiKeys();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleOpenChange = (type: ApiKeysDialogType, isOpen: boolean): void => {
    if (isOpen) {
      setOpen(type);
    } else {
      setOpen(null);
      setTimeout(() => {
        if (type !== 'copy') {
          setCurrentRow(null);
        }
        if (type === 'copy') {
          setNewKeyText(null);
          setIsCopied(false);
        }
      }, 200); // 等待动画结束再清空
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (currentRow?.id === undefined || currentRow.id === '') {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteApiKey(currentRow.id);
      await loadApiKeys();
      handleOpenChange('delete', false);
    } catch {
      // 忽略，或者由全局拦截器处理弹窗，或者这里增加 toast
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRotate = async (): Promise<void> => {
    if (currentRow?.id === undefined || currentRow.id === '') {
      return;
    }
    try {
      setIsRotating(true);
      const res = await rotateApiKey(currentRow.id);
      if (res.ok) {
        await loadApiKeys();
        setNewKeyText(res.data.key ?? null);
        handleOpenChange('rotate', false);
        // 旋转成功后自动弹出复制窗口
        setTimeout(() => {
          setOpen('copy');
        }, 250);
      }
    } catch {
      // 捕获
    } finally {
      setIsRotating(false);
    }
  };

  const handleCreateSuccessWithKey = (key: string): void => {
    setNewKeyText(key);
    setTimeout(() => {
      setOpen('copy');
    }, 250);
  };

  const copyToClipboard = async (): Promise<void> => {
    if (newKeyText === null || newKeyText === '') {
      return;
    }
    try {
      await navigator.clipboard.writeText(newKeyText);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <>
      <ApiKeysMutateDialog
        key={currentRow?.id ?? 'new'}
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => {
          handleOpenChange(open as ApiKeysDialogType, isOpen);
        }}
        currentRow={currentRow}
        onSuccess={loadApiKeys}
        onKeyGenerated={handleCreateSuccessWithKey}
      />

      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          handleOpenChange('delete', v);
        }}
        title={t('apiKeys.deleteConfirmTitle', 'Delete API Key?')}
        desc={t(
          'apiKeys.deleteConfirmDesc',
          'Are you sure you want to delete this API Key? This action cannot be undone and any integrations using this key will immediately fail.',
        )}
        destructive={true}
        isLoading={isDeleting}
        handleConfirm={() => {
          void handleDelete();
        }}
        confirmText={isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
      />

      <ConfirmDialog
        open={open === 'rotate'}
        onOpenChange={(v) => {
          handleOpenChange('rotate', v);
        }}
        title={t('apiKeys.rotateConfirmTitle', 'Rotate API Key?')}
        desc={t(
          'apiKeys.rotateConfirmDesc',
          'Rotating an API key will invalidate the current key immediately and generate a new one. Do you want to proceed?',
        )}
        destructive={false}
        isLoading={isRotating}
        handleConfirm={() => {
          void handleRotate();
        }}
        confirmText={isRotating ? t('common.rotating', 'Rotating...') : t('common.rotate', 'Rotate')}
      />

      {/* Copy New Key Dialog */}
      <Dialog
        open={open === 'copy'}
        onOpenChange={(v) => {
          handleOpenChange('copy', v);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md"
          onInteractOutside={(e) => {
            e.preventDefault(); // 阻止点击外部关闭，强制用户确认
          }}
        >
          <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b bg-background px-6 py-5">
            <div className="flex flex-col gap-1.5 text-left">
              <DialogTitle>{t('apiKeys.copyTitle', 'Save Your API Key')}</DialogTitle>
              <DialogDescription className="text-orange-600 dark:text-orange-400">
                {t(
                  'apiKeys.copyDesc',
                  'Please save this secret key somewhere safe and accessible. For security reasons, you will not be able to view it again.',
                )}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex items-center space-x-2 p-6 pb-8">
            <div className="flex-1 rounded-md bg-muted p-3 px-4 font-mono text-sm font-medium break-all text-primary">
              {newKeyText !== null && newKeyText !== '' ? newKeyText : 'Error: Key not found'}
            </div>
            <Button
              size="icon"
              className="shrink-0"
              onClick={() => {
                void copyToClipboard();
              }}
              variant="outline"
              disabled={newKeyText === null || newKeyText === ''}
            >
              {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <DialogFooter className="shrink-0 border-t bg-muted/30 px-6 py-4">
            <Button
              type="button"
              onClick={() => {
                handleOpenChange('copy', false);
              }}
              variant="default"
            >
              {t('common.done', 'Done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
