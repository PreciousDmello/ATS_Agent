'use client';

import Link from 'next/link';
import Script from 'next/script';
import {
    FileText,
    BarChart3,
    Sparkles,
    Layout,
    Download,
    ArrowLeftRight,
    MessageSquare,
    CheckCircle2,
    Upload,
    PenTool,
    ArrowRight,
    Zap
} from 'lucide-react';

export default function HomePage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'WhizResume',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
        },
        'description': 'AI-powered resume builder that optimizes your resume for ATS systems and helps you land more interviews.',
        'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.8',
            'ratingCount': '1250'
        }
    };

    return (
        <>
            <Script
                id="app-ld-json"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link href="/" className="logo">
                        <div className="logo-icon">
                            <FileText size={18} />
                        </div>
                        WhizResume
                    </Link>
                    <div className="nav-links">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#how-it-works" className="nav-link">How it Works</a>
                        <Link href="/builder" className="btn btn-primary btn-sm">
                            Get Started <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Zap size={14} style={{ marginRight: '6px', color: 'var(--primary-400)' }} />
                        Professional Resume Optimization
                    </div>
                    <h1>
                        Build Resumes That <br />
                        <span className="gradient-text">Beat the ATS</span>
                    </h1>
                    <p>
                        Create professional, ATS-optimized resumes in minutes.
                        Upload your current resume or start from scratch with our intelligent builder.
                        Get instant scoring and expert enhancement suggestions.
                    </p>
                    <div className="hero-actions">
                        <Link href="/builder" className="btn btn-primary btn-lg">
                            Start Building <ArrowRight size={18} />
                        </Link>
                        <Link href="/builder?mode=upload" className="btn btn-secondary btn-lg">
                            <Upload size={18} style={{ marginRight: '8px' }} />
                            Upload Resume
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Why Choose WhizResume</div>
                        <h2 className="section-title">Everything You Need to Land the Job</h2>
                        <p className="section-desc">
                            A complete toolkit for crafting professional resumes that get noticed by recruiters and passing Applicant Tracking Systems.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="card feature-card">
                            <div className="feature-icon-wrapper">
                                <BarChart3 size={24} />
                            </div>
                            <h3>Instant ATS Scoring</h3>
                            <p>
                                Get a detailed compatibility score with a breakdown across keywords,
                                formatting, readability, and section completeness.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon-wrapper" style={{ color: 'var(--primary-600)' }}>
                                <FileText size={24} />
                            </div>
                            <h3>Smart Enhancement</h3>
                            <p>
                                Our intelligent engine suggests improvements for your experience bullets,
                                enhancing action verbs and quantifying achievements.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon-wrapper">
                                <Layout size={24} />
                            </div>
                            <h3>Professional Templates</h3>
                            <p>
                                Choose from 3 clean, industry-standard templates — Classic, Modern, and Creative —
                                all optimized for parsing.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon-wrapper">
                                <Download size={24} />
                            </div>
                            <h3>DOCX & PDF Export</h3>
                            <p>
                                Download your finalized resume in both Word (.docx) and PDF formats,
                                ready for submission to any job portal.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon-wrapper">
                                <ArrowLeftRight size={24} />
                            </div>
                            <h3>Comparison View</h3>
                            <p>
                                Track improvements clearly. Compare your original draft side-by-side
                                with the optimized version to see the difference.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon-wrapper">
                                <MessageSquare size={24} />
                            </div>
                            <h3>Resume Coach</h3>
                            <p>
                                Get personalized answers to your resume questions and suggestions
                                for specific sections from our interactive assistant.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="features" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Simple Process</div>
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-desc">
                            From upload to optimized resume in a few simple steps.
                        </p>
                    </div>

                    <div className="features-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {[
                            { step: '01', icon: <Upload size={24} />, title: 'Upload or Enter', desc: 'Upload your existing resume (PDF/DOCX) or enter your details manually in our guided form.' },
                            { step: '02', icon: <BarChart3 size={24} />, title: 'Get Your Score', desc: 'Our engine analyzes your resume across 5 categories and provides an compatibility score.' },
                            { step: '03', icon: <Sparkles size={24} />, title: 'Enhance Content', desc: 'Apply intelligent suggestions to improve phrasing, keywords, and impact.' },
                            { step: '04', icon: <Layout size={24} />, title: 'Choose Template', desc: 'Select from our professionally designed templates, each optimized for ATS scanning.' },
                            { step: '05', icon: <Download size={24} />, title: 'Download', desc: 'Get your optimized resume in Word and PDF formats, ready to apply.' },
                        ].map((item) => (
                            <div key={item.step} className="card feature-card" style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    color: 'rgba(99, 102, 241, 0.1)',
                                }}>
                                    {item.step}
                                </div>
                                <div className="feature-icon-wrapper">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <div className="card card-highlight" style={{ padding: '60px 40px', maxWidth: '700px', margin: '0 auto' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '16px' }}>
                            Ready to Optimize Your Resume?
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.05rem' }}>
                            Join thousands of job seekers who have improved their ATS scores and landed more interviews.
                        </p>
                        <Link href="/builder" className="btn btn-primary btn-lg">
                            Start Building Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '32px 0',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
            }}>
                <div className="container">
                    <p>© 2026 WhizResume by WhizJunior — Built using Next.js & Google Gemini</p>
                </div>
            </footer>
        </>
    );
}
