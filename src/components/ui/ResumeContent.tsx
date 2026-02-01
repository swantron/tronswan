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
            <button onClick={onRefresh} className='refresh-button'>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse the content into structured sections
  const parseContent = (content: string) => {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const sections: { [key: string]: string[] } = {};
    let currentSection = '';
    let currentContent: string[] = [];
    let isFirstSection = true;

    // Common section headers in resumes
    const sectionHeaders = [
      'Professional Summary',
      'Summary',
      'Technical Skills',
      'Professional Experience',
      'Experience',
      'Education',
      'Projects & Achievements',
      'Projects',
      'Certifications',
      'Contact Information',
      'Contact',
    ];

    lines.forEach(line => {
      // Skip Google Docs artifacts and unwanted separators
      if (
        /^Tab \d+$/i.test(line) ||
        /^Sheet \d+$/i.test(line) ||
        /^_+$/.test(line) ||
        /^-+$/.test(line) ||
        /^[*]+$/.test(line)
      ) {
        return;
      }

      // Check if this is a section header (case-insensitive fuzzy match)
      const matchedHeader = sectionHeaders.find(
        h => line.toLowerCase() === h.toLowerCase()
      );

      if (matchedHeader) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = [...currentContent];
        }

        // Start new section
        currentSection = matchedHeader;
        currentContent = [];
        isFirstSection = false;
      } else {
        // If this is the first section and it doesn't have a header, treat it as Contact Information
        if (isFirstSection && !currentSection) {
          currentSection = 'Contact Information';
        }
        currentContent.push(line);
      }
    });

    // Save the last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent;
    }

    return sections;
  };

  const sections = parseContent(content);

  return (
    <div className='resume-container'>
      <SEO
        title='Resume - Joseph Swanson | Tron Swan'
        description="View Joseph Swanson's professional resume. Staff Software Engineer at Demandbase specializing in DevX, CI/CD, AI, IaC, and React."
        keywords='Joseph Swanson, resume, software engineer, Demandbase, DevX, CI/CD, React, TypeScript, Montana'
        url='/resume'
      />
      <div className='resume-content' data-testid='resume-content'>
        <header className='resume-header'>
          <h1 className='resume-name page-title' data-testid='resume-name'>
            {sections['Contact Information']?.[0] || 'Joseph Swanson'}
          </h1>
          <div className='resume-contact'>
            {sections['Contact Information']?.slice(1).map((line, index) => {
              const parseContactLine = (text: string) => {
                // Better link detection
                if (text.toLowerCase().includes('linkedin')) {
                  return (
                    <a
                      key={index}
                      href='https://www.linkedin.com/in/joseph-swanson-11092758/'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='resume-contact-link'
                    >
                      <span className='icon'>🔗</span> LinkedIn
                    </a>
                  );
                }
                if (text.toLowerCase().includes('tronswan.com')) {
                  return (
                    <a
                      key={index}
                      href='https://tronswan.com'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='resume-contact-link'
                    >
                      <span className='icon'>🌐</span> tronswan.com
                    </a>
                  );
                }
                if (text.includes('@')) {
                  return (
                    <span key={index} className='resume-contact-item'>
                      <span className='icon'>📧</span> {text}
                    </span>
                  );
                }
                // Handle location or phone
                if (/\d{3}-\d{3}-\d{4}/.test(text)) {
                  return (
                    <span key={index} className='resume-contact-item'>
                      <span className='icon'>📱</span> {text}
                    </span>
                  );
                }
                return (
                  <span key={index} className='resume-contact-item'>
                    {text}
                  </span>
                );
              };
              return parseContactLine(line);
            })}
          </div>
        </header>

        <div className='resume-main-grid'>
          <div className='resume-sidebar'>
            {sections['Technical Skills'] && (
              <section className='resume-section' data-testid='resume-skills'>
                <h2 className='section-title'>Technical Skills</h2>
                <div className='skills-container'>
                  {sections['Technical Skills'].map((skillLine, index) => {
                    const cleanSkill = skillLine
                      .replace(/^\s*[*\-•◦▪▫]\s*/, '')
                      .trim();
                    const [category, skills] = cleanSkill.split(':');

                    if (category && skills) {
                      return (
                        <div key={index} className='skill-group'>
                          <h3 className='skill-category-title'>
                            {category.trim()}
                          </h3>
                          <div className='skill-tags'>
                            {skills
                              .split(',')
                              .map((s, i) => (
                                <span key={i} className='skill-tag'>
                                  {s.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={index} className='skill-tag solo'>
                        {cleanSkill}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {sections['Education'] && (
              <section className='resume-section' data-testid='resume-education'>
                <h2 className='section-title'>Education</h2>
                {sections['Education'].map((line, index) => (
                  <div key={index} className='education-item'>
                    <p>{line}</p>
                  </div>
                ))}
              </section>
            )}

            {sections['Certifications'] && (
              <section className='resume-section'>
                <h2 className='section-title'>Certifications</h2>
                <ul className='cert-list'>
                  {sections['Certifications'].map((cert, index) => (
                    <li key={index} className='cert-item'>
                      {cert.replace(/^\s*[*\-•◦▪▫]\s*/, '').trim()}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className='resume-body'>
            {(sections['Summary'] || sections['Professional Summary']) && (
              <section className='resume-section' data-testid='resume-summary'>
                <h2 className='section-title'>Summary</h2>
                <p className='summary-text'>
                  {(
                    sections['Summary'] || sections['Professional Summary']
                  ).join(' ')}
                </p>
              </section>
            )}

            {(sections['Professional Experience'] ||
              sections['Experience']) && (
                <section
                  className='resume-section'
                  data-testid='resume-experience'
                >
                  <h2 className='section-title'>Professional Experience</h2>
                  <div className='experience-timeline'>
                    {(
                      sections['Professional Experience'] ||
                      sections['Experience']
                    ).map((line, index) => {
                      const isJobRole =
                        line.includes('|') &&
                        /Engineer|Developer|Manager|Director|Lead|Senior|Staff|Principal|Architect/i.test(
                          line
                        );

                      const isBulletPoint = /^\s*[*\-•◦▪▫]/.test(line);

                      if (isJobRole) {
                        // Attempt to split title, company, dates
                        // Format: Title | Company | Location | Dates
                        const parts = line.split('|').map(p => p.trim());
                        return (
                          <div key={index} className='experience-role-header'>
                            <div className='role-title-row'>
                              <h3 className='role-title'>{parts[0]}</h3>
                              <span className='role-dates'>
                                {parts[parts.length - 1]}
                              </span>
                            </div>
                            <div className='role-company-row'>
                              <span className='role-company'>{parts[1]}</span>
                              {parts[2] && parts[2] !== parts[parts.length - 1] && (
                                <span className='role-location'>
                                  {parts[2]}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      } else if (isBulletPoint) {
                        const cleanBullet = line
                          .replace(/^\s*[*\-•◦▪▫]\s*/, '')
                          .trim();
                        return (
                          <div key={index} className='experience-bullet-item'>
                            <p>{cleanBullet}</p>
                          </div>
                        );
                      } else {
                        return (
                          <p key={index} className='experience-text'>
                            {line}
                          </p>
                        );
                      }
                    })}
                  </div>
                </section>
              )}

            {(sections['Projects & Achievements'] || sections['Projects']) && (
              <section className='resume-section'>
                <h2 className='section-title'>Projects & Achievements</h2>
                <div className='projects-list'>
                  {(
                    sections['Projects & Achievements'] || sections['Projects']
                  ).map((item, index) => (
                    <div key={index} className='project-item'>
                      <p>{item.replace(/^\s*[*\-•◦▪▫]\s*/, '').trim()}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <footer className='resume-footer'>
          <div className='footer-info'>
            <p>Last updated: {lastUpdated?.toLocaleDateString() || 'Recent'}</p>
            <a
              href='https://docs.google.com/document/d/1zeZ_mN27_KVgUuOovUn4nHb_w8CDRUBrj5xOiIVTz8M/edit?usp=sharing'
              target='_blank'
              rel='noopener noreferrer'
              className='doc-link'
            >
              View original Google Doc
            </a>
          </div>
          <button
            onClick={onRefresh}
            className='resume-refresh-btn'
            aria-label='Refresh resume content'
          >
            Refresh Content
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ResumeContent;
