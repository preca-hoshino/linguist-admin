import { Item, Root as Radio } from '@radix-ui/react-radio-group';
import { CircleCheck, RotateCcw } from 'lucide-react';
import type { SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { IconDir } from '@/assets/custom/icon-dir';
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact';
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default';
import { IconLayoutFull } from '@/assets/custom/icon-layout-full';
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating';
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset';
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar';
import { Button } from '@/components/ui/Button';
import { useSidebar } from '@/components/ui/Sidebar';
import { useDirection } from '@/providers/DirectionProvider';
import { type Collapsible, useLayout } from '@/providers/LayoutProvider';
import { cn } from '@/utils/utils';
import { ContentSection } from '../components/content-section';

export function SettingsAppearance(): React.JSX.Element {
  const { setOpen } = useSidebar();
  const { resetDir } = useDirection();
  const { resetLayout } = useLayout();
  const { t } = useTranslation();

  const handleResetAll = (): void => {
    setOpen(true);
    resetDir();
    resetLayout();
  };

  return (
    <ContentSection title={t('settings.appearance.title')} desc={t('settings.appearance.desc')}>
      <div className="space-y-8">
        <SidebarConfig />
        <LayoutConfig />
        <DirConfig />

        <div className="pt-4">
          <Button variant="destructive" onClick={handleResetAll} aria-label="Reset all settings to default values">
            {t('common.resetAll')}
          </Button>
        </div>
      </div>
    </ContentSection>
  );
}

/* ────── Shared Components ────── */

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: Readonly<{
  title: string;
  showReset?: boolean;
  onReset?: () => void;
  className?: string;
}>): React.JSX.Element {
  return (
    <div className={cn('mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground', className)}>
      {title}
      {showReset && onReset && (
        <Button size="icon" variant="secondary" className="size-4 rounded-full" onClick={onReset}>
          <RotateCcw className="size-3" />
        </Button>
      )}
    </div>
  );
}

function RadioGroupItem({
  item,
  isTheme = false,
}: Readonly<{
  item: {
    value: string;
    label: string;
    icon: (props: Readonly<SVGProps<SVGSVGElement>>) => React.ReactElement;
  };
  isTheme?: boolean;
}>): React.JSX.Element {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2',
        )}
        role="img"
        aria-hidden="false"
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2',
          )}
          aria-hidden="true"
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground',
          )}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1 text-xs" id={`${item.value}-description`} aria-live="polite">
        {item.label}
      </div>
    </Item>
  );
}

/* ────── Config Sections ────── */

function SidebarConfig(): React.JSX.Element {
  const { defaultVariant, variant, setVariant } = useLayout();
  const { t } = useTranslation();
  return (
    <div className="max-md:hidden">
      <SectionTitle
        title={t('settings.appearance.sidebar')}
        showReset={defaultVariant !== variant}
        onReset={() => {
          setVariant(defaultVariant);
        }}
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select sidebar style"
        aria-describedby="sidebar-description"
      >
        {[
          { value: 'inset', label: 'Inset', icon: IconSidebarInset },
          { value: 'floating', label: 'Floating', icon: IconSidebarFloating },
          { value: 'sidebar', label: 'Sidebar', icon: IconSidebarSidebar },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="sidebar-description" className="sr-only">
        {t('settings.appearance.sidebarDesc')}
      </div>
    </div>
  );
}

function LayoutConfig(): React.JSX.Element {
  const { open, setOpen } = useSidebar();
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout();
  const { t } = useTranslation();

  const radioState = open ? 'default' : collapsible;

  return (
    <div className="max-md:hidden">
      <SectionTitle
        title={t('settings.appearance.layout')}
        showReset={radioState !== 'default'}
        onReset={() => {
          setOpen(true);
          setCollapsible(defaultCollapsible);
        }}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') {
            setOpen(true);
            return;
          }
          setOpen(false);
          setCollapsible(v as Collapsible);
        }}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select layout style"
        aria-describedby="layout-description"
      >
        {[
          { value: 'default', label: 'Default', icon: IconLayoutDefault },
          { value: 'icon', label: 'Compact', icon: IconLayoutCompact },
          { value: 'offcanvas', label: 'Full layout', icon: IconLayoutFull },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="layout-description" className="sr-only">
        {t('settings.appearance.layoutDesc')}
      </div>
    </div>
  );
}

function DirConfig(): React.JSX.Element {
  const { defaultDir, dir, setDir } = useDirection();
  const { t } = useTranslation();
  return (
    <div>
      <SectionTitle
        title={t('settings.appearance.direction')}
        showReset={defaultDir !== dir}
        onReset={() => {
          setDir(defaultDir);
        }}
      />
      <Radio
        value={dir}
        onValueChange={setDir}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select site direction"
        aria-describedby="direction-description"
      >
        {[
          {
            value: 'ltr',
            label: t('settings.appearance.leftToRight'),
            icon: (props: Readonly<SVGProps<SVGSVGElement>>) => <IconDir dir="ltr" {...props} />,
          },
          {
            value: 'rtl',
            label: t('settings.appearance.rightToLeft'),
            icon: (props: Readonly<SVGProps<SVGSVGElement>>) => <IconDir dir="rtl" {...props} />,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="direction-description" className="sr-only">
        {t('settings.appearance.directionDesc')}
      </div>
    </div>
  );
}
