import React from 'react';
import { Helmet } from 'react-helmet-async';

import { runtimeConfig } from '../../utils/runtimeConfig';

const SEO = ({
  title = 'Tron Swan - Robot-Style Recipes & Tech Fun',
  description = 'Explore robot-style recipes from ChompTron and enjoy tech-inspired fun at Tron Swan. Weather updates, FizzBuzz games, and futuristic cooking adventures await!',
  keywords = 'recipes, robot cooking, tech fun, weather, FizzBuzz, ChompTron, cooking',
  image = '/robotard_512x512.png',
  url = 'https://tronswan.com',
  type = 'website',
  author = 'SwanTron',
  structuredData = null,
}) => {
  const siteUrl = runtimeConfig.getWithDefault(
    'VITE_SITE_URL',
    'https://tronswan.com'
  );
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <meta name='author' content={author} />
      <link rel='canonical' href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type} />
      <meta property='og:url' content={fullUrl} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={imageUrl} />
      <meta property='og:site_name' content='Tron Swan' />

      {/* Twitter */}
      <meta property='twitter:card' content='summary_large_image' />
      <meta property='twitter:url' content={fullUrl} />
      <meta property='twitter:title' content={title} />
      <meta property='twitter:description' content={description} />
      <meta property='twitter:image' content={imageUrl} />

      {/* Additional SEO Meta Tags */}
      <meta name='robots' content='index, follow' />
      <meta name='googlebot' content='index, follow' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta httpEquiv='Content-Language' content='en-US' />

      {/* Structured Data */}
      {structuredData && (
        <script type='application/ld+json'>
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
