/**
 * Admin Articles API Route
 * GET /api/admin/articles - List all articles with pagination
 * POST /api/admin/articles - Create a new article
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getAllArticles, createArticle } from '@/lib/supabase';
import { scoreArticle } from '@/lib/news-filter';

export async function GET(request) {
  // Check authentication
  const auth = await requireAdmin();
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || null;
    const category = searchParams.get('category') || null;

    const { articles, total } = await getAllArticles({
      page,
      limit,
      status,
      category
    });

    // Calculate this week's articles
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = articles.filter(
      a => new Date(a.created_at) > oneWeekAgo
    ).length;

    return NextResponse.json({
      success: true,
      articles,
      total,
      thisWeek,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Articles fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Check authentication
  const auth = await requireAdmin();
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, description, content, source, author, url, urlToImage, category } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Score the article
    const suitability = scoreArticle({ title, description, content });

    const result = await createArticle({
      title,
      description: description || '',
      content: content || description || '',
      source: source || 'Manual Entry',
      author: author || null,
      url: url || null,
      urlToImage: urlToImage || null,
      category: category || null,
      aiScore: suitability.score
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      article: result.article,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('Article creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
