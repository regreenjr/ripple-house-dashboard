"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber, formatPercent, formatDelta, getDeltaColor } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'percent';
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export function KPICard({ title, value, previousValue, format = 'number', icon, tooltip, className }: KPICardProps) {
  const formattedValue = format === 'percent' ? formatPercent(value) : formatNumber(value);

  let delta: string | null = null;
  let deltaColor = 'text-muted-foreground';
  let TrendIcon = null;
  let change = 0;

  if (previousValue !== undefined && previousValue !== null) {
    change = value - previousValue;
    delta = formatDelta(value, previousValue);
    deltaColor = getDeltaColor(change);
    TrendIcon = change > 0 ? TrendingUp : TrendingDown;
  }

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200 border-border/50", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {delta && TrendIcon && (
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md",
              change > 0 ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"
            )}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{delta}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-3xl font-bold tracking-tight text-foreground">{formattedValue}</p>
          {icon && (
            <div className="p-3 bg-primary/15 rounded-full flex-shrink-0 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
