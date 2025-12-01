/**
 * @fileoverview Simple localStorage hook
 *
 * Exactly matches the current working localStorage implementation,
 * just extracted into a reusable hook.
 */
import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

/**
 * Simple localStorage hook that saves state to localStorage
 *
 * @param key - localStorage key
 * @param initialValue - default value if nothing in localStorage
 * @returns [state, setState] - same as useState but with localStorage persistence
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with localStorage value or default
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.warn('Failed to read localStorage', { key, error: String(error) });
      return initialValue;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState] as const;
}