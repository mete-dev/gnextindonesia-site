import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Article } from '../pages/studio/types';

export interface SchemaMarkupProps {
  article?: Article | null;
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogoUrl?: string;
  categoryName?: string;
  keywords?: string[] | string;
  articleBody?: string;
  type?: 'NewsArticle' | 'Article' | 'BlogPosting';
  siteOrigin?: string;
}

export function SchemaMarkup({
  article,
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  publisherName = 'Gnext News',
  publisherLogoUrl,
  categoryName,
  keywords,
  articleBody,
  type = 'NewsArticle',
  siteOrigin,
}: SchemaMarkupProps) {
  // Extract values with precedence: explicit props > article fields > defaults
  const headline = title || article?.title || '';
  
  // Format description cleanly
  const rawDesc = description || (article?.content ? article.content.replace(/<[^>]*>/g, '').replace(/!\[.*?\]\(.*?\)/g, '').slice(0, 200).trim() : '');
  const cleanDescription = rawDesc || headline;

  // Origin resolution
  const origin = siteOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://www.gnextindonesia.site');
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : origin);

  // Cover Image resolution
  const coverImg = imageUrl || (article as any)?.cover_image || (article?.images && article.images[0]?.url) || `${origin}/favicon-news.svg`;
  const absoluteImageUrl = coverImg.startsWith('http') ? coverImg : `${origin}${coverImg.startsWith('/') ? '' : '/'}${coverImg}`;

  // Dates
  const pubDate = datePublished || (article as any)?.created_at || article?.date || new Date().toISOString();
  const modDate = dateModified || (article as any)?.updated_at || pubDate;

  // Author & Publisher
  const author = authorName || (article as any)?.author_name || 'Redaksi Gnext';
  const publisherLogo = publisherLogoUrl || `${origin}/favicon-news.svg`;

  // Keywords
  const parsedKeywords = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords || (article?.tags ? (Array.isArray(article.tags) ? article.tags.join(', ') : article.tags) : undefined);

  // Body text for word count
  const bodyText = articleBody || article?.content || '';
  const cleanBody = bodyText.replace(/<[^>]*>/g, '').replace(/!\[.*?\]\(.*?\)/g, '').trim();
  const wordCount = cleanBody ? cleanBody.split(/\s+/).length : undefined;

  // 1. NewsArticle / Article Schema
  const articleSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': type,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    'headline': headline,
    'description': cleanDescription,
    'image': [absoluteImageUrl],
    'datePublished': pubDate,
    'dateModified': modDate,
    'inLanguage': 'id-ID',
    'author': {
      '@type': 'Person',
      'name': author,
      'url': currentUrl,
    },
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': publisherName,
      'url': origin,
      'logo': {
        '@type': 'ImageObject',
        'url': publisherLogo,
      },
    },
  };

  if (categoryName || article?.categoryId) {
    articleSchema['articleSection'] = categoryName || article?.categoryId;
  }

  if (parsedKeywords) {
    articleSchema['keywords'] = parsedKeywords;
  }

  if (wordCount && wordCount > 0) {
    articleSchema['wordCount'] = wordCount;
  }

  if (cleanBody) {
    articleSchema['articleBody'] = cleanBody.slice(0, 5000); // Sanitize large content payload
  }

  // 2. BreadcrumbList Schema
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Berita',
      'item': origin,
    },
  ];

  if (categoryName) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': 2,
      'name': categoryName,
      'item': `${origin}/category/${encodeURIComponent(categoryName.toLowerCase())}`,
    });
  }

  if (headline) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': breadcrumbItems.length + 1,
      'name': headline,
      'item': currentUrl,
    });
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}

export default SchemaMarkup;
