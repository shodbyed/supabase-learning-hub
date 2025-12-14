/**
 * @fileoverview Number Input Component
 *
 * A controlled number input that allows free typing and validates on blur.
 * Features:
 * - Selects all text on focus for easy replacement
 * - Allows free typing without immediate clamping
 * - Validates and clamps to min/max on blur
 * - Supports arrow keys for increment/decrement
 * - Suppresses context menu on focus
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  /** Current numeric value */
  value: number;
  /** Called when value changes (after validation on blur or arrow keys) */
  onChange: (value: number) => void;
  /** Minimum allowed value (default: 0) */
  min?: number;
  /** Maximum allowed value (default: no limit) */
  max?: number;
  /** Default value when input is empty or invalid (default: min or 0) */
  defaultValue?: number;
}

/**
 * NumberInput Component
 *
 * A number input that provides a better UX than the default HTML number input:
 * - Click to select all (easy to replace value)
 * - Type freely without interruption
 * - Values validated only when you leave the field
 *
 * @example
 * const [count, setCount] = useState(5);
 * <NumberInput value={count} onChange={setCount} min={1} max={10} />
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, min = 0, max, defaultValue, ...props }, ref) => {
    // Internal string state for free typing
    const [inputValue, setInputValue] = React.useState(value.toString());

    // Sync internal state when external value changes
    React.useEffect(() => {
      setInputValue(value.toString());
    }, [value]);

    // Calculate the effective default value
    const effectiveDefault = defaultValue ?? min;

    /**
     * Validate and clamp the input value
     * @returns The validated number
     */
    const validateAndClamp = (val: string): number => {
      const stripped = val.replace(/\D/g, '');
      if (stripped === '') {
        return effectiveDefault;
      }
      let num = parseInt(stripped, 10);
      if (isNaN(num)) {
        return effectiveDefault;
      }
      // Clamp to min/max
      num = Math.max(min, num);
      if (max !== undefined) {
        num = Math.min(max, num);
      }
      return num;
    };

    /**
     * Handle blur: validate, clamp, and notify parent
     */
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const validated = validateAndClamp(inputValue);
      setInputValue(validated.toString());
      if (validated !== value) {
        onChange(validated);
      }
      props.onBlur?.(e);
    };

    /**
     * Handle change: allow free typing
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    /**
     * Handle focus: select all text for easy replacement
     */
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
      props.onFocus?.(e);
    };

    /**
     * Handle context menu: prevent it from showing on focus
     */
    const handleContextMenu = (e: React.MouseEvent<HTMLInputElement>) => {
      e.preventDefault();
      props.onContextMenu?.(e);
    };

    return (
      <Input
        ref={ref}
        type="number"
        min={min}
        max={max}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onContextMenu={handleContextMenu}
        className={cn('text-center', className)}
        {...props}
      />
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };
