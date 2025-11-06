'use client';
import { ResponsiveContainer, Treemap } from 'recharts';

type SymbolCount = { symbol: string; count: number };

export default function SymbolsTreemap({ data }: { data: SymbolCount[] }) {
  const nodes = data.map((d) => ({ name: d.symbol, size: d.count }));
  return (
    <div style={{ width: '100%', height: 380 }}>
      <ResponsiveContainer>
        <Treemap data={nodes} dataKey="size" nameKey="name" />
      </ResponsiveContainer>
    </div>
  );
}
