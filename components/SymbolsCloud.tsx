'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useMemo } from 'react';
const WordCloud = dynamic(() => import('react-d3-cloud'), { ssr: false });

type Mode = 'all' | '25' | '10';

export default function SymbolsCloud({ data }: { data: { symbol: string; count: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<[number, number]>([0, 0]);
  const [mode, setMode] = useState<Mode>('all');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = Math.max(240, Math.round(w * 0.6));
      setSize([w, h]);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const sorted = useMemo(() => [...data].sort((a, b) => b.count - a.count), [data]);

  const limited = useMemo(() => {
    if (mode === '10') return sorted.slice(0, 10);
    if (mode === '25') return sorted.slice(0, 25);
    return sorted;
  }, [sorted, mode]);

  const words = useMemo(() => limited.map((d) => ({ text: d.symbol, value: d.count })), [limited]);

  const fontSize = (w: { value: number }) => 12 + Math.sqrt(w.value) * 12;

  const btn = (m: Mode, label: string) => (
    <button
      onClick={() => setMode(m)}
      className={
        `flex px-3 py-1 rounded-full text-sm border ` +
        (mode === m
          ? `bg-slate-700 text-white border-slate-600`
          : `bg-white text-slate-700 border-slate-600 hover:bg-slate-700/40`)
      }
      aria-pressed={mode === m}
    >
      {label}
    </button>
  );

  return (
    <div ref={ref} className="w-full">
      <h1 className="text-center text-2xl">Symbols</h1>
      <div className="flex flex-row justify-center gap-2 mt-2 mb-2">
        {btn('all', 'All')}
        {btn('25', 'Top 25')}
        {btn('10', 'Top 10')}
      </div>
      {size[0] > 0 && (
        <WordCloud data={words} width={size[0]} height={size[1]} fontSize={fontSize} />
      )}
    </div>
  );
}
