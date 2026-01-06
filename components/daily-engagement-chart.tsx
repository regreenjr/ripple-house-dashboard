"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { DailyMetrics } from '@/types/video';
import { formatPercent } from '@/lib/formatters';
import { format, parseISO } from 'date-fns';

interface DailyEngagementChartProps {
  data: DailyMetrics[];
  isLoading?: boolean;
  timeWindow?: string;
}

export function DailyEngagementChart({ data, isLoading, timeWindow }: DailyEngagementChartProps) {
  const processedData = useMemo(() => {
    return data.map(item => ({
      date: format(parseISO(item.date), 'M/dd'),
      engagementRate: item.engagementRate,
    }));
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No data available for the selected period</p>
      </div>
    );
  }

  const getTickInterval = () => {
    const length = processedData.length;
    if (length <= 7) return 0;
    if (length <= 15) return Math.floor(length / 7);
    if (length <= 30) return Math.floor(length / 10);
    return Math.floor(length / 15);
  };

  return (
    <>
      {timeWindow === 'alltime' && data.length > 0 && (
        <div className="text-xs text-muted-foreground mb-2 px-2">
          📊 Showing last 30 days. KPIs above reflect full historical data.
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            interval={getTickInterval()}
          />
          <YAxis
            domain={['dataMin', 'dataMax']}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => formatPercent(value, 1)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value: any) => [formatPercent(value, 1), 'Engagement Rate']}
          />
          <Line
            type="monotone"
            dataKey="engagementRate"
            stroke="hsl(var(--accent))"
            strokeWidth={2.5}
            dot={{ fill: 'hsl(var(--accent))', r: 4 }}
            activeDot={{
              r: 6,
              fill: 'hsl(var(--accent))',
              strokeWidth: 2,
              stroke: 'hsl(var(--background))'
            }}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
