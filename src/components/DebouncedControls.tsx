import { useState, useEffect, useRef } from 'react';

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string | number;
    onChange: (value: string) => void;
    delay?: number;
}

interface DebouncedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    delay?: number;
}

export function DebouncedInput({
    value: initialValue,
    onChange,
    delay = 300,
    ...props
}: DebouncedInputProps) {
    const [localValue, setLocalValue] = useState(initialValue);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync from parent if parent changes externally (e.g. undo/redo)
    // We strictly compare to avoid resetting cursor if we are the ones who triggered the change
    // Ideally, we only sync if the incoming value is different from what we last sent or current local
    useEffect(() => {
        setLocalValue(initialValue);
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            onChange(newValue);
        }, delay);
    };

    return (
        <input
            {...props}
            value={localValue}
            onChange={handleChange}
        />
    );
}

export function DebouncedTextarea({
    value: initialValue,
    onChange,
    delay = 300,
    ...props
}: DebouncedTextareaProps) {
    const [localValue, setLocalValue] = useState(initialValue);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setLocalValue(initialValue);
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            onChange(newValue);
        }, delay);
    };

    return (
        <textarea
            {...props}
            value={localValue}
            onChange={handleChange}
        />
    );
}
