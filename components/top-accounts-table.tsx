"use client";

import { useMemo, useState } from 'react';
import { VideoPerformance, AccountAggregate } from '@/types/video';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ExternalLink } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { aggregateByAccount } from '@/lib/videoUtils';

interface TopAccountsTableProps {
  videos: VideoPerformance[];
  isLoading: boolean;
}

type SortField = 'total_views' | 'avg_engagement_rate' | 'followers' | 'total_videos';

const metricLabels: Record<SortField, string> = {
  total_views: 'Views',
  avg_engagement_rate: 'ER %',
  followers: 'Followers',
  total_videos: 'Videos'
};

export function TopAccountsTable({ videos, isLoading }: TopAccountsTableProps) {
  const [sortField, setSortField] = useState<SortField>('total_views');
  const [topCount, setTopCount] = useState<number>(5);

  const accountAggregates = useMemo(() => aggregateByAccount(videos), [videos]);

  const sortedAccounts = useMemo(() => {
    const sorted = [...accountAggregates].sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return bVal - aVal;
    });
    return sorted.slice(0, topCount);
  }, [accountAggregates, sortField, topCount]);

  const getInitials = (username: string): string => {
    return username.slice(0, 2).toUpperCase();
  };

  const getMetricValue = (account: AccountAggregate): number => {
    if (sortField === 'avg_engagement_rate') {
      return account.avg_engagement_rate * 100;
    }
    return account[sortField] || 0;
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
            <Users className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-base font-semibold">Top Accounts</CardTitle>
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
        {sortedAccounts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No accounts found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAccounts.map((account, idx) => (
              <a
                key={account.username}
                href={`https://tiktok.com/@${account.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-accent/5 transition-all group border border-border/50"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xs font-semibold">{idx + 1}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-bold">{getInitials(account.username)}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-bold mb-1 group-hover:text-primary transition-colors">
                    @{account.username}
                  </p>
                  <p className="text-muted-foreground text-xs flex items-center gap-2">
                    {formatNumber(account.followers)} followers • TikTok
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>

                <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-primary/10 text-right min-w-[100px]">
                  <p className="text-foreground text-lg font-bold">
                    {formatNumber(getMetricValue(account))}
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
