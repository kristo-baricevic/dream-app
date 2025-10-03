'use client';

import { useEffect, useRef } from 'react';

type Props = {
  hasNext: boolean;
  onLoadMore: () => Promise<void>;
  rootMargin?: string;
};

export default function LoadSentinel({ hasNext, onLoadMore, rootMargin = '200px' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNext) return;

    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        if (inFlightRef.current) return;

        inFlightRef.current = true;
        try {
          await onLoadMore();
        } catch (err) {
          console.error('infinite scroll loadMore failed:', err);
        } finally {
          inFlightRef.current = false;
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [hasNext, onLoadMore, rootMargin]);

  return <div ref={ref} className="h-8 w-full" />;
}
