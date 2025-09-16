import React from 'react';
import { Link } from 'react-router-dom';

import { useDateFormatter } from '../hooks/useDateFormatter';
import { SwantronCardProps } from '../types';
import '../styles/SwantronCard.css';

const SwantronCard: React.FC<SwantronCardProps> = React.memo(({ post }) => {
  const formatDate = useDateFormatter();

  return (
    <div className='swantron-card' data-testid='swantron-card'>
      <Link to={`/swantron/${post.id}`} className='swantron-card-link'>
        {post.featuredImage && (
          <div className='swantron-card-image'>
            <img src={post.featuredImage} alt={post.title} loading='lazy' />
          </div>
        )}
        <div className='swantron-card-content'>
          <h3 className='swantron-card-title'>{post.title}</h3>
          <div
            className='swantron-card-excerpt'
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
          <div className='swantron-card-meta'>
            <span className='swantron-card-date'>{formatDate(post.date)}</span>
            {post.categories.length > 0 && (
              <div className='swantron-card-categories'>
                {post.categories.map(category => (
                  <span key={category.id} className='swantron-card-category'>
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className='swantron-card-external'>
            <a
              href={post.link}
              target='_blank'
              rel='noopener noreferrer'
              className='swantron-external-link'
              onClick={e => e.stopPropagation()}
            >
              📖 Read on swantron.com
            </a>
          </div>
        </div>
      </Link>
    </div>
  );
});

SwantronCard.displayName = 'SwantronCard';

export default SwantronCard;
