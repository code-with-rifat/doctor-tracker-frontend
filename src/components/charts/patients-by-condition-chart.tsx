'use client';

import { memo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard } from '@/components/charts/chart-card';

const COLORS = [
  '#0F766E',
  '#0E7490',
  '#0369A1',
  '#1D4ED8',
  '#4338CA',
  '#A16207',
  '#B45309',
  '#BE123C',
];

function PatientsByConditionChartComponent({
  data,
}: {
  data: { condition: string; count: number }[];
}) {
  return (
    <ChartCard title="Patients by condition">
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="condition"
              innerRadius="55%"
              outerRadius="78%"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.condition} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid max-h-28 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
        {data.slice(0, 8).map((item, index) => (
          <div key={item.condition} className="flex items-center gap-2 text-xs text-slate-600">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">
              {item.condition} · {item.count}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export const PatientsByConditionChart = memo(PatientsByConditionChartComponent);
