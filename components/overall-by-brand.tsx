"use client";

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Video, Users, Eye, Target } from 'lucide-react';
import { VideoPerformance, BrandAggregate } from '@/types/video';
import { aggregateByBrand } from '@/lib/videoUtils';
import { formatNumber } from '@/lib/formatters';
import { formatBrandName } from '@/lib/brandUtils';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OverallByBrandProps {
  videos: VideoPerformance[];
  isLoading: boolean;
  brandsInRange?: string[];
}

type SortField = 'total_views' | 'avg_views' | 'total_videos' | 'active_accounts' | 'avg_engagement_rate';

export const OverallByBrand = ({ videos, isLoading, brandsInRange }: OverallByBrandProps) => {
  const [sortField, setSortField] = useState<SortField>('total_views');

  // Aggregate by brand
  const brandAggregates = useMemo(() => {
    const aggregated = aggregateByBrand(videos);

    // Complete the list with all brands in range (even with zero metrics)
    if (brandsInRange && brandsInRange.length > 0) {
      const existingBrands = new Set(aggregated.map(b => b.brand));
      const missingBrands = brandsInRange.filter(brand => !existingBrands.has(brand));

      missingBrands.forEach(brand => {
        aggregated.push({
          brand,
          total_videos: 0,
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          total_shares: 0,
          total_saves: 0,
          total_interactions: 0,
          avg_views: 0,
          avg_engagement_rate: 0,
          active_accounts: 0,
        });
      });
    }

    return aggregated;
  }, [videos, brandsInRange]);

  // Sort by selected field
  const sortedBrands = useMemo(() => {
    return [...brandAggregates].sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return bVal - aVal;
    });
  }, [brandAggregates, sortField]);

  if (isLoading) {
    return (
      <Card className="bg-card/30 border-border/50 shadow-sm rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card/30 border-border/50 shadow-sm rounded-xl p-6">
      {/* Header with title and sort selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/15 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-foreground text-lg font-bold">Overall Performance by Brand</h3>
        </div>
        <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total_views">Total Views</SelectItem>
            <SelectItem value="avg_views">Avg Views</SelectItem>
            <SelectItem value="total_videos">Videos</SelectItem>
            <SelectItem value="active_accounts">Accounts</SelectItem>
            <SelectItem value="avg_engagement_rate">Engagement Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid of brand cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedBrands.map((brand) => (
          <BrandCard key={brand.brand} brand={brand} highlightMetric={sortField} />
        ))}
      </div>
    </Card>
  );
};

interface BrandCardProps {
  brand: BrandAggregate;
  highlightMetric: SortField;
}

const BrandCard = ({ brand, highlightMetric }: BrandCardProps) => {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200">
      {/* Header: Brand name */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
        <h4 className="text-foreground font-bold text-base truncate flex-1" title={brand.brand}>
          {formatBrandName(brand.brand)}
        </h4>
        <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <MetricRow
          label="Total Views"
          value={formatNumber(brand.total_views)}
          highlight={highlightMetric === 'total_views'}
          icon={<Eye className="h-3.5 w-3.5" />}
        />
        <MetricRow
          label="Avg Views"
          value={formatNumber(Math.round(brand.avg_views))}
          highlight={highlightMetric === 'avg_views'}
          icon={<Target className="h-3.5 w-3.5" />}
        />
        <MetricRow
          label="Videos"
          value={formatNumber(brand.total_videos)}
          highlight={highlightMetric === 'total_videos'}
          icon={<Video className="h-3.5 w-3.5" />}
        />
        <MetricRow
          label="Accounts"
          value={formatNumber(brand.active_accounts)}
          highlight={highlightMetric === 'active_accounts'}
          icon={<Users className="h-3.5 w-3.5" />}
        />
        <MetricRow
          label="Engagement"
          value={`${(brand.avg_engagement_rate * 100).toFixed(2)}%`}
          highlight={highlightMetric === 'avg_engagement_rate'}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
        />
      </div>
    </div>
  );
};

interface MetricRowProps {
  label: string;
  value: string;
  highlight: boolean;
  icon: React.ReactNode;
}

const MetricRow = ({ label, value, highlight, icon }: MetricRowProps) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
    <span className={cn(
      "text-sm font-semibold tabular-nums",
      highlight ? "text-primary" : "text-foreground"
    )}>
      {value}
    </span>
  </div>
);
