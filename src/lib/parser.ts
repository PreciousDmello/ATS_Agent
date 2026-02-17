import { ResumeData, PersonalInfo, Education, Experience, Skill, Project, Certification } from './types';
import { v4 as uuidv4 } from 'uuid';

/* ========================================
   Resume Parser - Extracts structured data
   from raw text (PDF/DOCX)
   ======================================== */

// Section header patterns
const SECTION_PATTERNS = {
    education: /\b(education|academic|qualification|degree)\b/i,
    experience: /\b(experience|employment|work history|professional|career)\b/i,
    skills: /\b(skills|technical skills|competencies|technologies|proficiencies)\b/i,
    projects: /\b(projects|portfolio|personal projects|academic projects)\b/i,
    certifications: /\b(certifications?|licenses?|credentials)\b/i,
    summary: /\b(summary|objective|profile|about me|professional summary)\b/i,
    contact: /\b(contact|personal info|personal information)\b/i,
};

// Data extraction patterns
const EMAIL_PATTERN = /[\w.-]+@[\w.-]+\.\w+/;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/;
const LINKEDIN_PATTERN = /linkedin\.com\/in\/[\w-]+/i;
const GITHUB_PATTERN = /github\.com\/[\w-]+/i;
const URL_PATTERN = /https?:\/\/[^\s]+/g;
const DATE_PATTERN = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|(?:\d{1,2}\/\d{4})|(?:\d{4})\s*[-–]\s*(?:Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4})/gi;

/* ========================================
   Text to Structured Data
   ======================================== */

function splitIntoSections(text: string): Record<string, string> {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const sections: Record<string, string> = {};
    let currentSection = 'header';
    const sectionContent: string[] = [];

    for (const line of lines) {
        let matched = false;
        for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
            // Check if line is a section header (typically short, and matches pattern)
            if (pattern.test(line) && line.split(/\s+/).length <= 6) {
                if (sectionContent.length > 0) {
                    sections[currentSection] = sectionContent.join('\n');
                    sectionContent.length = 0;
                }
                currentSection = sectionName;
                matched = true;
                break;
            }
        }
        if (!matched) {
            sectionContent.push(line);
        }
    }

    if (sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n');
    }

    return sections;
}

