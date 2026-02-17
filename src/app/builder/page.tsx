'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    ResumeData,
    ATSScore,
    TemplateId,
    WizardStep,
    EnhancementChange,
    ChatMessage,
} from '@/lib/types';
import { TEMPLATES } from '@/lib/templates';
import { createEmptyResume } from '@/lib/parser';
import {
    Upload,
    FileText,
    BarChart3,
    Sparkles,
    Layout,
    Download,
    ArrowRight,
    ArrowLeft,
    Check,
    X,
    MessageSquare,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Briefcase,
    GraduationCap,
    Code,
    FolderKanban,
    User,
    Loader2,
    FileType
} from 'lucide-react';

/* ========================================
   Builder Page — Main Component
   ======================================== */

export default function BuilderPage() {
    // State
    const [step, setStep] = useState<WizardStep>('input');
    const [inputMethod, setInputMethod] = useState<'upload' | 'manual' | null>(null);
    const [resumeData, setResumeData] = useState<ResumeData>(createEmptyResume());
    const [enhancedData, setEnhancedData] = useState<ResumeData | null>(null);
    const [originalScore, setOriginalScore] = useState<ATSScore | null>(null);
    const [enhancedScore, setEnhancedScore] = useState<ATSScore | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');
    const [jobDescription, setJobDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [changes, setChanges] = useState<EnhancementChange[]>([]);
    const [activeFormTab, setActiveFormTab] = useState('personal');
    const [previewHtml, setPreviewHtml] = useState('');
    const [showComparison, setShowComparison] = useState(false);

    // Chat state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'assistant', content: 'Hi! I\'m your resume coach. Ask me anything about improving your resume!', timestamp: new Date() },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Steps config
    const steps: { id: WizardStep; label: string; number: number }[] = [
        { id: 'input', label: 'Input', number: 1 },
        { id: 'score', label: 'Score', number: 2 },
        { id: 'enhance', label: 'Enhance', number: 3 },
        { id: 'template', label: 'Template', number: 4 },
        { id: 'download', label: 'Download', number: 5 },
    ];

    const stepOrder: WizardStep[] = ['input', 'score', 'enhance', 'template', 'download'];
    const currentIndex = stepOrder.indexOf(step);

    // ======== File Upload ========
    const handleFileUpload = async (file: File) => {
        setIsProcessing(true);
        setProcessingMessage('Parsing document...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/parse', { method: 'POST', body: formData });
            const result = await res.json();

            if (result.success) {
                setResumeData(result.data);
                setStep('score');
                calculateScore(result.data);
            } else {
                alert(result.error || 'Failed to parse resume');
            }
        } catch (error) {
            alert('Error uploading file. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFileUpload(files[0]);
    }, []);

    // ======== ATS Score ========
    const calculateScore = async (data: ResumeData) => {
        setIsProcessing(true);
        setProcessingMessage('Calculating Score...');

        try {
            const res = await fetch('/api/ats-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: data, jobDescription }),
            });
            const result = await res.json();
            if (result.success) {
                setOriginalScore(result.score);
            }
        } catch (error) {
            console.error('Score calculation error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // ======== AI Enhancement ========
    const handleEnhance = async () => {
        setIsProcessing(true);
        setProcessingMessage('Enhancing content...');

        try {
            const res = await fetch('/api/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData, jobDescription }),
            });
            const result = await res.json();

            if (result.success) {
                setEnhancedData(result.enhancedData);
                setChanges(result.changes || []);

                // Calculate enhanced score
                const scoreRes = await fetch('/api/ats-score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData: result.enhancedData, jobDescription }),
                });
                const scoreResult = await scoreRes.json();
                if (scoreResult.success) {
                    setEnhancedScore(scoreResult.score);
                }

                setStep('template');
            } else {
                alert(result.error || 'Enhancement failed');
            }
        } catch (error) {
            alert('Error enhancing resume. Please check your API key and try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ======== Preview ========
    const generatePreview = async (data: ResumeData, templateId: TemplateId) => {
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: data, templateId, format: 'html' }),
            });
            const html = await res.text();
            setPreviewHtml(html);
        } catch (error) {
            console.error('Preview error:', error);
        }
    };

    useEffect(() => {
        if (step === 'template' || step === 'download') {
            const data = enhancedData || resumeData;
            generatePreview(data, selectedTemplate);
        }
    }, [step, selectedTemplate, enhancedData]);

    // ======== Download ========
    const handleDownload = async (format: 'html' | 'docx') => {
        const data = enhancedData || resumeData;
        setIsProcessing(true);
        setProcessingMessage(`Generating ${format.toUpperCase()}...`);

        try {
            if (format === 'html') {
                const res = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData: data, templateId: selectedTemplate, format: 'html' }),
                });
                const html = await res.text();

                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(html);
                    printWindow.document.close();
                    setTimeout(() => printWindow.print(), 500);
                }
            } else if (format === 'docx') {
                const res = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData: data, templateId: selectedTemplate, format: 'docx' }),
                });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resume_${data.personalInfo.fullName?.replace(/\s+/g, '_') || 'optimized'}.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            alert('Error generating file. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ======== Chat ========
    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput,
            timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setChatLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: chatInput, resumeData: enhancedData || resumeData }),
            });
            const result = await res.json();

            const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.response || 'Sorry, I could not process that.',
                timestamp: new Date(),
            };
            setChatMessages(prev => [...prev, assistantMsg]);
        } catch {
            setChatMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, there was an error. Please try again.',
                timestamp: new Date(),
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    // ======== Manual Entry Handlers ========
    const updatePersonalInfo = (field: string, value: string) => {
        setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value },
        }));
    };

    const addEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, { id: Date.now().toString(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', highlights: [] }],
        }));
    };

    const updateEducation = (index: number, field: string, value: string) => {
        setResumeData(prev => {
            const updated = [...prev.education];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, education: updated };
        });
    };

    const removeEducation = (index: number) => {
        if (resumeData.education.length <= 1) return;
        setResumeData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index),
        }));
    };

    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: Date.now().toString(), company: '', position: '', startDate: '', endDate: '', gpa: '', highlights: [] }],
        }));
    };

    const updateExperience = (index: number, field: string, value: string | string[] | boolean) => {
        setResumeData(prev => {
            const updated = [...prev.experience];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, experience: updated };
        });
    };

    const removeExperience = (index: number) => {
        if (resumeData.experience.length <= 1) return;
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index),
        }));
    };

    const updateExpBullet = (expIndex: number, bulletIndex: number, value: string) => {
        setResumeData(prev => {
            const updated = [...prev.experience];
            const desc = [...updated[expIndex].description];
            desc[bulletIndex] = value;
            updated[expIndex] = { ...updated[expIndex], description: desc };
            return { ...prev, experience: updated };
        });
    };

    const addExpBullet = (expIndex: number) => {
        setResumeData(prev => {
            const updated = [...prev.experience];
            updated[expIndex] = { ...updated[expIndex], description: [...updated[expIndex].description, ''] };
            return { ...prev, experience: updated };
        });
    };

    const removeExpBullet = (expIndex: number, bulletIndex: number) => {
        if (resumeData.experience[expIndex].description.length <= 1) return;
        setResumeData(prev => {
            const updated = [...prev.experience];
            const desc = updated[expIndex].description.filter((_, i) => i !== bulletIndex);
            updated[expIndex] = { ...updated[expIndex], description: desc };
            return { ...prev, experience: updated };
        });
    };

    const addSkillCategory = () => {
        setResumeData(prev => ({
            ...prev,
            skills: [...prev.skills, { id: Date.now().toString(), category: '', items: [] }],
        }));
    };

    const updateSkillCategory = (index: number, value: string) => {
        setResumeData(prev => {
            const updated = [...prev.skills];
            updated[index] = { ...updated[index], category: value };
            return { ...prev, skills: updated };
        });
    };

    const addSkillItem = (catIndex: number, skill: string) => {
        if (!skill.trim()) return;
        setResumeData(prev => {
            const updated = [...prev.skills];
            updated[catIndex] = { ...updated[catIndex], items: [...updated[catIndex].items, skill.trim()] };
            return { ...prev, skills: updated };
        });
    };

    const removeSkillItem = (catIndex: number, itemIndex: number) => {
        setResumeData(prev => {
            const updated = [...prev.skills];
            updated[catIndex] = { ...updated[catIndex], items: updated[catIndex].items.filter((_, i) => i !== itemIndex) };
            return { ...prev, skills: updated };
        });
    };

    const removeSkillCategory = (index: number) => {
        if (resumeData.skills.length <= 1) return;
        setResumeData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index),
        }));
    };

    const addProject = () => {
        setResumeData(prev => ({
            ...prev,
            projects: [...prev.projects, { id: Date.now().toString(), name: '', description: '', technologies: [], highlights: [''], link: '' }],
        }));
    };

    const updateProject = (index: number, field: string, value: string | string[]) => {
        setResumeData(prev => {
            const updated = [...prev.projects];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, projects: updated };
        });
    };

    const removeProject = (index: number) => {
        if (resumeData.projects.length <= 1) return;
        setResumeData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index),
        }));
    };

    const handleManualSubmit = () => {
        setStep('score');
        calculateScore(resumeData);
    };

    // ======== Score color helper ========
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    // ======== Icons Helper ========
    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'personal': return <User size={16} />;
            case 'education': return <GraduationCap size={16} />;
            case 'experience': return <Briefcase size={16} />;
            case 'skills': return <Code size={16} />;
            case 'projects': return <FolderKanban size={16} />;
            default: return <FileText size={16} />;
        }
    }

    // ======== RENDER ========
    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link href="/" className="logo">
                        <div className="logo-icon">
                            <Sparkles size={18} />
                        </div>
                        WhizResume
                    </Link>
                    <div className="nav-links">
                        <Link href="/" className="nav-link flex items-center gap-1">
                            <ArrowLeft size={16} /> Home
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="wizard-container">
                {/* Wizard Steps */}
                <div className="wizard-steps">
                    {steps.map((s, i) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div
                                className={`wizard-step ${step === s.id ? 'active' : ''} ${currentIndex > i ? 'completed' : ''}`}
                                onClick={() => currentIndex >= i ? setStep(s.id) : null}
                                style={{ cursor: currentIndex >= i ? 'pointer' : 'default' }}
                            >
                                <span className="wizard-step-number">
                                    {currentIndex > i ? <Check size={14} /> : s.number}
                                </span>
                                {s.label}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`wizard-connector ${currentIndex > i ? 'completed' : ''}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
                        <div className="loading-overlay" style={{ flexDirection: 'column', gap: '16px' }}>
                            <Loader2 className="animate-spin" size={48} color="var(--primary-500)" />
                            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{processingMessage}</p>
                        </div>
                    </div>
                )}

                {/* ======== STEP 1: INPUT ======== */}
                {step === 'input' && !isProcessing && (
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {!inputMethod && (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '8px' }}>
                                        Select Input Method
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        Choose how you want to provide your resume details
                                    </p>
                                </div>

                                <div className="input-method-grid">
                                    <div className="card input-method-card" onClick={() => setInputMethod('upload')}>
                                        <div className="method-icon"><Upload size={32} /></div>
                                        <h3>Upload Resume</h3>
                                        <p>Parse existing PDF or Word resume</p>
                                    </div>
                                    <div className="card input-method-card" onClick={() => setInputMethod('manual')}>
                                        <div className="method-icon"><FileText size={32} /></div>
                                        <h3>Build From Scratch</h3>
                                        <p>Use guided forms to enter details</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* File Upload */}
                        {inputMethod === 'upload' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Upload Document</h2>
                                    <button className="btn btn-ghost" onClick={() => setInputMethod(null)}><ArrowLeft size={16} /> Back</button>
                                </div>

                                <div
                                    className="upload-zone"
                                    onDrop={onDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="upload-icon"><Upload size={40} /></div>
                                    <h3>Drag & Drop Document</h3>
                                    <p>Supports PDF and DOCX</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.doc"
                                        style={{ display: 'none' }}
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    />
                                </div>

                                <div className="jd-section">
                                    <h3><Briefcase size={16} style={{ display: 'inline', marginRight: '8px' }} /> Target Job Description <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></h3>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Paste job description for keyword scoring..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Manual Entry */}
                        {inputMethod === 'manual' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Resume Details</h2>
                                    <button className="btn btn-ghost" onClick={() => setInputMethod(null)}><ArrowLeft size={16} /> Back</button>
                                </div>

                                <div className="form-tabs">
                                    {['personal', 'education', 'experience', 'skills', 'projects'].map(tab => (
                                        <button
                                            key={tab}
                                            className={`form-tab ${activeFormTab === tab ? 'active' : ''}`}
                                            onClick={() => setActiveFormTab(tab)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            {getTabIcon(tab)}
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <div className="card" style={{ padding: '28px' }}>
                                    {/* Personal Info Tab */}
                                    {activeFormTab === 'personal' && (
                                        <div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Full Name</label>
                                                    <input className="form-input" placeholder="John Doe" value={resumeData.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Email</label>
                                                    <input className="form-input" type="email" placeholder="john@example.com" value={resumeData.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Phone</label>
                                                    <input className="form-input" placeholder="+1 (555) 123-4567" value={resumeData.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Location</label>
                                                    <input className="form-input" placeholder="New York, NY" value={resumeData.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">LinkedIn URL</label>
                                                    <input className="form-input" placeholder="https://linkedin.com/in/johndoe" value={resumeData.personalInfo.linkedin || ''} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">GitHub URL</label>
                                                    <input className="form-input" placeholder="https://github.com/johndoe" value={resumeData.personalInfo.github || ''} onChange={(e) => updatePersonalInfo('github', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Professional Summary</label>
                                                <textarea className="form-textarea" placeholder="Brief summary of your professional background..." value={resumeData.personalInfo.summary || ''} onChange={(e) => updatePersonalInfo('summary', e.target.value)} rows={3} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Education Tab */}
                                    {activeFormTab === 'education' && (
                                        <div>
                                            <div className="entries-header">
                                                <h3>Education</h3>
                                                <button className="add-btn" onClick={addEducation}><Plus size={14} /> Add</button>
                                            </div>
                                            {resumeData.education.map((edu, i) => (
                                                <div key={edu.id} className="entry-card">
                                                    {resumeData.education.length > 1 && (
                                                        <button className="remove-entry-btn" onClick={() => removeEducation(i)}><Trash2 size={14} /></button>
                                                    )}
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label className="form-label">Institution</label>
                                                            <input className="form-input" placeholder="University Name" value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">Degree</label>
                                                            <input className="form-input" placeholder="Bachelor of Science" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label className="form-label">Field of Study</label>
                                                            <input className="form-input" placeholder="Computer Science" value={edu.field} onChange={(e) => updateEducation(i, 'field', e.target.value)} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">GPA</label>
                                                            <input className="form-input" placeholder="3.8/4.0" value={edu.gpa || ''} onChange={(e) => updateEducation(i, 'gpa', e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label className="form-label">Start Date</label>
                                                            <input className="form-input" placeholder="Aug 2019" value={edu.startDate} onChange={(e) => updateEducation(i, 'startDate', e.target.value)} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">End Date</label>
                                                            <input className="form-input" placeholder="May 2023" value={edu.endDate} onChange={(e) => updateEducation(i, 'endDate', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Experience Tab */}
                                    {activeFormTab === 'experience' && (
                                        <div>
                                            <div className="entries-header">
                                                <h3>Work Experience</h3>
                                                <button className="add-btn" onClick={addExperience}><Plus size={14} /> Add</button>
                                            </div>
                                            {resumeData.experience.map((exp, i) => (
                                                <div key={exp.id} className="entry-card">
                                                    {resumeData.experience.length > 1 && (
                                                        <button className="remove-entry-btn" onClick={() => removeExperience(i)}><Trash2 size={14} /></button>
                                                    )}
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label className="form-label">Company</label>
                                                            <input className="form-input" placeholder="Company Name" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">Position</label>
                                                            <input className="form-input" placeholder="Software Engineer" value={exp.position} onChange={(e) => updateExperience(i, 'position', e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label className="form-label">Start Date</label>
                                                            <input className="form-input" placeholder="Jan 2022" value={exp.startDate} onChange={(e) => updateExperience(i, 'startDate', e.target.value)} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">End Date</label>
                                                            <input className="form-input" placeholder="Present" value={exp.endDate} onChange={(e) => updateExperience(i, 'endDate', e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Description (Bullet Points)</label>
                                                        <div className="bullet-list">
                                                            {exp.description.map((bullet, j) => (
                                                                <div key={j} className="bullet-item">
                                                                    <span className="bullet-marker">•</span>
                                                                    <input className="form-input" placeholder="Describe your achievement..." value={bullet} onChange={(e) => updateExpBullet(i, j, e.target.value)} />
                                                                    {exp.description.length > 1 && (
                                                                        <button onClick={() => removeExpBullet(i, j)}><X size={14} /></button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button className="add-bullet-btn" onClick={() => addExpBullet(i)}><Plus size={12} /> Add Bullet</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Skills Tab */}
                                    {activeFormTab === 'skills' && (
                                        <div>
                                            <div className="entries-header">
                                                <h3>Skills</h3>
                                                <button className="add-btn" onClick={addSkillCategory}><Plus size={14} /> Add</button>
                                            </div>
                                            {resumeData.skills.map((skill, i) => (
                                                <div key={skill.id} className="entry-card">
                                                    {resumeData.skills.length > 1 && (
                                                        <button className="remove-entry-btn" onClick={() => removeSkillCategory(i)}><Trash2 size={14} /></button>
                                                    )}
                                                    <div className="form-group">
                                                        <label className="form-label">Category</label>
                                                        <input className="form-input" placeholder="Programming Languages" value={skill.category} onChange={(e) => updateSkillCategory(i, e.target.value)} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Skills (press Enter to add)</label>
                                                        <div className="skills-input-container">
                                                            {skill.items.map((item, j) => (
                                                                <span key={j} className="skill-chip">
                                                                    {item}
                                                                    <button onClick={() => removeSkillItem(i, j)}><X size={12} /></button>
                                                                </span>
                                                            ))}
                                                            <input
                                                                placeholder="Type a skill and press Enter..."
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        addSkillItem(i, (e.target as HTMLInputElement).value);
                                                                        (e.target as HTMLInputElement).value = '';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Projects Tab */}
                                    {activeFormTab === 'projects' && (
                                        <div>
                                            <div className="entries-header">
                                                <h3>Projects</h3>
                                                <button className="add-btn" onClick={addProject}><Plus size={14} /> Add</button>
                                            </div>
                                            {resumeData.projects.map((proj, i) => (
                                                <div key={proj.id} className="entry-card">
                                                    {resumeData.projects.length > 1 && (
                                                        <button className="remove-entry-btn" onClick={() => removeProject(i)}><Trash2 size={14} /></button>
                                                    )}
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label className="form-label">Project Name</label>
                                                            <input className="form-input" placeholder="Project Name" value={proj.name} onChange={(e) => updateProject(i, 'name', e.target.value)} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">Technologies</label>
                                                            <input className="form-input" placeholder="React, Node.js (comma-separated)" value={proj.technologies.join(', ')} onChange={(e) => updateProject(i, 'technologies', e.target.value.split(',').map(t => t.trim()))} />
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Description</label>
                                                        <textarea className="form-textarea" placeholder="Brief project description..." value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} rows={2} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Highlights</label>
                                                        <div className="bullet-list">
                                                            {proj.highlights.map((h, j) => (
                                                                <div key={j} className="bullet-item">
                                                                    <span className="bullet-marker">•</span>
                                                                    <input className="form-input" placeholder="Key achievement..." value={h} onChange={(e) => {
                                                                        const updated = [...proj.highlights];
                                                                        updated[j] = e.target.value;
                                                                        updateProject(i, 'highlights', updated);
                                                                    }} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button className="add-bullet-btn" onClick={() => updateProject(i, 'highlights', [...proj.highlights, ''])}><Plus size={12} /> Add Highlight</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Job Description */}
                                <div className="jd-section">
                                    <h3><Briefcase size={16} style={{ display: 'inline', marginRight: '8px' }} /> Target Job Description <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></h3>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Paste job description for keyword optimization..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-primary btn-lg" onClick={handleManualSubmit}>
                                        Calculate Score <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ======== STEP 2: ATS SCORE ======== */}
                {step === 'score' && !isProcessing && originalScore && (
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '8px' }}>
                                Analysis Results
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Overview of your resume's performance
                            </p>
                        </div>

                        <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                            <div className="score-container">
                                <div className="score-circle">
                                    <svg viewBox="0 0 120 120">
                                        <circle className="score-circle-bg" cx="60" cy="60" r="52" />
                                        <circle
                                            className="score-circle-fill"
                                            cx="60" cy="60" r="52"
                                            stroke={getScoreColor(originalScore.overallScore)}
                                            strokeDasharray={`${2 * Math.PI * 52}`}
                                            strokeDashoffset={`${2 * Math.PI * 52 * (1 - originalScore.overallScore / 100)}`}
                                        />
                                    </svg>
                                    <div className="score-circle-text">
                                        <div className="score-number" style={{ color: getScoreColor(originalScore.overallScore) }}>
                                            {originalScore.overallScore}
                                        </div>
                                        <div className="score-label">ATS Score</div>
                                    </div>
                                </div>

                                <div className="score-breakdown">
                                    {[
                                        { label: 'Keywords', value: originalScore.breakdown.keywordScore },
                                        { label: 'Experience Impact', value: originalScore.breakdown.experienceScore },
                                        { label: 'Completeness', value: originalScore.breakdown.sectionScore },
                                        { label: 'Readability', value: originalScore.breakdown.readabilityScore },
                                        { label: 'Formatting', value: originalScore.breakdown.formattingScore },
                                    ].map(item => (
                                        <div key={item.label} className="breakdown-item">
                                            <div className="breakdown-header">
                                                <span className="breakdown-label">{item.label}</span>
                                                <span className="breakdown-value">{item.value}%</span>
                                            </div>
                                            <div className="breakdown-bar">
                                                <div className="breakdown-fill" style={{ width: `${item.value}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        {originalScore.suggestions.length > 0 && (
                            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={20} color="var(--accent-500)" /> Areas for Improvement
                                </h3>
                                <ul className="suggestions-list">
                                    {originalScore.suggestions.map((s, i) => (
                                        <li key={i} className="suggestion-item">
                                            <div className={`suggestion-priority ${s.priority}`} />
                                            <span className="suggestion-text">{s.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setStep('input')}>
                                Edit Inputs
                            </button>
                            <button className="btn btn-primary btn-lg" onClick={() => { setStep('enhance'); handleEnhance(); }}>
                                <Sparkles size={18} style={{ marginRight: '8px' }} /> Optimize Content
                            </button>
                        </div>
                    </div>
                )}

                {/* ======== STEP 3: ENHANCE (shows loading then moves to template) ======== */}
                {step === 'enhance' && !isProcessing && enhancedData && (
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--primary-900)', marginBottom: '16px', color: 'var(--primary-400)' }}>
                                <Sparkles size={48} />
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '8px' }}>
                                Optimization Complete
                            </h2>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button className="btn btn-primary btn-lg" onClick={() => setStep('template')}>
                                Select Template <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ======== STEP 4: TEMPLATE ======== */}
                {step === 'template' && !isProcessing && (
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '8px' }}>
                                Select Template
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Choose a professional format for your resume
                            </p>
                        </div>

                        {/* Score Comparison */}
                        {originalScore && enhancedScore && (
                            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                                <div className="score-comparison">
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Original Score</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: getScoreColor(originalScore.overallScore) }}>
                                            {originalScore.overallScore}
                                        </div>
                                    </div>
                                    <div className="arrow"><ArrowRight size={24} /></div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Optimized Score</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: getScoreColor(enhancedScore.overallScore) }}>
                                            {enhancedScore.overallScore}
                                        </div>
                                    </div>
                                    {enhancedScore.overallScore > originalScore.overallScore && (
                                        <span className="score-improvement positive">
                                            +{enhancedScore.overallScore - originalScore.overallScore} points
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Comparison toggle */}
                        {changes.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <button className="btn btn-secondary" onClick={() => setShowComparison(!showComparison)}>
                                    {showComparison ? <><ChevronUp size={16} /> Hide Changes</> : <><ChevronDown size={16} /> Review Changes</>}
                                </button>

                                {showComparison && (
                                    <div className="card" style={{ marginTop: '16px', padding: '20px' }}>
                                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>Optimization Details</h3>
                                        {changes.map((change, i) => (
                                            <div key={i} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-accent)' }}>
                                                    {change.section}
                                                </div>
                                                <div className="comparison-container">
                                                    <div className="comparison-panel">
                                                        <h3><span className="tag tag-original">Original</span></h3>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                                            {change.original}
                                                        </div>
                                                    </div>
                                                    <div className="comparison-panel">
                                                        <h3><span className="tag tag-enhanced">Optimized</span></h3>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                                            {change.enhanced}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-500)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Sparkles size={12} /> {change.reason}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Template Gallery */}
                        <div className="template-grid" style={{ marginBottom: '32px' }}>
                            {TEMPLATES.map(tmpl => (
                                <div
                                    key={tmpl.id}
                                    className={`card template-card ${selectedTemplate === tmpl.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedTemplate(tmpl.id)}
                                >
                                    {selectedTemplate === tmpl.id && (
                                        <div className="template-selected-badge"><Check size={14} /></div>
                                    )}
                                    <div className="template-preview" style={{ background: `linear-gradient(135deg, ${tmpl.previewColor}, ${tmpl.previewColor}dd)` }}>
                                        {tmpl.name.charAt(0)}
                                    </div>
                                    <h3>{tmpl.name}</h3>
                                    <p>{tmpl.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Preview */}
                        {previewHtml && (
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={20} /> Preview
                                </h3>
                                <div className="preview-frame">
                                    <iframe
                                        srcDoc={previewHtml}
                                        title="Resume Preview"
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary btn-lg" onClick={() => setStep('download')}>
                                Generate Resume <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ======== STEP 5: DOWNLOAD ======== */}
                {step === 'download' && !isProcessing && (
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '8px' }}>
                                Resume Ready
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Download your optimized resume
                            </p>
                        </div>

                        {/* Final Score */}
                        {(enhancedScore || originalScore) && (
                            <div className="card" style={{ padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Final Score</div>
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '4rem',
                                    fontWeight: 800,
                                    color: getScoreColor((enhancedScore || originalScore)!.overallScore),
                                    lineHeight: 1,
                                }}>
                                    {(enhancedScore || originalScore)!.overallScore}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>/ 100</div>
                                {originalScore && enhancedScore && enhancedScore.overallScore > originalScore.overallScore && (
                                    <div className="score-improvement positive" style={{ marginTop: '12px' }}>
                                        <ArrowRight size={14} style={{ transform: 'rotate(-45deg)', display: 'inline' }} /> Improved by {enhancedScore.overallScore - originalScore.overallScore} points
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="download-grid" style={{ marginBottom: '32px' }}>
                            <div className="card download-card" onClick={() => handleDownload('html')}>
                                <div className="file-icon"><FileType size={32} /></div>
                                <h3>PDF Format</h3>
                                <p>Print-ready, fixed formatting.</p>
                                <button className="btn btn-primary">Download PDF</button>
                            </div>
                            <div className="card download-card" onClick={() => handleDownload('docx')}>
                                <div className="file-icon"><FileText size={32} /></div>
                                <h3>Word Format</h3>
                                <p>Editable DOCX file.</p>
                                <button className="btn btn-secondary">Download DOCX</button>
                            </div>
                        </div>

                        {/* Preview */}
                        {previewHtml && (
                            <div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px' }}>
                                    Document Preview
                                </h3>
                                <div className="preview-frame">
                                    <iframe srcDoc={previewHtml} title="Resume Preview" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ======== AI Chat ======== */}
            <button
                className="chat-toggle"
                onClick={() => setChatOpen(!chatOpen)}
                title="Resume Assistant"
            >
                {chatOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {chatOpen && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <h3>Resume Assistant</h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => setChatOpen(false)}><X size={16} /></button>
                    </div>
                    <div className="chat-messages">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`chat-message ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="chat-message assistant">
                                Thinking<span className="loading-dots"></span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="chat-input-area">
                        <input
                            placeholder="Type your question..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                        />
                        <button onClick={sendChatMessage} disabled={chatLoading}><ArrowRight size={16} /></button>
                    </div>
                </div>
            )}
        </>
    );
}
