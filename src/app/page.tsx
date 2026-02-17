'use client';

import Link from 'next/link';

export default function HomePage() {
    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link href="/" className="logo">
                        <div className="logo-icon">✦</div>
                        WhizResume
                    </Link>
                    <div className="nav-links">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#how-it-works" className="nav-link">How it Works</a>
                        <Link href="/builder" className="btn btn-primary btn-sm">
                            Get Started →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="dot"></span>
                        AI-Powered Resume Optimization
                    </div>
                    <h1>
                        Build Resumes That <br />
                        <span className="gradient-text">Beat the ATS</span>
                    </h1>
                    <p>
                        Upload your resume or create one from scratch. Our AI analyzes, scores,
                        and enhances your resume for maximum ATS compatibility — helping you land
                        more interviews with less effort.
                    </p>
                    <div className="hero-actions">
                        <Link href="/builder" className="btn btn-primary btn-lg">
                            🚀 Build My Resume
                        </Link>
                        <Link href="/builder?mode=upload" className="btn btn-secondary btn-lg">
                            📄 Upload & Optimize
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Why Choose Us</div>
                        <h2 className="section-title">Everything You Need to Land the Job</h2>
                        <p className="section-desc">
                            Our AI-powered platform handles every aspect of resume creation and optimization.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="card feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Instant ATS Scoring</h3>
                            <p>
                                Get a detailed ATS compatibility score with a breakdown across keywords,
                                formatting, readability, and section completeness.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon">🤖</div>
                            <h3>Gemini AI Enhancement</h3>
                            <p>
                                Powered by Google Gemini, our AI rewrites your experience bullets with
                                strong action verbs, quantified achievements, and optimized keywords.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon">🎨</div>
                            <h3>Professional Templates</h3>
                            <p>
                                Choose from 3 beautifully designed templates — Classic, Modern, and Creative —
                                all optimized for ATS readability.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon">📥</div>
                            <h3>DOCX & PDF Export</h3>
                            <p>
                                Download your enhanced resume in both Word (.docx) and PDF formats,
                                ready for submission to any job portal.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon">🔄</div>
                            <h3>Before vs After Comparison</h3>
                            <p>
                                See exactly what changed — compare your original resume side-by-side
                                with the AI-enhanced version.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>AI Resume Coach</h3>
                            <p>
                                Chat with our AI assistant for personalized resume tips, keyword
                                suggestions, and career advice.
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
                            From upload to optimized resume in minutes, not hours.
                        </p>
                    </div>

                    <div className="features-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {[
                            { step: '01', icon: '📄', title: 'Upload or Enter', desc: 'Upload your existing resume (PDF/DOCX) or enter your details manually in our guided form.' },
                            { step: '02', icon: '📊', title: 'Get Your ATS Score', desc: 'Our engine analyzes your resume across 5 categories and provides an instant ATS compatibility score.' },
                            { step: '03', icon: '✨', title: 'AI Enhancement', desc: 'Gemini AI improves your phrasing, adds keywords, quantifies achievements, and polishes every section.' },
                            { step: '04', icon: '🎨', title: 'Choose Template', desc: 'Select from our professionally designed templates, each optimized for ATS scanning and visual appeal.' },
                            { step: '05', icon: '📥', title: 'Download', desc: 'Get your optimized resume in Word and PDF formats, with your new improved ATS score.' },
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
                                <div className="feature-icon">{item.icon}</div>
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
                            🚀 Start Building Now — It&apos;s Free
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
                    <p>© 2026 WhizResume by WhizJunior — Built with ❤️ using Next.js & Google Gemini</p>
                </div>
            </footer>
        </>
    );
}
