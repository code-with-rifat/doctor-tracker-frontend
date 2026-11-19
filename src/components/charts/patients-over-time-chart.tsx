'use client';

import { memo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '@/components/charts/chart-card';
import { cn } from '@/lib/utils';

type DayRow = { date: string; count: number };
type MonthRow = { month: string; count: number };

function PatientsOverTimeChartComponent({
  last30Days,
  last12Months,
}: {
  last30Days: DayRow[];
  last12Months: MonthRow[];
}) {
  const [range, setRange] = useState<'30d' | '12m'>('30d');
  const data =
    range === '30d'
      ? last30Days.map((d) => ({ label: d.date.slice(5), count: d.count, full: d.date }))
      : last12Months.map((d) => ({ label: d.month, count: d.count, full: d.month }));

  return (
    <ChartCard
      title="Patients over time"
      actions={
        <div className="flex rounded-lg border border-slate-200 p-0.5">
          {(
            [
              ['30d', '30 days'],
              ['12m', '12 months'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium',
                range === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F766E" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0F766E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 12,
              }}
              labelFormatter={(_label, payload) =>
                (payload?.[0]?.payload as { full?: string } | undefined)?.full || ''
              }
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#0F766E"
              strokeWidth={2}
              fill="url(#patientsFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export const PatientsOverTimeChart = memo(PatientsOverTimeChartComponent);
