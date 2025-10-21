import React from 'react';

import SEO from './SEO';
import '../../styles/Hello.css';

function Hello() {
  return (
    <div className='hello-page'>
      <SEO
        title='Hello - Connect with Joseph Swanson | Tron Swan'
        description='Connect with Joseph Swanson, Staff Software Engineer building full-stack solutions with a focus on DevX, CI/CD, AI, IaC, and React. Links to personal projects and professional profiles.'
        keywords='Joseph Swanson, software engineer, DevX, CI/CD, IaC, AI, React, full-stack, LinkedIn, Montana, Bozeman'
        url='/hello'
      />

      <div className='hello-content'>
        <h1 className='hello-title' data-testid='hello-title'>
          hello
        </h1>
        <p className='hello-subtitle'>👋 connect with joseph swanson</p>

        <div className='hello-description'>
          <p>
            Staff Software Engineer building full-stack solutions with a focus
            on DevX, CI/CD, AI, IaC, and React
          </p>
          <p>Based in Bozeman, Montana 🏔️</p>
        </div>

        <div className='hello-links'>
          <a
            className='hello-link linkedin'
            href='https://www.linkedin.com/in/joseph-swanson-11092758/'
            target='_blank'
            rel='noopener noreferrer'
            aria-label="Joseph Swanson's LinkedIn"
          >
            💼 LinkedIn Profile
          </a>

          <a
            className='hello-link personal'
            href='https://swantron.com'
            target='_blank'
            rel='noopener noreferrer'
            aria-label="Joseph's personal website"
          >
            🦢 swan tron dot com
          </a>

          <a
            className='hello-link recipes'
            href='https://chomptron.com'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='AI-powered recipe app with Gemini'
          >
            🍳 chomp tron dot com
          </a>

          <a
            className='hello-link fizzbuzz'
            href='/trontronbuzztron'
            aria-label='TronTronBuzzTron FizzBuzz generator'
          >
            🤖 trontronbuzztron
          </a>

          <a
            className='hello-link resume'
            href='/resume'
            aria-label="Joseph Swanson's Resume"
          >
            📄 Resume
          </a>
        </div>

        <div className='hello-info'>
          <h3>About This Site</h3>
          <p className='building-learning-text'>
            building / deploying / learning
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hello;
