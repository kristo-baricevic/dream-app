'use client';

import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

type AnalysisData = {
  mood: string;
  sentimentScore: number;
  createdAt: Date;
};

const RadarChartComponent: React.FC<{ data: AnalysisData[] }> = ({ data }) => {
  const uniqueMoods: string[] = Array.from(new Set(data.map((item: AnalysisData) => item.mood)));

  const moodData = uniqueMoods.map((mood, index) => {
    const count = data.filter((item) => item.mood === mood).length;
    return { mood, count };
  });

  const maxCount = Math.max(...moodData.map((item) => item.count));

  return (
    <div className="flex px-4">
      <RadarChart outerRadius={90} width={340} height={275} data={moodData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="mood" />
        <PolarRadiusAxis angle={30} domain={[0, maxCount]} />
        <Radar name="Dreams Per Mood" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Legend />
      </RadarChart>
    </div>
  );
};

export default RadarChartComponent;
