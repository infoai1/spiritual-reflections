/**
 * Admin Queue Item API Route
 * PATCH /api/admin/queue/[id] - Approve or reject an article
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { approveArticle, rejectArticle } from '@/lib/supabase';

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
    const { action, category } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'approve') {
      result = await approveArticle(id, category);
    } else {
      result = await rejectArticle(id);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      message: action === 'approve' ? 'Article approved and published' : 'Article rejected'
    });
  } catch (error) {
    console.error('Queue action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
