/**
 * @fileoverview Enhanced Input Component
 *
 * Extends the base shadcn Input with optional auto-capitalization,
 * built-in label, error messaging, and info button support.
 * Default behavior is unchanged - all features are opt-in.
 *
 * @example
 * // Basic input (no extras)
 * <Input value={value} onChange={handleChange} />
 *
 * @example
 * // With label and required indicator
 * <Input label="First Name" required value={value} onChange={handleChange} />
 *
 * @example
 * // With label, error, and titleCase
 * <Input
 *   label="City"
 *   required
 *   error="City is required"
 *   titleCase
 *   value={value}
 *   onChange={handleChange}
 * />
 *
 * @example
 * // With checkbox to let user toggle capitalization
 * <Input label="Name" titleCase showCapitalizeCheckbox value={value} onChange={handleChange} />
 */
import * as React from "react"
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { InfoButton } from "@/components/InfoButton"

/**
 * Default title case formatter
 * Capitalizes first letter of each word
 */
const defaultTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};

interface InputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  /** Label text for the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Info button title (requires infoContent to show) */
  infoTitle?: string;
  /** Info button content (requires infoTitle to show) */
  infoContent?: React.ReactNode;
  /** Enable title case auto-capitalization (default: false) */
  titleCase?: boolean;
  /** Show checkbox to let user toggle auto-capitalize (default: false) */
  showCapitalizeCheckbox?: boolean;
  /** When to apply capitalization: 'blur' (default), 'change', or 'enter' */
  capitalizeOn?: 'blur' | 'change' | 'enter';
  /** Custom format function (defaults to title case) */
  formatFunction?: (text: string) => string;
  /** Standard onChange - returns string value for convenience when using capitalize features */
  onChange?: React.ChangeEventHandler<HTMLInputElement> | ((value: string) => void);
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type,
  label,
  error,
  infoTitle,
  infoContent,
  required,
  titleCase = false,
  showCapitalizeCheckbox = false,
  capitalizeOn = 'blur',
  formatFunction = defaultTitleCase,
  onChange,
  value,
  defaultValue,
  id,
  disabled,
  ...props
}, ref) => {
  // Internal ref for the input element
  const internalRef = useRef<HTMLInputElement>(null);

  // Expose the internal ref to parent via forwardRef
  useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

  // Track internal value for capitalization features
  const [internalValue, setInternalValue] = useState<string>(
    (value as string) ?? (defaultValue as string) ?? ''
  );

  // Track if user wants auto-capitalize (when checkbox is shown)
  const [capitalizeEnabled, setCapitalizeEnabled] = useState(titleCase);

  // Sync internal value when controlled value changes from parent
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value as string);
    }
  }, [value]);

  // Update capitalizeEnabled when titleCase prop changes
  useEffect(() => {
    setCapitalizeEnabled(titleCase);
  }, [titleCase]);

  /**
   * Apply formatting to the current value
   */
  const applyFormatting = (text: string): string => {
    if (!capitalizeEnabled || !text.trim()) return text;
    return formatFunction(text);
  };

  /**
   * Call the parent onChange handler
   * When titleCase features are enabled, always passes the string value directly
   */
  const notifyParent = (newValue: string) => {
    if (!onChange) return;
    // When using titleCase features, onChange receives the string value directly
    (onChange as (value: string) => void)(newValue);
  };

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    if (capitalizeEnabled && capitalizeOn === 'change') {
      const formatted = applyFormatting(newValue);
      setInternalValue(formatted);
      notifyParent(formatted);
    } else {
      notifyParent(newValue);
    }
  };

  /**
   * Handle blur - apply formatting if capitalizeOn is 'blur'
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (capitalizeEnabled && capitalizeOn === 'blur' && internalValue.trim()) {
      const formatted = applyFormatting(internalValue);
      setInternalValue(formatted);
      notifyParent(formatted);
    }
    props.onBlur?.(e);
  };

  /**
   * Handle keydown - apply formatting on Enter if capitalizeOn is 'enter'
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && capitalizeEnabled && capitalizeOn === 'enter' && internalValue.trim()) {
      e.preventDefault();
      const formatted = applyFormatting(internalValue);
      setInternalValue(formatted);
      notifyParent(formatted);
    }
    props.onKeyDown?.(e);
  };

  // Check if we need the wrapper (label, error, info, or capitalize features)
  const needsWrapper = label || error || infoTitle || titleCase || showCapitalizeCheckbox;

  // Base input element classes
  const inputClasses = cn(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    error && "border-red-500",
    className
  );

  // If no wrapper needed, render simple input
  if (!needsWrapper) {
    return (
      <input
        ref={internalRef}
        type={type}
        data-slot="input"
        className={inputClasses}
        id={id}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        required={required}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        {...props}
      />
    );
  }

  // Determine if we're using titleCase features (need internal state management)
  const useTitleCaseFeatures = titleCase || showCapitalizeCheckbox;

  // Render input with wrapper (label, error, info, and/or capitalize features)
  return (
    <div className="w-full">
      {/* Label with optional required indicator and info button */}
      {label && (
        <div className="flex items-center gap-2 mb-1">
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {infoTitle && infoContent && (
            <InfoButton title={infoTitle}>{infoContent}</InfoButton>
          )}
        </div>
      )}

      <input
        ref={internalRef}
        type={type}
        data-slot="input"
        className={inputClasses}
        id={id}
        disabled={disabled}
        required={required}
        value={useTitleCaseFeatures ? internalValue : value}
        defaultValue={defaultValue}
        onChange={useTitleCaseFeatures ? handleChange : onChange as React.ChangeEventHandler<HTMLInputElement>}
        onBlur={useTitleCaseFeatures ? handleBlur : props.onBlur}
        onKeyDown={useTitleCaseFeatures ? handleKeyDown : props.onKeyDown}
        {...props}
      />

      {/* Auto-Capitalize Checkbox */}
      {showCapitalizeCheckbox && (
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id={`${id}-autocap`}
            checked={capitalizeEnabled}
            onChange={(e) => setCapitalizeEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            disabled={disabled}
          />
          <label
            htmlFor={`${id}-autocap`}
            className="text-sm text-gray-600 select-none cursor-pointer"
          >
            Auto-capitalize
          </label>
        </div>
      )}

      {/* Formatting indicator when titleCase is enabled without checkbox */}
      {!showCapitalizeCheckbox && capitalizeEnabled && (
        <p className="text-xs text-gray-500 mt-1">Capitalizes on save</p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type,
  label,
  error,
  infoTitle,
  infoContent,
  required,
  titleCase = false,
  showCapitalizeCheckbox = false,
  capitalizeOn = 'blur',
  formatFunction = defaultTitleCase,
  onChange,
  value,
  defaultValue,
  id,
  disabled,
  ...props
}, ref) => {
  // Internal ref for the input element
  const internalRef = useRef<HTMLInputElement>(null);

  // Expose the internal ref to parent via forwardRef
  useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

  // Track internal value for capitalization features
  const [internalValue, setInternalValue] = useState<string>(
    (value as string) ?? (defaultValue as string) ?? ''
  );

  // Track if user wants auto-capitalize (when checkbox is shown)
  const [capitalizeEnabled, setCapitalizeEnabled] = useState(titleCase);

  // Sync internal value when controlled value changes from parent
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value as string);
    }
  }, [value]);

  // Update capitalizeEnabled when titleCase prop changes
  useEffect(() => {
    setCapitalizeEnabled(titleCase);
  }, [titleCase]);

  /**
   * Apply formatting to the current value
   */
  const applyFormatting = (text: string): string => {
    if (!capitalizeEnabled || !text.trim()) return text;
    return formatFunction(text);
  };

  /**
   * Create a synthetic change event with a new value
   */
  const createSyntheticEvent = (newValue: string): React.ChangeEvent<HTMLInputElement> => {
    const input = internalRef.current;
    return {
      target: { ...input, value: newValue } as HTMLInputElement,
      currentTarget: { ...input, value: newValue } as HTMLInputElement,
      bubbles: true,
      cancelable: false,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      nativeEvent: new Event('change'),
      preventDefault: () => {},
      isDefaultPrevented: () => false,
      stopPropagation: () => {},
      isPropagationStopped: () => false,
      persist: () => {},
      timeStamp: Date.now(),
      type: 'change',
    };
  };

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    if (capitalizeEnabled && capitalizeOn === 'change') {
      const formatted = applyFormatting(newValue);
      setInternalValue(formatted);
      // Modify the event's target value for the formatted text
      onChange?.({ ...e, target: { ...e.target, value: formatted } } as React.ChangeEvent<HTMLInputElement>);
    } else {
      onChange?.(e);
    }
  };

  /**
   * Handle blur - apply formatting if capitalizeOn is 'blur'
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (capitalizeEnabled && capitalizeOn === 'blur' && internalValue.trim()) {
      const formatted = applyFormatting(internalValue);
      setInternalValue(formatted);
      onChange?.(createSyntheticEvent(formatted));
    }
    props.onBlur?.(e);
  };

  /**
   * Handle keydown - apply formatting on Enter if capitalizeOn is 'enter'
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && capitalizeEnabled && capitalizeOn === 'enter' && internalValue.trim()) {
      e.preventDefault();
      const formatted = applyFormatting(internalValue);
      setInternalValue(formatted);
      onChange?.(createSyntheticEvent(formatted));
    }
    props.onKeyDown?.(e);
  };

  // Check if we need the wrapper (label, error, info, or capitalize features)
  const needsWrapper = label || error || infoTitle || titleCase || showCapitalizeCheckbox;

  // Base input element classes
  const inputClasses = cn(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    error && "border-red-500",
    className
  );

  // If no wrapper needed, render simple input
  if (!needsWrapper) {
    return (
      <input
        ref={internalRef}
        type={type}
        data-slot="input"
        className={inputClasses}
        id={id}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        required={required}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        {...props}
      />
    );
  }

  // Determine if we're using titleCase features (need internal state management)
  const useTitleCaseFeatures = titleCase || showCapitalizeCheckbox;

  // Render input with wrapper (label, error, info, and/or capitalize features)
  return (
    <div className="w-full">
      {/* Label with optional required indicator and info button */}
      {label && (
        <div className="flex items-center gap-2 mb-1">
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {infoTitle && infoContent && (
            <InfoButton title={infoTitle}>{infoContent}</InfoButton>
          )}
        </div>
      )}

      <input
        ref={internalRef}
        type={type}
        data-slot="input"
        className={inputClasses}
        id={id}
        disabled={disabled}
        required={required}
        value={useTitleCaseFeatures ? internalValue : value}
        defaultValue={defaultValue}
        onChange={useTitleCaseFeatures ? handleChange : onChange as React.ChangeEventHandler<HTMLInputElement>}
        onBlur={useTitleCaseFeatures ? handleBlur : props.onBlur}
        onKeyDown={useTitleCaseFeatures ? handleKeyDown : props.onKeyDown}
        {...props}
      />

      {/* Auto-Capitalize Checkbox */}
      {showCapitalizeCheckbox && (
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id={`${id}-autocap`}
            checked={capitalizeEnabled}
            onChange={(e) => setCapitalizeEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            disabled={disabled}
          />
          <label
            htmlFor={`${id}-autocap`}
            className="text-sm text-gray-600 select-none cursor-pointer"
          >
            Auto-capitalize
          </label>
        </div>
      )}

      {/* Formatting indicator when titleCase is enabled without checkbox */}
      {!showCapitalizeCheckbox && capitalizeEnabled && (
        <p className="text-xs text-gray-500 mt-1">Capitalizes on save</p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input }
export type { InputProps }
