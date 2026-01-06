"use client";

import { useDashboardStore } from '@/stores/dashboardStore';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TimeWindow, DescriptionOption } from '@/types/video';
import { BrandFilter } from '@/components/brand-filter';
import { DescriptionFilter } from '@/components/description-filter';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

interface DashboardFiltersProps {
  totalDays?: number;
  isLoading?: boolean;
  brands?: string[];
  descriptionOptions?: DescriptionOption[];
}

export function DashboardFilters({ totalDays = 0, isLoading = false, brands = [], descriptionOptions = [] }: DashboardFiltersProps) {
  const {
    timeWindow,
    setTimeWindow,
    hideUnknown,
    setHideUnknown,
    customRange,
    setCustomRange,
    anchorDate,
    overallMode,
    setOverallMode
  } = useDashboardStore();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    customRange?.start && customRange?.end
      ? { from: parseISO(customRange.start), to: parseISO(customRange.end) }
      : undefined
  );

  const handleTimeWindowChange = (window: TimeWindow) => {
    setTimeWindow(window);
    if (window !== 'custom') {
      setCustomRange(null);
    }
  };

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setCustomRange({
        start: format(range.from, 'yyyy-MM-dd'),
        end: format(range.to, 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* Filters */}
        <BrandFilter brands={brands} isLoading={isLoading} />
        <DescriptionFilter availableOptions={descriptionOptions} isLoading={isLoading} />

        {/* Period label */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground/70">Period:</span>
          <Button
            variant={timeWindow === 'daily' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTimeWindowChange('daily')}
            className={cn(
              "h-8 px-3 text-xs rounded-md transition-all",
              timeWindow === 'daily'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
            )}
          >
            Daily
          </Button>
          <Button
            variant={timeWindow === 'last7' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTimeWindowChange('last7')}
            className={cn(
              "h-8 px-3 text-xs rounded-md transition-all",
              timeWindow === 'last7'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
            )}
          >
            Last 7 Days
          </Button>
          <Button
            variant={timeWindow === 'last30' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTimeWindowChange('last30')}
            className={cn(
              "h-8 px-3 text-xs rounded-md transition-all",
              timeWindow === 'last30'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
            )}
          >
            Last 30 Days
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={timeWindow === 'custom' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  if (timeWindow !== 'custom') {
                    handleTimeWindowChange('custom');
                  }
                }}
                className={cn(
                  "h-8 px-3 text-xs rounded-md transition-all",
                  timeWindow === 'custom'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
                )}
              >
                Custom Period
              </Button>
            </PopoverTrigger>
            {timeWindow === 'custom' && (
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleCustomRangeSelect}
                  numberOfMonths={2}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            )}
          </Popover>

          <Button
            variant={timeWindow === 'alltime' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTimeWindowChange('alltime')}
            className={cn(
              "h-8 px-3 text-xs rounded-md transition-all",
              timeWindow === 'alltime'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
            )}
          >
            All Time ({isLoading ? '—' : totalDays})
          </Button>
        </div>
      </div>

      {/* Custom Range Display */}
      {timeWindow === 'custom' && customRange && (
        <div className="text-xs text-muted-foreground">
          Showing data from {format(parseISO(customRange.start), 'MMM d, yyyy')} to {format(parseISO(customRange.end), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
}
