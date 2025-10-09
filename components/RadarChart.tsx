'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type AnalysisData = {
  mood: string;
  sentimentScore: number;
  createdAt: Date;
};

const RadarChartComponent: React.FC<{ data: AnalysisData[] }> = ({ data }) => {
  const uniqueMoods: string[] = Array.from(new Set(data.map((item) => item.mood)));

  const moodData = uniqueMoods.map((mood) => {
    const count = data.filter((item) => item.mood === mood).length;
    return { mood, count };
  });

  const maxCount = Math.max(...moodData.map((item) => item.count));

  return (
    <div className="flex flex-col w-full px-4 py-4 items-center justify-center">
      <h1 className="mb-3 text-center">Dreams Per Mood</h1>
      <div className="w-full h-[320px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            outerRadius="65%"
            data={moodData}
            // margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <PolarGrid />
            {/* Full labels on md+ screens, none on small */}
            <PolarAngleAxis
              dataKey="mood"
              tick={({ x, y, payload }) => (
                <text x={x} y={y} textAnchor="middle" fill="#555" className="hidden sm:block">
                  {payload.value}
                </text>
              )}
            />
            <PolarRadiusAxis angle={30} domain={[0, maxCount]} />
            <Radar
              name="Dreams Per Mood"
              dataKey="count"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            {/* Tooltip for small screens */}
            <Tooltip
              cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.85rem',
              }}
              labelFormatter={(mood) => `Mood: ${mood}`}
              formatter={(value) => [`Count: ${value}`]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RadarChartComponent;
