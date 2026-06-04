'use client';

import { usePathname } from 'next/navigation';
import { useBuilderReady } from '@/hooks/useBuilderReady';
import { Footer } from './Footer';

/**
 * Shows the static Footer ONLY when the builder is not active (or as a degraded
 * fallback if the builder structure fails to load).
 * When builder is enabled, the Footer inside the builder data handles the footer —
 * except on /vehicles and /embed, where the builder doesn't render.
 *
 * While the builder structure is still loading we render NOTHING instead of the
 * static footer, to avoid the flash of hardcoded defaults. See useBuilderReady.
 */
export default function ConditionalFooter() {
  const pathname = usePathname();
  const status = useBuilderReady();

  // Embed pages always use the static footer
  if (pathname?.startsWith('/embed')) {
    return <Footer />;
  }

  // Builder client still hydrating elements_structure → wait, don't flash static
  if (status === 'loading') return null;

  // Non-builder client, or structure failed to load (timeout) → static footer
  if (status === 'fallback') return <Footer />;

  // status === 'ready': builder structure loaded.
  // /vehicles is not a builder page, so it still needs the static footer.
  if (pathname?.startsWith('/vehicles')) {
    return <Footer />;
  }

  // Other pages: the builder renders its own footer inside the page.
  return null;
}
