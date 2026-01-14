/**
 * Admin AI Review API
 * GET: Get pending articles with AI interpretations
 * POST: Generate AI for a specific article
 */

import { cookies } from 'next/headers';
import { getPendingArticlesWithAI, saveArticleWithAI, isSupabaseConfigured } from '@/lib/supabase';
import { generateInterpretation, generateQuranicPerspective } from '@/lib/claude';

// Verify admin session
async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    return false;
  }

  // Simple token validation (matches what login sets)
  const expectedToken = Buffer.from(`admin:${process.env.ADMIN_PASSWORD || 'admin123'}`).toString('base64');
  return sessionToken === expectedToken;
}

export async function GET(request) {
  // Verify admin
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({
      success: false,
      error: 'Supabase not configured',
      setup: true
    });
  }

  try {
    const pendingArticles = await getPendingArticlesWithAI();
    return Response.json({
      success: true,
      articles: pendingArticles,
      total: pendingArticles.length
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  // Verify admin
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({
      success: false,
      error: 'Supabase not configured'
    });
  }

  try {
    const body = await request.json();
    const { article } = body;

    if (!article || !article.title) {
      return Response.json({ success: false, error: 'Article data required' }, { status: 400 });
    }

    // Generate AI interpretation
    const news = {
      title: article.title,
      description: article.description,
      content: article.content,
      source: article.source,
    };

    const [interpretation, quranicPerspective] = await Promise.all([
      generateInterpretation(news),
      generateQuranicPerspective(news),
    ]);

    // Save article with AI content
    const aiContent = {
      whatHappened: interpretation.whatHappened,
      interpretation: interpretation.interpretation,
      inlineCitations: interpretation.inlineCitations,
      quranicPerspective: quranicPerspective,
    };

    const result = await saveArticleWithAI(article, aiContent);

    if (!result.success) {
      return Response.json({ success: false, error: result.error }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'Article saved with AI interpretation (pending approval)',
      article: result.article
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
