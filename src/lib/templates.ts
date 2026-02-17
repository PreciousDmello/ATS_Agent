import { ResumeData, TemplateId, TemplateInfo } from './types';

/* ========================================
   Template Registry
   ======================================== */

export const TEMPLATES: TemplateInfo[] = [
    {
        id: 'classic',
        name: 'Classic Professional',
        description: 'Clean, traditional layout inspired by LaTeX/AutoCV. Serif headings with elegant dividers. Perfect for corporate and academic roles.',
        previewColor: '#1a365d',
    },
    {
        id: 'modern',
        name: 'Modern Minimal',
        description: 'Two-column design with a sleek sidebar. Sans-serif typography with accent color bars. Great for tech and creative roles.',
        previewColor: '#2d3748',
    },
    {
        id: 'creative',
        name: 'Bold Impact',
        description: 'Eye-catching header with color accents and modern typography. Structured layout maintains ATS compatibility. Ideal for startups and design roles.',
        previewColor: '#553c9a',
    },
];

/* ========================================
   Template Renderers - HTML/CSS
   ======================================== */

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ---------- Classic Template ---------- */

export function renderClassicTemplate(data: ResumeData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'EB Garamond', 'Times New Roman', serif;
  font-size: 11pt;
  line-height: 1.4;
  color: #1a1a1a;
  background: white;
  max-width: 8.5in;
  margin: 0 auto;
  padding: 0.6in 0.7in;
}

