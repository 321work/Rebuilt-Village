import { useEffect } from 'react';

/**
 * Sets the page <title> and <meta name="description"> on mount.
 * Lightweight replacement for react-helmet-async that avoids the
 * CJS/ESM React duplicate-instance issue in React 19.
 */
export function usePageMeta(
  title: string,
  description?: string,
  options?: { noindex?: boolean }
) {
  const noindex = options?.noindex === true;
  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta description
    if (description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    // Keep error pages out of search results. The page already carries
    // <meta name="robots" content="index, follow">; switch it to noindex while
    // this page is shown and restore it on leaving.
    if (!noindex) return;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    const previous = robots?.getAttribute('content') ?? null;
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex');
    const tag = robots;
    return () => {
      if (created) tag.remove();
      else if (previous !== null) tag.setAttribute('content', previous);
    };
  }, [title, description, noindex]);
}
