/**
 * URL Metadata Extraction API Route
 * POST /api/admin/fetch-url - Extract metadata from a URL
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * Extract Open Graph and meta tags from HTML
 */
function extractMetadata(html, url) {
  const metadata = {
    title: null,
    description: null,
    image: null,
    source: null,
    author: null
  };

  // Helper to extract content from meta tag
  const getMetaContent = (name, property) => {
    // Try property first (og:title, twitter:title)
    if (property) {
      const propMatch = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'));
      if (propMatch) return propMatch[1];
    }
    // Try name (description, author)
    if (name) {
      const nameMatch = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'));
      if (nameMatch) return nameMatch[1];
    }
    return null;
  };

  // Extract title (priority: og:title > twitter:title > <title>)
  metadata.title = getMetaContent(null, 'og:title')
    || getMetaContent(null, 'twitter:title')
    || (html.match(/<title>([^<]+)<\/title>/i) || [])[1]
    || null;

  // Extract description (priority: og:description > twitter:description > meta description)
  metadata.description = getMetaContent(null, 'og:description')
    || getMetaContent(null, 'twitter:description')
    || getMetaContent('description', null)
    || null;

  // Extract image (priority: og:image > twitter:image)
  let image = getMetaContent(null, 'og:image')
    || getMetaContent(null, 'twitter:image')
    || null;

  // Make relative URLs absolute
  if (image && !image.startsWith('http')) {
    try {
      const baseUrl = new URL(url);
      image = new URL(image, baseUrl.origin).href;
    } catch (e) {
      // Keep as-is if URL parsing fails
    }
  }
  metadata.image = image;

  // Extract source/site name
  metadata.source = getMetaContent(null, 'og:site_name')
    || (html.match(/<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["']/i) || [])[1]
    || extractDomainName(url);

  // Extract author
  metadata.author = getMetaContent('author', null)
    || getMetaContent(null, 'article:author')
    || null;

  // Clean up extracted values
  Object.keys(metadata).forEach(key => {
    if (metadata[key]) {
      // Decode HTML entities
      metadata[key] = metadata[key]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .trim();
    }
  });

  return metadata;
}

/**
 * Extract domain name from URL
 */
function extractDomainName(url) {
  try {
    const hostname = new URL(url).hostname;
    // Remove www. and get domain name
    const parts = hostname.replace('www.', '').split('.');
    if (parts.length >= 2) {
      // Capitalize first letter of domain
      const domain = parts[parts.length - 2];
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
    return hostname;
  } catch (e) {
    return 'Unknown Source';
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
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SpiritualReflections/1.0; +https://spiritual-reflections.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch URL: ${response.status}` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return NextResponse.json(
        { success: false, error: 'URL does not return HTML content' },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract metadata
    const metadata = extractMetadata(html, url);

    return NextResponse.json({
      success: true,
      metadata: {
        title: metadata.title || '',
        description: metadata.description || '',
        urlToImage: metadata.image || '',
        source: metadata.source || '',
        author: metadata.author || '',
        url: response.url // Use final URL after redirects
      }
    });
  } catch (error) {
    console.error('URL fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch URL metadata' },
      { status: 500 }
    );
  }
}
