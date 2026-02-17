import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResumeData, EnhancementResult, EnhancementChange } from './types';

/* ========================================
   Gemini AI Enhancer
   ======================================== */

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables');
    return new GoogleGenerativeAI(apiKey);
}

/* ========================================
   Prompt Templates
   ======================================== */

const ENHANCE_SUMMARY_PROMPT = `You are an expert resume writer and ATS optimization specialist. 
Improve the following professional summary to be more impactful, ATS-friendly, and concise.
Use strong action-oriented language and include relevant industry keywords.
Keep it to 2-3 sentences maximum.

Current summary: "{summary}"
Target role/industry context: "{context}"

Return ONLY the improved summary text, nothing else.`;

const ENHANCE_EXPERIENCE_PROMPT = `You are an expert resume writer and ATS optimization specialist.
Improve the following work experience bullet points to be more impactful and ATS-optimized.

Rules:
1. Start each bullet with a strong action verb
2. Include quantified achievements where possible (add realistic metrics if none exist)
3. Use industry keywords naturally
4. Keep each bullet to 1-2 lines (15-25 words)
5. Focus on impact and results, not just responsibilities

Company: {company}
Position: {position}
Current bullets:
{bullets}

Job description context (if available): {jobDescription}

Return the improved bullets as a JSON array of strings. Example: ["Improved bullet 1", "Improved bullet 2"]
Return ONLY the JSON array, no other text.`;

const ENHANCE_SKILLS_PROMPT = `You are an expert resume writer and ATS optimization specialist.
Analyze the following skills and suggest additional relevant skills and better categorization for ATS optimization.

Current skills:
{skills}

Job description context: {jobDescription}

Return a JSON array of skill categories with items:
[{"category": "Category Name", "items": ["skill1", "skill2"]}]

Keep existing skills and add 3-5 additional relevant ones. Return ONLY the JSON array.`;

const ENHANCE_PROJECTS_PROMPT = `You are an expert resume writer. Improve the following project descriptions to be more impactful.

Rules:
1. Highlight technical complexity and impact
2. Use action verbs and quantify where possible
3. Keep highlights to 1-2 lines each

Project: {name}
Description: {description}
Technologies: {technologies}
Current highlights:
{highlights}

Return a JSON object with "description" (string) and "highlights" (array of strings).
Return ONLY the JSON object.`;

/* ========================================
   Enhancement Functions
   ======================================== */

async function enhanceSummary(
    genAI: GoogleGenerativeAI,
    summary: string,
    jobDescription: string
): Promise<{ enhanced: string; change: EnhancementChange | null }> {
    if (!summary || summary.trim().length === 0) {
        return { enhanced: '', change: null };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = ENHANCE_SUMMARY_PROMPT
            .replace('{summary}', summary)
            .replace('{context}', jobDescription || 'General professional');

        const result = await model.generateContent(prompt);
        const enhanced = result.response.text().trim();

        return {
            enhanced,
            change: {
                section: 'Professional Summary',
                original: summary,
                enhanced,
                reason: 'Improved clarity, impact, and keyword optimization',
            },
        };
    } catch (error) {
        console.error('Error enhancing summary:', error);
        return { enhanced: summary, change: null };
    }
}

async function enhanceExperience(
    genAI: GoogleGenerativeAI,
    experience: ResumeData['experience'],
    jobDescription: string
): Promise<{ enhanced: ResumeData['experience']; changes: EnhancementChange[] }> {
    const changes: EnhancementChange[] = [];
    const enhanced = [...experience];

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    for (let i = 0; i < enhanced.length; i++) {
        try {
            const prompt = ENHANCE_EXPERIENCE_PROMPT
                .replace('{company}', enhanced[i].company)
                .replace('{position}', enhanced[i].position)
                .replace('{bullets}', enhanced[i].description.map((d, j) => `${j + 1}. ${d}`).join('\n'))
                .replace('{jobDescription}', jobDescription || 'Not provided');

            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();

            // Clean response: remove markdown code fences
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const improvedBullets = JSON.parse(responseText);

            if (Array.isArray(improvedBullets) && improvedBullets.length > 0) {
                changes.push({
                    section: `Experience - ${enhanced[i].company}`,
                    original: enhanced[i].description.join(' | '),
                    enhanced: improvedBullets.join(' | '),
                    reason: 'Action verbs, quantified achievements, and keyword optimization',
                });
                enhanced[i] = { ...enhanced[i], description: improvedBullets };
            }
        } catch (error) {
            console.error(`Error enhancing experience ${i}:`, error);
        }
    }

    return { enhanced, changes };
}

