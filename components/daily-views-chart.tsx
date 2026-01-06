"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface DailyViewsChartProps {
  data: Array<{ date: string; plays: number; likes: number; comments: number; shares: number; }>;
}

export function DailyViewsChart({ data }: DailyViewsChartProps) {
  const chartData = data.map(d => ({ ...d, formattedDate: format(new Date(d.date), 'MMM d') }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="formattedDate" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="plays" stroke="#8884d8" name="Views" />
        <Line type="monotone" dataKey="likes" stroke="#82ca9d" name="Likes" />
      </LineChart>
    </ResponsiveContainer>
  );
}
