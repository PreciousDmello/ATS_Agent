import { ResumeData, ATSScore, ATSBreakdown, ATSSuggestion } from './types';

/* ========================================
   ATS Keywords Database
   ======================================== */

const ACTION_VERBS = [
    'achieved', 'administered', 'analyzed', 'built', 'collaborated',
    'communicated', 'conducted', 'coordinated', 'created', 'delivered',
    'demonstrated', 'designed', 'developed', 'directed', 'engineered',
    'established', 'executed', 'facilitated', 'generated', 'implemented',
    'improved', 'increased', 'initiated', 'innovated', 'integrated',
    'launched', 'led', 'managed', 'mentored', 'monitored',
    'negotiated', 'optimized', 'organized', 'oversaw', 'performed',
    'planned', 'presented', 'produced', 'programmed', 'reduced',
    'researched', 'resolved', 'restructured', 'reviewed', 'scaled',
    'spearheaded', 'streamlined', 'supervised', 'trained', 'transformed',
];

const TECH_KEYWORDS = [
    'python', 'javascript', 'typescript', 'react', 'node.js', 'angular',
    'vue', 'java', 'c++', 'sql', 'nosql', 'mongodb', 'postgresql',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git',
    'agile', 'scrum', 'rest api', 'graphql', 'machine learning',
    'deep learning', 'data analysis', 'tensorflow', 'pytorch',
    'html', 'css', 'sass', 'webpack', 'next.js', 'express',
    'django', 'flask', 'spring', 'microservices', 'redis',
];

const SOFT_SKILLS = [
    'leadership', 'communication', 'teamwork', 'problem-solving',
    'analytical', 'strategic', 'collaborative', 'innovative',
    'adaptable', 'detail-oriented', 'self-motivated', 'proactive',
];

const QUANTIFIER_PATTERN = /\d+[%+]?|\$[\d,]+/;

/* ========================================
   Scoring Functions
   ======================================== */

function calculateKeywordScore(data: ResumeData, jobDescription?: string): number {
    const allText = getFullText(data).toLowerCase();
    let score = 0;
    let maxScore = 0;

    // Check action verbs in experience
    const expText = data.experience.map(e => e.description.join(' ')).join(' ').toLowerCase();
    let actionVerbCount = 0;
    ACTION_VERBS.forEach(verb => {
        if (expText.includes(verb)) actionVerbCount++;
    });
    score += Math.min((actionVerbCount / 10) * 25, 25);
    maxScore += 25;

    // Check technical keywords
    const allSkills = data.skills.flatMap(s => s.items).join(' ').toLowerCase();
    let techCount = 0;
    TECH_KEYWORDS.forEach(keyword => {
        if (allText.includes(keyword) || allSkills.includes(keyword)) techCount++;
    });
    score += Math.min((techCount / 8) * 25, 25);
    maxScore += 25;

    // Check soft skills
    let softCount = 0;
    SOFT_SKILLS.forEach(skill => {
        if (allText.includes(skill)) softCount++;
    });
    score += Math.min((softCount / 4) * 15, 15);
    maxScore += 15;

    // Check quantified achievements
    const descriptions = data.experience.flatMap(e => e.description);
    const quantified = descriptions.filter(d => QUANTIFIER_PATTERN.test(d)).length;
    score += Math.min((quantified / Math.max(descriptions.length, 1)) * 20, 20);
    maxScore += 20;

    // Job description keyword matching
    if (jobDescription) {
        const jdWords = jobDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const uniqueJdWords = [...new Set(jdWords)];
        let matches = 0;
        uniqueJdWords.forEach(word => {
            if (allText.includes(word)) matches++;
        });
        score += Math.min((matches / Math.max(uniqueJdWords.length, 1)) * 15, 15);
        maxScore += 15;
    } else {
        maxScore += 15;
        score += 8; // Default middle score when no JD
    }

    return Math.round((score / maxScore) * 100);
}

