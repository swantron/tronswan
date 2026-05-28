import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { logger } from '../../utils/logger';

import '../../styles/Footer.css';

function Footer() {
  const location = useLocation();
  const year = new Date().getFullYear();

  return (
    <footer className='app-footer' data-testid='app-footer'>
      <div className='footer-inner'>
        <span className='footer-copy'>© {year} swantron</span>
        <div className='footer-links'>
          <Link
            to='/status'
            className={`footer-link ${location.pathname === '/status' ? 'active' : ''}`}
            aria-current={location.pathname === '/status' ? 'page' : undefined}
            onClick={() =>
              logger.info('Footer clicked - Status', {
                target: '/status',
                timestamp: new Date().toISOString(),
              })
            }
            data-testid='footer-status-link'
          >
            status
          </Link>
          <a
            href='https://github.com/swantron'
            target='_blank'
            rel='noopener noreferrer'
            className='footer-link'
            data-testid='footer-github-link'
          >
            github ↗
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
