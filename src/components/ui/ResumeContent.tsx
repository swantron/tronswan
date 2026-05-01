import React from 'react';

import SEO from './SEO';
import '../../styles/Resume.css';

interface ResumeContentProps {
  content: string;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

// ── Parsers ───────────────────────────────────────────────────────────────────

const stripBullet = (line: string) =>
  line.replace(/^\s*[*\-•◦▪▫]\s*/, '').trim();

/** Splits contact lines that use " | " as a separator (e.g. "linkedin | github.com/…") */
const flattenContactLines = (lines: string[]): string[] =>
  lines.flatMap(line =>
    line.includes('|')
      ? line
          .split('|')
          .map(s => s.trim())
          .filter(Boolean)
      : [line]
  );

type ExperienceJob = {
  parts: string[];
  bullets: string[];
};

type Project = {
  name: string;
  url: string | null;
  description: string;
};

/** Parses "Name (url): description" or "Name: description" project lines */
const parseProjects = (lines: string[]): Project[] =>
  lines.map(line => {
    const clean = stripBullet(line);
    // "Name (url): description"
    const withUrl = clean.match(/^(.+?)\s+\(([^)]+)\):\s+(.+)$/s);
    if (withUrl) {
      const urlRaw = withUrl[2].trim();
      const url = urlRaw.startsWith('http') ? urlRaw : `https://${urlRaw}`;
      return { name: withUrl[1].trim(), url, description: withUrl[3].trim() };
    }
    // "Name: description"
    const simple = clean.match(/^([^:]{1,60}):\s+(.+)$/s);
    if (simple) {
      return {
        name: simple[1].trim(),
        url: null,
        description: simple[2].trim(),
      };
    }
    return { name: clean, url: null, description: '' };
  });

const parseJobs = (lines: string[]): ExperienceJob[] => {
  const jobs: ExperienceJob[] = [];
  let current: ExperienceJob | null = null;

  for (const line of lines) {
    const isHeader =
      line.includes('|') &&
      /Engineer|Developer|Manager|Director|Lead|Senior|Staff|Principal|Architect|Applications/i.test(
        line
      );

    if (isHeader) {
      if (current) jobs.push(current);
      current = { parts: line.split('|').map(p => p.trim()), bullets: [] };
    } else if (current) {
      const b = stripBullet(line);
      if (b) current.bullets.push(b);
    }
  }
  if (current) jobs.push(current);
  return jobs;
};

type SkillGroup = {
  category: string;
  items: { key: string; values: string[] }[];
};

const parseSkillGroups = (lines: string[]): SkillGroup[] => {
  const groups: SkillGroup[] = [];
  let current: SkillGroup | null = null;

  for (const line of lines) {
    const clean = stripBullet(line);
    if (!clean) continue;

    if (clean.includes(':')) {
      const idx = clean.indexOf(':');
      const key = clean.slice(0, idx).trim();
      const values = clean
        .slice(idx + 1)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (!current) current = { category: '', items: [] };
      current.items.push({ key, values });
    } else {
      if (current) groups.push(current);
      current = { category: clean, items: [] };
    }
  }
  if (current) groups.push(current);
  return groups;
};

// ── Sub-components ────────────────────────────────────────────────────────────

/** Bolds the "Label:" prefix in bullet points that use it */
const BulletText: React.FC<{ text: string }> = ({ text }) => {
  const match = text.match(/^([^:]{3,60}):\s+(.+)$/s);
  if (match) {
    return (
      <>
        <strong className='bullet-label'>{match[1]}:</strong> {match[2]}
      </>
    );
  }
  return <>{text}</>;
};

const ContactBadge: React.FC<{ text: string }> = ({ text }) => {
  const lc = text.toLowerCase();

  if (lc === 'linkedin' || lc.includes('linkedin.com')) {
    return (
      <a
        href='https://www.linkedin.com/in/joseph-swanson-11092758/'
        target='_blank'
        rel='noopener noreferrer'
        className='resume-contact-link'
      >
        LinkedIn
      </a>
    );
  }
  if (lc.includes('github')) {
    return (
      <a
        href='https://github.com/swantron'
        target='_blank'
        rel='noopener noreferrer'
        className='resume-contact-link'
      >
        GitHub
      </a>
    );
  }
  if (lc.includes('tronswan.com')) {
    return (
      <a
        href='https://tronswan.com'
        target='_blank'
        rel='noopener noreferrer'
        className='resume-contact-link'
      >
        tronswan.com
      </a>
    );
  }
  if (text.includes('@')) {
    return (
      <a href={`mailto:${text}`} className='resume-contact-link'>
        {text}
      </a>
    );
  }
  return <span className='resume-contact-item'>{text}</span>;
};

