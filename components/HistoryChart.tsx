'use client';

import React from 'react';
import { ResponsiveContainer, Line, XAxis, Tooltip, LineChart, TooltipProps } from 'recharts';

type AnalysisData = {
  sentimentScore: number;
  createdAt: Date; 
  mood: string;
  color: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: AnalysisData }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {

  if (active && payload && payload.length) {
    const data = payload[0].payload as AnalysisData;
    const formattedDate = new Date(label ?? "").toLocaleString("en-us", {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

    return (
      <div className="p-8 custom-tooltip bg-white/5 shadow-md border border-black/10 rounded-lg backdrop-blur-md relative">
        <div
          className="absolute left-2 top-2 w-2 h-2 rounded-full"
          style={{ background: data.color }}
        ></div>
        <p className="label text-sm text-black/30">{formattedDate}</p>
        <p className="intro text-xl uppercase">{data.mood}</p>
      </div>
    );
  }
  return null;
};

const HistoryChart: React.FC<{ data: AnalysisData[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width={"100%"} height={400}>
      <LineChart width={300} height={100} data={data}>
        <Line
          dataKey="sentimentScore"
          type="monotone"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <XAxis dataKey="createdAt" tickFormatter={(tick) => new Date(tick).toLocaleDateString()} />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoryChart;
