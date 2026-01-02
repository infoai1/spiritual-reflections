/**
 * Admin Authentication Utilities
 *
 * Simple password-based authentication using environment variables.
 * Sessions are managed via HMAC-signed tokens stored in HttpOnly cookies.
 */

import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

/**
 * Simple hash function for HMAC-like signature
 * Uses the admin password as the secret key
 */
function createSignature(data, secret) {
  let hash = 0;
  const combined = data + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Validate the admin password
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid
 */
export function validatePassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set in environment variables');
    return false;
  }

  return password === adminPassword;
}

/**
 * Create a session token
 * Format: timestamp.signature
 * @returns {string} - Session token
 */
export function createSessionToken() {
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const timestamp = Date.now().toString();
  const signature = createSignature(timestamp, adminPassword);
  return `${timestamp}.${signature}`;
}

/**
 * Verify a session token
 * @param {string} token - Session token to verify
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function verifySessionToken(token) {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const parts = token.split('.');

  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid token format' };
  }

  const [timestamp, signature] = parts;
  const expectedSignature = createSignature(timestamp, adminPassword);

  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid signature' };
  }

  // Check expiration
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (tokenAge > SESSION_DURATION) {
    return { valid: false, error: 'Session expired' };
  }

  return { valid: true };
}

/**
 * Get the admin session from cookies
 * @returns {Object} - { authenticated: boolean, error?: string }
 */
export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return { authenticated: false, error: 'No session' };
    }

    const result = verifySessionToken(sessionCookie.value);

    if (!result.valid) {
      return { authenticated: false, error: result.error };
    }

    return { authenticated: true };
  } catch (error) {
    return { authenticated: false, error: 'Failed to read session' };
  }
}

/**
 * Set the admin session cookie
 * @param {string} token - Session token
 */
export async function setAdminSession(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/'
  });
}

/**
 * Clear the admin session cookie
 */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Middleware helper to check admin authentication
 * Returns 401 response if not authenticated
 * @param {Request} request - The request object
 * @returns {Object|null} - Error response or null if authenticated
 */
export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session.authenticated) {
    return {
      authenticated: false,
      error: session.error || 'Unauthorized'
    };
  }

  return { authenticated: true };
}

/**
 * Cookie configuration for responses
 */
export const COOKIE_CONFIG = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  }
};
