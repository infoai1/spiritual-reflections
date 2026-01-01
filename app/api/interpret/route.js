/**
 * Interpretation API Route
 * POST /api/interpret - Generate spiritual interpretation for a news article
 */

import { NextResponse } from 'next/server';
import { generateInterpretation, isConfigured } from '@/lib/claude';

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

    // Check if Claude is configured
    if (!isConfigured()) {
      console.warn('Claude API not configured, using fallback');
    }

    // Generate interpretation
    const result = await generateInterpretation({
      id: body.id,
      title: body.title,
      description: body.description || '',
      content: body.content || '',
      source: body.source || 'Unknown',
    });

    return NextResponse.json({
      success: true,
      interpretation: result.interpretation,
      relevantPassages: result.relevantPassages,
      usedFallback: !!result.error,
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
