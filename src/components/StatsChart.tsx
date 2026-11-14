import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useState } from 'react';
import type { DailyPoint } from '../lib/types';
import { formatNumber } from '../lib/format';

interface StatsChartProps {
  data: DailyPoint[];
}

export default function StatsChart({ data }: StatsChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const totalClicksInPeriod = data.reduce((sum, item) => sum + item.count, 0);
  const maxClicks = Math.max(...data.map((d) => d.count), 0);

  return (
    <div className="space-y-4">
      {/* Header controls inside chart */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Period Total: <strong className="text-slate-900 dark:text-white font-semibold">{formatNumber(totalClicksInPeriod)}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Peak: <strong className="text-slate-900 dark:text-white font-semibold">{formatNumber(maxClicks)}</strong>
          </span>
        </div>

        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
              chartType === 'area'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
            Smooth
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
              chartType === 'bar'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Bars
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full text-slate-500 dark:text-slate-400">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
              <defs>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="opacity-[0.12] dark:opacity-[0.1]"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => {
                  try {
                    const date = new Date(value);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  } catch {
                    return value.slice(5);
                  }
                }}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-500"
              />
              <YAxis
                allowDecimals={false}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-500"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length && payload[0]) {
                    const dateStr = String(label);
                    let formattedDate = dateStr;
                    try {
                      formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    } catch {
                      // fallback
                    }
                    const val = payload[0].value !== undefined ? Number(payload[0].value) : 0;
                    return (
                      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 dark:shadow-2xl">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {formattedDate}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                          <span>{formatNumber(val)} clicks</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Clicks"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#clickGradient)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff', fill: '#4f46e5' }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="opacity-[0.12] dark:opacity-[0.1]"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => {
                  try {
                    const date = new Date(value);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  } catch {
                    return value.slice(5);
                  }
                }}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-500"
              />
              <YAxis
                allowDecimals={false}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-500"
              />
              <Tooltip
                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length && payload[0]) {
                    const dateStr = String(label);
                    let formattedDate = dateStr;
                    try {
                      formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    } catch {
                      // fallback
                    }
                    const val = payload[0].value !== undefined ? Number(payload[0].value) : 0;
                    return (
                      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 dark:shadow-2xl">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {formattedDate}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                          <span>{formatNumber(val)} clicks</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                name="Clicks"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
