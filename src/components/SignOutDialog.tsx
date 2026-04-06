import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuthStore } from '@/stores/authStore';

interface SignOutDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps): React.JSX.Element {
  const navigate = useNavigate();
  const { auth } = useAuthStore();
  const { t } = useTranslation();

  const handleSignOut = (): void => {
    auth.reset();
    void navigate({
      to: '/login',
      replace: true,
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('auth.signOut')}
      desc={t('auth.signOutConfirmDesc')}
      confirmText={t('auth.signOut')}
      destructive
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  );
}
