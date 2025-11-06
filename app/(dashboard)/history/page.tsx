'use client';
import { useEffect, useState } from 'react';
import HistoryChart from '@/components/HistoryChart';
import RadarChart from '@/components/RadarChart';
import PieChart from '@/components/PieChart';
import HorizontalBarChart from '@/components/HorizontalBarChart';
import { fetchAllSymbols } from '@/redux/slices/chartsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { RootState } from '@/redux/rootReducer';
import SymbolsCloud from '@/components/SymbolsCloud';

export const dynamic = 'force-dynamic';

type AnalysisType = any;

const History = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { symbols } = useSelector((state: RootState) => state.charts);
  const words = symbols.map((s) => ({ symbol: s.symbol, count: s.count }));
  // const words = symbols.map((d) => ({ text: d.symbol, value: d.count }));

  const [analyses, setAnalyses] = useState<AnalysisType[]>([]);
  const [avg, setAvg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchAllSymbols());
  }, [dispatch]);

  useEffect(() => {
    console.log('fetchAllSymbols', symbols);
  }, [symbols]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/history', { cache: 'no-store' });
        const json = await res.json();
        if (isMounted) {
          setAnalyses(json.analyses || []);
          setAvg(json.avg ?? null);
        }
      } catch (e) {
        console.error('Failed to load history data', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <></>;

  return (
    <div className="w-full h-full bg-pink-100 px-4 py-4">
      <div className="flex flex-col">
        <div className="w-full h-full bg-pink-200 px-4 py-4 rounded-lg mt-2">
          <HistoryChart data={analyses} />
        </div>
        <div className="flex w-full py-5 px-2 lg:gap-24 gap-8 flex-wrap justify-center rounded-lg mt-2 bg-pink-300">
          <div className="flex w-full max-w-[400px] py-10 px-2 bg-pink-100 rounded-lg shadow-md">
            <RadarChart data={analyses} />
          </div>
          <div className="flex w-full max-w-[400px] py-10 px-2 bg-pink-400 rounded-lg shadow-md">
            <PieChart data={analyses} />
          </div>
        </div>
        <div className="flex py-4 px-2 mt-2 bg-pink-600 rounded-lg shadow-md">
          <HorizontalBarChart data={analyses} />
        </div>
        <div className="flex py-4 px-2 mt-2 bg-pink-200 rounded-lg shadow-md">
          {/* {!loading && <SymbolsTreemap data={words} />} */}
          <SymbolsCloud data={words} />
        </div>
      </div>
    </div>
  );
};

export default History;
