import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';
import { cn } from '@/utils/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { trackColors?: string[] }
>(({ className, trackColors, ...props }, ref) => {
  const values = props.value || props.defaultValue || [];
  const max = props.max || 100;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn('relative flex w-full touch-none items-center select-none', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        {trackColors && trackColors.length > 0 ? (
          <div className="absolute inset-0 flex h-full w-full">
            {(() => {
              const splits = [0, ...(Array.isArray(values) ? values : [values]), max];
              const sortedSplits = [...splits].sort((a, b) => a - b);
              const parts = [];
              for (let i = 0; i < sortedSplits.length - 1; i++) {
                let width = (((sortedSplits[i + 1] ?? 0) - (sortedSplits[i] ?? 0)) / max) * 100;
                if (width < 0) width = 0;
                parts.push(
                  <div key={i} style={{ width: width + '%' }} className={trackColors[i % trackColors.length]} />,
                );
              }
              return parts;
            })()}
          </div>
        ) : (
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        )}
      </SliderPrimitive.Track>
      {Array.isArray(values) &&
        values.map((_val, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block h-5 w-5 cursor-grab rounded-full border-2 border-primary bg-background shadow-sm ring-offset-background transition-colors hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-110 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
