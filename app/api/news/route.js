/**
 * News API Route
 * GET /api/news - Fetch and filter news suitable for spiritual interpretation
 * GET /api/news?categorized=true - Fetch categorized news (Inspiration, Science, All)
 *
 * Priority: Supabase (curated) > NewsAPI (fresh)
 */

import { NextResponse } from 'next/server';
import { fetchNews, fetchCategorizedNews } from '@/lib/newsapi';
import { filterNews, filterAndCategorizeNews } from '@/lib/news-filter';
import { NEWS_CATEGORIES } from '@/lib/categories';
import { getApprovedArticles, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const categorized = searchParams.get('categorized') === 'true';

    // Try Supabase first for curated content
    if (isSupabaseConfigured()) {
      const dbArticles = await getApprovedArticles({ limit: limit * 2 });

      if (dbArticles.length > 0) {
        // We have curated articles - use them
        if (categorized) {
          // Group by category
          const byCategory = {
            inspiration: dbArticles.filter(a => a.category === 'inspiration').slice(0, 3),
            science: dbArticles.filter(a => a.category === 'science').slice(0, 3),
            nature: dbArticles.filter(a => a.category === 'nature').slice(0, 3),
            health: dbArticles.filter(a => a.category === 'health').slice(0, 3)
          };

          // Get uncategorized for "all" section
          const categorizedIds = new Set([
            ...byCategory.inspiration.map(a => a.id),
            ...byCategory.science.map(a => a.id),
            ...byCategory.nature.map(a => a.id),
            ...byCategory.health.map(a => a.id)
          ]);
          const allNews = dbArticles.filter(a => !categorizedIds.has(a.id)).slice(0, limit);

          return NextResponse.json({
            success: true,
            categorized: true,
            source: 'curated',
            categories: {
              inspiration: {
                id: 'inspiration',
                name: NEWS_CATEGORIES.inspiration.name,
                description: NEWS_CATEGORIES.inspiration.description,
                icon: NEWS_CATEGORIES.inspiration.icon,
                articles: byCategory.inspiration,
                count: byCategory.inspiration.length
              },
              science: {
                id: 'science',
                name: NEWS_CATEGORIES.science.name,
                description: NEWS_CATEGORIES.science.description,
                icon: NEWS_CATEGORIES.science.icon,
                articles: byCategory.science,
                count: byCategory.science.length
              },
              nature: {
                id: 'nature',
                name: NEWS_CATEGORIES.nature.name,
                description: NEWS_CATEGORIES.nature.description,
                icon: NEWS_CATEGORIES.nature.icon,
                articles: byCategory.nature,
                count: byCategory.nature.length
              },
              health: {
                id: 'health',
                name: NEWS_CATEGORIES.health.name,
                description: NEWS_CATEGORIES.health.description,
                icon: NEWS_CATEGORIES.health.icon,
                articles: byCategory.health,
                count: byCategory.health.length
              }
            },
            allNews,
            totalCount: byCategory.inspiration.length +
                       byCategory.science.length +
                       byCategory.nature.length +
                       byCategory.health.length +
                       allNews.length
          });
        }

        // Non-categorized mode
        return NextResponse.json({
          success: true,
          source: 'curated',
          count: dbArticles.length,
          news: dbArticles.slice(0, limit)
        });
      }
    }

    // Fallback to NewsAPI
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
        ...rawNews.nature,
        ...rawNews.health,
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
          },
          nature: {
            id: 'nature',
            name: NEWS_CATEGORIES.nature.name,
            description: NEWS_CATEGORIES.nature.description,
            icon: NEWS_CATEGORIES.nature.icon,
            articles: categorizedNews.nature,
            count: categorizedNews.nature.length
          },
          health: {
            id: 'health',
            name: NEWS_CATEGORIES.health.name,
            description: NEWS_CATEGORIES.health.description,
            icon: NEWS_CATEGORIES.health.icon,
            articles: categorizedNews.health,
            count: categorizedNews.health.length
          }
        },
        allNews: categorizedNews.all,
        totalCount: categorizedNews.inspiration.length +
                   categorizedNews.science.length +
                   categorizedNews.nature.length +
                   categorizedNews.health.length +
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
