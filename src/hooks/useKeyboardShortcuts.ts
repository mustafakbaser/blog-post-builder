import { useEffect } from 'react';

export interface Shortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean; // Command key on Mac
    description: string;
    action: () => void;
    preventDefault?: boolean; // Defaults to true
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if user is typing in an input, textarea, or contentEditable
            // BUT allow Ctrl+S or other control commands to go through if desired?
            // Usually we normally allow Ctrl+S even in inputs.
            const target = event.target as HTMLElement;
            const isInput =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            shortcuts.forEach(shortcut => {
                const isKeyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const isCtrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
                const isShiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const isAltMatch = shortcut.alt ? event.altKey : !event.altKey;

                if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
                    // If it's an input and the shortcut is NOT a control shortcut (like simple 'x'), don't fire
                    // But if it is Ctrl+S, we usually want it to fire even in inputs.

                    const isControlShortcut = shortcut.ctrl || shortcut.alt || shortcut.meta;

                    if (isInput && !isControlShortcut && shortcut.key !== 'Escape') {
                        return;
                    }

                    if (shortcut.preventDefault !== false) {
                        event.preventDefault();
                    }
                    shortcut.action();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
