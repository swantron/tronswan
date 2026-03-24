import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';

import Baseball2 from './Baseball2';
import BuschLeague from './BuschLeague';
import Coffee from './Coffee';
import Dynomite from './Dynomite';
import JobWellDone from './JobWellDone';
import KingKong from './KingKong';
import Mishap from './Mishap';
import Peloton from './Peloton';
import Seeya from './Seeya';
import ThumbsUp from './ThumbsUp';
import Working from './Working';
import DealWithFont from './DealWithFont';
import DealWithIt from './DealWithIt';
import DealWithWord from './DealWithWord';
import GangamStyle from './GangamStyle';
import Hacking from './Hacking';
import Wrigley from './Wrigley';

// Standard video components: title (h2), video attrs + src, container
// (.gangnam-container), fallback text, download link
const standardVideoComponents: Array<{
  name: string;
  Component: React.ComponentType;
  title: string;
  testId: string;
  src: string;
}> = [
  {
    name: 'Baseball2',
    Component: Baseball2,
    title: 'glove up',
    testId: 'baseball2',
    src: '/baseball_2.mp4',
  },
  {
    name: 'BuschLeague',
    Component: BuschLeague,
    title: 'busch dot league',
    testId: 'buschleague',
    src: '/buschleague.mp4',
  },
  {
    name: 'Coffee',
    Component: Coffee,
    title: 'coffee',
    testId: 'coffee',
    src: '/coffee.mp4',
  },
  {
    name: 'Dynomite',
    Component: Dynomite,
    title: 'dynomite',
    testId: 'dynomite',
    src: '/dynomite.mp4',
  },
  {
    name: 'JobWellDone',
    Component: JobWellDone,
    title: 'job well done',
    testId: 'jobwelldone',
    src: '/jobwelldone.mp4',
  },
  {
    name: 'KingKong',
    Component: KingKong,
    title: 'kong tron',
    testId: 'kingkong',
    src: '/kingkong.mp4',
  },
  {
    name: 'Mishap',
    Component: Mishap,
    title: 'mishap',
    testId: 'mishap',
    src: '/mishap.mp4',
  },
  {
    name: 'Peloton',
    Component: Peloton,
    title: 'peloton',
    testId: 'peloton',
    src: '/peloton.mp4',
  },
  {
    name: 'Seeya',
    Component: Seeya,
    title: 'seeya',
    testId: 'seeya',
    src: '/seeya.mp4',
  },
  {
    name: 'ThumbsUp',
    Component: ThumbsUp,
    title: 'thumbs up',
    testId: 'thumbsup',
    src: '/thumbsup.mp4',
  },
  {
    name: 'Working',
    Component: Working,
    title: 'working',
    testId: 'working',
    src: '/working.mp4',
  },
];

standardVideoComponents.forEach(({ name, Component, title, testId, src }) => {
  describe(name, () => {
    it('renders title', () => {
      render(<Component />);
      const titleEl = screen.getByText(title);
      expect(titleEl).toBeInTheDocument();
      expect(titleEl.tagName).toBe('H2');
    });

    it('renders video with correct attributes', () => {
      render(<Component />);
      const video = screen.getByTestId(
        `${testId}-modal-video`
      ) as HTMLVideoElement;
      expect(video).toBeInTheDocument();
      expect(video.autoplay).toBe(true);
      expect(video.muted).toBe(true);
      expect(video.loop).toBe(true);
      expect(video.playsInline).toBe(true);
      expect(video).toHaveClass('video-modal-video');
    });

    it('renders video with correct source', () => {
      render(<Component />);
      expect(screen.getByTestId(`${testId}-modal-video`)).toHaveAttribute(
        'src',
        src
      );
    });

    it('renders container', () => {
      render(<Component />);
      const container = screen.getByTestId(`${testId}-container`);
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('gangnam-container');
    });

    it('renders fallback for unsupported browsers', () => {
      render(<Component />);
      const fallback = screen.getByText(
        'Your browser does not support the video tag.'
      );
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveClass('video-fallback');
    });

    it('renders download link in fallback', () => {
      render(<Component />);
      const link = screen.getByText('Download MP4 version');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', src);
      expect(link).toHaveAttribute('download');
    });
  });
});

// Simpler video components: title, video element presence, video attrs, container
const simpleVideoComponents: Array<{
  name: string;
  Component: React.ComponentType;
  titlePattern: string | RegExp;
  testId: string;
}> = [
  {
    name: 'DealWithFont',
    Component: DealWithFont,
    titlePattern: /deal with font/i,
    testId: 'dealwithfont',
  },
  {
    name: 'DealWithIt',
    Component: DealWithIt,
    titlePattern: /deal with it/i,
    testId: 'dealwithit',
  },
  {
    name: 'DealWithWord',
    Component: DealWithWord,
    titlePattern: /deal with word/i,
    testId: 'dealwithword',
  },
  {
    name: 'GangamStyle',
    Component: GangamStyle,
    titlePattern: /gangam style/i,
    testId: 'gangamstyle',
  },
  {
    name: 'Hacking',
    Component: Hacking,
    titlePattern: /computer hacking skills/i,
    testId: 'hacking',
  },
  {
    name: 'Wrigley',
    Component: Wrigley,
    titlePattern: /wrigley/i,
    testId: 'wrigley',
  },
];

simpleVideoComponents.forEach(({ name, Component, titlePattern, testId }) => {
  describe(name, () => {
    it('renders title', () => {
      render(<Component />);
      expect(screen.getByText(titlePattern)).toBeInTheDocument();
    });

    it('renders video element', () => {
      render(<Component />);
      expect(
        screen.getByTestId(`${testId}-modal-video`)
      ).toBeInTheDocument();
    });

    it('renders video with correct attributes', () => {
      render(<Component />);
      const video = screen.getByTestId(
        `${testId}-modal-video`
      ) as HTMLVideoElement;
      expect(video.autoplay).toBe(true);
      expect(video.muted).toBe(true);
      expect(video.loop).toBe(true);
      expect(video.playsInline).toBe(true);
    });

    it('renders container', () => {
      render(<Component />);
      expect(screen.getByTestId(`${testId}-container`)).toBeInTheDocument();
    });
  });
});
