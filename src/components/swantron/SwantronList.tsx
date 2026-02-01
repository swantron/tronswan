import React, { useState, useEffect } from 'react';

import { swantronService } from '../../services/swantronService';
import { Post } from '../../types';
import { logger } from '../../utils/logger';
import SEO from '../ui/SEO';

import SwantronCard from './SwantronCard';
import { Button } from '../common/Button';
import '../../styles/SwantronList.css';

const SwantronList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      try {
        setLoading(true);

        logger.info('SwantronList fetching data', {
          page,
          searchQuery,
          isSearch: !!searchQuery,
          timestamp: new Date().toISOString(),
        });

        const data = searchQuery
          ? await swantronService.searchPosts(searchQuery, page)
          : await swantronService.getPosts(page);

        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setError(null);

        logger.info('SwantronList data loaded successfully', {
          postCount: data.posts.length,
          totalPages: data.totalPages,
          page,
          searchQuery,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        setError(
          'Failed to load posts from swantron.com. Please try again later.'
        );
        logger.error('Error fetching swantron posts', { error: err });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    logger.info('Swantron search submitted', {
      searchQuery,
      currentPage: page,
      timestamp: new Date().toISOString(),
    });

    setPage(1); // Reset to first page when searching
  };

  return (
    <div className='swantron-page'>
      <SEO
        title='Swantron Posts - Personal Blog | Tron Swan'
        description="Explore personal posts and thoughts from Joseph Swanson's blog at swantron.com. Tech insights, life updates, and random musings from a software engineer."
        keywords='swantron, Joseph Swanson, blog posts, software engineering, personal blog, tech insights'
        url='/swantron'
      />

      <div className='swantron-list-container' data-testid='swantron-list'>
        <div className='swantron-list-header'>
          <h1 className='page-title'>og blog</h1>
          <form onSubmit={handleSearch} className='swantron-search-form'>
            <input
              type='text'
              value={searchQuery}
              onChange={e => {
                const value = e.target.value;
                logger.debug('Swantron search input changed', {
                  searchQuery: value,
                  queryLength: value.length,
                  timestamp: new Date().toISOString(),
                });
                setSearchQuery(value);
              }}
              placeholder='Search posts...'
              className='swantron-search-input'
            />
            <Button type='submit' variant='primary'>
              Search
            </Button>
          </form>
        </div>

        {loading ? (
          <div className='loading-spinner' aria-label='Loading posts' />
        ) : error ? (
          <div className='error-message'>{error}</div>
        ) : posts.length === 0 ? (
          <div className='no-posts-message'>
            No posts found. Try a different search term.
          </div>
        ) : (
          <>
            <div className='swantron-grid'>
              {posts.map(post => (
                <SwantronCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className='pagination'>
                <Button
                  onClick={() => {
                    const newPage = Math.max(page - 1, 1);
                    logger.info('Swantron pagination - Previous clicked', {
                      fromPage: page,
                      toPage: newPage,
                      searchQuery,
                      timestamp: new Date().toISOString(),
                    });
                    setPage(newPage);
                  }}
                  disabled={page === 1}
                  variant='secondary'
                >
                  Previous
                </Button>
                <span className='pagination-info'>
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => {
                    const newPage = Math.min(page + 1, totalPages);
                    logger.info('Swantron pagination - Next clicked', {
                      fromPage: page,
                      toPage: newPage,
                      searchQuery,
                      timestamp: new Date().toISOString(),
                    });
                    setPage(newPage);
                  }}
                  disabled={page === totalPages}
                  variant='secondary'
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SwantronList;
