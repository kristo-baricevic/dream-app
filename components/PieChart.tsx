'use client';

import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

type AnalysisData = {
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
    return { name: color, value: count, fill: color };
  });

  return (
    <>
      <div className="flex flex-col text-center">
        <h1 className="flex justify-center text-center">Dreams by Color Analysis</h1>
        <PieChart width={450} height={250}>
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
