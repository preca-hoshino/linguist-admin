/* eslint-disable sonarjs/no-nested-functions */
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/Command';
import { getSidebarData } from '@/layouts/data/sidebar-data';
import { useSearch } from '@/providers/SearchProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { ScrollArea } from './ui/ScrollArea';

export function CommandMenu(): React.JSX.Element {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();
  const { t } = useTranslation();

  const sidebarData = getSidebarData();

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen],
  );

  const handleUrlSelect = React.useCallback(
    (url: string | undefined) => {
      if (url !== undefined) {
        runCommand(() => {
          void navigate({ to: url });
        });
      }
    },
    [navigate, runCommand],
  );

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('command.placeholder')} />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pe-1">
          <CommandEmpty>{t('command.noResults')}</CommandEmpty>
          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem) => {
                if (navItem.url !== undefined) {
                  return (
                    <CommandItem
                      key={navItem.url}
                      value={navItem.title}
                      onSelect={() => {
                        handleUrlSelect(navItem.url);
                      }}
                    >
                      <div className="flex size-4 items-center justify-center">
                        <ArrowRight className="size-2 text-muted-foreground/80" />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  );
                }

                if (navItem.items !== undefined) {
                  return (
                    <React.Fragment key={navItem.title}>
                      {navItem.items.map((subItem) => (
                        <CommandItem
                          key={subItem.url}
                          value={`${navItem.title}-${subItem.url ?? ''}`}
                          onSelect={() => {
                            handleUrlSelect(subItem.url);
                          }}
                        >
                          <div className="flex size-4 items-center justify-center">
                            <ArrowRight className="size-2 text-muted-foreground/80" />
                          </div>
                          {navItem.title} <ChevronRight /> {subItem.title}
                        </CommandItem>
                      ))}
                    </React.Fragment>
                  );
                }

                return null;
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading={t('command.theme')}>
            <CommandItem
              onSelect={() => {
                runCommand(() => {
                  setTheme('light');
                });
              }}
            >
              <Sun /> <span>{t('command.light')}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => {
                  setTheme('dark');
                });
              }}
            >
              <Moon className="scale-90" />
              <span>{t('command.dark')}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => {
                  setTheme('system');
                });
              }}
            >
              <Laptop />
              <span>{t('command.system')}</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
