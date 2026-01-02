/**
 * Admin Logout API Route
 * POST /api/admin/logout - Clear admin session
 */

import { NextResponse } from 'next/server';
import { COOKIE_CONFIG } from '@/lib/admin-auth';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear session cookie
    response.cookies.set(COOKIE_CONFIG.name, '', {
      ...COOKIE_CONFIG.options,
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
