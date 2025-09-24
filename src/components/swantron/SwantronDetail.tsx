import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useDateFormatter } from '../../hooks/useDateFormatter';
import { swantronService } from '../../services/swantronService';
import { Post } from '../../types';

import SEO from '../ui/SEO';

import '../../styles/SwantronDetail.css';

const SwantronDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const formatDate = useDateFormatter();

  useEffect(() => {
    const fetchPost = async (): Promise<void> => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await swantronService.getPostById(parseInt(id, 10));
        setPost(data);
        setError(null);
      } catch (err) {
        setError(
          'Failed to load post from swantron.com. Please try again later.'
        );
        console.error('Error fetching swantron post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div
        className='swantron-detail-loading'
        data-testid='swantron-detail-loading'
      >
        <div className='loading-spinner' aria-label='Loading post' />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className='swantron-detail-error'
        data-testid='swantron-detail-error'
      >
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className='swantron-detail-not-found'
        data-testid='swantron-detail-not-found'
      >
        Post not found.
      </div>
    );
  }

  return (
    <div className='swantron-page'>
      <SEO
        title={`${post.title} - Swantron | Tron Swan`}
        description={post.excerpt.replace(/<[^>]*>/g, '').substring(0, 160)}
        keywords={`swantron, Joseph Swanson, ${post.title}, blog post`}
        url={`/swantron/${post.id}`}
        image={post.featuredImage || undefined}
      />

      <article className='swantron-detail' data-testid='swantron-detail'>
        {post.featuredImage && (
          <div className='swantron-detail-image'>
            <img src={post.featuredImage} alt={post.title} loading='lazy' />
          </div>
        )}

        <div className='swantron-detail-content'>
          <header className='swantron-detail-header'>
            <h1 className='swantron-detail-title'>{post.title}</h1>
            <div className='swantron-detail-meta'>
              <time className='swantron-detail-date'>
                {formatDate(post.date)}
              </time>
              {post.categories.length > 0 && (
                <div className='swantron-detail-categories'>
                  {post.categories.map(category => (
                    <span
                      key={category.id}
                      className='swantron-detail-category'
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div
            className='swantron-detail-body'
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className='swantron-detail-external'>
            <a
              href={post.link}
              target='_blank'
              rel='noopener noreferrer'
              className='swantron-external-button'
            >
              📖 Read original on swantron.com
            </a>
          </div>

          {post.tags.length > 0 && (
            <footer className='swantron-detail-footer'>
              <div className='swantron-detail-tags'>
                {post.tags.map(tag => (
                  <span key={tag.id} className='swantron-detail-tag'>
                    #{tag.name}
                  </span>
                ))}
              </div>
            </footer>
          )}
        </div>
      </article>
    </div>
  );
};

export default SwantronDetail;
