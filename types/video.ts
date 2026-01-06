export interface VideoPerformance {
  id: number;
  brand: string;
  username: string;
  followers: number;
  video_id: string;
  video_key: string;
  description: string;
  url: string;
  saves: number;
  shares: number;
  comments: number;
  likes: number;
  plays: number;
  interactions: number;
  engagement_rate_video: number;
  date_posted: string;
  date_scraped: string;
  inserted_at: string;
}

export interface IngestRun {
  id: string;
  source_file: string;
  scrape_date: string;
  status: 'pending' | 'processed' | 'failed';
  rows_in: number;
  rows_valid: number;
  rows_dropped: number;
  rows_deduped: number;
  created_at: string;
}

export interface KPIData {
  publishedVideos: number;
  activeAccounts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalBookmarks: number;
  engagementRate: number;
  videosWithZeroViews: number;
  videosWithZeroViewsPercent: number;
  avgViews: number;
}

export interface DailyMetrics {
  date: string;
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  interactions: number;
  engagementRate: number;
}

export type TimeWindow = 'daily' | 'last7' | 'last30' | 'custom' | 'alltime';

export interface QueryParams {
  mode: 'admin' | 'client';
  brand?: string;
  timeWindow: TimeWindow;
  anchorDate?: string;
  customRange?: {
    start: string;
    end: string;
  };
  selectedBrands?: string[];
  hideUnknown?: boolean;
}

export interface QueryResponse {
  allData: VideoPerformance[];
  dedupedData: VideoPerformance[];
  previousData: VideoPerformance[];
  kpis: KPIData;
  previousKpis: KPIData;
  dailyMetrics: DailyMetrics[];
  previousDailyMetrics: DailyMetrics[];
  totalDaysAvailable: number;
  brandsInRange?: string[];
  recent15Data?: VideoPerformance[];
}

export interface ProcessedVideo extends VideoPerformance {
  interactions: number;
  engagement_rate: number;
}

export interface AccountAggregate {
  username: string;
  brands: string[];
  followers: number;
  total_videos: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_interactions: number;
  avg_engagement_rate: number;
}

export interface BestPerformingAccount {
  username: string;
  brands: string[];
  followers: number;
  total_videos: number;
  total_views: number;
  avg_views: number;
  min_views: number;
  max_views: number;
  days_with_posts: number;
}

export interface BrandAggregate {
  brand: string;
  total_videos: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_saves: number;
  total_interactions: number;
  avg_engagement_rate: number;
  active_accounts: number;
  avg_views: number;
}

// Description Filter Types
export type DescriptionMatchMode = 'exact' | 'contains';
export type DescriptionCombineMode = 'OR' | 'AND';

export interface DescriptionFilterState {
  selectedDescriptions: string[];
  matchMode: DescriptionMatchMode;
  combineMode: DescriptionCombineMode;
}

export interface DescriptionOption {
  id: string;
  text: string;
  normalizedText: string;
  count: number;
  firstPosted: string;
  lastPosted: string;
}
