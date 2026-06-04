// src/components/connect-drawer/InteractiveToken.tsx

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function InteractiveToken({ value }: { readonly value: string }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="inline cursor-pointer appearance-none border-none bg-transparent p-0 font-medium text-green-600 underline decoration-green-600/40 underline-offset-4 hover:text-green-700 hover:decoration-green-600/80 focus:outline-none dark:text-green-400 dark:decoration-green-400/40 dark:hover:text-green-300 dark:hover:decoration-green-400/80"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void navigator.clipboard.writeText(value);
        toast.success(t('connectDrawer.copied', { defaultValue: 'Copied to clipboard' }));
      }}
      title={t('connectDrawer.clickToCopy', { defaultValue: 'Click to copy' })}
    >
      {value}
    </button>
  );
}
