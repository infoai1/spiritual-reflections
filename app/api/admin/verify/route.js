/**
 * Admin Verify API Route
 * GET /api/admin/verify - Check if admin session is valid
 */

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session.authenticated) {
      return NextResponse.json(
        { authenticated: false, error: session.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
