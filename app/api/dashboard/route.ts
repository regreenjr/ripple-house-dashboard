import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const searchParams = request.nextUrl.searchParams;
    const timeWindow = searchParams.get('timeWindow') || 'last30';
    const selectedBrands = searchParams.get('brands')?.split(',').filter(Boolean);

    let query = supabase.from('mv_video_performance_deduped').select('*');

    if (selectedBrands && selectedBrands.length > 0) {
      query = query.in('brand', selectedBrands);
    }

    const now = new Date();
    let startDate: Date;

    switch (timeWindow) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last7':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last30':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate = new Date(0);
    }

    if (timeWindow !== 'alltime') {
      query = query.gte('date_posted', startDate.toISOString().split('T')[0]);
    }

    const { data: videos, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const kpis = calculateKPIs(videos || []);
    const dailyMetrics = calculateDailyMetrics(videos || []);
    const brands = getBrands(videos || []);
    const descriptionOptions = getDescriptionOptions(videos || []);

    return NextResponse.json({
      kpis,
      dailyMetrics,
      dedupedData: videos || [],
      totalDaysAvailable: dailyMetrics.length,
      brands,
      descriptionOptions
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculateKPIs(videos: any[]) {
  const totalViews = videos.reduce((sum, v) => sum + (v.plays || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + (v.comments || 0), 0);
  const totalShares = videos.reduce((sum, v) => sum + (v.shares || 0), 0);
  const totalBookmarks = videos.reduce((sum, v) => sum + (v.saves || 0), 0);
  const totalInteractions = totalLikes + totalComments + totalShares + totalBookmarks;
  const uniqueAccounts = new Set(videos.map(v => v.username)).size;
  const videosWithZeroViews = videos.filter(v => v.plays === 0).length;
  const avgViews = videos.length > 0 ? totalViews / videos.length : 0;

  return {
    publishedVideos: videos.length,
    activeAccounts: uniqueAccounts,
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    totalBookmarks,
    engagementRate: totalViews > 0 ? totalInteractions / totalViews : 0,
    videosWithZeroViews,
    videosWithZeroViewsPercent: videos.length > 0 ? videosWithZeroViews / videos.length : 0,
    avgViews,
  };
}

function calculateDailyMetrics(videos: any[]) {
  const metricsByDate = new Map();
  videos.forEach(video => {
    const date = video.date_posted;
    const existing = metricsByDate.get(date) || { date, plays: 0, likes: 0, comments: 0, shares: 0, saves: 0, interactions: 0 };
    const interactions = (video.likes || 0) + (video.comments || 0) + (video.shares || 0) + (video.saves || 0);
    existing.plays += video.plays || 0;
    existing.likes += video.likes || 0;
    existing.comments += video.comments || 0;
    existing.shares += video.shares || 0;
    existing.saves += video.saves || 0;
    existing.interactions += interactions;
    metricsByDate.set(date, existing);
  });

  return Array.from(metricsByDate.values())
    .map(m => ({ ...m, engagementRate: m.plays > 0 ? m.interactions / m.plays : 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getTopVideos(videos: any[], limit: number) {
  return [...videos].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, limit);
}

function getTopAccounts(videos: any[], limit: number) {
  const accountStats = new Map();
  videos.forEach(video => {
    const username = video.username;
    const existing = accountStats.get(username) || {
      username, brands: new Set(), total_videos: 0, total_views: 0, total_likes: 0,
      total_comments: 0, total_shares: 0, followers: video.followers || 0
    };
    existing.brands.add(video.brand);
    existing.total_videos += 1;
    existing.total_views += video.plays || 0;
    existing.total_likes += video.likes || 0;
    existing.total_comments += video.comments || 0;
    existing.total_shares += video.shares || 0;
    accountStats.set(username, existing);
  });

  return Array.from(accountStats.values())
    .map(acc => ({
      ...acc,
      brands: Array.from(acc.brands),
      avg_engagement_rate: acc.total_views > 0
        ? (acc.total_likes + acc.total_comments + acc.total_shares) / acc.total_views : 0
    }))
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, limit);
}

function getBrands(videos: any[]): string[] {
  const brands = new Set(videos.map(v => v.brand).filter(Boolean));
  const blocked = new Set(['PLEASEEE', 'Unknown', '0', '2', '3']);
  return Array.from(brands).filter(brand => brand && !blocked.has(brand.trim()));
}

function getDescriptionOptions(videos: any[]) {
  const descriptionMap = new Map();

  videos.forEach(video => {
    const text = video.description || '';
    if (!text.trim()) return;

    const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
    const id = Buffer.from(normalized).toString('base64').substring(0, 12);

    if (descriptionMap.has(id)) {
      const existing = descriptionMap.get(id);
      existing.count++;
      if (video.date_posted < existing.firstPosted) {
        existing.firstPosted = video.date_posted;
      }
      if (video.date_posted > existing.lastPosted) {
        existing.lastPosted = video.date_posted;
      }
    } else {
      descriptionMap.set(id, {
        id,
        text,
        normalizedText: normalized,
        count: 1,
        firstPosted: video.date_posted,
        lastPosted: video.date_posted,
      });
    }
  });

  return Array.from(descriptionMap.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.normalizedText.localeCompare(b.normalizedText);
  });
}