.header { text-align: center; margin-bottom: 16px; }
.header h1 { font-size: 22pt; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #1a365d; margin-bottom: 6px; }
.header .contact { font-family: 'Inter', sans-serif; font-size: 9pt; color: #4a5568; }
.header .contact span { margin: 0 6px; }
.header .contact a { color: #2b6cb0; text-decoration: none; }

.summary { margin-bottom: 14px; text-align: justify; font-style: italic; color: #2d3748; border-left: 3px solid #1a365d; padding-left: 12px; }

.section { margin-bottom: 14px; }
.section-title { font-size: 12pt; font-weight: 700; text-transform: uppercase; color: #1a365d; letter-spacing: 1.5px; border-bottom: 1.5px solid #1a365d; padding-bottom: 3px; margin-bottom: 8px; }

.entry { margin-bottom: 10px; }
.entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
.entry-title { font-weight: 700; font-size: 11pt; }
.entry-subtitle { font-style: italic; color: #4a5568; }
.entry-date { font-family: 'Inter', sans-serif; font-size: 9pt; color: #718096; white-space: nowrap; }

ul { padding-left: 18px; margin-top: 3px; }
li { margin-bottom: 2px; }

.skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
.skill-row { display: flex; }
.skill-category { font-weight: 700; min-width: 140px; }
.skill-items { color: #2d3748; }

.project-tech { font-family: 'Inter', sans-serif; font-size: 9pt; color: #718096; margin-top: 2px; }
</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(data.personalInfo.fullName || 'Your Name')}</h1>
    <div class="contact">
      ${data.personalInfo.email ? `<span>${escapeHtml(data.personalInfo.email)}</span>` : ''}
      ${data.personalInfo.phone ? `<span>| ${escapeHtml(data.personalInfo.phone)}</span>` : ''}
      ${data.personalInfo.location ? `<span>| ${escapeHtml(data.personalInfo.location)}</span>` : ''}
      ${data.personalInfo.linkedin ? `<span>| <a href="${escapeHtml(data.personalInfo.linkedin)}">LinkedIn</a></span>` : ''}
      ${data.personalInfo.github ? `<span>| <a href="${escapeHtml(data.personalInfo.github)}">GitHub</a></span>` : ''}
    </div>
  </div>

  ${data.personalInfo.summary ? `<div class="summary">${escapeHtml(data.personalInfo.summary)}</div>` : ''}

  ${data.experience.length > 0 && data.experience[0].company ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${data.experience.map(exp => `
    <div class="entry">
      <div class="entry-header">
        <div><span class="entry-title">${escapeHtml(exp.position)}</span> — <span class="entry-subtitle">${escapeHtml(exp.company)}</span></div>
        <div class="entry-date">${escapeHtml(exp.startDate)} – ${escapeHtml(exp.endDate)}</div>
      </div>
      <ul>${exp.description.filter(Boolean).map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
    </div>`).join('')}
  </div>` : ''}

  ${data.education.length > 0 && data.education[0].institution ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${data.education.map(edu => `
    <div class="entry">
      <div class="entry-header">
        <div><span class="entry-title">${escapeHtml(edu.degree)} ${escapeHtml(edu.field)}</span> — <span class="entry-subtitle">${escapeHtml(edu.institution)}</span></div>
        <div class="entry-date">${escapeHtml(edu.startDate)} – ${escapeHtml(edu.endDate)}</div>
      </div>
      ${edu.gpa ? `<div class="entry-subtitle">GPA: ${escapeHtml(edu.gpa)}</div>` : ''}
      ${edu.highlights && edu.highlights.length > 0 ? `<ul>${edu.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${data.skills.length > 0 && data.skills[0].category ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      ${data.skills.map(skill => `
      <div class="skill-row">
        <span class="skill-category">${escapeHtml(skill.category)}:</span>
        <span class="skill-items">${escapeHtml(skill.items.join(', '))}</span>
      </div>`).join('')}
    </div>
  </div>` : ''}

  ${data.projects.length > 0 && data.projects[0].name ? `
  <div class="section">
    <div class="section-title">Projects</div>
    ${data.projects.map(proj => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${escapeHtml(proj.name)}</span>
      </div>
      <div>${escapeHtml(proj.description)}</div>
      ${proj.highlights.length > 0 ? `<ul>${proj.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>` : ''}
      ${proj.technologies.length > 0 ? `<div class="project-tech">Technologies: ${escapeHtml(proj.technologies.join(', '))}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${data.certifications.length > 0 ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    ${data.certifications.map(cert => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${escapeHtml(cert.name)}</span> — <span class="entry-subtitle">${escapeHtml(cert.issuer)}</span>
        <span class="entry-date">${escapeHtml(cert.date)}</span>
      </div>
    </div>`).join('')}
  </div>` : ''}
</body>
</html>`;
}

/* ---------- Modern Template ---------- */

export function renderModernTemplate(data: ResumeData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', sans-serif;
  font-size: 10pt;
  line-height: 1.45;
  color: #2d3748;
  background: white;
  max-width: 8.5in;
  margin: 0 auto;
  padding: 0;
}

.container { display: grid; grid-template-columns: 220px 1fr; min-height: 100%; }

.sidebar {
  background: #1a202c;
  color: #e2e8f0;
  padding: 32px 20px;
}

.sidebar h1 { font-size: 18pt; font-weight: 700; color: white; margin-bottom: 4px; line-height: 1.2; }
.sidebar .tagline { font-size: 9pt; color: #90cdf4; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }

.sidebar-section { margin-bottom: 20px; }
.sidebar-title { font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #90cdf4; margin-bottom: 8px; border-bottom: 1px solid #4a5568; padding-bottom: 4px; }

.contact-item { font-size: 9pt; margin-bottom: 6px; color: #cbd5e0; word-break: break-all; }
.contact-item a { color: #90cdf4; text-decoration: none; }

.skill-category-title { font-size: 9pt; font-weight: 600; color: white; margin-top: 8px; margin-bottom: 4px; }
.skill-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.skill-tag { background: #2d3748; color: #e2e8f0; padding: 2px 8px; border-radius: 3px; font-size: 8pt; }

.main { padding: 32px 28px; }

.main-section { margin-bottom: 18px; }
.main-title { font-size: 12pt; font-weight: 700; color: #1a202c; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid #3182ce; }

.summary-text { color: #4a5568; line-height: 1.5; margin-bottom: 12px; }

.entry { margin-bottom: 12px; }
.entry-top { display: flex; justify-content: space-between; align-items: baseline; }
.entry-role { font-size: 11pt; font-weight: 600; color: #1a202c; }
.entry-company { font-weight: 500; color: #3182ce; }
.entry-date { font-size: 8pt; color: #718096; font-weight: 500; white-space: nowrap; }

ul { padding-left: 16px; margin-top: 4px; }
li { margin-bottom: 2px; font-size: 9.5pt; color: #4a5568; }

.edu-degree { font-weight: 600; color: #1a202c; }
.edu-school { color: #3182ce; font-weight: 500; }

.project-name { font-weight: 600; color: #1a202c; }
.project-tech { font-size: 8pt; color: #718096; margin-top: 2px; }
</style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <h1>${escapeHtml(data.personalInfo.fullName || 'Your Name')}</h1>
      <div class="tagline">${data.experience[0]?.position ? escapeHtml(data.experience[0].position) : 'Professional'}</div>

      <div class="sidebar-section">
        <div class="sidebar-title">Contact</div>
        ${data.personalInfo.email ? `<div class="contact-item">${escapeHtml(data.personalInfo.email)}</div>` : ''}
        ${data.personalInfo.phone ? `<div class="contact-item">${escapeHtml(data.personalInfo.phone)}</div>` : ''}
        ${data.personalInfo.location ? `<div class="contact-item">${escapeHtml(data.personalInfo.location)}</div>` : ''}
        ${data.personalInfo.linkedin ? `<div class="contact-item"><a href="${escapeHtml(data.personalInfo.linkedin)}">LinkedIn</a></div>` : ''}
        ${data.personalInfo.github ? `<div class="contact-item"><a href="${escapeHtml(data.personalInfo.github)}">GitHub</a></div>` : ''}
      </div>

      ${data.skills.length > 0 && data.skills[0].category ? `
      <div class="sidebar-section">
        <div class="sidebar-title">Skills</div>
        ${data.skills.map(skill => `
        <div class="skill-category-title">${escapeHtml(skill.category)}</div>
        <div class="skill-tags">${skill.items.map(item => `<span class="skill-tag">${escapeHtml(item)}</span>`).join('')}</div>
        `).join('')}
      </div>` : ''}

      ${data.education.length > 0 && data.education[0].institution ? `
      <div class="sidebar-section">
        <div class="sidebar-title">Education</div>
        ${data.education.map(edu => `
        <div style="margin-bottom: 10px;">
          <div class="edu-degree" style="color: white; font-size: 9pt;">${escapeHtml(edu.degree)}</div>
          <div style="font-size: 8pt; color: #cbd5e0;">${escapeHtml(edu.field)}</div>
          <div style="font-size: 8pt; color: #90cdf4;">${escapeHtml(edu.institution)}</div>
          <div style="font-size: 8pt; color: #718096;">${escapeHtml(edu.startDate)} – ${escapeHtml(edu.endDate)}</div>
          ${edu.gpa ? `<div style="font-size: 8pt; color: #cbd5e0;">GPA: ${escapeHtml(edu.gpa)}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}
    </div>

    <div class="main">
      ${data.personalInfo.summary ? `
      <div class="main-section">
        <div class="main-title">Profile</div>
        <div class="summary-text">${escapeHtml(data.personalInfo.summary)}</div>
      </div>` : ''}

      ${data.experience.length > 0 && data.experience[0].company ? `
      <div class="main-section">
        <div class="main-title">Experience</div>
        ${data.experience.map(exp => `
        <div class="entry">
          <div class="entry-top">
            <div><span class="entry-role">${escapeHtml(exp.position)}</span></div>
            <span class="entry-date">${escapeHtml(exp.startDate)} – ${escapeHtml(exp.endDate)}</span>
          </div>
          <div class="entry-company">${escapeHtml(exp.company)}</div>
          <ul>${exp.description.filter(Boolean).map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
        </div>`).join('')}
      </div>` : ''}

      ${data.projects.length > 0 && data.projects[0].name ? `
      <div class="main-section">
        <div class="main-title">Projects</div>
        ${data.projects.map(proj => `
        <div class="entry">
          <div class="project-name">${escapeHtml(proj.name)}</div>
          <div style="font-size: 9.5pt; color: #4a5568;">${escapeHtml(proj.description)}</div>
          ${proj.highlights.length > 0 ? `<ul>${proj.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>` : ''}
          ${proj.technologies.length > 0 ? `<div class="project-tech">${escapeHtml(proj.technologies.join(' • '))}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}
    </div>
  </div>
</body>
</html>`;
}

/* ---------- Creative Template ---------- */

export function renderCreativeTemplate(data: ResumeData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Outfit', sans-serif;
  font-size: 10pt;
  line-height: 1.45;
  color: #2d3748;
  background: white;
  max-width: 8.5in;
  margin: 0 auto;
  padding: 0;
}

.header {
  background: linear-gradient(135deg, #553c9a 0%, #6b46c1 50%, #805ad5 100%);
  color: white;
  padding: 32px 36px;
}

.header h1 { font-size: 26pt; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
.header .title { font-size: 11pt; font-weight: 300; color: #e9d8fd; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
.header .contact-row { display: flex; flex-wrap: wrap; gap: 16px; font-size: 9pt; font-weight: 400; }
.header .contact-row span { color: #e9d8fd; }
.header .contact-row a { color: #faf5ff; text-decoration: none; }

.content { padding: 24px 36px; }

.section { margin-bottom: 18px; }
.section-title {
  font-size: 11pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #553c9a;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-title::after { content: ''; flex: 1; height: 2px; background: linear-gradient(90deg, #553c9a, transparent); }

.summary { color: #4a5568; line-height: 1.6; padding: 12px 0; font-size: 10.5pt; }

.entry { margin-bottom: 12px; padding-left: 14px; border-left: 3px solid #e9d8fd; }
.entry-header { display: flex; justify-content: space-between; align-items: baseline; }
.entry-role { font-size: 11pt; font-weight: 600; color: #2d3748; }
.entry-company { color: #6b46c1; font-weight: 600; }
.entry-date { font-size: 8.5pt; color: #9f7aea; font-weight: 500; background: #faf5ff; padding: 2px 8px; border-radius: 10px; }

ul { padding-left: 16px; margin-top: 4px; }
li { margin-bottom: 3px; color: #4a5568; }
li::marker { color: #9f7aea; }

.skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-group { background: #faf5ff; border: 1px solid #e9d8fd; border-radius: 8px; padding: 10px 14px; flex: 1; min-width: 200px; }
.skill-group-name { font-weight: 600; color: #553c9a; font-size: 9pt; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.skill-list { display: flex; flex-wrap: wrap; gap: 4px; }
.skill-pill { background: white; border: 1px solid #d6bcfa; color: #553c9a; padding: 2px 10px; border-radius: 12px; font-size: 8.5pt; font-weight: 500; }

.project-tech-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.tech-badge { background: #553c9a; color: white; padding: 1px 8px; border-radius: 3px; font-size: 7.5pt; font-weight: 500; }
</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(data.personalInfo.fullName || 'Your Name')}</h1>
    <div class="title">${data.experience[0]?.position ? escapeHtml(data.experience[0].position) : 'Professional'}</div>
    <div class="contact-row">
      ${data.personalInfo.email ? `<span>${escapeHtml(data.personalInfo.email)}</span>` : ''}
      ${data.personalInfo.phone ? `<span>${escapeHtml(data.personalInfo.phone)}</span>` : ''}
      ${data.personalInfo.location ? `<span>${escapeHtml(data.personalInfo.location)}</span>` : ''}
      ${data.personalInfo.linkedin ? `<span><a href="${escapeHtml(data.personalInfo.linkedin)}">LinkedIn</a></span>` : ''}
      ${data.personalInfo.github ? `<span><a href="${escapeHtml(data.personalInfo.github)}">GitHub</a></span>` : ''}
    </div>
  </div>

  <div class="content">
    ${data.personalInfo.summary ? `
    <div class="section">
      <div class="section-title">About Me</div>
      <div class="summary">${escapeHtml(data.personalInfo.summary)}</div>
    </div>` : ''}

    ${data.experience.length > 0 && data.experience[0].company ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${data.experience.map(exp => `
      <div class="entry">
        <div class="entry-header">
          <div><span class="entry-role">${escapeHtml(exp.position)}</span></div>
          <span class="entry-date">${escapeHtml(exp.startDate)} – ${escapeHtml(exp.endDate)}</span>
        </div>
        <div class="entry-company">${escapeHtml(exp.company)}</div>
        <ul>${exp.description.filter(Boolean).map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
      </div>`).join('')}
    </div>` : ''}

    ${data.skills.length > 0 && data.skills[0].category ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills-container">
        ${data.skills.map(skill => `
        <div class="skill-group">
          <div class="skill-group-name">${escapeHtml(skill.category)}</div>
          <div class="skill-list">${skill.items.map(item => `<span class="skill-pill">${escapeHtml(item)}</span>`).join('')}</div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    ${data.education.length > 0 && data.education[0].institution ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${data.education.map(edu => `
      <div class="entry">
        <div class="entry-header">
          <div><span class="entry-role">${escapeHtml(edu.degree)} ${escapeHtml(edu.field)}</span></div>
          <span class="entry-date">${escapeHtml(edu.startDate)} – ${escapeHtml(edu.endDate)}</span>
        </div>
        <div class="entry-company">${escapeHtml(edu.institution)}</div>
        ${edu.gpa ? `<div style="font-size: 9pt; color: #6b46c1;">GPA: ${escapeHtml(edu.gpa)}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}

    ${data.projects.length > 0 && data.projects[0].name ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${data.projects.map(proj => `
      <div class="entry">
        <div class="entry-role">${escapeHtml(proj.name)}</div>
        <div style="color: #4a5568; font-size: 9.5pt;">${escapeHtml(proj.description)}</div>
        ${proj.highlights.length > 0 ? `<ul>${proj.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>` : ''}
        ${proj.technologies.length > 0 ? `<div class="project-tech-list">${proj.technologies.map(t => `<span class="tech-badge">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}
  </div>
</body>
</html>`;
}

/* ========================================
   Template Renderer Dispatcher
   ======================================== */

export function renderTemplate(data: ResumeData, templateId: TemplateId): string {
    switch (templateId) {
        case 'classic':
            return renderClassicTemplate(data);
        case 'modern':
            return renderModernTemplate(data);
        case 'creative':
            return renderCreativeTemplate(data);
        default:
            return renderClassicTemplate(data);
    }
}
