/* ========================================
   Resume Data Types
   ======================================== */

export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    summary?: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    highlights?: string[];
}

export interface Experience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
}

export interface Skill {
    id: string;
    category: string;
    items: string[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    highlights: string[];
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    education: Education[];
    experience: Experience[];
    skills: Skill[];
    projects: Project[];
    certifications: Certification[];
}

/* ========================================
   ATS Score Types
   ======================================== */

export interface ATSBreakdown {
    keywordScore: number;
    formattingScore: number;
    sectionScore: number;
    readabilityScore: number;
    experienceScore: number;
}

export interface ATSSuggestion {
    category: 'keyword' | 'formatting' | 'content' | 'structure';
    message: string;
    priority: 'high' | 'medium' | 'low';
}

export interface ATSScore {
    overallScore: number;
    breakdown: ATSBreakdown;
    suggestions: ATSSuggestion[];
}

/* ========================================
   Template Types
   ======================================== */

export type TemplateId = 'classic' | 'modern' | 'creative';

export interface TemplateInfo {
    id: TemplateId;
    name: string;
    description: string;
    previewColor: string;
}

/* ========================================
   Enhancement Types
   ======================================== */

export interface EnhancementChange {
    section: string;
    original: string;
    enhanced: string;
    reason: string;
}

export interface EnhancementResult {
    enhancedData: ResumeData;
    changes: EnhancementChange[];
    keywordsAdded: string[];
}

/* ========================================
   App State Types
   ======================================== */

export type WizardStep = 'input' | 'score' | 'enhance' | 'template' | 'download';

export interface AppState {
    currentStep: WizardStep;
    originalData: ResumeData | null;
    enhancedData: ResumeData | null;
    originalScore: ATSScore | null;
    enhancedScore: ATSScore | null;
    selectedTemplate: TemplateId;
    jobDescription: string;
    isProcessing: boolean;
    changes: EnhancementChange[];
}

/* ========================================
   Chat Types
   ======================================== */

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}
