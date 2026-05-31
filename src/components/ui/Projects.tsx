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

interface BloggingItem {
  slug: string;
  title: string;
  year: string;
  description: string;
  url: string;
}

const BLOGGING: BloggingItem[] = [
  {
    slug: 'secure-base-images',
    title: 'secure base images for docker',
    year: '2025',
    description:
      'distroless docker base for static go binaries — zero vulns, no shell, non-root.',
    url: 'https://swantron.com/2025/11/30/secure-base-images/',
  },
  {
    slug: 'self-hosting-bluesky-pds',
    title: 'self-hosting a bluesky pds',
    year: '2026',
    description:
      'running my own at protocol personal data server — federated, portable.',
    url: 'https://swantron.com/2026/01/29/self-hosting-bluesky-pds/',
  },
  {
    slug: 'wordpress-to-hugo-migration',
    title: 'wordpress → hugo migration',
    year: '2026',
    description:
      'fourteen years of posts moved off wordpress onto a hugo static site.',
    url: 'https://swantron.com/2026/01/18/wordpress-to-hugo-migration/',
  },
  {
    slug: 'aggressive-tv-repair',
    title: 'aggressive tv repair: baking a motherboard',
    year: '2018',
    description: 'an lg tv with a stuck boot sequence got a turn in the oven.',
    url: 'https://swantron.com/2018/02/20/aggressive-tv-repair-baking-a-motherboard/',
  },
  {
    slug: 'garage-door-hack',
    title: 'garage door hack: open-er-o-matic 3000',
    year: '2011',
    description:
      'arduino + ping sensor + servo + leds, automating the garage door.',
    url: 'https://swantron.com/2011/04/13/garage-door-hack/',
  },
];

const PROJECTS: Project[] = [
  {
    slug: 'wrenchtron',
    title: 'wrenchtron',
    tagline:
      'vehicle maintenance tracker for mixed fleets. nhtsa recall lookup, mileage and time-based service intervals, offline-capable pwa.',
    internalPath: '/wrenchtron',
    externalUrl: 'https://wrenchtron.com',
    tags: ['Next.js', 'Firebase', 'PWA', 'TypeScript'],
  },
  {
    slug: 'chomptron',
    title: 'chomptron',
    tagline:
      'ai recipe generator powered by google gemini. type ingredients, get a recipe.',
    internalPath: '/chomptron',
    externalUrl: 'https://chomptron.com',
    tags: ['React', 'Gemini API', 'GCP'],
  },
  {
    slug: 'swantron',
    title: 'og blog',
    tagline:
      'wordpress blog reader fetching posts from swantron.com — tech, projects, and life.',
    internalPath: '/swantron',
    externalUrl: 'https://swantron.com',
    tags: ['React', 'WordPress REST'],
  },
  {
    slug: 'weathertron',
    title: 'weathertron',
    tagline:
      'forecast and current conditions dashboard built on the openweather api.',
    internalPath: '/weathertron',
    tags: ['React', 'OpenWeather API'],
  },
  {
    slug: 'music',
    title: 'music',
    tagline:
      'spotify listening stats — top tracks, top artists, recently played, playlists.',
    internalPath: '/music',
    tags: ['React', 'Spotify API', 'OAuth'],
  },
  {
    slug: 'mlb',
    title: 'mlb',
    tagline: 'live standings and team records pulled from the mlb stats api.',
    internalPath: '/mlb',
    tags: ['React', 'MLB Stats API'],
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

        <div className='projects-writing' data-testid='projects-writing'>
          <h2 className='projects-section-title'>blogging</h2>
          <p className='projects-writing-sub'>
            selected posts from swantron.com
          </p>

          <ul className='projects-writing-list'>
            {BLOGGING.map(w => (
              <li key={w.slug} className='projects-writing-item'>
                <a
                  href={w.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='projects-writing-link'
                  data-testid={`projects-writing-link-${w.slug}`}
                >
                  <div className='projects-writing-row'>
                    <span className='projects-writing-title'>
                      {w.title} <span className='projects-writing-ext'>↗</span>
                    </span>
                    <span className='projects-writing-year'>{w.year}</span>
                  </div>
                  <p className='projects-writing-desc'>{w.description}</p>
                </a>
              </li>
            ))}
          </ul>

          <p className='projects-writing-footer'>
            <a
              href='https://swantron.com/hof/'
              target='_blank'
              rel='noopener noreferrer'
              className='projects-inline-link'
            >
              see the full hall of fame ↗
            </a>
          </p>
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
              linkedin ↗
            </a>
            ,{' '}
            <a
              href='https://github.com/swantron'
              target='_blank'
              rel='noopener noreferrer'
              className='projects-inline-link'
            >
              github ↗
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
