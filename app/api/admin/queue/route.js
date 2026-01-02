/**
 * Admin Queue API Route
 * GET /api/admin/queue - List pending articles
 * POST /api/admin/queue - Fetch new articles from NewsAPI
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPendingQueue, addToQueue } from '@/lib/supabase';
import { fetchCategorizedNews } from '@/lib/newsapi';
import { scoreArticle } from '@/lib/news-filter';

export async function GET() {
  // Check authentication
  const auth = await requireAdmin();
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const queue = await getPendingQueue();

    return NextResponse.json({
      success: true,
      queue,
      count: queue.length
    });
  } catch (error) {
    console.error('Queue fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch queue' },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Check authentication
  const auth = await requireAdmin();
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    // Fetch fresh news from NewsAPI
    const categorizedNews = await fetchCategorizedNews({
      perCategory: 10,
      forAllSection: 20
    });

    // Combine all articles
    const allArticles = [
      ...categorizedNews.inspiration.map(a => ({ ...a, category: 'inspiration' })),
      ...categorizedNews.science.map(a => ({ ...a, category: 'science' })),
      ...categorizedNews.nature.map(a => ({ ...a, category: 'nature' })),
      ...categorizedNews.health.map(a => ({ ...a, category: 'health' })),
      ...categorizedNews.all
    ];

    // Remove duplicates by ID
    const uniqueArticles = Array.from(
      new Map(allArticles.map(a => [a.id, a])).values()
    );

    // Score articles and add suitability info
    const scoredArticles = uniqueArticles.map(article => {
      const suitability = scoreArticle(article);
      return {
        ...article,
        suitability
      };
    });

    // Filter to only recommended articles
    const recommendedArticles = scoredArticles.filter(
      a => a.suitability.isRecommended
    );

    // Add to queue
    const result = await addToQueue(recommendedArticles);

    return NextResponse.json({
      success: true,
      fetched: recommendedArticles.length,
      added: result.added,
      skipped: result.skipped,
      message: `Added ${result.added} new articles to queue`
    });
  } catch (error) {
    console.error('Queue population error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to populate queue' },
      { status: 500 }
    );
  }
}
