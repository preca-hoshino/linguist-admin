import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { updateUserApi } from '@/api/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { compressImage } from '@/utils/compress-image';

/** 头像硬性上限 5 MB（超过 512KB 会自动压缩） */
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm(): React.JSX.Element {
  const { t } = useTranslation();
  const { auth } = useAuthStore();
  const user = auth.user;

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url ?? '');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username ?? '',
    },
    mode: 'onChange',
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // 重置 input 值，允许再次选择同一文件
    e.target.value = '';

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error(t('settings.avatarTooLarge', 'Avatar file must be less than 5MB max limit'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.avatarInvalidType', 'Please select an image file'));
      return;
    }

    try {
      // 触发压缩（大于 512KB 时压缩到 max 800px宽 0.8 质量）
      const compressedBase64 = await compressImage(file, 512 * 1024, 800, 0.8);
      setAvatarPreview(compressedBase64);
      setAvatarBase64(compressedBase64);
    } catch {
      toast.error(t('settings.avatarProcessError', 'Failed to process image'));
      // console.error is disabled by eslint. Ignoring the detailed output.
    }
  };

  const handleSubmit = async (data: ProfileFormValues): Promise<void> => {
    if (!user) {
      return;
    }
    setSubmitting(true);

    try {
      const payload: { username?: string; avatar_data?: string } = {};

      if (data.username !== user.username) {
        payload.username = data.username;
      }
      if (avatarBase64 != null && avatarBase64 !== '') {
        payload.avatar_data = avatarBase64;
      }

      if (Object.keys(payload).length === 0) {
        toast.info(t('settings.noChanges', 'No changes to save'));
        setSubmitting(false);
        return;
      }

      const result = await updateUserApi(user.id, payload);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      const updated = result.data;

      let newAvatarUrl = '';
      if (avatarBase64 != null && avatarBase64 !== '') {
        newAvatarUrl = avatarBase64;
      } else if (updated.avatar_url !== '') {
        newAvatarUrl = `${updated.avatar_url}?t=${Date.now()}`;
      }

      // 使用 Immutable Update 同步全局状态
      // avatar_url 优先用本地 Base64 预览，避免等待后端缓存刷新
      auth.setUser({
        ...user,
        username: updated.username,
        avatar_url: newAvatarUrl,
      });

      setAvatarPreview(avatarBase64 ?? avatarPreview);
      setAvatarBase64(null);
      toast.success(t('settings.profileUpdated', 'Profile updated successfully'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-8">
        {/* 头像上传 */}
        <div className="space-y-2">
          <FormLabel>{t('settings.avatar', 'Avatar')}</FormLabel>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarPreview && <AvatarImage src={avatarPreview} alt="avatar" />}
              <AvatarFallback className="text-lg">{(user?.username ?? 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                {t('settings.changeAvatar', 'Change Avatar')}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t('settings.avatarHint', 'JPG, PNG or GIF. Max 5MB (auto compresses large files).')}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleAvatarChange(e)}
          />
        </div>

        {/* 用户名 */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('users.username', 'Username')}</FormLabel>
              <FormControl>
                <Input placeholder="admin" {...field} />
              </FormControl>
              <FormDescription>{t('settings.usernameDesc', 'This is your public display name.')}</FormDescription>
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
            t('settings.updateProfile', 'Update profile')
          )}
        </Button>
      </form>
    </Form>
  );
}
