'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

type AnalysisData = {
  mood: string;
  color: string;
  sentimentScore: number;
  createdAt: Date;
};

const PieChartComponent: React.FC<{ data: AnalysisData[] }> = ({ data }) => {
  const uniqueColors: string[] = Array.from(new Set(data.map((item: AnalysisData) => item.color)));

  const colorData = uniqueColors.map((color) => {
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].color === color) {
        count++;
      }
    }
    return { name: data.find((d) => d.color === color)?.mood || color, value: count, fill: color };
  });

  return (
    <>
      <div className="flex w-full justify-center items-center flex-col text-center">
        <h1 className="flex justify-center text-center">Dreams by Color Analysis</h1>
        <PieChart width={350} height={250}>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Pie dataKey="value" data={colorData} nameKey="name" cx="50%" cy="50%" outerRadius={100}>
            {colorData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </div>
    </>
  );
};

export default PieChartComponent;