function calculateFormattingScore(data: ResumeData): number {
    let score = 0;

    // Check bullet point usage in experience
    const hasBullets = data.experience.every(e => e.description.length >= 2);
    if (hasBullets) score += 30;
    else if (data.experience.some(e => e.description.length >= 2)) score += 15;

    // Check consistent date formatting
    const dates = [
        ...data.experience.map(e => e.startDate),
        ...data.experience.map(e => e.endDate),
        ...data.education.map(e => e.startDate),
        ...data.education.map(e => e.endDate),
    ].filter(Boolean);
    if (dates.length > 0) score += 25;

    // Check skills are categorized
    if (data.skills.length >= 2) score += 25;
    else if (data.skills.length === 1) score += 15;

    // Check for summary/objective
    if (data.personalInfo.summary && data.personalInfo.summary.length > 50) score += 20;
    else if (data.personalInfo.summary) score += 10;

    return Math.min(score, 100);
}

function calculateSectionScore(data: ResumeData): number {
    let score = 0;

    // Personal info completeness (20 points)
    if (data.personalInfo.fullName) score += 4;
    if (data.personalInfo.email) score += 4;
    if (data.personalInfo.phone) score += 4;
    if (data.personalInfo.location) score += 4;
    if (data.personalInfo.linkedin) score += 4;

    // Education (20 points)
    if (data.education.length > 0) score += 20;

    // Experience (25 points)
    if (data.experience.length >= 3) score += 25;
    else if (data.experience.length >= 2) score += 20;
    else if (data.experience.length >= 1) score += 15;

    // Skills (20 points)
    if (data.skills.length > 0 && data.skills.flatMap(s => s.items).length >= 5) score += 20;
    else if (data.skills.length > 0) score += 12;

    // Projects (15 points)
    if (data.projects.length >= 2) score += 15;
    else if (data.projects.length >= 1) score += 10;

    return Math.min(score, 100);
}

function calculateReadabilityScore(data: ResumeData): number {
    let score = 70; // Base score

    const allDescriptions = [
        ...data.experience.flatMap(e => e.description),
        ...data.projects.flatMap(p => p.highlights),
    ];

    if (allDescriptions.length === 0) return 50;

    // Check average sentence length (penalize too long)
    const avgLength = allDescriptions.reduce((sum, d) => sum + d.split(' ').length, 0) / allDescriptions.length;
    if (avgLength >= 8 && avgLength <= 25) score += 15;
    else if (avgLength < 8) score -= 5;
    else score -= 10;

    // Check for jargon overuse
    const jargonCount = allDescriptions.filter(d =>
        /synergy|leverage|paradigm|utilize/i.test(d)
    ).length;
    score -= jargonCount * 3;

    // Check for action verb start
    const startsWithVerb = allDescriptions.filter(d => {
        const firstWord = d.trim().split(' ')[0]?.toLowerCase();
        return ACTION_VERBS.includes(firstWord);
    }).length;
    score += Math.min((startsWithVerb / allDescriptions.length) * 15, 15);

    return Math.max(0, Math.min(score, 100));
}

function calculateExperienceScore(data: ResumeData): number {
    let score = 0;

    data.experience.forEach(exp => {
        // Has multiple description points
        if (exp.description.length >= 3) score += 10;
        else if (exp.description.length >= 2) score += 7;
        else score += 3;

        // Has quantified achievements
        const hasMetrics = exp.description.some(d => QUANTIFIER_PATTERN.test(d));
        if (hasMetrics) score += 10;

        // Has dates
        if (exp.startDate && exp.endDate) score += 5;
    });

    const maxPossible = data.experience.length * 25;
    return maxPossible > 0 ? Math.min(Math.round((score / maxPossible) * 100), 100) : 50;
}

/* ========================================
   Suggestion Generator
   ======================================== */

