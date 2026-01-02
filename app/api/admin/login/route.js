/**
 * Admin Login API Route
 * POST /api/admin/login - Authenticate admin with password
 */

import { NextResponse } from 'next/server';
import {
  validatePassword,
  createSessionToken,
  COOKIE_CONFIG
} from '@/lib/admin-auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password
    if (!validatePassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session token
    const token = createSessionToken();

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful'
    });

    // Set session cookie
    response.cookies.set(
      COOKIE_CONFIG.name,
      token,
      COOKIE_CONFIG.options
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
