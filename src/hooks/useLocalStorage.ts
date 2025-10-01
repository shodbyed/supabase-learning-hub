/**
 * @fileoverview useLocalStorage Hook
 *
 * Custom React hook for persisting state in localStorage.
 * Automatically saves state changes to localStorage and restores them on component mount.
 * Handles JSON serialization/deserialization and provides fallback for SSR compatibility.
 *
 * Usage:
 * const [value, setValue] = useLocalStorage('my-key', defaultValue);
 */
import { useState } from 'react';

/**
 * Custom hook for persisting state in localStorage
 *
 * @param key - The localStorage key to store the value under
 * @param initialValue - The default value if nothing is stored
 * @returns [storedValue, setValue] - Tuple similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Clear the stored value
  const clearValue = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.log(`Error clearing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, clearValue] as const;
}