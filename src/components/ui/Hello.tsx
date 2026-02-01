import React from 'react';

import SEO from './SEO';
import { Card } from '../common/Card';
import '../../styles/Hello.css';

function Hello() {
  return (
    <div className='hello-page'>
      <SEO
        title='Hello - Joseph Swanson | Tron Swan'
        description='Connect with Joseph Swanson, Staff Software Engineer @ Demandbase. DevX, CI/CD, AI, IaC, and React. Based in Bozeman, Montana.'
        keywords='Joseph Swanson, software engineer, Demandbase, DevX, CI/CD, IaC, AI, React, Montana, Bozeman'
        url='/hello'
      />

      <div className='hello-content'>
        <h1 className='page-title hello-title' data-testid='hello-title'>
          hello
        </h1>
        <p className='hello-subtitle'>joseph swanson</p>

        <Card className='hello-card'>
          <div className='hello-description'>
            <p>Staff Software Engineer @ Demandbase</p>
            <p>DevX · CI/CD · AI · IaC · React</p>
            <p>Bozeman, Montana</p>
          </div>

          <div className='hello-links'>
            <a
              className='hello-link'
              href='https://www.linkedin.com/in/joseph-swanson-11092758/'
              target='_blank'
              rel='noopener noreferrer'
              aria-label="Joseph Swanson's LinkedIn"
            >
              linkedin
            </a>

            <a
              className='hello-link'
              href='https://github.com/swantron'
              target='_blank'
              rel='noopener noreferrer'
              aria-label="Joseph's GitHub"
            >
              github
            </a>

            <a
              className='hello-link'
              href='https://swantron.com/'
              target='_blank'
              rel='noopener noreferrer'
              aria-label="Joseph's blog"
            >
              swantron
            </a>

            <a
              className='hello-link'
              href='https://chomptron.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='AI-powered recipe app'
            >
              chomptron
            </a>

            <a className='hello-link' href='/resume' aria-label='Resume'>
              resume
            </a>
          </div>
        </Card>

        <div className='hello-info'>
          <p className='building-learning-text'>
            building / deploying / learning
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hello;
