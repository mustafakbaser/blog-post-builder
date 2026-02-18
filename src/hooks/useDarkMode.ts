import { useState, useEffect } from 'react';

/**
 * Hook to detect dark mode by watching the 'dark' class on <html>
 * Returns true if dark mode is active, false otherwise
 */
export function useDarkMode(): boolean {
    const [isDark, setIsDark] = useState(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class') {
                    setIsDark(document.documentElement.classList.contains('dark'));
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return isDark;
}
