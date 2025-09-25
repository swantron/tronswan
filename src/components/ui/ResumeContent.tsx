import React from 'react';
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
            <div className='loading-spinner' role='status' aria-label='Loading'></div>
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
    const lines = content.split('\n').filter(line => line.trim());
    const sections: { [key: string]: string[] } = {};
    let currentSection = '';
    let currentContent: string[] = [];
    let isFirstSection = true;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Skip Google Docs artifacts and unwanted headers
      if (trimmedLine === 'Tab 1' || 
          trimmedLine === 'Tab 2' || 
          trimmedLine === 'Tab 3' ||
          trimmedLine === 'Sheet 1' ||
          trimmedLine === 'Sheet 2' ||
          trimmedLine === 'Sheet 3' ||
          trimmedLine.startsWith('Tab ') ||
          trimmedLine.startsWith('Sheet ') ||
          trimmedLine === '________________' ||
          trimmedLine === '_________________' ||
          trimmedLine === '__________________' ||
          trimmedLine === '___________________' ||
          trimmedLine === '____________________' ||
          /^_+$/.test(trimmedLine) || // Any line that's only underscores
          trimmedLine === '' ||
          trimmedLine === ' ' ||
          trimmedLine === '  ') {
        return; // Skip this line
      }
      
      // Check if this is a section header (look for common resume section names)
      if (trimmedLine === 'Professional Summary' ||
          trimmedLine === 'Summary' ||
          trimmedLine === 'Technical Skills' ||
          trimmedLine === 'Professional Experience' ||
          trimmedLine === 'Education' ||
          trimmedLine === 'Projects & Achievements' ||
          trimmedLine === 'Certifications' ||
          trimmedLine === 'Contact Information') {
        
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = [...currentContent];
        }
        
        // Start new section
        currentSection = trimmedLine;
        currentContent = [];
        isFirstSection = false;
      } else if (trimmedLine) {
        // If this is the first section and it doesn't have a header, treat it as Contact Information
        if (isFirstSection && !currentSection) {
          currentSection = 'Contact Information';
        }
        currentContent.push(trimmedLine);
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
      <div className='resume-content'>
        <header className='resume-header'>
          <h1 className='resume-name'>
            {sections['Contact Information']?.[0] || 'Your Name'}
          </h1>
          <div className='resume-contact'>
            {sections['Contact Information']?.slice(1, 5).map((line, index) => {
              // Parse the line to create clickable links
              const parseContactLine = (text: string) => {
                // Split by common separators and process each part
                const parts = text.split(/(\||\n)/);
                return parts.map((part, partIndex) => {
                  const trimmedPart = part.trim();
                  
                  if (trimmedPart === 'linkedin' || trimmedPart === 'LinkedIn') {
                    return (
                      <a
                        key={partIndex}
                        href="https://www.linkedin.com/in/joseph-swanson-11092758/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resume-link"
                      >
                        LinkedIn
                      </a>
                    );
                  } else if (trimmedPart === 'tronswan.com') {
                    return (
                      <a
                        key={partIndex}
                        href="https://tronswan.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resume-link"
                      >
                        tronswan.com
                      </a>
                    );
                  } else if (trimmedPart === '|' || trimmedPart === '\n') {
                    return <span key={partIndex}> | </span>;
                  } else {
                    return <span key={partIndex}>{trimmedPart}</span>;
                  }
                });
              };

              return (
                <p key={index}>
                  {parseContactLine(line)}
                </p>
              );
            })}
          </div>
        </header>

        {sections['Professional Summary'] && (
          <section className='resume-section'>
            <h2>Professional Summary</h2>
            <p>{sections['Professional Summary'].join(' ')}</p>
          </section>
        )}

        {sections['Summary'] && (
          <section className='resume-section'>
            <h2>Summary</h2>
            <p>{sections['Summary'].join(' ')}</p>
          </section>
        )}

        {sections['Technical Skills'] && (
          <section className='resume-section'>
            <h2>Technical Skills</h2>
            <div className='skills-grid'>
              {sections['Technical Skills'].map((skill, index) => {
                // Clean up the skill text by removing bullet points and asterisks
                const cleanSkill = skill
                  .replace(/^\s*[\*\-\•\◦\▪\▫]\s*/, '') // Remove leading bullet points
                  .replace(/\s*[\*\-\•\◦\▪\▫]\s*$/, '') // Remove trailing bullet points
                  .trim();
                
                // Split by colon to separate category from skills
                const [category, skills] = cleanSkill.split(':');
                
                return (
                  <div key={index} className='skill-category'>
                    {category && skills ? (
                      <>
                        <h3>{category.trim()}</h3>
                        <p>{skills.trim()}</p>
                      </>
                    ) : (
                      <p>{cleanSkill}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {sections['Professional Experience'] && (
          <section className='resume-section'>
            <h2>Professional Experience</h2>
            {sections['Professional Experience'].map((line, index) => {
              // Check if this line is a job role (contains job title, company, location, dates)
              const isJobRole = line.includes('|') && 
                               (line.includes('Engineer') || 
                                line.includes('Developer') || 
                                line.includes('Manager') || 
                                line.includes('Director') || 
                                line.includes('Lead') || 
                                line.includes('Senior') || 
                                line.includes('Staff') ||
                                line.includes('Principal') ||
                                line.includes('Architect') ||
                                line.includes('Consultant') ||
                                line.includes('Analyst') ||
                                line.includes('Coordinator') ||
                                line.includes('Specialist') ||
                                line.includes('Technician') ||
                                line.includes('Intern') ||
                                line.includes('Associate') ||
                                line.includes('Assistant') ||
                                line.includes('Executive') ||
                                line.includes('President') ||
                                line.includes('CEO') ||
                                line.includes('CTO') ||
                                line.includes('VP') ||
                                line.includes('Vice President') ||
                                line.includes('Founder') ||
                                line.includes('Co-founder') ||
                                line.includes('Owner') ||
                                line.includes('Freelance') ||
                                line.includes('Contractor') ||
                                line.includes('Consultant'));
              
              // Check if this line is a bullet point
              const isBulletPoint = line.trim().startsWith('*') || 
                                   line.trim().startsWith('-') || 
                                   line.trim().startsWith('•') ||
                                   line.trim().startsWith('◦') ||
                                   line.trim().startsWith('▪') ||
                                   line.trim().startsWith('▫');
              
              if (isJobRole) {
                return (
                  <div key={index} className='experience-role'>
                    <h3>{line}</h3>
                  </div>
                );
              } else if (isBulletPoint) {
                return (
                  <div key={index} className='experience-bullet'>
                    <p>{line}</p>
                  </div>
                );
              } else {
                // Regular content
                return (
                  <div key={index} className='experience-item'>
                    <p>{line}</p>
                  </div>
                );
              }
            })}
          </section>
        )}

        {sections['Education'] && (
          <section className='resume-section'>
            <h2>Education</h2>
            {sections['Education'].map((line, index) => (
              <div key={index} className='education-item'>
                <p>{line}</p>
              </div>
            ))}
          </section>
        )}

        {sections['Projects & Achievements'] && (
          <section className='resume-section'>
            <h2>Projects & Achievements</h2>
            <ul>
              {sections['Projects & Achievements'].map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {sections['Certifications'] && (
          <section className='resume-section'>
            <h2>Certifications</h2>
            <ul>
              {sections['Certifications'].map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </section>
        )}

        <footer className='resume-footer'>
          <p>Last updated: {lastUpdated?.toLocaleDateString() || 'Unknown'}</p>
          <p>
            <a href="https://docs.google.com/document/d/1zeZ_mN27_KVgUuOovUn4nHb_w8CDRUBrj5xOiIVTz8M/edit?usp=sharing" 
               target="_blank" 
               rel="noopener noreferrer">
              View original Google Doc version
            </a>
          </p>
          <button onClick={onRefresh} className='refresh-button'>
            Refresh Content
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ResumeContent;
