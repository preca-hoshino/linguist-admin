import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { type GlobalTimeRange, TIME_RANGE_OPTIONS } from '@/types/dashboard';

interface TimeRangePickerProps {
  readonly value: GlobalTimeRange;
  readonly onChange: (value: GlobalTimeRange) => void;
}

export function TimeRangePicker({ value, onChange }: TimeRangePickerProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
      {TIME_RANGE_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => {
            onChange(opt.value);
          }}
        >
          {t(opt.labelKey, opt.fallback)}
        </Button>
      ))}
    </div>
  );
}
