import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, KeyRound, ShieldCheck, UserIcon, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { createUserApi, type User, type UserUpdatePayload, updateUserApi } from '@/api/users';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth-store';
import { usePermission, usePermissionStore } from '@/stores/permission-store';
import type { PermissionModule, UserPermissions } from '@/types/permissions';
import { DEFAULT_PERMISSIONS, hasPermission, PERMISSION_MODULES } from '@/types/permissions';

// ── Zod Schema ──────────────────────────────────────────────────────────────
const formSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().optional(),
  permissions: z
    .object({
      models: z.enum(['view', 'edit']),
      mcp: z.enum(['view', 'edit']),
      apps: z.enum(['view', 'edit']),
      users: z.enum(['view', 'edit']),
      settings: z.enum(['view', 'edit']),
    })
    .optional(),
});

type UserForm = z.infer<typeof formSchema>;

// ── Props ───────────────────────────────────────────────────────────────────
interface UserMutateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentRow?: User | null;
  readonly onSuccess?: () => void | Promise<void>;
}

// ── Component ───────────────────────────────────────────────────────────────
export function UserMutateDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: UserMutateDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const isUpdate = !!currentRow;
  const currentUser = useAuthStore((s) => s.auth.user);
  const isEditingSelf = isUpdate && currentRow?.id === currentUser?.id;
  const operatorPermissions = usePermissionStore((s) => s.permissions);
  const canEditUsers = usePermission('users', 'edit');

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      permissions: { ...DEFAULT_PERMISSIONS },
    },
  });

  // ── 重置表单 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          username: currentRow.username,
          email: currentRow.email,
          password: '',
          permissions: { ...DEFAULT_PERMISSIONS, ...currentRow.permissions },
        });
      } else {
        form.reset({
          username: '',
          email: '',
          password: '',
          permissions: { ...DEFAULT_PERMISSIONS },
        });
      }
    }
  }, [open, currentRow, form]);

  // ── 权限 Badge 切换 ──────────────────────────────────────────────────────
  const permissions = form.watch('permissions') ?? DEFAULT_PERMISSIONS;

  const toggleModulePermission = (module: PermissionModule): void => {
    if (isEditingSelf) return;
    const canGrantEdit = hasPermission(operatorPermissions ?? { ...DEFAULT_PERMISSIONS }, module, 'edit');
    if (!canGrantEdit) return;
    const current = (permissions[module] ?? 'view') as 'view' | 'edit';
    const next: UserPermissions = {
      ...permissions,
      [module]: current === 'edit' ? 'view' : 'edit',
    };
    form.setValue('permissions', next, { shouldDirty: true });
  };

  // ── 提交 ──────────────────────────────────────────────────────────────────
  const onSubmit = async (values: UserForm): Promise<void> => {
    try {
      if (currentRow) {
        const payload: UserUpdatePayload = {};
        if (values.username !== currentRow.username) payload.username = values.username;
        if (values.email !== currentRow.email) payload.email = values.email;
        if (values.password) payload.password = values.password;
        const permsChanged = PERMISSION_MODULES.some(
          (m) => (values.permissions?.[m] ?? 'view') !== (currentRow.permissions?.[m] ?? 'view'),
        );
        if (permsChanged) payload.permissions = values.permissions as UserPermissions;
        if (Object.keys(payload).length > 0) {
          await updateUserApi(currentRow.id, payload);
        }
      } else {
        await createUserApi({
          username: values.username,
          email: values.email,
          password: values.password ?? '',
          permissions: values.permissions as UserPermissions,
        });
      }
      await onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      form.setError('root', { message: error instanceof Error ? error.message : 'Operation failed' });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) form.reset();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex h-[85vh] max-h-[850px] flex-col overflow-hidden p-0 sm:max-w-[700px] lg:h-[700px] lg:max-w-[900px]"
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b bg-background px-8 py-5">
          <div className="flex flex-col gap-1.5 text-left">
            <DialogTitle>
              {isUpdate ? t('users.edit', 'Edit User') : t('users.create', 'New User')}
            </DialogTitle>
            <DialogDescription>
              {isUpdate
                ? t('users.editDesc', 'Modify user information. Leave password blank to keep current.')
                : t('users.createDesc', 'Create a new administrator account.')}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-2 mt-0.5 h-8 w-8 text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* ── Form ───────────────────────────────────────────────────── */}
        <Form {...form}>
          <form
            id="users-form"
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 py-6"
          >
            <div className="flex h-full min-h-0 w-full flex-col gap-6">
              {/* Root error */}
              {form.formState.errors.root && (
                <div className="shrink-0 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr]">
                {/* ── 左列：基础配置 ─────────────────────────────── */}
                <div className="-mr-4 flex flex-col gap-6 overflow-y-auto pt-1 pr-4 pb-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                          <UserIcon className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">{t('users.username', 'Username')}</span>
                        </FormLabel>
                        <div className="space-y-1.5">
                          <FormControl>
                            <Input {...field} placeholder="admin" />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                          <AtSign className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">{t('users.email', 'Email')}</span>
                        </FormLabel>
                        <div className="space-y-1.5">
                          <FormControl>
                            <Input {...field} type="email" placeholder="user@example.com" />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                        <FormLabel className="flex items-center justify-start gap-2 text-left text-muted-foreground">
                          <KeyRound className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">
                            {t('auth.password', 'Password')}
                            {isUpdate && (
                              <span className="ml-1 text-xs font-normal text-muted-foreground">
                                ({t('common.optional', 'optional')})
                              </span>
                            )}
                          </span>
                        </FormLabel>
                        <div className="space-y-1.5">
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder={
                                isUpdate ? t('users.passwordPlaceholder', 'Leave blank to keep current') : '••••••••'
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── 右列：权限配置面板 ───────────────────────── */}
                <div className="-mr-4 flex flex-col gap-6 overflow-y-auto pt-1 pr-4 pb-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    {t('users.permissions.configure', 'Configure Permissions')}
                  </div>

                  {isEditingSelf && (
                    <p className="text-xs text-muted-foreground">
                      {t('users.permissions.selfProtect', 'cannot change own permissions')}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {PERMISSION_MODULES.map((module) => {
                        const level = permissions[module] ?? 'view';
                        const isEditLevel = level === 'edit';
                        const canGrantEdit = hasPermission(
                          operatorPermissions ?? { ...DEFAULT_PERMISSIONS },
                          module,
                          'edit',
                        );
                        return (
                          <Badge
                            key={module}
                            variant={isEditLevel ? 'default' : 'outline'}
                            className={`text-xs${
                              isEditingSelf || !canGrantEdit ? '' : ' cursor-pointer select-none hover:opacity-80'
                            }`}
                            onClick={() => toggleModulePermission(module)}
                          >
                            {t(`users.permissions.modules.${module}`, module)}
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-muted/30 px-8 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={form.formState.isSubmitting}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" form="users-form" disabled={form.formState.isSubmitting || !canEditUsers}>
            {form.formState.isSubmitting && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {isUpdate ? t('common.save', 'Save') : t('common.create', 'Create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
