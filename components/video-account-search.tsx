"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SearchX, Play, ExternalLink } from 'lucide-react';
import { VideoPerformance } from '@/types/video';
import { aggregateByAccount } from '@/lib/videoUtils';
import { formatNumber, formatPercent } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoAccountSearchProps {
  videos: VideoPerformance[];
  isLoading: boolean;
}

export function VideoAccountSearch({ videos, isLoading }: VideoAccountSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'videos' | 'accounts'>('videos');
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchedVideos = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const query = debouncedQuery.toLowerCase();
    return videos
      .filter(v =>
        v.description.toLowerCase().includes(query) ||
        v.username.toLowerCase().includes(query) ||
        v.video_id.toLowerCase().includes(query)
      )
      .map(v => ({
        ...v,
        interactions: (v.likes || 0) + (v.comments || 0) + (v.shares || 0) + (v.saves || 0),
        engagement_rate: v.plays > 0 ? ((v.likes || 0) + (v.comments || 0) + (v.shares || 0) + (v.saves || 0)) / v.plays : 0
      }))
      .sort((a, b) => b.plays - a.plays);
  }, [videos, debouncedQuery]);

  const searchedAccounts = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const query = debouncedQuery.toLowerCase();
    const aggregated = aggregateByAccount(videos);

    return aggregated
      .filter(a => a.username.toLowerCase().includes(query))
      .sort((a, b) => b.total_views - a.total_views);
  }, [videos, debouncedQuery]);

  const currentResults = searchMode === 'videos' ? searchedVideos : searchedAccounts;
  const totalPages = Math.ceil(currentResults.length / resultsPerPage);
  const paginatedResults = currentResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const truncateText = (text: string | undefined, maxLength: number = 80) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Search Videos & Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username, description, or video ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'videos' | 'accounts')}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="videos">
                  Videos ({searchedVideos.length})
                </TabsTrigger>
                <TabsTrigger value="accounts">
                  Accounts ({searchedAccounts.length})
                </TabsTrigger>
              </TabsList>

              {debouncedQuery && currentResults.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Show</span>
                  <Select
                    value={resultsPerPage.toString()}
                    onValueChange={(v) => {
                      setResultsPerPage(Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <TabsContent value="videos" className="mt-4">
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : !debouncedQuery ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Type to search videos</p>
                    <p className="text-xs opacity-60 mt-1">Search by username, description, or video ID</p>
                  </div>
                ) : searchedVideos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <SearchX className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No videos found for "{debouncedQuery}"</p>
                    <p className="text-xs opacity-60 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <>
                    {(paginatedResults as any[]).map((video) => (
                      <a
                        key={video.id}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-xl bg-background hover:bg-accent/10 transition-all border border-border/50 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <Play className="h-5 w-5 text-accent" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {truncateText(video.description)}
                          </p>
                          <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-2">
                            @{video.username} • {formatNumber(video.plays)} views
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-foreground text-sm font-semibold">{formatNumber(video.likes)}</p>
                            <p className="text-muted-foreground text-xs">Likes</p>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground text-sm font-semibold">{formatPercent(video.engagement_rate)}</p>
                            <p className="text-muted-foreground text-xs">Eng. Rate</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="accounts" className="mt-4">
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : !debouncedQuery ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Type to search accounts</p>
                    <p className="text-xs opacity-60 mt-1">Search by username</p>
                  </div>
                ) : searchedAccounts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <SearchX className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No accounts found for "{debouncedQuery}"</p>
                    <p className="text-xs opacity-60 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <>
                    {(paginatedResults as any[]).map((account) => (
                      <a
                        key={account.username}
                        href={`https://tiktok.com/@${account.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-xl bg-background hover:bg-accent/10 transition-all border border-border/50 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center flex-shrink-0">
                          <span className="text-accent-foreground text-sm font-bold">
                            {getInitials(account.username)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-bold group-hover:text-primary transition-colors">@{account.username}</p>
                          <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-2">
                            {formatNumber(account.followers)} followers • {account.total_videos} videos
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-foreground text-sm font-semibold">{formatNumber(account.total_views)}</p>
                            <p className="text-muted-foreground text-xs">Total Views</p>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground text-sm font-semibold">{formatPercent(account.avg_engagement_rate)}</p>
                            <p className="text-muted-foreground text-xs">Avg Eng.</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {debouncedQuery && currentResults.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} • {currentResults.length} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded-md bg-background border border-border/50 hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded-md bg-background border border-border/50 hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
