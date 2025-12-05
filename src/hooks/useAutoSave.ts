import { useEffect, useRef } from 'react';

/**
 * Custom hook for debounced auto-save functionality
 * @param callback - Function to call after debounce period
 * @param delay - Debounce delay in milliseconds (default: 1000ms)
 * @param dependencies - Array of dependencies to trigger the save
 */
export const useAutoSave = (
  callback: () => void,
  delay: number = 1000,
  dependencies: any[]
): void => {
  const timeoutRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the first render to avoid saving default values
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);
};
