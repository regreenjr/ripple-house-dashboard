"use client";

import { useState, useMemo } from 'react';
import { VideoPerformance, ProcessedVideo } from '@/types/video';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Trophy, ExternalLink } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { processVideos, truncateDescription } from '@/lib/videoUtils';

interface TopVideosTableProps {
  videos: VideoPerformance[];
  isLoading: boolean;
}

type SortField = 'plays' | 'likes' | 'comments' | 'shares' | 'engagement_rate';

const metricLabels: Record<SortField, string> = {
  plays: 'Views',
  likes: 'Likes',
  comments: 'Comments',
  shares: 'Shares',
  engagement_rate: 'ER %'
};

export function TopVideosTable({ videos, isLoading }: TopVideosTableProps) {
  const [sortField, setSortField] = useState<SortField>('plays');
  const [topCount, setTopCount] = useState<number>(5);

  const processedVideos = useMemo(() => processVideos(videos), [videos]);

  const sortedVideos = useMemo(() => {
    const sorted = [...processedVideos].sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return bVal - aVal;
    });
    return sorted.slice(0, topCount);
  }, [processedVideos, sortField, topCount]);

  const getMetricValue = (video: ProcessedVideo): number => {
    if (sortField === 'engagement_rate') {
      return video.engagement_rate * 100;
    }
    return video[sortField] || 0;
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/30">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base font-semibold">Top Videos</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Select value={topCount.toString()} onValueChange={(v) => setTopCount(Number(v))}>
              <SelectTrigger className="w-[70px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedVideos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Play className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No videos found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedVideos.map((video, idx) => (
              <a
                key={video.video_key}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-accent/5 transition-all group border border-border/50"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xs font-semibold">{idx + 1}</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium truncate mb-1 group-hover:text-primary transition-colors">
                    {truncateDescription(video.description, 80)}
                  </p>
                  <p className="text-muted-foreground text-xs flex items-center gap-2">
                    @{video.username} • TikTok
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>

                <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-primary/10 text-right min-w-[100px]">
                  <p className="text-foreground text-lg font-bold">
                    {formatNumber(getMetricValue(video))}
                  </p>
                  <p className="text-muted-foreground text-xs">{metricLabels[sortField]}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
