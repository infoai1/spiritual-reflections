/**
 * Admin AI Review - Single Article Actions
 * GET: Get full article with AI for review
 * PUT: Approve or reject article
 * DELETE: Delete article
 */

import { cookies } from 'next/headers';
import {
  getArticleWithAI,
  approveArticleWithAI,
  rejectArticleWithAI,
  deleteArticle,
  isSupabaseConfigured
} from '@/lib/supabase';

// Verify admin session
async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    return false;
  }

  const expectedToken = Buffer.from(`admin:${process.env.ADMIN_PASSWORD || 'admin123'}`).toString('base64');
  return sessionToken === expectedToken;
}

export async function GET(request, { params }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ success: false, error: 'Supabase not configured' });
  }

  try {
    const { id } = params;
    const article = await getArticleWithAI(id, true); // adminView = true

    if (!article) {
      return Response.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    return Response.json({ success: true, article });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ success: false, error: 'Supabase not configured' });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    let result;
    if (action === 'approve') {
      result = await approveArticleWithAI(id, 'admin');
    } else {
      result = await rejectArticleWithAI(id, 'admin');
    }

    if (!result.success) {
      return Response.json({ success: false, error: result.error }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: `Article ${action}d successfully`
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ success: false, error: 'Supabase not configured' });
  }

  try {
    const { id } = params;
    const result = await deleteArticle(id);

    if (!result.success) {
      return Response.json({ success: false, error: result.error }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
