import { NextRequest, NextResponse } from 'next/server';
import { parseResumeText } from '@/lib/parser';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        const fileType = file.name.toLowerCase().split('.').pop();
        if (!['pdf', 'docx', 'doc'].includes(fileType || '')) {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload a PDF or Word document.' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let rawText = '';

        if (fileType === 'pdf') {
            // Dynamic import for pdf-parse
            const pdfParse = (await import('pdf-parse')).default;
            const pdfData = await pdfParse(buffer);
            rawText = pdfData.text;
        } else if (fileType === 'docx' || fileType === 'doc') {
            // Dynamic import for mammoth
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value;
        }

        if (!rawText.trim()) {
            return NextResponse.json(
                { error: 'Could not extract text from the uploaded file. Please try a different file or enter details manually.' },
                { status: 422 }
            );
        }

        const resumeData = parseResumeText(rawText);

        return NextResponse.json({
            success: true,
            data: resumeData,
            rawText: rawText.substring(0, 2000), // For debugging
        });

    } catch (error) {
        console.error('Parse error:', error);
        return NextResponse.json(
            { error: 'Failed to parse the uploaded file. Please try again.' },
            { status: 500 }
        );
    }
}
