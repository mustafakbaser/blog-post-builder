import { useState, useCallback, useMemo } from 'react';

interface UseHistoryOptions<T> {
    maxHistory?: number;
}

interface UseHistoryResult<T> {
    state: T;
    set: (newState: T) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clear: () => void;
    // For debugging/display
    historyLength: number;
    historyIndex: number;
}

export function useHistory<T>(initialState: T, options: UseHistoryOptions<T> = {}): UseHistoryResult<T> {
    const { maxHistory = 50 } = options;

    // We store the entire history in a single state object to ensure atomic updates
    const [history, setHistory] = useState<{
        past: T[];
        present: T;
        future: T[];
    }>({
        past: [],
        present: initialState,
        future: [],
    });

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    const undo = useCallback(() => {
        setHistory((curr) => {
            if (curr.past.length === 0) return curr;

            const previous = curr.past[curr.past.length - 1]; // Last item in past
            const newPast = curr.past.slice(0, curr.past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [curr.present, ...curr.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((curr) => {
            if (curr.future.length === 0) return curr;

            const next = curr.future[0]; // First item in future
            const newFuture = curr.future.slice(1);

            return {
                past: [...curr.past, curr.present],
                present: next,
                future: newFuture,
            };
        });
    }, []);

    const set = useCallback((newState: T) => {
        setHistory((curr) => {
            // If the new state is exactly the same (reference or shallow eq), ignore
            // For objects/arrays, usually we assume it's a new reference if it's an update.
            if (curr.present === newState) return curr;

            const newPast = [...curr.past, curr.present];

            // Enforce max history limit
            if (newPast.length > maxHistory) {
                newPast.shift(); // Remove oldest
            }

            return {
                past: newPast,
                present: newState,
                future: [], // Clear future on new change
            };
        });
    }, [maxHistory]);

    const clear = useCallback(() => {
        setHistory({
            past: [],
            present: initialState,
            future: [],
        });
    }, [initialState]);

    return useMemo(() => ({
        state: history.present,
        set,
        undo,
        redo,
        canUndo,
        canRedo,
        clear,
        historyLength: history.past.length + history.future.length + 1,
        historyIndex: history.past.length,
    }), [history, set, undo, redo, canUndo, canRedo, clear]);
}
