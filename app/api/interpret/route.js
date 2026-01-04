/**
 * Interpretation API Route
 * POST /api/interpret - Generate spiritual interpretation for a news article
 * Includes caching to avoid regenerating interpretations on each page load
 * Now includes Executive Summary and optional Quranic Perspective
 */

import { NextResponse } from 'next/server';
import { generateInterpretation, generateQuranicPerspective, isConfigured } from '@/lib/claude';
import { getCached, setCache } from '@/lib/cache';
import { getRelevantVerse } from '@/lib/quran-verses';

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
    const includeQuranicPerspective = body.includeQuranicPerspective !== false;

    // Get relevant Quran verse based on news content (fallback/quick verse)
    const quranVerse = getRelevantVerse(body.title, body.content || body.description || '');

    // Check cache first (now async for Supabase persistence)
    const cached = await getCached(newsId);
    if (cached) {
      return NextResponse.json({
        success: true,
        whatHappened: cached.whatHappened,
        executiveSummary: cached.executiveSummary || '',
        interpretation: cached.interpretation,
        relevantPassages: cached.relevantPassages,
        inlineCitations: cached.inlineCitations || [],
        quranVerse,
        quranicPerspective: cached.quranicPerspective || null,
        fromCache: true,
      });
    }

    // Check if LightRAG is configured
    if (!isConfigured()) {
      console.warn('LightRAG API not available, using fallback');
    }

    const newsData = {
      id: body.id,
      title: body.title,
      description: body.description || '',
      content: body.content || '',
      source: body.source || 'Unknown',
    };

    // Generate interpretation (includes executiveSummary now)
    const result = await generateInterpretation(newsData);

    // Generate Quranic perspective (separate prompt) if requested
    let quranicPerspective = null;
    if (includeQuranicPerspective) {
      quranicPerspective = await generateQuranicPerspective(newsData);

      // Only include if found relevant content
      if (!quranicPerspective || !quranicPerspective.found) {
        quranicPerspective = null;
      }
    }

    // Cache the result permanently in Supabase
    await setCache(newsId, {
      whatHappened: result.whatHappened,
      executiveSummary: result.executiveSummary || '',
      interpretation: result.interpretation,
      relevantPassages: result.relevantPassages,
      inlineCitations: result.inlineCitations || [],
      quranicPerspective,
    });

    return NextResponse.json({
      success: true,
      whatHappened: result.whatHappened,
      executiveSummary: result.executiveSummary || '',
      interpretation: result.interpretation,
      relevantPassages: result.relevantPassages,
      inlineCitations: result.inlineCitations || [],
      quranVerse,
      quranicPerspective,
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
