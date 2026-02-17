import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-enhancer';
import { ResumeData } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, resumeData } = body as {
            message: string;
            resumeData: ResumeData;
        };

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key is not configured' },
                { status: 500 }
            );
        }

        const response = await chatWithAI(message, resumeData);

        return NextResponse.json({
            success: true,
            response,
        });

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        );
    }
}
