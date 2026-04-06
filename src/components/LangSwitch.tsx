import { Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { useLocale } from '@/providers/LocaleProvider';
import { cn } from '@/utils/utils';

export function LangSwitch(): React.JSX.Element {
  const { locale, setLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="scale-95 rounded-full">
          <Languages className="scale-125" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setLocale('zh-CN');
          }}
        >
          简体中文
          <Check size={14} className={cn('ms-auto', locale !== 'zh-CN' && 'hidden')} />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setLocale('en');
          }}
        >
          English
          <Check size={14} className={cn('ms-auto', locale !== 'en' && 'hidden')} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
