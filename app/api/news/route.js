/**
 * News API Route
 * GET /api/news - Fetch and filter news suitable for spiritual interpretation
 * GET /api/news?categorized=true - Fetch categorized news (Inspiration, Science, All)
 */

import { NextResponse } from 'next/server';
import { fetchNews, fetchCategorizedNews } from '@/lib/newsapi';
import { filterNews, filterAndCategorizeNews } from '@/lib/news-filter';
import { NEWS_CATEGORIES } from '@/lib/categories';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const categorized = searchParams.get('categorized') === 'true';

    // Categorized mode: Return news organized by categories
    if (categorized) {
      // Fetch raw news from all sources
      const rawNews = await fetchCategorizedNews({
        perCategory: 5,
        forAllSection: limit
      });

      // Combine all articles for unified filtering
      const allArticles = [
        ...rawNews.inspiration,
        ...rawNews.science,
        ...rawNews.all
      ];

      // Remove duplicates by ID
      const uniqueArticles = Array.from(
        new Map(allArticles.map(a => [a.id, a])).values()
      );

      // Apply category scoring and filtering
      const categorizedNews = filterAndCategorizeNews(uniqueArticles, {
        bestPerCategory: 3,
        maxAll: limit
      });

      return NextResponse.json({
        success: true,
        categorized: true,
        categories: {
          inspiration: {
            id: 'inspiration',
            name: NEWS_CATEGORIES.inspiration.name,
            description: NEWS_CATEGORIES.inspiration.description,
            icon: NEWS_CATEGORIES.inspiration.icon,
            articles: categorizedNews.inspiration,
            count: categorizedNews.inspiration.length
          },
          science: {
            id: 'science',
            name: NEWS_CATEGORIES.science.name,
            description: NEWS_CATEGORIES.science.description,
            icon: NEWS_CATEGORIES.science.icon,
            articles: categorizedNews.science,
            count: categorizedNews.science.length
          }
        },
        allNews: categorizedNews.all,
        totalCount: categorizedNews.inspiration.length +
                   categorizedNews.science.length +
                   categorizedNews.all.length
      });
    }

    // Default mode: Simple filtered list
    const allNews = await fetchNews('general', limit * 3);
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
