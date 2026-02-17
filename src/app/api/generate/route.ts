import { NextRequest, NextResponse } from 'next/server';
import { renderTemplate } from '@/lib/templates';
import { ResumeData, TemplateId } from '@/lib/types';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeData, templateId, format } = body as {
            resumeData: ResumeData;
            templateId: TemplateId;
            format: 'html' | 'docx';
        };

        if (!resumeData || !templateId) {
            return NextResponse.json(
                { error: 'Resume data and template ID are required' },
                { status: 400 }
            );
        }

        if (format === 'html') {
            // Return HTML for preview and PDF generation (client-side)
            const html = renderTemplate(resumeData, templateId);
            return new NextResponse(html, {
                headers: {
                    'Content-Type': 'text/html',
                },
            });
        }

        if (format === 'docx') {
            // Generate DOCX using the docx library
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sections: any[] = [];

            // Header - Name
            sections.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [
                        new TextRun({
                            text: resumeData.personalInfo.fullName || 'Your Name',
                            bold: true,
                            size: 36,
                            font: 'Calibri',
                        }),
                    ],
                })
            );

            // Contact info
            const contactParts = [
                resumeData.personalInfo.email,
                resumeData.personalInfo.phone,
                resumeData.personalInfo.location,
                resumeData.personalInfo.linkedin,
            ].filter(Boolean);

            sections.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: contactParts.join(' | '),
                            size: 18,
                            color: '666666',
                            font: 'Calibri',
                        }),
                    ],
                })
            );

            // Summary
            if (resumeData.personalInfo.summary) {
                sections.push(createSectionHeading('PROFESSIONAL SUMMARY'));
                sections.push(
                    new Paragraph({
                        spacing: { after: 200 },
                        children: [
                            new TextRun({
                                text: resumeData.personalInfo.summary,
                                size: 20,
                                font: 'Calibri',
                                italics: true,
                            }),
                        ],
                    })
                );
            }

            // Experience
            if (resumeData.experience.length > 0 && resumeData.experience[0].company) {
                sections.push(createSectionHeading('EXPERIENCE'));
                for (const exp of resumeData.experience) {
                    sections.push(
                        new Paragraph({
                            spacing: { before: 100 },
                            children: [
                                new TextRun({ text: exp.position, bold: true, size: 22, font: 'Calibri' }),
                                new TextRun({ text: ` — ${exp.company}`, size: 22, font: 'Calibri' }),
                                new TextRun({ text: `    ${exp.startDate} – ${exp.endDate}`, size: 18, color: '888888', font: 'Calibri' }),
                            ],
                        })
                    );
                    for (const desc of exp.description.filter(Boolean)) {
                        sections.push(
                            new Paragraph({
                                bullet: { level: 0 },
                                spacing: { after: 40 },
                                children: [
                                    new TextRun({ text: desc, size: 20, font: 'Calibri' }),
                                ],
                            })
                        );
                    }
                }
            }

            // Education
            if (resumeData.education.length > 0 && resumeData.education[0].institution) {
                sections.push(createSectionHeading('EDUCATION'));
                for (const edu of resumeData.education) {
                    sections.push(
                        new Paragraph({
                            spacing: { before: 100 },
                            children: [
                                new TextRun({ text: `${edu.degree} ${edu.field}`, bold: true, size: 22, font: 'Calibri' }),
                                new TextRun({ text: ` — ${edu.institution}`, size: 22, font: 'Calibri' }),
                                new TextRun({ text: `    ${edu.startDate} – ${edu.endDate}`, size: 18, color: '888888', font: 'Calibri' }),
                            ],
                        })
                    );
                    if (edu.gpa) {
                        sections.push(
                            new Paragraph({
                                children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 20, font: 'Calibri' })],
                            })
                        );
                    }
                }
            }

            // Skills
            if (resumeData.skills.length > 0 && resumeData.skills[0].category) {
                sections.push(createSectionHeading('SKILLS'));
                for (const skill of resumeData.skills) {
                    sections.push(
                        new Paragraph({
                            spacing: { after: 40 },
                            children: [
                                new TextRun({ text: `${skill.category}: `, bold: true, size: 20, font: 'Calibri' }),
                                new TextRun({ text: skill.items.join(', '), size: 20, font: 'Calibri' }),
                            ],
                        })
                    );
                }
            }

            // Projects
            if (resumeData.projects.length > 0 && resumeData.projects[0].name) {
                sections.push(createSectionHeading('PROJECTS'));
                for (const proj of resumeData.projects) {
                    sections.push(
                        new Paragraph({
                            spacing: { before: 100 },
                            children: [
                                new TextRun({ text: proj.name, bold: true, size: 22, font: 'Calibri' }),
                            ],
                        })
                    );
                    if (proj.description) {
                        sections.push(
                            new Paragraph({
                                children: [new TextRun({ text: proj.description, size: 20, font: 'Calibri' })],
                            })
                        );
                    }
                    for (const h of proj.highlights) {
                        sections.push(
                            new Paragraph({
                                bullet: { level: 0 },
                                spacing: { after: 40 },
                                children: [new TextRun({ text: h, size: 20, font: 'Calibri' })],
                            })
                        );
                    }
                    if (proj.technologies.length > 0) {
                        sections.push(
                            new Paragraph({
                                children: [
                                    new TextRun({ text: 'Technologies: ', bold: true, size: 18, color: '888888', font: 'Calibri' }),
                                    new TextRun({ text: proj.technologies.join(', '), size: 18, color: '888888', font: 'Calibri' }),
                                ],
                            })
                        );
                    }
                }
            }

            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: { top: 720, right: 720, bottom: 720, left: 720 },
                        },
                    },
                    children: sections,
                }],
            });

            const docBuffer = await Packer.toBuffer(doc);
            const uint8 = new Uint8Array(docBuffer);

            return new NextResponse(uint8, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="resume_${resumeData.personalInfo.fullName?.replace(/\s+/g, '_') || 'optimized'}.docx"`,
                },
            });
        }

        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });

    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate resume' },
            { status: 500 }
        );
    }
}

// Helper uses top-level imports directly
function createSectionHeading(text: string) {
    return new Paragraph({
        spacing: { before: 240, after: 80 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
        },
        children: [
            new TextRun({
                text,
                bold: true,
                size: 24,
                font: 'Calibri',
                color: '1a365d',
            }),
        ],
    });
}
