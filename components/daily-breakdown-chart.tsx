"use client";

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { DailyMetrics } from '@/types/video';
import { formatNumber } from '@/lib/formatters';
import { format, parseISO } from 'date-fns';

interface DailyBreakdownChartProps {
  data: DailyMetrics[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border/50 bg-popover p-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#fb923c]" />
            <span className="text-xs text-muted-foreground">Plays:</span>
            <span className="text-xs font-mono text-foreground ml-auto">
              {formatNumber(payload.find((p: any) => p.dataKey === 'plays')?.value || 0)}
            </span>
          </div>

          {['likes', 'comments', 'shares', 'saves'].map((key) => {
            const colors: Record<string, string> = {
              likes: '#06b6d4',
              comments: '#3b82f6',
              shares: '#10b981',
              saves: '#a855f7'
            };

            return (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: colors[key] }}
                />
                <span className="text-xs text-muted-foreground capitalize">{key}:</span>
                <span className="text-xs font-mono text-foreground ml-auto">
                  {formatNumber(payload.find((p: any) => p.dataKey === key)?.value || 0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function DailyBreakdownChart({ data, isLoading }: DailyBreakdownChartProps) {
  const processedData = useMemo(() => {
    return data.map(item => ({
      date: format(parseISO(item.date), 'M/dd'),
      likes: item.likes,
      comments: item.comments,
      shares: item.shares,
      saves: item.saves,
      plays: item.plays,
    }));
  }, [data]);

  const getTickInterval = () => {
    const length = processedData.length;
    if (length <= 7) return 0;
    if (length <= 15) return Math.floor(length / 7);
    if (length <= 30) return Math.floor(length / 10);
    return Math.floor(length / 15);
  };

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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
            <stop offset="100%" stopColor="#0891b2" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
            <stop offset="100%" stopColor="#9333ea" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
          interval={getTickInterval()}
          label={{
            value: 'Date',
            position: 'insideBottom',
            offset: -10,
            style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
          }}
        />
        <YAxis
          yAxisId="left"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
          tickFormatter={formatNumber}
          width={80}
          label={{
            value: 'Engagement Metrics',
            angle: -90,
            position: 'insideLeft',
            offset: 10,
            style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12, textAnchor: 'middle' }
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#fb923c"
          tick={{ fill: '#fb923c', fontSize: 12 }}
          tickLine={{ stroke: '#fb923c' }}
          tickFormatter={formatNumber}
          width={80}
          label={{
            value: 'Plays (Views)',
            angle: 90,
            position: 'insideRight',
            offset: 10,
            style: { fill: '#fb923c', fontSize: 12, textAnchor: 'middle' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="square"
          iconSize={10}
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '12px',
            color: 'hsl(var(--muted-foreground))'
          }}
        />
        <Bar
          yAxisId="left"
          dataKey="likes"
          stackId="engagement"
          fill="url(#colorLikes)"
          radius={[0, 0, 0, 0]}
          maxBarSize={50}
          animationDuration={800}
        />
        <Bar
          yAxisId="left"
          dataKey="comments"
          stackId="engagement"
          fill="url(#colorComments)"
          radius={[0, 0, 0, 0]}
          maxBarSize={50}
          animationDuration={800}
        />
        <Bar
          yAxisId="left"
          dataKey="shares"
          stackId="engagement"
          fill="url(#colorShares)"
          radius={[0, 0, 0, 0]}
          maxBarSize={50}
          animationDuration={800}
        />
        <Bar
          yAxisId="left"
          dataKey="saves"
          stackId="engagement"
          fill="url(#colorSaves)"
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
          animationDuration={800}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="plays"
          stroke="#fb923c"
          strokeWidth={2.5}
          dot={{ fill: '#fb923c', r: 3 }}
          activeDot={{ r: 5, fill: '#fb923c', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
          animationDuration={1000}
          animationEasing="ease-in-out"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
