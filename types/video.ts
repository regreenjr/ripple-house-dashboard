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
