import { NextRequest, NextResponse } from 'next/server';
import { calculateATSScore } from '@/lib/ats-scorer';
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

        const score = calculateATSScore(resumeData, jobDescription);

        return NextResponse.json({
            success: true,
            score,
        });

    } catch (error) {
        console.error('ATS scoring error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate ATS score' },
            { status: 500 }
        );
    }
}
