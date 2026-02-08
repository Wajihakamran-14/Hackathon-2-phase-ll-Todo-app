import { cn } from '@/lib/utils';
import { ChangeEvent, ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

interface CheckboxProps extends ComponentPropsWithoutRef<'input'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<ElementRef<'input'>, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
      // Call the original onChange if it exists
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500',
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };