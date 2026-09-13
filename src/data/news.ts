export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Checks if an article is a trial / test / draft / dummy article that should be hidden from public news portals.
 */
export function isTrialArticle(article: any): boolean {
  if (!article) return true;
  
  const id = String(article.id || '').toLowerCase();
  const title = String(article.title || '').trim().toLowerCase();
  const content = String(article.content || '').trim().toLowerCase();
  const status = String(article.status || '').toLowerCase();
  const slug = String(article.slug || '').toLowerCase();
  const categoryId = String(article.categoryId || article.category_id || '').toLowerCase();
  const tags = String(article.tags || '').toLowerCase();

  // Hide non-published articles
  if (status && status !== 'published') {
    return true;
  }

  // Hide articles with trivial or incomplete title (only validate content if content was actually fetched)
  if (title.length < 5 || (article.content !== undefined && content.length > 0 && content.length < 10)) {
    return true;
  }

  // Common keywords associated with trial / test / dummy news
  const trialKeywords = [
    'trial',
    'uji coba',
    'ujicoba',
    'berita trial',
    'berita test',
    'test news',
    'dummy',
    'contoh berita',
    'sample news',
    'draft',
    'percobaan',
    'testing',
    'test',
    'asdf',
    'qwerty',
    '1234',
    'untitled',
    'sample',
    'lorem ipsum',
    'lorem',
    'ipsum'
  ];

  for (const keyword of trialKeywords) {
    if (keyword === 'test' || keyword === 'lorem' || keyword === 'ipsum' || keyword === 'sample' || keyword === 'draft' || keyword === 'dummy' || keyword === 'trial') {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(title) || regex.test(id) || regex.test(slug) || regex.test(categoryId) || regex.test(tags)) {
        return true;
      }
    } else {
      if (
        title.includes(keyword) ||
        id.includes(keyword) ||
        slug.includes(keyword) ||
        categoryId.includes(keyword) ||
        tags.includes(keyword)
      ) {
        return true;
      }
    }
  }

  if (content.startsWith('lorem ipsum') || content.startsWith('test ') || content.startsWith('testing ')) {
    return true;
  }

  return false;
}

/**
 * Filters out trial/draft/test articles from an array of articles.
 */
export function filterValidArticles<T extends any>(articles: T[]): T[] {
  if (!Array.isArray(articles)) return [];
  return articles.filter(a => !isTrialArticle(a));
}

/**
 * Extracts a clean excerpt from raw HTML/Markdown content.
 * Strips HTML tags, Angular bindings, Markdown formatting, and truncates to length.
 */
export function getCleanExcerpt(content: string, length: number = 180): string {
  if (!content) return '';
  let plainText = content;

  // First, parse as HTML to resolve any entities (&lt;) and strip real DOM tags
  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      plainText = doc.body.textContent || '';
    }
  } catch (e) {
    // Silent fallback
  }

  // Then run through regex to strip remaining Markdown or fake-HTML tags
  plainText = plainText
    .replace(/<[^>]*>/g, '')             // Remove HTML tags (including angular attributes)
    .replace(/!\[.*?\]\(.*?\)/g, '')     // Remove Markdown images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // Extract text from Markdown links
    .replace(/#{1,6}\s+/g, '')           // Remove Markdown headers
    .replace(/[*_~`]/g, '')              // Remove bold, italic, strikethrough, code
    .replace(/\s+/g, ' ')                // Replace multiple spaces/newlines with single space
    .trim();
  
  return plainText.length > length ? plainText.substring(0, length) + '...' : plainText;
}

