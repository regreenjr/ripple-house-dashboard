import { VideoPerformance, ProcessedVideo, AccountAggregate, BestPerformingAccount, BrandAggregate } from '@/types/video';

export const processVideos = (videos: VideoPerformance[]): ProcessedVideo[] => {
  return videos.map(v => ({
    ...v,
    interactions: (v.likes || 0) + (v.comments || 0) + (v.shares || 0) + (v.saves || 0),
    engagement_rate: v.plays > 0 ? ((v.likes || 0) + (v.comments || 0) + (v.shares || 0) + (v.saves || 0)) / v.plays : 0
  }));
};

export const aggregateByAccount = (videos: VideoPerformance[]): AccountAggregate[] => {
  const accountMap = new Map<string, AccountAggregate>();

  videos.forEach(video => {
    if (!video.username) return;

    const existing = accountMap.get(video.username);
    const interactions = (video.likes || 0) + (video.comments || 0) + (video.shares || 0) + (video.saves || 0);

    if (!existing) {
      accountMap.set(video.username, {
        username: video.username,
        brands: [video.brand],
        followers: video.followers || 0,
        total_videos: 1,
        total_views: video.plays || 0,
        total_likes: video.likes || 0,
        total_comments: video.comments || 0,
        total_shares: video.shares || 0,
        total_interactions: interactions,
        avg_engagement_rate: 0
      });
    } else {
      existing.total_videos += 1;
      existing.total_views += video.plays || 0;
      existing.total_likes += video.likes || 0;
      existing.total_comments += video.comments || 0;
      existing.total_shares += video.shares || 0;
      existing.total_interactions += interactions;
      if (!existing.brands.includes(video.brand)) {
        existing.brands.push(video.brand);
      }
      if (video.followers > existing.followers) {
        existing.followers = video.followers;
      }
    }
  });

  return Array.from(accountMap.values()).map(account => ({
    ...account,
    avg_engagement_rate: account.total_views > 0 ? account.total_interactions / account.total_views : 0
  }));
};

export const truncateDescription = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const aggregateByBrand = (videos: VideoPerformance[]): BrandAggregate[] => {
  const brandMap = new Map<string, {
    brand: string;
    total_videos: number;
    total_views: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    total_saves: number;
    total_interactions: number;
    accounts: Set<string>;
  }>();

  videos.forEach(video => {
    const brandName = video.brand || 'Unknown';
    const existing = brandMap.get(brandName);

    const interactions = (video.likes || 0) + (video.comments || 0) +
                        (video.shares || 0) + (video.saves || 0);

    if (!existing) {
      brandMap.set(brandName, {
        brand: brandName,
        total_videos: 1,
        total_views: video.plays || 0,
        total_likes: video.likes || 0,
        total_comments: video.comments || 0,
        total_shares: video.shares || 0,
        total_saves: video.saves || 0,
        total_interactions: interactions,
        accounts: new Set([video.username]),
      });
    } else {
      existing.total_videos += 1;
      existing.total_views += video.plays || 0;
      existing.total_likes += video.likes || 0;
      existing.total_comments += video.comments || 0;
      existing.total_shares += video.shares || 0;
      existing.total_saves += video.saves || 0;
      existing.total_interactions += interactions;
      existing.accounts.add(video.username);
    }
  });

  return Array.from(brandMap.values()).map(brand => ({
    brand: brand.brand,
    total_videos: brand.total_videos,
    total_views: brand.total_views,
    total_likes: brand.total_likes,
    total_comments: brand.total_comments,
    total_shares: brand.total_shares,
    total_saves: brand.total_saves,
    total_interactions: brand.total_interactions,
    active_accounts: brand.accounts.size,
    avg_engagement_rate: brand.total_views > 0
      ? brand.total_interactions / brand.total_views
      : 0,
    avg_views: brand.total_videos > 0
      ? brand.total_views / brand.total_videos
      : 0,
  }));
};

export const getBestPerformingAccounts = (videos: VideoPerformance[]): BestPerformingAccount[] => {
  const accountMap = new Map<string, {
    username: string;
    brands: Set<string>;
    followers: number;
    postDates: Set<string>;
    videos: VideoPerformance[];
  }>();

  videos.forEach(video => {
    if (!video.username) return;

    const existing = accountMap.get(video.username);
    if (!existing) {
      accountMap.set(video.username, {
        username: video.username,
        brands: new Set([video.brand]),
        followers: video.followers || 0,
        postDates: new Set([video.date_posted]),
        videos: [video],
      });
    } else {
      existing.brands.add(video.brand);
      existing.postDates.add(video.date_posted);
      existing.videos.push(video);
      if (video.followers > existing.followers) {
        existing.followers = video.followers;
      }
    }
  });

  const results: BestPerformingAccount[] = [];

  accountMap.forEach((account) => {
    const views = account.videos.map(v => v.plays || 0);
    const total_videos = account.videos.length;
    const total_views = views.reduce((sum, v) => sum + v, 0);
    const avg_views = total_views / total_videos;
    const min_views = Math.min(...views);
    const max_views = Math.max(...views);
    const days_with_posts = account.postDates.size;

    results.push({
      username: account.username,
      brands: Array.from(account.brands),
      followers: account.followers,
      total_videos,
      total_views,
      avg_views,
      min_views,
      max_views,
      days_with_posts,
    });
  });

  const MIN_TOTAL_VIEWS = 500;
  const filteredResults = results.filter(account => account.total_views >= MIN_TOTAL_VIEWS);

  return filteredResults.sort((a, b) => b.avg_views - a.avg_views);
};