function generateSuggestions(data: ResumeData, breakdown: ATSBreakdown): ATSSuggestion[] {
    const suggestions: ATSSuggestion[] = [];

    // Keyword suggestions
    if (breakdown.keywordScore < 60) {
        suggestions.push({
            category: 'keyword',
            message: 'Add more industry-specific keywords and technical skills relevant to your target role.',
            priority: 'high',
        });
    }

    const expText = data.experience.map(e => e.description.join(' ')).join(' ').toLowerCase();
    const usedVerbs = ACTION_VERBS.filter(v => expText.includes(v));
    if (usedVerbs.length < 5) {
        suggestions.push({
            category: 'keyword',
            message: `Start bullet points with strong action verbs like: ${ACTION_VERBS.slice(0, 8).join(', ')}`,
            priority: 'high',
        });
    }

    // Formatting suggestions
    if (breakdown.formattingScore < 60) {
        if (!data.personalInfo.summary) {
            suggestions.push({
                category: 'formatting',
                message: 'Add a professional summary at the top of your resume to quickly convey your value proposition.',
                priority: 'high',
            });
        }
        if (data.skills.length < 2) {
            suggestions.push({
                category: 'formatting',
                message: 'Organize your skills into categories (e.g., "Programming Languages", "Tools & Frameworks") for better ATS parsing.',
                priority: 'medium',
            });
        }
    }

    // Content suggestions
    if (breakdown.experienceScore < 60) {
        const noMetrics = data.experience.filter(exp =>
            !exp.description.some(d => QUANTIFIER_PATTERN.test(d))
        );
        if (noMetrics.length > 0) {
            suggestions.push({
                category: 'content',
                message: `Quantify achievements in your experience at ${noMetrics.map(e => e.company).join(', ')}. Use numbers, percentages, or dollar amounts.`,
                priority: 'high',
            });
        }

        data.experience.forEach(exp => {
            if (exp.description.length < 3) {
                suggestions.push({
                    category: 'content',
                    message: `Add more bullet points (at least 3) for your role at ${exp.company}.`,
                    priority: 'medium',
                });
            }
        });
    }

    // Section suggestions
    if (breakdown.sectionScore < 70) {
        if (!data.personalInfo.linkedin) {
            suggestions.push({
                category: 'structure',
                message: 'Add your LinkedIn profile URL to improve discoverability.',
                priority: 'low',
            });
        }
        if (data.projects.length === 0) {
            suggestions.push({
                category: 'structure',
                message: 'Add a Projects section to showcase relevant work and technical skills.',
                priority: 'medium',
            });
        }
    }

    if (breakdown.readabilityScore < 60) {
        suggestions.push({
            category: 'content',
            message: 'Keep bullet points concise (10-25 words). Avoid jargon like "synergy" or "leverage".',
            priority: 'medium',
        });
    }

    return suggestions.slice(0, 10);
}

/* ========================================
   Helpers
   ======================================== */

function getFullText(data: ResumeData): string {
    const parts = [
        data.personalInfo.fullName,
        data.personalInfo.summary || '',
        ...data.education.map(e => `${e.institution} ${e.degree} ${e.field} ${(e.highlights || []).join(' ')}`),
        ...data.experience.map(e => `${e.company} ${e.position} ${e.description.join(' ')}`),
        ...data.skills.flatMap(s => s.items),
        ...data.projects.map(p => `${p.name} ${p.description} ${p.technologies.join(' ')} ${p.highlights.join(' ')}`),
        ...data.certifications.map(c => `${c.name} ${c.issuer}`),
    ];
    return parts.join(' ');
}

/* ========================================
   Main Scorer Export
   ======================================== */

export function calculateATSScore(data: ResumeData, jobDescription?: string): ATSScore {
    const breakdown: ATSBreakdown = {
        keywordScore: calculateKeywordScore(data, jobDescription),
        formattingScore: calculateFormattingScore(data),
        sectionScore: calculateSectionScore(data),
        readabilityScore: calculateReadabilityScore(data),
        experienceScore: calculateExperienceScore(data),
    };

    // Weighted overall score
    const overallScore = Math.round(
        breakdown.keywordScore * 0.30 +
        breakdown.formattingScore * 0.10 +
        breakdown.sectionScore * 0.20 +
        breakdown.readabilityScore * 0.15 +
        breakdown.experienceScore * 0.25
    );

    const suggestions = generateSuggestions(data, breakdown);

    return {
        overallScore: Math.min(overallScore, 100),
        breakdown,
        suggestions,
    };
}
