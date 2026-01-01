/**
 * News API Route
 * GET /api/news - Fetch and filter news suitable for spiritual interpretation
 */

import { NextResponse } from 'next/server';
import { fetchNews } from '@/lib/newsapi';
import { filterNews } from '@/lib/news-filter';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch more news than needed so we can filter
    const allNews = await fetchNews('general', limit * 3);

    // Filter for spiritually suitable news
    const filteredNews = filterNews(allNews, limit);

    return NextResponse.json({
      success: true,
      count: filteredNews.length,
      news: filteredNews,
    });
  } catch (error) {
    console.error('News API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
