/**
 * @fileoverview Auto-Capitalize Input Component
 *
 * A self-contained text input with optional auto-capitalization functionality.
 * The component manages its own internal state (raw and formatted values).
 * Parent components only see the final output value via onChange.
 *
 * When auto-capitalize is enabled:
 * - Press Enter to preview capitalization
 * - Component always returns formatted value to parent
 * When disabled:
 * - Component returns raw value exactly as entered
 *
 * Default: auto-capitalize enabled
 */
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export interface CapitalizeInputProps {
  /** Initial/controlled value from parent */
  value: string;
  /** Change handler - receives formatted value if auto-capitalize is on, raw value if off */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Input ID for label association */
  id?: string;
  /** Label text */
  label?: string;
  /** Whether to show error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Whether auto-capitalize is enabled by default */
  defaultCapitalize?: boolean;
  /** Hide the checkbox and always capitalize (forces auto-capitalize on) */
  hideCheckbox?: boolean;
  /** Custom formatting function (defaults to title case) */
  formatFunction?: (text: string) => string;
  /** Whether to disable the input */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default title case formatter
 * Capitalizes first letter of each word
 */
const defaultFormat = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};

/**
 * Auto-Capitalize Input Component
 *
 * @example
 * ```tsx
 * const [division, setDivision] = useState('');
 *
 * // The component handles capitalization internally
 * // setDivision will receive "East Division" if auto-capitalize is on
 * // or "east division" if auto-capitalize is off
 * <CapitalizeInput
 *   value={division}
 *   onChange={setDivision}
 *   label="Division Name"
 *   placeholder="e.g., East Division, Beginner"
 *   defaultCapitalize={true}
 * />
 * ```
 */
export const CapitalizeInput = React.forwardRef<
  { getValue: () => string },
  CapitalizeInputProps
>(({
  value,
  onChange,
  placeholder,
  id,
  label,
  error,
  errorMessage,
  defaultCapitalize = true,
  hideCheckbox = false,
  formatFunction = defaultFormat,
  disabled,
  className,
}, ref) => {
  // Internal state for raw input value
  const [internalValue, setInternalValue] = useState(value);

  // Auto-capitalize toggle state (forced on if hideCheckbox is true)
  const [autoCapitalize, setAutoCapitalize] = useState(hideCheckbox ? true : defaultCapitalize);

  // Sync internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  /**
   * Expose method to get the current value (formatted or raw based on checkbox)
   */
  React.useImperativeHandle(ref, () => ({
    getValue: () => {
      return (hideCheckbox || autoCapitalize) ? formatFunction(internalValue) : internalValue;
    }
  }));

  /**
   * Handle internal value changes
   * Just update internal state - don't format on every keystroke
   */
  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    // Pass raw value to parent so they can see what user is typing
    onChange(newValue);
  };

  /**
   * Handle Enter key press - preview/apply capitalization
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (hideCheckbox || autoCapitalize) && internalValue.trim()) {
      e.preventDefault(); // Prevent form submission
      const formatted = formatFunction(internalValue);
      setInternalValue(formatted);
      onChange(formatted);
    }
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="block mb-2">
          {label}
        </Label>
      )}

      <Input
        id={id}
        type="text"
        value={internalValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />

      {errorMessage && error && (
        <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
      )}

      {/* Auto-Capitalize Toggle - hide if hideCheckbox is true */}
      {!hideCheckbox && (
        <div className="flex items-center space-x-2 mt-3">
          <Checkbox
            id={`${id}-autocap`}
            checked={autoCapitalize}
            onCheckedChange={(checked) => setAutoCapitalize(checked === true)}
            disabled={disabled}
          />
          <Label
            htmlFor={`${id}-autocap`}
            className="text-sm text-gray-700 select-none cursor-pointer"
          >
            {autoCapitalize
              ? "Auto-capitalize (press Enter to preview, or Next to apply)"
              : "Auto-capitalize off (text will appear exactly as entered)"
            }
          </Label>
        </div>
      )}
    </div>
  );
});

CapitalizeInput.displayName = 'CapitalizeInput';