async function enhanceSkills(
    genAI: GoogleGenerativeAI,
    skills: ResumeData['skills'],
    jobDescription: string
): Promise<{ enhanced: ResumeData['skills']; changes: EnhancementChange[]; keywordsAdded: string[] }> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = ENHANCE_SKILLS_PROMPT
            .replace('{skills}', JSON.stringify(skills))
            .replace('{jobDescription}', jobDescription || 'General technology role');

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const improved = JSON.parse(responseText);

        if (Array.isArray(improved)) {
            const originalItems = skills.flatMap(s => s.items);
            const newItems = improved.flatMap((s: { items: string[] }) => s.items);
            const addedKeywords = newItems.filter((item: string) =>
                !originalItems.some(orig => orig.toLowerCase() === item.toLowerCase())
            );

            const enhancedSkills = improved.map((s: { category: string; items: string[] }, index: number) => ({
                id: `skill-${index}`,
                category: s.category,
                items: s.items,
            }));

            return {
                enhanced: enhancedSkills,
                changes: [{
                    section: 'Skills',
                    original: skills.map(s => `${s.category}: ${s.items.join(', ')}`).join(' | '),
                    enhanced: enhancedSkills.map((s: { category: string; items: string[] }) => `${s.category}: ${s.items.join(', ')}`).join(' | '),
                    reason: 'Better categorization and additional relevant keywords',
                }],
                keywordsAdded: addedKeywords,
            };
        }
    } catch (error) {
        console.error('Error enhancing skills:', error);
    }

    return { enhanced: skills, changes: [], keywordsAdded: [] };
}

async function enhanceProjects(
    genAI: GoogleGenerativeAI,
    projects: ResumeData['projects']
): Promise<{ enhanced: ResumeData['projects']; changes: EnhancementChange[] }> {
    const changes: EnhancementChange[] = [];
    const enhanced = [...projects];

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    for (let i = 0; i < enhanced.length; i++) {
        try {
            const prompt = ENHANCE_PROJECTS_PROMPT
                .replace('{name}', enhanced[i].name)
                .replace('{description}', enhanced[i].description)
                .replace('{technologies}', enhanced[i].technologies.join(', '))
                .replace('{highlights}', enhanced[i].highlights.join('\n'));

            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const improved = JSON.parse(responseText);

            if (improved.description && improved.highlights) {
                changes.push({
                    section: `Project - ${enhanced[i].name}`,
                    original: `${enhanced[i].description} | ${enhanced[i].highlights.join(' | ')}`,
                    enhanced: `${improved.description} | ${improved.highlights.join(' | ')}`,
                    reason: 'Improved technical impact and clarity',
                });
                enhanced[i] = {
                    ...enhanced[i],
                    description: improved.description,
                    highlights: improved.highlights,
                };
            }
        } catch (error) {
            console.error(`Error enhancing project ${i}:`, error);
        }
    }

    return { enhanced, changes };
}

/* ========================================
   Main Enhancement Export
   ======================================== */

export async function enhanceResume(
    data: ResumeData,
    jobDescription: string = ''
): Promise<EnhancementResult> {
    const genAI = getGeminiClient();
    const allChanges: EnhancementChange[] = [];
    let allKeywordsAdded: string[] = [];

    // Clone the data
    const enhancedData: ResumeData = JSON.parse(JSON.stringify(data));

    // 1. Enhance summary
    const summaryResult = await enhanceSummary(genAI, enhancedData.personalInfo.summary || '', jobDescription);
    if (summaryResult.enhanced) enhancedData.personalInfo.summary = summaryResult.enhanced;
    if (summaryResult.change) allChanges.push(summaryResult.change);

    // 2. Enhance experience
    const expResult = await enhanceExperience(genAI, enhancedData.experience, jobDescription);
    enhancedData.experience = expResult.enhanced;
    allChanges.push(...expResult.changes);

    // 3. Enhance skills
    const skillsResult = await enhanceSkills(genAI, enhancedData.skills, jobDescription);
    enhancedData.skills = skillsResult.enhanced;
    allChanges.push(...skillsResult.changes);
    allKeywordsAdded = skillsResult.keywordsAdded;

    // 4. Enhance projects
    if (enhancedData.projects.length > 0) {
        const projResult = await enhanceProjects(genAI, enhancedData.projects);
        enhancedData.projects = projResult.enhanced;
        allChanges.push(...projResult.changes);
    }

    return {
        enhancedData,
        changes: allChanges,
        keywordsAdded: allKeywordsAdded,
    };
}

/* ========================================
   Chat Enhancement Export
   ======================================== */

export async function chatWithAI(
    message: string,
    resumeContext: ResumeData
): Promise<string> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are an expert resume coach and career advisor. You have access to the user's resume data and can provide personalized suggestions for improvement.

Resume Context:
- Name: ${resumeContext.personalInfo.fullName}
- Summary: ${resumeContext.personalInfo.summary || 'Not provided'}
- Experience: ${resumeContext.experience.map(e => `${e.position} at ${e.company}`).join(', ')}
- Skills: ${resumeContext.skills.flatMap(s => s.items).join(', ')}
- Education: ${resumeContext.education.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join(', ')}

Provide specific, actionable advice. Be concise but helpful. Focus on ATS optimization, keyword improvement, and professional presentation.`;

    try {
        const result = await model.generateContent(`${systemPrompt}\n\nUser question: ${message}`);
        return result.response.text().trim();
    } catch (error) {
        console.error('Chat error:', error);
        return 'I apologize, but I encountered an error. Please try again.';
    }
}