// ── Main component ────────────────────────────────────────────────────────────

const ResumeContent: React.FC<ResumeContentProps> = ({
  content,
  loading,
  error,
  lastUpdated,
  onRefresh,
}) => {
  if (loading) {
    return (
      <div className='resume-container'>
        <div className='resume-content'>
          <div className='resume-loading'>
            <div
              className='loading-spinner'
              role='status'
              aria-label='Loading'
            />
            <p>Loading resume content from Google Doc...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='resume-container'>
        <div className='resume-content'>
          <div className='resume-error'>
            <h2>Error Loading Resume</h2>
            <p>{error}</p>
            <button onClick={onRefresh} className='resume-refresh-btn'>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Parse sections ──────────────────────────────────────────────────────────

  const lines = content
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const sections: Record<string, string[]> = {};
  let currentSection = '';
  let currentContent: string[] = [];
  let isFirstSection = true;

  const sectionHeaders = [
    'Professional Summary',
    'Summary',
    'Technical Skills',
    'Professional Experience',
    'Experience',
    'Education',
    'Selected Projects',
    'Projects & Achievements',
    'Projects',
    'Certifications',
    'Contact Information',
    'Contact',
  ];

  for (const line of lines) {
    if (
      /^Tab \d+$/i.test(line) ||
      /^Sheet \d+$/i.test(line) ||
      /^_+$/.test(line) ||
      /^-+$/.test(line) ||
      /^[*]+$/.test(line)
    )
      continue;

    const matched = sectionHeaders.find(
      h => line.toLowerCase() === h.toLowerCase()
    );
    if (matched) {
      if (currentSection && currentContent.length > 0)
        sections[currentSection] = [...currentContent];
      currentSection = matched;
      currentContent = [];
      isFirstSection = false;
    } else {
      if (isFirstSection && !currentSection)
        currentSection = 'Contact Information';
      currentContent.push(line);
    }
  }
  if (currentSection && currentContent.length > 0)
    sections[currentSection] = currentContent;

  // Contact
  const contactRaw = sections['Contact Information'] ?? [];
  const name = contactRaw[0] ?? 'Joseph Swanson';
  const contactItems = flattenContactLines(contactRaw.slice(1));

  // Summary — first line may be a "|"-delimited tagline
  const summaryLines =
    sections['Summary'] ?? sections['Professional Summary'] ?? [];
  const firstSummaryLine = summaryLines[0] ?? '';
  const hasTagline = firstSummaryLine.includes('|');
  const tagline = hasTagline
    ? firstSummaryLine.replace(/\|/g, '·').replace(/\s*·\s*/g, ' · ')
    : null;
  const summaryBody = hasTagline
    ? summaryLines.slice(1).join(' ')
    : summaryLines.join(' ');

  // Experience
  const expLines =
    sections['Professional Experience'] ?? sections['Experience'] ?? [];
  const jobs = parseJobs(expLines);

  // Skills
  const skillGroups = parseSkillGroups(sections['Technical Skills'] ?? []);

  // Projects
  const projectLines =
    sections['Selected Projects'] ??
    sections['Projects & Achievements'] ??
    sections['Projects'] ??
    [];
  const projects = parseProjects(projectLines);

  // Education
  const educationLines = sections['Education'] ?? [];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='resume-container'>
      <SEO
        title='Resume - Joseph Swanson | Tron Swan'
        description="View Joseph Swanson's professional resume. Staff Software Engineer at Demandbase specializing in DevX, CI/CD, AI, IaC, and React."
        keywords='Joseph Swanson, resume, software engineer, Demandbase, DevX, CI/CD, React, TypeScript, Montana'
        url='/resume'
      />

      <div className='resume-content' data-testid='resume-content'>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className='resume-header'>
          <h1 className='resume-name' data-testid='resume-name'>
            {name}
          </h1>
          {tagline && <p className='resume-tagline'>{tagline}</p>}
          <div className='resume-contact'>
            {contactItems.map((item, i) => (
              <ContactBadge key={i} text={item} />
            ))}
          </div>
        </header>

        {/* ── Two-column body ─────────────────────────────────────────────── */}
        <div className='resume-main-grid'>
          {/* Main column — comes first in DOM so print flows correctly */}
          <main className='resume-body'>
            {summaryBody && (
              <section className='resume-section' data-testid='resume-summary'>
                <h2 className='resume-section-title'>Summary</h2>
                <p className='summary-text'>{summaryBody}</p>
              </section>
            )}

            {expLines.length > 0 && (
              <section
                className='resume-section'
                data-testid='resume-experience'
              >
                <h2 className='resume-section-title'>
                  Professional Experience
                </h2>
                {jobs.length > 0 ? (
                  <div className='experience-list'>
                    {jobs.map((job, ji) => {
                      const title = job.parts[0];
                      const company = job.parts[1];
                      const dates = job.parts[job.parts.length - 1];
                      const location =
                        job.parts.length >= 4 ? job.parts[2] : null;
                      return (
                        <article key={ji} className='job-card'>
                          <div className='job-header'>
                            <div className='job-title-row'>
                              <h3 className='job-title'>{title}</h3>
                              <span className='job-dates'>{dates}</span>
                            </div>
                            <div className='job-meta'>
                              <span className='job-company'>{company}</span>
                              {location && (
                                <span className='job-location'>{location}</span>
                              )}
                            </div>
                          </div>
                          {job.bullets.length > 0 && (
                            <ul className='job-bullets'>
                              {job.bullets.map((b, bi) => (
                                <li key={bi} className='job-bullet'>
                                  <BulletText text={b} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className='experience-list'>
                    {expLines.map((line, i) => (
                      <p key={i} className='job-bullet'>
                        {stripBullet(line)}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            )}

            {projects.length > 0 && (
              <section className='resume-section'>
                <h2 className='resume-section-title'>Selected Projects</h2>
                <div className='projects-list'>
                  {projects.map((p, pi) => (
                    <div key={pi} className='project-card'>
                      <div className='project-header'>
                        <span className='project-name'>{p.name}</span>
                        {p.url && (
                          <a
                            href={p.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='project-url'
                          >
                            {p.url.replace('https://', '')}
                          </a>
                        )}
                      </div>
                      {p.description && (
                        <p className='project-desc'>{p.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar — after main in DOM so print flows body-first */}
          <aside className='resume-sidebar'>
            {skillGroups.length > 0 && (
              <section className='resume-section' data-testid='resume-skills'>
                <h2 className='resume-section-title'>Technical Skills</h2>
                <div className='skills-container'>
                  {skillGroups.map((group, gi) => (
                    <div key={gi} className='skill-group'>
                      {group.category && (
                        <h3 className='skill-category'>{group.category}</h3>
                      )}
                      {group.items.map((item, ii) => (
                        <p key={ii} className='skill-row'>
                          <span className='skill-key'>{item.key}: </span>
                          <span className='skill-values'>
                            {item.values.join(', ')}
                          </span>
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {educationLines.length > 0 && (
              <section
                className='resume-section'
                data-testid='resume-education'
              >
                <h2 className='resume-section-title'>Education</h2>
                {educationLines.map((line, i) => {
                  if (line.includes('|')) {
                    const parts = line.split('|').map(p => p.trim());
                    return (
                      <div key={i} className='edu-entry'>
                        <div className='edu-degree'>{parts[0]}</div>
                        <div className='edu-institution'>{parts[1]}</div>
                        {parts.slice(2).map((p, pi) => (
                          <div key={pi} className='edu-detail'>
                            {p}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  if (line.includes(':')) {
                    const idx = line.indexOf(':');
                    const k = line.slice(0, idx).trim();
                    const v = line.slice(idx + 1).trim();
                    return (
                      <p key={i} className='edu-detail'>
                        <span className='edu-detail-key'>{k}:</span> {v}
                      </p>
                    );
                  }
                  return (
                    <p key={i} className='edu-detail'>
                      {line}
                    </p>
                  );
                })}
              </section>
            )}
          </aside>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className='resume-footer'>
          <div className='footer-meta'>
            <p className='footer-updated'>
              Last updated: {lastUpdated?.toLocaleDateString() || 'Recent'}
            </p>
            <a
              href='https://docs.google.com/document/d/1zeZ_mN27_KVgUuOovUn4nHb_w8CDRUBrj5xOiIVTz8M/edit?usp=sharing'
              target='_blank'
              rel='noopener noreferrer'
              className='doc-link'
            >
              View original Google Doc
            </a>
          </div>
          <div className='footer-actions'>
            <button
              onClick={() => window.print()}
              className='resume-print-btn'
              aria-label='Print resume'
            >
              Print / Save PDF
            </button>
            <button
              onClick={onRefresh}
              className='resume-refresh-btn'
              aria-label='Refresh resume content'
            >
              Refresh
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ResumeContent;
