import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Reset scroll to the top when the visitor navigates to a new page. Without
 * this, a link clicked near the bottom of one page (footer, sticky bar) opens
 * the next page at the same depth.
 *
 * Skipped for back/forward (the browser restores the earlier position), for
 * URLs with a #hash, and for /donate, where the page scrolls the donation form
 * into view itself.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP' || hash || pathname === '/donate') return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
};
