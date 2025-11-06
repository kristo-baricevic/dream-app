'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
const WordCloud = dynamic(() => import('react-d3-cloud'), { ssr: false });

export default function SymbolsCloud({ data }: { data: { symbol: string; count: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = Math.max(240, Math.round(w * 0.6)); // responsive height
      setSize([w, h]);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const words = data.map((d) => ({ text: d.symbol, value: d.count }));
  const fontSize = (w: { value: number }) => 12 + Math.sqrt(w.value) * 12;

  return (
    <div ref={ref} className="w-full">
      <h1 className="text-center text-2xl">Symbols</h1>
      {size[0] > 0 && (
        <WordCloud data={words} width={size[0]} height={size[1]} fontSize={fontSize} />
      )}
    </div>
  );
}
