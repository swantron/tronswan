import React from 'react';

import { logger } from '../../utils/logger';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

import SEO from './SEO';

import '../../styles/Wrenchtron.css';

const FEATURES = [
  {
    label: 'Mixed-fleet tracking',
    detail: 'Cars, motorcycles, ATVs, mowers, boats, snowblowers — each type gets appropriate fields and service intervals.',
  },
  {
    label: 'Smart scheduling',
    detail: 'Mileage-based, time-based, seasonal, and calendar-month intervals. Composite "whichever comes first" also supported.',
  },
  {
    label: 'NHTSA recall integration',
    detail: 'Automatic open-recall lookup by VIN on every vehicle detail page.',
  },
  {
    label: 'Offline-capable PWA',
    detail: 'Installable on iOS and Android. Firestore persistence via IndexedDB keeps data available without a connection.',
  },
];

const STACK = [
  'Next.js 15',
  'TypeScript',
  'Firebase',
  'Tailwind CSS v4',
  'PWA',
];

const Wrenchtron: React.FC = () => {
  React.useEffect(() => {
    logger.info('Wrenchtron page loaded', {
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleDemo = () => {
    logger.info('Wrenchtron demo link clicked', {
      timestamp: new Date().toISOString(),
    });
    window.open('https://wrenchtron.com/demo', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className='wrenchtron-page'>
      <SEO
        title='Wrenchtron - Vehicle Maintenance Tracker | Tron Swan'
        description='A vehicle maintenance tracker for mixed fleets. Tracks service history, calculates what is due next, and surfaces NHTSA safety recalls automatically.'
        keywords='wrenchtron, vehicle maintenance, fleet tracker, NHTSA recalls, PWA, Firebase, Next.js'
        url='/wrenchtron'
      />

      <div className='wrenchtron-container' data-testid='wrenchtron-container'>
        <Card className='wrenchtron-card'>
          <div className='wrenchtron-header'>
            <h1 className='page-title'>wrenchtron</h1>

            <p className='wrenchtron-description'>
              Vehicle maintenance tracker for mixed fleets. Logs service history,
              calculates what&apos;s due next, and surfaces NHTSA safety recalls
              automatically.
            </p>

            <div className='wrenchtron-cta'>
              <Button
                onClick={handleDemo}
                size='lg'
                className='demo-button'
                data-testid='demo-button'
              >
                Try Demo →
              </Button>
              <a
                href='https://wrenchtron.com'
                target='_blank'
                rel='noopener noreferrer'
                className='wrenchtron-external-link'
              >
                wrenchtron.com ↗
              </a>
            </div>

            <ul className='wrenchtron-features' data-testid='feature-list'>
              {FEATURES.map(f => (
                <li key={f.label} className='feature-item'>
                  <span className='feature-label'>{f.label}</span>
                  <span className='feature-detail'>{f.detail}</span>
                </li>
              ))}
            </ul>

            <div className='wrenchtron-stack'>
              {STACK.map(tech => (
                <span key={tech} className='stack-chip'>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Wrenchtron;
