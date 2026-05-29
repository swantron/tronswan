import React from 'react';
import { Link } from 'react-router-dom';

import { logger } from '../../utils/logger';
import { Card } from '../common/Card';

import SEO from './SEO';

import '../../styles/Projects.css';

interface Project {
  slug: string;
  title: string;
  tagline: string;
  internalPath: string;
  externalUrl?: string;
  tags: string[];
}

const PROJECTS: Project[] = [
  {
    slug: 'wrenchtron',
    title: 'wrenchtron',
    tagline:
      'Vehicle maintenance tracker for mixed fleets. NHTSA recall lookup, mileage and time-based service intervals, offline-capable PWA.',
    internalPath: '/wrenchtron',
    externalUrl: 'https://wrenchtron.com',
    tags: ['Next.js', 'Firebase', 'PWA', 'TypeScript'],
  },
  {
    slug: 'chomptron',
    title: 'chomptron',
    tagline:
      'AI recipe generator powered by Google Gemini. Type ingredients, get a recipe.',
    internalPath: '/chomptron',
    externalUrl: 'https://chomptron.com',
    tags: ['React', 'Gemini API', 'GCP'],
  },
  {
    slug: 'weathertron',
    title: 'weathertron',
    tagline:
      'Forecast and current conditions dashboard built on the OpenWeather API.',
    internalPath: '/weathertron',
    tags: ['React', 'OpenWeather API'],
  },
  {
    slug: 'music',
    title: 'music',
    tagline:
      'Spotify listening stats — top tracks, top artists, recently played, playlists.',
    internalPath: '/music',
    tags: ['React', 'Spotify API', 'OAuth'],
  },
  {
    slug: 'mlb',
    title: 'mlb',
    tagline: 'Live standings and team records pulled from the MLB Stats API.',
    internalPath: '/mlb',
    tags: ['React', 'MLB Stats API'],
  },
  {
    slug: 'swantron',
    title: 'og blog',
    tagline:
      'WordPress blog reader fetching posts from swantron.com — tech, projects, and life.',
    internalPath: '/swantron',
    externalUrl: 'https://swantron.com',
    tags: ['React', 'WordPress REST'],
  },
];

function Projects() {
  React.useEffect(() => {
    logger.info('Projects page loaded', {
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <div className='projects-page'>
      <SEO
        title='Projects | Tron Swan'
        description='Personal projects by Joseph Swanson — Wrenchtron, Chomptron, Weathertron, Music, MLB. Built with React, Next.js, Firebase, and friends.'
        keywords='Joseph Swanson, projects, wrenchtron, chomptron, weathertron, React, Next.js, portfolio'
        url='/projects'
      />

      <div className='projects-content'>
        <h1 className='page-title' data-testid='projects-title'>
          projects
        </h1>
        <p className='projects-subtitle'>some things i&apos;ve built</p>

        <div className='projects-grid' data-testid='projects-grid'>
          {PROJECTS.map(p => (
            <Card key={p.slug} className='projects-card' hoverable>
              <div className='projects-card-inner'>
                <h2 className='projects-card-title'>{p.title}</h2>
                <p className='projects-card-tagline'>{p.tagline}</p>
                <div className='projects-card-tags'>
                  {p.tags.map(t => (
                    <span key={t} className='projects-card-tag'>
                      {t}
                    </span>
                  ))}
                </div>
                <div className='projects-card-links'>
                  <Link
                    to={p.internalPath}
                    className='projects-card-link primary'
                    data-testid={`projects-card-link-${p.slug}`}
                  >
                    explore →
                  </Link>
                  {p.externalUrl && (
                    <a
                      href={p.externalUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='projects-card-link secondary'
                    >
                      live site ↗
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className='projects-professional'>
          <h2 className='projects-section-title'>professional</h2>
          <p className='projects-professional-text'>
            staff software engineer @ demandbase — devx, ci/cd, iac, ai tooling,
            react. for the full story:{' '}
            <a
              href='https://www.linkedin.com/in/joseph-swanson-11092758/'
              target='_blank'
              rel='noopener noreferrer'
              className='projects-inline-link'
            >
              linkedin
            </a>
            ,{' '}
            <a
              href='https://github.com/swantron'
              target='_blank'
              rel='noopener noreferrer'
              className='projects-inline-link'
            >
              github
            </a>
            , or{' '}
            <Link to='/resume' className='projects-inline-link'>
              résumé
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default Projects;
