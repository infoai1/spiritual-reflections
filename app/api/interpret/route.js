/**
 * Interpretation API Route
 * POST /api/interpret - Generate spiritual interpretation for a news article
 * Includes caching to avoid regenerating interpretations on each page load
 */

import { NextResponse } from 'next/server';
import { generateInterpretation, isConfigured } from '@/lib/claude';
import { getCached, setCache } from '@/lib/cache';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        {
          success: false,
          error: 'News title is required',
        },
        { status: 400 }
      );
    }

    const newsId = body.id || body.title.slice(0, 50);

    // Check cache first
    const cached = getCached(newsId);
    if (cached) {
      return NextResponse.json({
        success: true,
        whatHappened: cached.whatHappened,
        interpretation: cached.interpretation,
        relevantPassages: cached.relevantPassages,
        fromCache: true,
      });
    }

    // Check if LightRAG is configured
    if (!isConfigured()) {
      console.warn('LightRAG API not available, using fallback');
    }

    // Generate interpretation
    const result = await generateInterpretation({
      id: body.id,
      title: body.title,
      description: body.description || '',
      content: body.content || '',
      source: body.source || 'Unknown',
    });

    // Cache the result (7 days TTL)
    setCache(newsId, {
      whatHappened: result.whatHappened,
      interpretation: result.interpretation,
      relevantPassages: result.relevantPassages,
    });

    return NextResponse.json({
      success: true,
      whatHappened: result.whatHappened,
      interpretation: result.interpretation,
      relevantPassages: result.relevantPassages,
      usedFallback: !!result.error,
      fromCache: false,
    });
  } catch (error) {
    console.error('Interpretation API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate interpretation',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
