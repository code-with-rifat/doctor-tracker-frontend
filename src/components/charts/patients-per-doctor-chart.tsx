'use client';

import { memo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '@/components/charts/chart-card';

type Row = { name: string; count: number };

function PatientsPerDoctorChartComponent({ data }: { data: Row[] }) {
  const chartData = data.map((d) => ({
    ...d,
    shortName: d.name.replace(/^Dr\.\s*/, '').split(' ')[0],
  }));

  return (
    <ChartCard title="Patients per doctor">
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="shortName"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 12,
              }}
              formatter={(value) => [value as number, 'Patients']}
              labelFormatter={(_label, payload) =>
                (payload?.[0]?.payload as { name?: string } | undefined)?.name || ''
              }
            />
            <Bar dataKey="count" fill="#0F766E" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export const PatientsPerDoctorChart = memo(PatientsPerDoctorChartComponent);
