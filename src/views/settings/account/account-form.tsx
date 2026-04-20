import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { updateUserApi } from '@/api/users';
import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth-store';

const accountFormSchema = z
  .object({
    // eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      return !(data.newPassword != null && data.newPassword !== '' && data.newPassword.length < 6);
    },
    {
      message: 'Password must be at least 6 characters.',
      path: ['newPassword'],
    },
  )
  .refine(
    (data) => {
      const hasNewPassword = data.newPassword != null && data.newPassword !== '';
      const hasConfirmPassword = data.confirmPassword != null && data.confirmPassword !== '';
      if (hasNewPassword || hasConfirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    },
  );

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountForm(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { auth } = useAuthStore();
  const user = auth.user;
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: user?.email ?? '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: AccountFormValues): Promise<void> => {
    if (!user) {
      return;
    }
    setSubmitting(true);

    try {
      const payload: { email?: string; password?: string } = {};

      if (data.email !== user.email) {
        payload.email = data.email;
      }
      if (data.newPassword != null && data.newPassword !== '') {
        payload.password = data.newPassword;
      }

      if (Object.keys(payload).length === 0) {
        toast.info(t('settings.noChanges', 'No changes to save'));
        setSubmitting(false);
        return;
      }

      await updateUserApi(user.id, payload);

      // 邮箱或密码已变更，JWT 与 Cookie 已失效，必须强制重新登录
      toast.success(t('settings.accountUpdatedLogout', 'Account updated. Please sign in again.'), { duration: 3000 });
      // 短暂延迟让用户看到提示后登出跳转
      setTimeout(() => {
        auth.reset();
        void navigate({ to: '/login' });
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('users.email', 'Email')}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormDescription>
                {t('settings.emailDesc', 'This email is used for login and notifications.')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.newPassword', 'New Password')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>{t('settings.passwordDesc', 'Leave blank to keep current password.')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.confirmPassword', 'Confirm Password')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t('common.saving', 'Saving...')}
            </span>
          ) : (
            t('settings.updateAccount', 'Update account')
          )}
        </Button>
      </form>
    </Form>
  );
}
