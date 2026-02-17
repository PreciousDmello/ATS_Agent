import { NextRequest, NextResponse } from 'next/server';
import { enhanceResume } from '@/lib/ai-enhancer';
import { ResumeData } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeData, jobDescription } = body as {
            resumeData: ResumeData;
            jobDescription?: string;
        };

        if (!resumeData) {
            return NextResponse.json(
                { error: 'Resume data is required' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file.' },
                { status: 500 }
            );
        }

        const result = await enhanceResume(resumeData, jobDescription || '');

        return NextResponse.json({
            success: true,
            enhancedData: result.enhancedData,
            changes: result.changes,
            keywordsAdded: result.keywordsAdded,
        });

    } catch (error) {
        console.error('Enhancement error:', error);
        const message = error instanceof Error ? error.message : 'Failed to enhance resume';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
