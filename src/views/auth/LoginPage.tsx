import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { login } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/stores/auth-store';

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { auth } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      auth.setAccessToken(res.data.access_token);
      // 获取用户资料
      await auth.initUser();

      const currentState = useAuthStore.getState().auth;
      if (!currentState.isAuthenticated()) {
        throw new Error(t('auth.loginFailed', 'Failed to load user profile'));
      }

      void navigate({ to: '/' });
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-lg">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Linguist</h1>
          <p className="text-sm text-muted-foreground">{t('auth.loginDesc', 'Sign in to your admin dashboard')}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@linguist.local"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t('auth.signingIn', 'Signing in...')}
              </span>
            ) : (
              t('auth.signIn', 'Sign in')
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">Linguist Admin Dashboard</p>
      </div>
    </div>
  );
}
