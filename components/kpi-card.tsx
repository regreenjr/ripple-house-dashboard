"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  format?: 'number' | 'percent';
  tooltip?: string;
}

export function KPICard({ title, value, icon: Icon, format = 'number', tooltip }: KPICardProps) {
  const formattedValue = format === 'percent'
    ? `${(value * 100).toFixed(2)}%`
    : value.toLocaleString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent><p>{tooltip}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
      </CardContent>
    </Card>
  );
}
