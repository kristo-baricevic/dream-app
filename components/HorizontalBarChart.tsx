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
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl shadow-2xl p-4">
      {/* <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl"> */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Good Dream to Bad Dream Ratio
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
            fill="#00897B"
            name="Good Dreams"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="badDreams"
            stackId="a"
            fill="#7B1FA2"
            name="Bad Dreams"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-teal-50 rounded-lg p-4 border-2 border-teal-700">
          <div className="text-teal-700 text-sm font-semibold mb-1">Good Dreams</div>
          <div className="text-3xl font-bold text-teal-600">{goodDreams}</div>
          <div className="text-teal-600 text-sm mt-1">
            {((goodDreams / data.length) * 100).toFixed(1)}% of total
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-700">
          <div className="text-purple-700 text-sm font-semibold mb-1">Bad Dreams</div>
          <div className="text-3xl font-bold text-purple-600">{badDreams}</div>
          <div className="text-purple-600 text-sm mt-1">
            {((badDreams / data.length) * 100).toFixed(1)}% of total
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default HorizontalBarChartComponent;
