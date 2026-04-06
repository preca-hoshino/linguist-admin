import { Pencil, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createUserApi, type User, type UserUpdatePayload, updateUserApi } from '@/api/users';
import { Button } from '@/components/ui/Button';
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

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      if (isEdit && targetUser) {
        setUsername(targetUser.username);
        setEmail(targetUser.email);
        setPassword('');
      } else {
        setUsername('');
        setEmail('');
        setPassword('');
      }
      setErrorMsg('');
    }
  }, [open, isEdit, targetUser]);

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

        if (Object.keys(payload).length > 0) {
          await updateUserApi(targetUser.id, payload);
        }
      } else {
        await createUserApi({
          username,
          email,
          password,
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
