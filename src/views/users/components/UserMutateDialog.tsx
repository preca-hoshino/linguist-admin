import { ChevronDown, Pencil, ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createUserApi, type User, type UserUpdatePayload, updateUserApi } from '@/api/users';
import { Button } from '@/components/ui/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useAuthStore } from '@/stores/auth-store';
import { usePermissionStore } from '@/stores/permission-store';
import type { PermissionLevel, PermissionModule, UserPermissions } from '@/types/permissions';
import { DEFAULT_PERMISSIONS, hasPermission, PERMISSION_MODULES } from '@/types/permissions';

interface UserMutateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  targetUser: User | null;
  onSuccess: () => void | Promise<void>;
}

export function UserMutateDialog({
  open,
  onOpenChange,
  mode,
  targetUser,
  onSuccess,
}: Readonly<UserMutateDialogProps>): React.JSX.Element {
  const { t } = useTranslation();
  const isEdit = mode === 'edit';
  const currentUser = useAuthStore((s) => s.auth.user);
  const isEditingSelf = isEdit && targetUser?.id === currentUser?.id;
  const operatorPermissions = usePermissionStore((s) => s.permissions);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<UserPermissions>({ ...DEFAULT_PERMISSIONS });
  const [permsOpen, setPermsOpen] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      if (isEdit && targetUser) {
        setUsername(targetUser.username);
        setEmail(targetUser.email);
        setPassword('');
        if (targetUser.permissions) {
          setPermissions({ ...targetUser.permissions });
        }
      } else {
        setUsername('');
        setEmail('');
        setPassword('');
        setPermissions({ ...DEFAULT_PERMISSIONS });
      }
      setErrorMsg('');
    }
  }, [open, isEdit, targetUser]);

  const setModulePermission = (module: PermissionModule, level: PermissionLevel): void => {
    setPermissions((prev) => ({ ...prev, [module]: level }));
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (isEdit && targetUser) {
        const payload: UserUpdatePayload = {};
        if (username !== targetUser.username) {
          payload.username = username;
        }
        if (email !== targetUser.email) {
          payload.email = email;
        }
        if (password) {
          payload.password = password;
        }
        // 仅在权限有变化时传递
        const permsChanged = PERMISSION_MODULES.some((m) => permissions[m] !== targetUser.permissions?.[m]);
        if (permsChanged) {
          payload.permissions = permissions;
        }

        if (Object.keys(payload).length > 0) {
          await updateUserApi(targetUser.id, payload);
        }
      } else {
        await createUserApi({
          username,
          email,
          password,
          permissions,
        });
      }
      onOpenChange(false);
      await onSuccess();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = isEdit ? (username && email) || password : username && email && password;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <Pencil className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            {isEdit ? t('users.edit', 'Edit User') : t('users.create', 'New User')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('users.editDesc', 'Modify user information. Leave password blank to keep current.')
              : t('users.createDesc', 'Create a new administrator account')}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${mode}-username`}>{t('users.username', 'Username')}</Label>
            <Input
              id={`${mode}-username`}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder="admin"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-email`}>{t('users.email', 'Email')}</Label>
            <Input
              id={`${mode}-email`}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-password`}>
              {t('auth.password', 'Password')}
              {isEdit && (
                <span className="ml-1 text-xs text-muted-foreground">({t('common.optional', 'optional')})</span>
              )}
            </Label>
            <Input
              id={`${mode}-password`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder={isEdit ? t('users.passwordPlaceholder', 'Leave blank to keep current') : '••••••••'}
              required={!isEdit}
            />
          </div>
        </div>

        {/* 权限配置 */}
        <Collapsible open={permsOpen} onOpenChange={setPermsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full items-center justify-between px-0 py-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                {t('users.permissions.configure', 'Configure Permissions')}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${permsOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            {PERMISSION_MODULES.map((module) => {
              // 自保护：编辑自己时禁用所有权限选择器
              // 权限天花板：只能授予自己已拥有的权限级别
              const canGrantEdit = hasPermission(
                operatorPermissions ?? { ...DEFAULT_PERMISSIONS },
                module,
                'edit',
              );
              const isDisabled = isEditingSelf;
              return (
                <div key={module} className="flex items-center justify-between">
                  <Label className="text-sm">
                    {t(`users.permissions.modules.${module}`, module)}
                    {isEditingSelf && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({t('users.permissions.selfProtect', 'cannot change own permissions')})
                      </span>
                    )}
                  </Label>
                  <Select
                    value={permissions[module]}
                    onValueChange={(v) => setModulePermission(module, v as PermissionLevel)}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">{t('users.permissions.levels.view', 'View')}</SelectItem>
                      {canGrantEdit && (
                        <SelectItem value="edit">{t('users.permissions.levels.edit', 'Edit')}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !isValid}>
            {isSubmitting && (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isEdit ? t('common.saving', 'Saving...') : t('common.creating', 'Creating...')}
              </span>
            )}
            {!isSubmitting && (isEdit ? t('common.save', 'Save') : t('users.create', 'New User'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
