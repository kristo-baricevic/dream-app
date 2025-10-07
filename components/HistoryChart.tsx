'use client';

import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, Line, XAxis, Tooltip, LineChart } from 'recharts';

type AnalysisData = {
  sentiment_score: number;
  created_at: Date;
  mood: string;
  color: string;
};

type ViewMode = 'day' | 'week' | 'month';

type AggregatedData = {
  period: string;
  total_sentiment: number;
  count: number;
  date: Date;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: AggregatedData }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as AggregatedData;

    return (
      <div className="p-4 custom-tooltip bg-white shadow-md border border-gray-200 rounded-lg">
        <p className="label text-sm text-gray-600 mb-1">{data.period}</p>
        <p className="text-lg font-semibold text-gray-800">
          Total Sentiment: {data.total_sentiment.toFixed(1)}
        </p>
        <p className="text-sm text-gray-500">
          {data.count} dream{data.count !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

const HistoryChart: React.FC<{ data: AnalysisData[] }> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const formatPeriod = (date: Date, mode: ViewMode): string => {
    switch (mode) {
      case 'day':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      case 'week':
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const aggregatedData = useMemo(() => {
    // For day view, show individual dreams without aggregation
    if (viewMode === 'day') {
      return data
        .map((entry) => ({
          period: new Date(entry.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          total_sentiment: entry.sentiment_score,
          count: 1,
          date: new Date(entry.created_at),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    // For week and month views, aggregate the data
    const grouped = new Map<string, { total: number; count: number; date: Date }>();

    data.forEach((entry) => {
      const date = new Date(entry.created_at);
      let key: string;
      let periodDate: Date;

      switch (viewMode) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          periodDate = weekStart;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          periodDate = new Date(date.getFullYear(), date.getMonth(), 1);
          break;
        default:
          return;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { total: 0, count: 0, date: periodDate });
      }

      const group = grouped.get(key)!;
      group.total += entry.sentiment_score;
      group.count += 1;
    });

    const result: AggregatedData[] = Array.from(grouped.entries())
      .map(([key, value]) => ({
        period: formatPeriod(value.date, viewMode),
        total_sentiment: value.total,
        count: value.count,
        date: value.date,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return result;
  }, [data, viewMode]);

  return (
    <div className="px-4">
      <div className="flex font-semibold justify-between items-center mb-4">
        <h1 className="text-xl">Sentiment Analysis</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'day'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
        </div>
      </div>
      <ResponsiveContainer width={'100%'} height={400}>
        <LineChart width={300} height={100} data={aggregatedData}>
          <Line
            dataKey="total_sentiment"
            type="monotone"
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
          <XAxis
            dataKey="period"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
