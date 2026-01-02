/**
 * Admin Single Article API Route
 * PATCH /api/admin/articles/[id] - Update article status
 * DELETE /api/admin/articles/[id] - Delete article
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { updateArticleStatus, deleteArticle } from '@/lib/supabase';

export async function PATCH(request, { params }) {
  // Check authentication
  const auth = await requireAdmin();
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['approved', 'hidden'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Use "approved" or "hidden"' },
        { status: 400 }
      );
    }

    const result = await updateArticleStatus(id, status);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Article ${status === 'hidden' ? 'hidden' : 'restored'}`
    });
  } catch (error) {
    console.error('Article update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  // Check authentication
  const auth = await requireAdmin();
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const result = await deleteArticle(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted'
    });
  } catch (error) {
    console.error('Article delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
