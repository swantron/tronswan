import React from 'react';
import '../styles/Resume.css';

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
      
      // Check if this is a section header (look for common resume section names)
      if (trimmedLine === 'Professional Summary' ||
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
            {sections['Contact Information']?.slice(1, 5).map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </header>

        {sections['Professional Summary'] && (
          <section className='resume-section'>
            <h2>Professional Summary</h2>
            <p>{sections['Professional Summary'].join(' ')}</p>
          </section>
        )}

        {sections['Technical Skills'] && (
          <section className='resume-section'>
            <h2>Technical Skills</h2>
            <div className='skills-grid'>
              {sections['Technical Skills'].map((skill, index) => (
                <div key={index} className='skill-category'>
                  <p>{skill}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {sections['Professional Experience'] && (
          <section className='resume-section'>
            <h2>Professional Experience</h2>
            {sections['Professional Experience'].map((line, index) => (
              <div key={index} className='experience-item'>
                <p>{line}</p>
              </div>
            ))}
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