function extractPersonalInfo(headerText: string, allText: string): PersonalInfo {
    const lines = headerText.split('\n').filter(Boolean);

    const email = allText.match(EMAIL_PATTERN)?.[0] || '';
    const phone = allText.match(PHONE_PATTERN)?.[0] || '';
    const linkedin = allText.match(LINKEDIN_PATTERN)?.[0] || '';
    const github = allText.match(GITHUB_PATTERN)?.[0] || '';

    // First non-email, non-phone line is likely the name
    let fullName = '';
    for (const line of lines) {
        if (!EMAIL_PATTERN.test(line) && !PHONE_PATTERN.test(line) && !URL_PATTERN.test(line)) {
            if (line.length < 60 && line.length > 2) {
                fullName = line;
                break;
            }
        }
    }

    // Try to find location (city, state pattern)
    const locationMatch = allText.match(/(?:[A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*(?:[A-Z]{2}|[A-Z][a-z]+)/);
    const location = locationMatch?.[0] || '';

    return {
        fullName,
        email,
        phone,
        location,
        linkedin: linkedin ? `https://www.${linkedin}` : '',
        github: github ? `https://www.${github}` : '',
        summary: '',
    };
}

function extractEducation(text: string): Education[] {
    if (!text) return [];

    const educations: Education[] = [];
    const lines = text.split('\n').filter(Boolean);

    // Group lines by education entries (look for degree patterns or institution patterns)
    const degreePattern = /\b(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Ph\.?D|Bachelor|Master|Doctor|MBA|Associate|Diploma)\b/i;
    let currentEdu: Partial<Education> = {};
    let hasStarted = false;

    for (const line of lines) {
        if (degreePattern.test(line) || (!hasStarted && line.length > 5)) {
            if (hasStarted && currentEdu.institution) {
                educations.push({
                    id: uuidv4(),
                    institution: currentEdu.institution || '',
                    degree: currentEdu.degree || '',
                    field: currentEdu.field || '',
                    startDate: currentEdu.startDate || '',
                    endDate: currentEdu.endDate || '',
                    gpa: currentEdu.gpa || '',
                    highlights: currentEdu.highlights || [],
                });
                currentEdu = {};
            }
            hasStarted = true;

            // Try to extract degree and institution from the line
            const degreeMatch = line.match(degreePattern);
            if (degreeMatch) {
                currentEdu.degree = line.substring(0, line.indexOf(degreeMatch[0]) + degreeMatch[0].length).trim();
                currentEdu.field = line.substring(line.indexOf(degreeMatch[0]) + degreeMatch[0].length).trim();
            }

            // Look for dates
            const dates = line.match(DATE_PATTERN);
            if (dates && dates.length >= 1) {
                const dateParts = dates[0].split(/[-–]/);
                currentEdu.startDate = dateParts[0]?.trim() || '';
                currentEdu.endDate = dateParts[1]?.trim() || '';
            }
        } else if (hasStarted) {
            if (!currentEdu.institution && line.length > 3) {
                currentEdu.institution = line;
            } else if (line.match(/GPA|CGPA/i)) {
                const gpaMatch = line.match(/(\d+\.?\d*)\s*(?:\/\s*(\d+\.?\d*))?/);
                if (gpaMatch) currentEdu.gpa = gpaMatch[0];
            } else {
                if (!currentEdu.highlights) currentEdu.highlights = [];
                currentEdu.highlights.push(line);
            }
        }
    }

    // Push last education
    if (hasStarted && (currentEdu.institution || currentEdu.degree)) {
        educations.push({
            id: uuidv4(),
            institution: currentEdu.institution || '',
            degree: currentEdu.degree || '',
            field: currentEdu.field || '',
            startDate: currentEdu.startDate || '',
            endDate: currentEdu.endDate || '',
            gpa: currentEdu.gpa || '',
            highlights: currentEdu.highlights || [],
        });
    }

    return educations.length > 0 ? educations : [{
        id: uuidv4(),
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        highlights: [],
    }];
}

function extractExperience(text: string): Experience[] {
    if (!text) return [];

    const experiences: Experience[] = [];
    const lines = text.split('\n').filter(Boolean);

    let currentExp: Partial<Experience> = {};
    let bullets: string[] = [];
    let hasStarted = false;

    for (const line of lines) {
        const dates = line.match(DATE_PATTERN);
        const isBullet = /^[•●▪\-\*]/.test(line.trim());

        // New experience entry (has dates or looks like a title/company)
        if (dates && !isBullet) {
            if (hasStarted && (currentExp.company || currentExp.position)) {
                experiences.push({
                    id: uuidv4(),
                    company: currentExp.company || '',
                    position: currentExp.position || '',
                    startDate: currentExp.startDate || '',
                    endDate: currentExp.endDate || '',
                    current: currentExp.current || false,
                    description: bullets.length > 0 ? bullets : [''],
                });
                bullets = [];
                currentExp = {};
            }
            hasStarted = true;

            const dateParts = dates[0].split(/[-–]/);
            currentExp.startDate = dateParts[0]?.trim() || '';
            currentExp.endDate = dateParts[1]?.trim() || 'Present';
            currentExp.current = /present|current|now/i.test(currentExp.endDate);

            // Remove dates from line to get position/company
            const cleanLine = line.replace(DATE_PATTERN, '').replace(/[|,]/g, ' ').trim();
            if (cleanLine) currentExp.position = cleanLine;
        } else if (isBullet) {
            bullets.push(line.replace(/^[•●▪\-\*]\s*/, '').trim());
        } else if (hasStarted && !currentExp.company && line.length > 2) {
            currentExp.company = line.trim();
        } else if (hasStarted && !currentExp.position && line.length > 2) {
            currentExp.position = line.trim();
        } else if (hasStarted && line.length > 10) {
            bullets.push(line.trim());
        }
    }

    // Push last experience
    if (hasStarted && (currentExp.company || currentExp.position)) {
        experiences.push({
            id: uuidv4(),
            company: currentExp.company || '',
            position: currentExp.position || '',
            startDate: currentExp.startDate || '',
            endDate: currentExp.endDate || '',
            current: currentExp.current || false,
            description: bullets.length > 0 ? bullets : [''],
        });
    }

    return experiences;
}

function extractSkills(text: string): Skill[] {
    if (!text) return [];

    const skills: Skill[] = [];
    const lines = text.split('\n').filter(Boolean);

    for (const line of lines) {
        // Check for "Category: skill1, skill2" pattern
        const colonSplit = line.split(':');
        if (colonSplit.length >= 2) {
            const category = colonSplit[0].trim();
            const items = colonSplit.slice(1).join(':').split(/[,;|]/).map(s => s.trim()).filter(Boolean);
            if (items.length > 0) {
                skills.push({ id: uuidv4(), category, items });
            }
        } else {
            // List of skills separated by commas or pipes
            const items = line.split(/[,;|•●▪]/).map(s => s.trim()).filter(s => s.length > 1);
            if (items.length > 1) {
                skills.push({ id: uuidv4(), category: 'Technical Skills', items });
            }
        }
    }

    return skills.length > 0 ? skills : [{ id: uuidv4(), category: 'Skills', items: [] }];
}

function extractProjects(text: string): Project[] {
    if (!text) return [];

    const projects: Project[] = [];
    const lines = text.split('\n').filter(Boolean);

    let currentProject: Partial<Project> = {};
    let highlights: string[] = [];
    let hasStarted = false;

    for (const line of lines) {
        const isBullet = /^[•●▪\-\*]/.test(line.trim());

        if (!isBullet && line.length > 3 && line.length < 100) {
            if (hasStarted && currentProject.name) {
                projects.push({
                    id: uuidv4(),
                    name: currentProject.name || '',
                    description: currentProject.description || '',
                    technologies: currentProject.technologies || [],
                    highlights: highlights.length > 0 ? highlights : [],
                });
                highlights = [];
                currentProject = {};
            }
            hasStarted = true;
            currentProject.name = line.replace(/[|].*$/, '').trim();

            // Extract technologies if mentioned in brackets or after pipe
            const techMatch = line.match(/[|(]\s*([^)]+)\s*[)]/);
            if (techMatch) {
                currentProject.technologies = techMatch[1].split(/[,;]/).map(t => t.trim());
            }
        } else if (isBullet) {
            highlights.push(line.replace(/^[•●▪\-\*]\s*/, '').trim());
        } else if (hasStarted && !currentProject.description && line.length > 10) {
            currentProject.description = line.trim();
        }
    }

    // Push last project
    if (hasStarted && currentProject.name) {
        projects.push({
            id: uuidv4(),
            name: currentProject.name || '',
            description: currentProject.description || '',
            technologies: currentProject.technologies || [],
            highlights: highlights.length > 0 ? highlights : [],
        });
    }

    return projects;
}

/* ========================================
   Main Parser Export
   ======================================== */

export function parseResumeText(rawText: string): ResumeData {
    const sections = splitIntoSections(rawText);

    const personalInfo = extractPersonalInfo(
        sections['header'] || sections['contact'] || '',
        rawText
    );

    if (sections['summary']) {
        personalInfo.summary = sections['summary'];
    }

    return {
        personalInfo,
        education: extractEducation(sections['education'] || ''),
        experience: extractExperience(sections['experience'] || ''),
        skills: extractSkills(sections['skills'] || ''),
        projects: extractProjects(sections['projects'] || ''),
        certifications: [],
    };
}

/* ========================================
   Create Empty Resume
   ======================================== */

export function createEmptyResume(): ResumeData {
    return {
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            portfolio: '',
            summary: '',
        },
        education: [{
            id: uuidv4(),
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            gpa: '',
            highlights: [],
        }],
        experience: [{
            id: uuidv4(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: [''],
        }],
        skills: [{
            id: uuidv4(),
            category: '',
            items: [],
        }],
        projects: [{
            id: uuidv4(),
            name: '',
            description: '',
            technologies: [],
            highlights: [],
        }],
        certifications: [],
    };
}
