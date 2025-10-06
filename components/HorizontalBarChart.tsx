'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';

type AnalysisData = {
  color: string;
  sentiment_score: number;
  createdAt: Date;
};

const HorizontalBarChartComponent: React.FC<{ data: AnalysisData[] }> = ({ data }) => {
  const goodDreams = data.filter((data) => data.sentiment_score > 3).length;
  const badDreams = data.filter((data) => data.sentiment_score <= 3).length;

  const chartData = [
    {
      category: 'Dreams',
      goodDreams: goodDreams,
      badDreams: badDreams,
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-2xl p-4">
      {/* <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl"> */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Dream Sentiment Analysis
      </h1>
      <p className="text-gray-600 mb-2 text-center">Good dreams have a sentiment score above 3</p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="category" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar
            dataKey="goodDreams"
            stackId="a"
            fill="#10b981"
            name="Good Dreams"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="badDreams"
            stackId="a"
            fill="#ef4444"
            name="Bad Dreams"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div className="text-green-700 text-sm font-semibold mb-1">Good Dreams</div>
          <div className="text-3xl font-bold text-green-600">{goodDreams}</div>
          <div className="text-green-600 text-sm mt-1">
            {((goodDreams / data.length) * 100).toFixed(1)}% of total
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <div className="text-red-700 text-sm font-semibold mb-1">Bad Dreams</div>
          <div className="text-3xl font-bold text-red-600">{badDreams}</div>
          <div className="text-red-600 text-sm mt-1">
            {((badDreams / data.length) * 100).toFixed(1)}% of total
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default HorizontalBarChartComponent;
