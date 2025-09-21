import React, { useState, useEffect } from 'react';

import { swantronService } from '../services/swantronService';
import { Post } from '../types';

import SEO from './SEO';
import SwantronCard from './SwantronCard';
import '../styles/SwantronList.css';

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
        const data = searchQuery
          ? await swantronService.searchPosts(searchQuery, page)
          : await swantronService.getPosts(page);

        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        setError(
          'Failed to load posts from swantron.com. Please try again later.'
        );
        console.error('Error fetching swantron posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
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
          <h1>og blog</h1>
          <form onSubmit={handleSearch} className='swantron-search-form'>
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search posts...'
              className='swantron-search-input'
            />
            <button type='submit' className='swantron-search-button'>
              Search
            </button>
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
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className='pagination-button'
                >
                  Previous
                </button>
                <span className='pagination-info'>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className='pagination-button'
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SwantronList;
