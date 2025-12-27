import { useEffect, useRef, useState, type RefObject } from 'react';

interface UseIntersectionObserverProps extends IntersectionObserverInit {
    triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement>({
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = false,
}: UseIntersectionObserverProps = {}): [RefObject<T>, boolean] {
    const [entry, setEntry] = useState<boolean>(false);
    const elementRef = useRef<T>(null);

    const frozen = entry && triggerOnce;

    useEffect(() => {
        const node = elementRef?.current;
        const hasIOSupport = !!window.IntersectionObserver;

        if (!hasIOSupport || frozen || !node) return;

        const observerParams = { threshold, root, rootMargin };
        const observer = new IntersectionObserver(([entry]) => {
            setEntry(entry.isIntersecting);
        }, observerParams);

        observer.observe(node);

        return () => observer.disconnect();
    }, [elementRef, threshold, root, rootMargin, frozen]);

    return [elementRef, entry] as [RefObject<T>, boolean];
}
