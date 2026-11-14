import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyPoint } from '../lib/types';

export default function StatsChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="h-64 w-full text-slate-500 dark:text-slate-400">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => value.slice(5)}
            fontSize={12}
            stroke="currentColor"
          />
          <YAxis allowDecimals={false} fontSize={12} stroke="currentColor" />
          <Tooltip
            labelFormatter={(value: string) => value}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="count" name="Clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
