import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * @param value The value to debounce (e.g., the input from a text field).
 * @param delay The time in milliseconds to wait before updating the debounced value.
 * @returns The debounced value.
 */
function useDebounce<T>(value: T, delay: number): T {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 1. Set up a timer (timeout) to update the debounced value after the delay.
    // This is the core of the debounce mechanism.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. Cleanup: If 'value' or 'delay' changes, the previous timer is cleared.
    // This resets the countdown every time the user types a new character.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
}

export default useDebounce;