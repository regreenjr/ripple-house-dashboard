"use client";

import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Navigation } from '@/components/navigation';
import { KPICard } from '@/components/kpi-card';
import { DashboardFilters } from '@/components/dashboard-filters';
import { DailyViewsChart } from '@/components/daily-views-chart';
import { DailyEngagementChart } from '@/components/daily-engagement-chart';
import { DailyBreakdownChart } from '@/components/daily-breakdown-chart';
import { TopVideosTable } from '@/components/top-videos-table';
import { TopAccountsTable } from '@/components/top-accounts-table';
import { VideoAccountSearch } from '@/components/video-account-search';
import { OverallByBrand } from '@/components/overall-by-brand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play, Heart, MessageCircle, Share2, Bookmark, TrendingUp, Users, Video, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

async function fetchDashboardData(timeWindow: string = 'last30') {
  const response = await fetch(`/api/dashboard?timeWindow=${timeWindow}`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
}

export default function DashboardPage() {
  const { timeWindow, overallMode, setOverallMode } = useDashboardStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', timeWindow],
    queryFn: () => fetchDashboardData(timeWindow),
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="p-6 border border-destructive rounded-lg bg-destructive/5">
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    publishedVideos: 0, activeAccounts: 0, totalViews: 0, totalLikes: 0, totalComments: 0,
    totalShares: 0, totalBookmarks: 0, engagementRate: 0, videosWithZeroViewsPercent: 0, avgViews: 0
  };

  const totalDaysAvailable = data?.dailyMetrics?.length || 0;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {/* Filters Bar */}
          <div className="mb-6 flex items-start gap-6">
            {/* Data Reference Sidebar */}
            <div className="flex-shrink-0">
              <div className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                DATA REFERENCE
              </div>
              <div className="text-sm font-bold text-foreground mt-1">
                {data?.anchorDate ? format(new Date(data.anchorDate), 'MMM d, yyyy') : 'Jan 6, 2026'}
              </div>
            </div>

            {/* Filters */}
            <div className="flex-1">
              <DashboardFilters
                totalDays={totalDaysAvailable}
                isLoading={isLoading}
                brands={data?.brands || []}
                descriptionOptions={data?.descriptionOptions || []}
              />
            </div>

            {/* Overall Mode Toggle */}
            <div className="flex-shrink-0">
              <Button
                variant={overallMode ? "default" : "outline"}
                onClick={() => setOverallMode(!overallMode)}
                className={cn(
                  "gap-2",
                  overallMode && "bg-primary hover:bg-primary/90"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                {overallMode ? 'Show KPIs' : 'Show Overall by Brand'}
              </Button>
            </div>
          </div>

          {overallMode ? (
            <OverallByBrand videos={data?.dedupedData || []} isLoading={isLoading} brandsInRange={data?.brands} />
          ) : (
            <>
              {/* KPI Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 animate-fade-in">
                  <KPICard title="Published Videos" value={kpis.publishedVideos} icon={<Video className="h-5 w-5" />} tooltip="Total number of videos published" />
                  <KPICard title="Active Accounts" value={kpis.activeAccounts} icon={<Users className="h-5 w-5" />} tooltip="Number of unique accounts that posted videos" />
                  <KPICard title="Total Views" value={kpis.totalViews} icon={<Play className="h-5 w-5" />} tooltip="Cumulative number of video plays" />
                  <KPICard title="Avg Views per Video" value={Math.round(kpis.avgViews)} icon={<Eye className="h-5 w-5" />} tooltip="Average number of views per published video" />
                  <KPICard title="Total Likes" value={kpis.totalLikes} icon={<Heart className="h-5 w-5" />} tooltip="Total number of likes received" />
                  <KPICard title="Total Comments" value={kpis.totalComments} icon={<MessageCircle className="h-5 w-5" />} tooltip="Total number of comments" />
                  <KPICard title="Total Shares" value={kpis.totalShares} icon={<Share2 className="h-5 w-5" />} tooltip="Total number of shares" />
                  <KPICard title="Total Bookmarks" value={kpis.totalBookmarks} icon={<Bookmark className="h-5 w-5" />} tooltip="Total number of bookmarks/saves" />
                  <KPICard title="Engagement Rate" value={kpis.engagementRate} format="percent" icon={<TrendingUp className="h-5 w-5" />} tooltip="Average engagement rate (interactions/views)" />
                  <KPICard title="Videos with Zero Views" value={kpis.videosWithZeroViewsPercent} format="percent" icon={<EyeOff className="h-5 w-5" />} tooltip="Percentage of videos with no views" />
                </div>
              )}

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Metrics</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Daily performance overview</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? <Skeleton className="w-full h-full" /> : <DailyViewsChart data={data?.dailyMetrics || []} />}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Engagement</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Engagement rate trends</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <DailyEngagementChart data={data?.dailyMetrics || []} isLoading={isLoading} timeWindow={timeWindow} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Daily Engagement Breakdown
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Detailed view of engagement components and plays over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <DailyBreakdownChart data={data?.dailyMetrics || []} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopVideosTable videos={data?.dedupedData || []} isLoading={isLoading} />
          <TopAccountsTable videos={data?.dedupedData || []} isLoading={isLoading} />
        </div>

                <div className="mt-6">
                <VideoAccountSearch videos={data?.dedupedData || []} isLoading={isLoading} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
